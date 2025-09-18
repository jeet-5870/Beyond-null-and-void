import db from '../db/db.js';
import { getHPIClassification, getHEIClassification } from '../utils/classification.js';

export default function getMapData(req, res) {
  const { userId } = req.user; // 🔑 Get userId from the authenticated request

  const query = `
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
    WHERE s.user_id = $1  -- 🕵️ Filter by user ID
    ORDER BY s.sample_id
  `;

  db.query(query, [userId])
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