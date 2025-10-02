// backend/controllers/analysisController.js

import db from '../db/db.js';
import { getHEIClassification } from '../utils/classification.js';

/**
 * In a production environment, this function would execute a Python script
 * using a child process to run DBSCAN and anomaly detection algorithms.
 * For this implementation, we will simulate the output by using the
 * 'cluster_id' and 'is_anomaly' flags already in the database.
 */
export const getAnalysisResults = async (req, res, next) => {
  try {
    const query = `
      SELECT
        l.name AS location,
        l.latitude AS lat,
        l.longitude AS lng,
        pi.hpi,
        pi.hei,
        pi.pli,
        pi.mpi,
        pi.is_anomaly,
        pi.cluster_id,
        s.sample_date
      FROM pollution_indices pi
      JOIN samples s ON pi.sample_id = s.sample_id
      JOIN locations l ON s.location_id = l.location_id
      ORDER BY l.name, s.sample_date DESC;
    `;
    
    const { rows } = await db.query(query);

    if (rows.length === 0) {
      return res.json({ hotspots: [], anomalies: [] });
    }

    // --- Process Data for Hotspots (DBSCAN Results) ---
    const clusters = {};
    rows.forEach(row => {
      if (row.cluster_id) {
        if (!clusters[row.cluster_id]) {
          clusters[row.cluster_id] = {
            id: row.cluster_id,
            locations: [],
            totalHpi: 0,
            totalPli: 0,
            count: 0,
            avgLat: 0,
            avgLng: 0,
          };
        }
        clusters[row.cluster_id].locations.push(row.location);
        clusters[row.cluster_id].totalHpi += row.hpi;
        clusters[row.cluster_id].totalPli += row.pli;
        clusters[row.cluster_id].avgLat += parseFloat(row.lat);
        clusters[row.cluster_id].avgLng += parseFloat(row.lng);
        clusters[row.cluster_id].count++;
      }
    });

    const hotspots = Object.values(clusters).map(c => ({
      id: c.id,
      avgHpi: c.totalHpi / c.count,
      avgPli: c.totalPli / c.count,
      locationCount: c.count,
      center: {
        lat: c.avgLat / c.count,
        lng: c.avgLng / c.count,
      },
      // Simple risk classification based on HPI
      risk: (c.totalHpi / c.count) > 200 ? 'High' : (c.totalHpi / c.count) > 100 ? 'Moderate' : 'Low',
      lastUpdate: new Date().toISOString(), // Placeholder
    }));
    
    // --- Process Data for Anomalies ---
    const anomalies = rows
      .filter(row => row.is_anomaly)
      .map(row => ({
        location: row.location,
        pollutant: 'Heavy Metals (HEI)', // Example
        value: row.hei.toFixed(2),
        threshold: '50.00', // Example threshold
        timestamp: row.sample_date,
        message: `Abnormal HEI value of ${row.hei.toFixed(2)} detected.`
      }));

    res.json({ hotspots, anomalies });

  } catch (err) {
    next(err);
  }
};  