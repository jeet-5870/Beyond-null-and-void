import express from 'express';
import db from '../db/db.js';
import { getHEIClassification } from '../utils/classification.js';

const router = express.Router();

router.get('/', (req, res, next) => {
  const query = `
    SELECT
      l.name AS location,
      l.latitude AS lat,
      l.longitude AS lng,
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
      // Add classification before sending to frontend
      const classifiedResults = result.rows.map(item => ({
        ...item,
        classification: getHEIClassification(item.hei),
      }));
      res.json(classifiedResults);
    })
    .catch(err => {
      next(err);
    });
});

export default router;