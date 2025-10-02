import db from '../db/db.js';
import { getHPIClassification, getHEIClassification } from '../utils/classification.js';

export default function getMapData(req, res) {
  const { userId, role } = req.user; // 🔑 Get userId and role from the authenticated request

  let query;
  let params = [];
  
  // 🔑 FIX: NGO, Researcher, AND GUEST now retrieve Global data for the map, consistent with resultRoutes.js
  if (role === 'ngo' || role === 'researcher' || role === 'guest') {
    // Global Data: Retrieve ALL samples for NGOs, Researchers, and Guests
    query = `
      SELECT
        s.sample_id AS id,
        l.name AS location,
        l.latitude AS lat,
        l.longitude AS lng,
        pi.hpi,
        pi.hei
      FROM samples s
      JOIN locations l ON s.location_id = l.location_id
      JOIN pollution_indices pi ON s.sample_id = pi.sample_id
      ORDER BY s.sample_id
    `;
    params = []; 
  } else {
    // Fallback/Local user data
    query = `
      SELECT
        s.sample_id AS id,
        l.name AS location,
        l.latitude AS lat,
        l.longitude AS lng,
        pi.hpi,
        pi.hei
      FROM samples s
      JOIN locations l ON s.location_id = l.location_id
      JOIN pollution_indices pi ON s.sample_id = pi.sample_id
      WHERE s.user_id = $1  -- Filter by user ID
      ORDER BY s.sample_id
    `;
    params = [userId];
  }


  db.query(query, params) // 🔑 Use dynamic query and params
    .then(result => {
      const grouped = result.rows.map(row => ({
        id: row.id,
        location: row.location,
        lat: row.lat,
        lng: row.lng,
        hpi: row.hpi,
        hei: row.hei,
        hpiClassification: getHPIClassification(row.hpi),
        heiClassification: getHEIClassification(row.hei)
      }));
      res.json(grouped);
    })
    .catch(err => {
      console.error('DB error in getMapData:', err.message);
      res.status(500).json({ error: 'Failed to fetch map data' });
    });
}