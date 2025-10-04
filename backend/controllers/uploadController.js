import fs from 'fs';
import csv from 'csv-parser';
import db from '../db/db.js';
import { calculateHMPI, calculateHEI, calculatePLI, calculateMPI, calculateCF } from '../utils/formulaEngine.js';
import { getHEIClassification } from '../utils/classification.js';

async function sendCriticalAlertsToOfficials(alertData) {
  if (alertData.length === 0) return;
  console.log(`🚨 Attempting to send ${alertData.length} critical pollution alerts externally...`);
  await new Promise(resolve => setTimeout(resolve, 500));
  console.log('✅ External Alert Service notification simulated and complete.');
}

export default async function handleUpload(req, res, next) {
  const userId = req.user ? req.user.userId : null;
  const { date: historicalDate } = req.body;
  const filePath = req.file?.path;

  if (!filePath) return res.status(400).json({ error: 'No file uploaded' });

  // Server-side validation for historical dates
  if (req.path.includes('/historical')) {
    if (!historicalDate) {
      return res.status(400).json({ error: 'Date is required for historical uploads.' });
    }
    const selectedDate = new Date(historicalDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize today's date to midnight

    if (selectedDate >= today) {
      return res.status(400).json({ error: 'Historical data can only be uploaded for past dates.' });
    }
  }

  const rowsByLocation = {};
  const generatedAlerts = [];
  const requiredHeaders = ['location', 'lat', 'lng', 'metal_name', 'concentration'];

  try {
    await new Promise((resolve, reject) => {
      const stream = fs.createReadStream(filePath).pipe(csv());
      let headersValid = false;
      stream.on('headers', (headers) => {
        const missingHeaders = requiredHeaders.filter(header => !headers.includes(header));
        if (missingHeaders.length > 0) {
          stream.destroy(new Error(`Missing required CSV headers: ${missingHeaders.join(', ')}`));
        } else {
          headersValid = true;
        }
      });
      stream.on('data', (row) => {
        if (headersValid) {
          const key = `${row.location}_${row.lat}_${row.lng}`;
          if (!rowsByLocation[key]) rowsByLocation[key] = [];
          rowsByLocation[key].push(row);
        }
      }).on('end', resolve).on('error', reject);
    });
    
    const { rows: standardsRows } = await db.query('SELECT metal_name, mac_ppm, standard_ppm FROM metal_standards');
    const metalStandards = {};
    standardsRows.forEach(row => {
      metalStandards[row.metal_name] = { mac: row.mac_ppm, standard: row.standard_ppm };
    });
    
    if (Object.keys(metalStandards).length === 0) {
      throw new Error("No metal standards found. Please upload standards first.");
    }
    
    let finalUserId = userId;
    if (!finalUserId) {
      const adminRes = await db.query("SELECT user_id FROM users WHERE email='admin@example.com'");
      if (adminRes.rows.length === 0) {
        throw new Error("Default admin user not found for public uploads.");
      }
      finalUserId = adminRes.rows[0].user_id;
    }
    
    await db.query('BEGIN');
    
    let insertedCount = 0;
    for (const [key, metals] of Object.entries(rowsByLocation)) {
      const { location, lat, lng } = metals[0];
      const district = metals[0].district || location;
      const state = metals[0].state || 'N/A';
      
      let locRes = await db.query('SELECT location_id FROM locations WHERE name = $1', [location]);
      let location_id;
      if (locRes.rows.length > 0) {
        location_id = locRes.rows[0].location_id;
      } else {
        const insertLoc = await db.query(
          `INSERT INTO locations (name, latitude, longitude, district, state) VALUES ($1, $2, $3, $4, $5) RETURNING location_id`,
          [location, lat, lng, district, state]
        );
        location_id = insertLoc.rows[0].location_id;
      }

      const sampleDate = historicalDate ? new Date(historicalDate) : new Date();

      const sampleRes = await db.query(
        `INSERT INTO samples (location_id, sample_date, source_type, notes, user_id) VALUES ($1, $2, $3, $4, $5) RETURNING sample_id`,
        [location_id, sampleDate.toISOString(), 'Groundwater', 'CSV import', finalUserId]
      );
      const sample_id = sampleRes.rows[0].sample_id;

      const concentrations = [];
      const hpiStandards = [];
      const heiStandards = [];
      const cfArray = [];
      
      for (const m of metals) {
        const standard = metalStandards[m.metal_name];
        if (!standard) throw new Error(`Standard for metal ${m.metal_name} not found.`);
        
        const concentration = parseFloat(m.concentration);
        concentrations.push(concentration);
        hpiStandards.push(standard.standard);
        heiStandards.push(standard.mac);
        cfArray.push(calculateCF(concentration, standard.mac));
        
        await db.query(
          `INSERT INTO metal_concentrations (sample_id, metal_name, concentration_ppm) VALUES ($1, $2, $3)`,
          [sample_id, m.metal_name, concentration]
        );
      }

      const hpi = calculateHMPI(concentrations, hpiStandards);
      const hei = calculateHEI(concentrations, heiStandards);
      const pli = calculatePLI(cfArray);
      const mpi = calculateMPI(concentrations);

      const is_anomaly = (hei >= 50);
      const cluster_id = Math.floor(Math.random() * 3) + 1;
      
      const classification = getHEIClassification(hei);
      if (classification === 'Highly Polluted') {
        generatedAlerts.push({
          location, hpi, hei,
          message: `HEI score of ${hei.toFixed(2)} exceeds critical safety threshold. Immediate intervention required.`,
          timestamp: new Date().toISOString()
        });
      }

      await db.query(
        `INSERT INTO pollution_indices (sample_id, hpi, hei, pli, mpi, cf, is_anomaly, cluster_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [sample_id, hpi, hei, pli, mpi, JSON.stringify(cfArray), is_anomaly, cluster_id]
      );
      insertedCount += metals.length;
    }
    
    await db.query('COMMIT');
    fs.unlinkSync(filePath);
    
    await sendCriticalAlertsToOfficials(generatedAlerts);

    res.status(200).json({ 
      message: 'Upload complete', 
      inserted: insertedCount,
      alerts: generatedAlerts,
    });
    
  } catch (err) {
    await db.query('ROLLBACK');
    console.error('❌ Upload failed:', err);
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    next(err);
  }
}