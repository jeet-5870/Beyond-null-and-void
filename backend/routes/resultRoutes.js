import express from 'express';
import db from '../db/db.js';
import { getHEIClassification } from '../utils/classification.js';

const router = express.Router();

// New controller logic for fetching user-specific samples
const getUserSamples = (req, res, next) => {
  const { userId } = req.user; // Get userId from the authenticated request

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
    WHERE s.user_id = $1 -- 🔑 Filter results by the authenticated user's ID
    ORDER BY l.name;
  `;

  db.query(query, [userId])
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
};

// 🔑 Use the new controller function
router.get('/', getUserSamples);

export default router;