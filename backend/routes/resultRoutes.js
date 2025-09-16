import express from 'express';
import db from '../db/db.js';

const router = express.Router();

router.get('/', (req, res) => {
  db.all(`
    SELECT l.name AS location, pi.hpi, pi.hei
    FROM pollution_indices pi
    JOIN samples s ON pi.sample_id = s.sample_id
    JOIN locations l ON s.location_id = l.location_id
  `, (err, rows) => {
    if (err) {
      console.error('❌ DB query failed:', err.message);
      return res.status(500).json({ error: err.message });
    }

    const grouped = rows.reduce((acc, row) => {
      if (!acc[row.location]) acc[row.location] = { hpi: 0, hei: 0, count: 0 };
      acc[row.location].hpi += row.hpi;
      acc[row.location].hei += row.hei;
      acc[row.location].count += 1;
      return acc;
    }, {});

    const result = Object.entries(grouped).map(([location, vals]) => {
      const hpi = vals.hpi / vals.count;
      const hei = vals.hei / vals.count;
      const pli = hpi * 0.7; // example formula
      const mpi = hei * 0.3; // example formula
      const classification = hpi > 1 || hei > 1 ? 'Unsafe' : 'Safe';

      return { location, hpi, pli, mpi, hei, classification };
    });

    res.json(result);
  });
});

export default router;
