import express from 'express';
import db from '../db/db.js';

const router = express.Router();

router.get('/', (req, res) => {
  const query = `
    SELECT
      l.name AS location,
      pi.hpi,
      pi.hei,
      pi.pli,
      pi.mpi,
      pi.cf
    FROM pollution_indices pi
    JOIN samples s ON pi.sample_id = s.sample_id
    JOIN locations l ON s.location_id = l.location_id
    ORDER BY l.name;
  `;

  db.query(query)
    .then(result => {
      res.json(result.rows);
    })
    .catch(err => {
      console.error('❌ DB query failed:', err.message);
      res.status(500).json({ error: 'Failed to fetch data' });
    });
});

export default router;