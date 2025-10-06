// backend/routes/resultRoutes.js

import express from 'express';
import db from '../db/db.js';
import { getHEIClassification } from '../utils/classification.js';

const router = express.Router();

const getUserSamples = async (req, res, next) => {
  const { userId, role } = req.user;

  let query;
  let params = [];
  
  // The logic to show global vs. user-specific data is correct.
  if (role === 'ngo' || role === 'researcher' || role === 'guest') {
    query = `
      WITH latest_samples AS (
        SELECT DISTINCT ON (location_id) 
          * FROM samples 
        ORDER BY location_id, sample_date DESC
      )
      SELECT
        l.name AS location,
        l.latitude AS lat,
        l.longitude AS lng,
        pi.hpi,
        pi.hei,
        pi.pli,
        pi.mpi,
        pi.cf,
        pi.is_anomaly,
        pi.cluster_id
      FROM pollution_indices pi
      JOIN latest_samples s ON pi.sample_id = s.sample_id
      JOIN locations l ON s.location_id = l.location_id
      ORDER BY l.name;
    `;
    params = [];
  } else {
    // This block handles other potential roles and is now also fixed
    query = `
      WITH latest_samples AS (
        SELECT DISTINCT ON (location_id) 
          * FROM samples 
        WHERE user_id = $1
        ORDER BY location_id, sample_date DESC
      )
      SELECT
        l.name AS location,
        l.latitude AS lat,
        l.longitude AS lng,
        pi.hpi,
        pi.hei,
        pi.pli,
        pi.mpi,
        pi.cf,
        pi.is_anomaly,
        pi.cluster_id
      FROM pollution_indices pi
      JOIN latest_samples s ON pi.sample_id = s.sample_id
      JOIN locations l ON s.location_id = l.location_id
      ORDER BY l.name;
    `;
    params = [userId];
  }

  try {
    const result = await db.query(query, params);
    const classifiedResults = result.rows.map(item => ({
      ...item,
      classification: getHEIClassification(item.hei),
    }));
    res.json(classifiedResults);
  } catch (err) {
    next(err);
  }
};

router.get('/', getUserSamples);

export default router;