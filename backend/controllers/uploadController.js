import fs from 'fs';
import csv from 'csv-parser';
import db from '../db/db.js';
import { calculateHMPI, calculateHEI, calculatePLI, calculateMPI, calculateCF } from '../utils/formulaEngine.js';
import { kmeans } from 'ml-kmeans';

/** Helper function to calculate mean and standard deviation */
function getMeanAndStdDev(values) {
  if (!values || values.length === 0) return { mean: 0, stdDev: 0 };
  const n = values.length;
  const mean = values.reduce((a, b) => a + b, 0) / n;
  const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / n;
  return { mean, stdDev: Math.sqrt(variance) };
}

async function sendCriticalAlertsToOfficials(alertData) {
  if (alertData.length === 0) return;
  console.log(`🚨 Attempting to send ${alertData.length} critical pollution alerts externally...`);
  await new Promise(resolve => setTimeout(resolve, 500));
  console.log('✅ External Alert Service notification simulated and complete.');
}

export default async function handleUpload(req, res, next) {
  const userId = req.user ? req.user.userId : null;
  const userRole = req.user ? req.user.role : null;
  const isGeneralUser = userRole === 'general';
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
  const requiredHeaders = ['location', 'lat', 'lng', 'Lead_Concentration', 'Mercury_Concentration', 'Arsenic_Concentration'];

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
          
          rowsByLocation[key].push({ location: row.location, lat: row.lat, lng: row.lng, district: row.district, state: row.state, metal_name: 'Lead', concentration: row.Lead_Concentration });
          rowsByLocation[key].push({ location: row.location, lat: row.lat, lng: row.lng, district: row.district, state: row.state, metal_name: 'Mercury', concentration: row.Mercury_Concentration });
          rowsByLocation[key].push({ location: row.location, lat: row.lat, lng: row.lng, district: row.district, state: row.state, metal_name: 'Arsenic', concentration: row.Arsenic_Concentration });
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
    if (!finalUserId && !isGeneralUser) {
      const adminRes = await db.query("SELECT user_id FROM users WHERE email='admin@example.com'");
      if (adminRes.rows.length === 0) {
        throw new Error("Default admin user not found for public uploads.");
      }
      finalUserId = adminRes.rows[0].user_id;
    }
    
    const educationalResults = [];
    if (!isGeneralUser) await db.query('BEGIN');
    
    let insertedCount = 0;
    for (const [key, metals] of Object.entries(rowsByLocation)) {
      const { location, lat, lng } = metals[0];
      const district = metals[0].district || location;
      const state = metals[0].state || 'N/A';
      
      let location_id = null;
      let sample_id = null;
      
      if (!isGeneralUser) {
        let locRes = await db.query('SELECT location_id FROM locations WHERE name = $1', [location]);
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
        sample_id = sampleRes.rows[0].sample_id;
      }

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
        
        if (!isGeneralUser) {
          await db.query(
            `INSERT INTO metal_concentrations (sample_id, metal_name, concentration_ppm) VALUES ($1, $2, $3)`,
            [sample_id, m.metal_name, concentration]
          );
        }
      }

      const hpi = calculateHMPI(concentrations, hpiStandards);
      const hei = calculateHEI(concentrations, heiStandards);
      const pli = calculatePLI(cfArray);
      const mpi = calculateMPI(concentrations);

      // === ML ANOMALY DETECTION (Z-Score Approach) ===
      // Fetch historical concentrations for this location to find mean & stddev
      const histRes = await db.query(`
        SELECT mc.metal_name, mc.concentration_ppm 
        FROM metal_concentrations mc
        JOIN samples s ON mc.sample_id = s.sample_id
        WHERE s.location_id = $1
      `, [location_id]);

      let is_anomaly = false;
      const historyByMetal = { Lead: [], Mercury: [], Arsenic: [] };
      histRes.rows.forEach(r => {
        if (historyByMetal[r.metal_name]) {
          historyByMetal[r.metal_name].push(r.concentration_ppm);
        }
      });

      for (const m of metals) {
         const historicalVals = historyByMetal[m.metal_name] || [];
         if (historicalVals.length >= 3) {
            const { mean, stdDev } = getMeanAndStdDev(historicalVals);
            if (stdDev > 0) {
              const currentVal = parseFloat(m.concentration);
              const zScore = Math.abs((currentVal - mean) / stdDev);
              if (zScore > 2.5) { // Threshold for anomaly
                is_anomaly = true;
              }
            }
         }
      }

      // Fallback or secondary check
      if (hpi > 200) {
        is_anomaly = true;
      }

      // === ML CLUSTERING (K-Means) ===
      // Fetch recent indices to cluster
      const recentIndices = await db.query(`
        SELECT hpi, hei, pli FROM pollution_indices
        WHERE hpi IS NOT NULL AND hei IS NOT NULL AND pli IS NOT NULL
        ORDER BY computed_on DESC LIMIT 50
      `);
      
      let cluster_id = 1;
      if (recentIndices.rows.length >= 5) {
        const dataForClustering = recentIndices.rows.map(r => [r.hpi, r.hei, r.pli]);
        // Add the current point to be clustered
        dataForClustering.push([hpi, hei, pli]);
        
        try {
          const numClusters = Math.min(3, dataForClustering.length);
          const result = kmeans(dataForClustering, numClusters, { initialization: 'kmeans++' });
          // The last element's cluster is our assigned cluster
          cluster_id = result.clusters[dataForClustering.length - 1] + 1; 
        } catch (clusterErr) {
          console.error("Clustering error:", clusterErr);
        }
      } else {
        cluster_id = Math.floor(Math.random() * 3) + 1; // Fallback
      }
      
      const classification = getHPIClassification(hpi);
      if (is_anomaly) { 
        generatedAlerts.push({
          location, hpi, hei,
          // 🔑 FIX: Update alert message to reference ML Anomaly
          message: `CRITICAL Anomaly detected at ${location}. HPI: ${hpi.toFixed(2)}. This deviates significantly from historical trends.`,
          timestamp: new Date().toISOString()
        });
      }

      if (isGeneralUser) {
        educationalResults.push({
          location, hpi, hei, pli, mpi, classification, is_anomaly
        });
      } else {
        await db.query(
          `INSERT INTO pollution_indices (sample_id, hpi, hei, pli, mpi, cf, is_anomaly, cluster_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [sample_id, hpi, hei, pli, mpi, JSON.stringify(cfArray), is_anomaly, cluster_id]
        );
        insertedCount += metals.length;
      }
    }
    
    if (!isGeneralUser) await db.query('COMMIT');
    fs.unlinkSync(filePath);
    
    await sendCriticalAlertsToOfficials(generatedAlerts);

    if (isGeneralUser) {
      res.status(200).json({
        message: 'Educational Mode: Data processed but not saved.',
        results: educationalResults,
        alerts: generatedAlerts
      });
    } else {
      res.status(200).json({ 
        message: 'Upload complete', 
        inserted: insertedCount,
        alerts: generatedAlerts,
      });
    }
    
  } catch (err) {
    if (!isGeneralUser) await db.query('ROLLBACK');
    console.error('❌ Upload failed:', err);
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    next(err);
  }
}