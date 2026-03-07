// backend/controllers/mapController.js

import db from '../db/db.js';
import { getHPIClassification } from '../utils/classification.js'; // FIX: Removed getHEIClassification import

export default async function getMapData(req, res, next) {
  const { userId, role } = req.user;

  let query;
  let params = [];
  
  if (role === 'ngo' || role === 'researcher' || role === 'guest') {
    query = `
      SELECT
        s.sample_id AS id,
        l.name AS location,
        l.latitude AS lat,
        l.longitude AS lng,
        pi.hpi,
        pi.hei,
        s.sample_date
      FROM samples s
      JOIN locations l ON s.location_id = l.location_id
      JOIN pollution_indices pi ON s.sample_id = pi.sample_id
      ORDER BY s.sample_date ASC;
    `;
    params = []; 
  } else {
    query = `
      SELECT
        s.sample_id AS id,
        l.name AS location,
        l.latitude AS lat,
        l.longitude AS lng,
        pi.hpi,
        pi.hei,
        s.sample_date
      FROM samples s
      JOIN locations l ON s.location_id = l.location_id
      JOIN pollution_indices pi ON s.sample_id = pi.sample_id
      WHERE s.user_id = $1
      ORDER BY s.sample_date ASC;
    `;
    params = [userId];
  }

  try {
    const result = await db.query(query, params);
    const grouped = result.rows.map(row => ({
      id: row.id,
      location: row.location,
      lat: row.lat,
      lng: row.lng,
      hpi: row.hpi,
      hei: row.hei,
      sample_date: row.sample_date,
      classification: getHPIClassification(row.hpi),
      // FIX: Removed heiClassification
    }));
    res.json(grouped);
  } catch (err) {
    console.error('DB error in getMapData:', err.message);
    res.status(500).json({ error: 'Failed to fetch map data' });
  }
}