import fs from 'fs';
import csv from 'csv-parser';
import db from '../db/db.js';
import { calculateHPI, calculateHEI, calculatePLI, calculateMPI, calculateCF } from '../utils/formulaEngine.js';
// 🔑 Import classification utility to check for 'Highly Polluted'
import { getHEIClassification } from '../utils/classification.js'; 

export default async function handleUpload(req, res, next) {
  const { userId } = req.user; 
  const filePath = req.file?.path;
  if (!filePath) return res.status(400).json({ error: 'No file uploaded' });

  const rowsByLocation = {};
  // 🔑 New array to hold generated alerts during processing
  const generatedAlerts = []; 

  try {
    await new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (row) => {
          const key = `${row.location}_${row.lat}_${row.lng}`;
          if (!rowsByLocation[key]) rowsByLocation[key] = [];
          rowsByLocation[key].push(row);
        })
        .on('end', resolve)
        .on('error', reject);
    });
    
    const { rows: standardsRows } = await db.query('SELECT metal_name, mac_ppm, standard_ppm FROM metal_standards');
    const metalStandards = {};
    standardsRows.forEach(row => {
      metalStandards[row.metal_name] = { mac: row.mac_ppm, standard: row.standard_ppm };
    });
    
    if (Object.keys(metalStandards).length === 0) {
      throw new Error("No metal standards found. Please upload standards first.");
    }
    
    await db.query('BEGIN');
    
    // Delete only the current user's data
    await db.query('DELETE FROM pollution_indices WHERE sample_id IN (SELECT sample_id FROM samples WHERE user_id = $1)', [userId]);
    await db.query('DELETE FROM metal_concentrations WHERE sample_id IN (SELECT sample_id FROM samples WHERE user_id = $1)', [userId]);
    await db.query('DELETE FROM samples WHERE user_id = $1', [userId]);

    let insertedCount = 0;
    for (const [key, metals] of Object.entries(rowsByLocation)) {
      const firstMetal = metals[0];
      const { location, lat, lng } = firstMetal;

      const district = firstMetal.district || location;
      const state = firstMetal.state || 'N/A';
      
      let locRes = await db.query(
        'SELECT location_id FROM locations WHERE name = $1',
        [location]
      );
      let location_id;
      if (locRes.rows.length > 0) {
        location_id = locRes.rows[0].location_id;
      } else {
        const insertLoc = await db.query(
          `INSERT INTO locations (name, latitude, longitude, district, state)
           VALUES ($1, $2, $3, $4, $5) RETURNING location_id`,
          [location, lat, lng, district, state]
        );
        location_id = insertLoc.rows[0].location_id;
      }

      const sampleRes = await db.query(
        `INSERT INTO samples (location_id, sample_date, source_type, notes, user_id)
         VALUES ($1, $2, $3, $4, $5) RETURNING sample_id`,
        [location_id, new Date().toISOString(), 'Groundwater', 'CSV import', userId]
      );
      const sample_id = sampleRes.rows[0].sample_id;

      const concentrations = [];
      const hpiStandards = [];
      const heiStandards = [];
      const cfArray = [];
      
      for (const m of metals) {
        const standard = metalStandards[m.metal_name];
        if (!standard) {
          throw new Error(`Standard for metal ${m.metal_name} not found.`);
        }
        
        const concentration = parseFloat(m.concentration);
        concentrations.push(concentration);
        hpiStandards.push(standard.standard);
        heiStandards.push(standard.mac);
        cfArray.push(calculateCF(concentration, standard.mac));
        
        await db.query(
          `INSERT INTO metal_concentrations (sample_id, metal_name, concentration_ppm)
           VALUES ($1, $2, $3)`,
          [sample_id, m.metal_name, concentration]
        );
      }

      const hpi = calculateHPI(concentrations, hpiStandards);
      const hei = calculateHEI(concentrations, heiStandards);
      const pli = calculatePLI(cfArray);
      const mpi = calculateMPI(concentrations);

      // 🔑 ALERT CHECK: If highly polluted, generate a mock alert.
      if (getHEIClassification(hei) === 'Highly Polluted') {
        generatedAlerts.push({
            location: location,
            hei: hei.toFixed(2),
            timestamp: new Date().toISOString(),
            // Mock notification for officials/NGOs
            message: `CRITICAL ALERT: ${location} recorded Highly Polluted water (HEI: ${hei.toFixed(2)})! Immediate review required.`,
        });
      }
      
      await db.query(
        `INSERT INTO pollution_indices (sample_id, hpi, hei, pli, mpi, cf)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [sample_id, hpi, hei, pli, mpi, JSON.stringify(cfArray)]
      );

      insertedCount += metals.length;
    }
    
    await db.query('COMMIT');
    fs.unlinkSync(filePath);
    // 🔑 Return alerts in the response
    res.status(200).json({ message: 'Upload complete', inserted: insertedCount, alerts: generatedAlerts });
  } catch (err) {
    await db.query('ROLLBACK');
    console.error('❌ Upload failed:', err);
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    next(err);
  }
}
