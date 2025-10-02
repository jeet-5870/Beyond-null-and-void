// backend/routes/resultRoutes.js

import express from 'express';
import db from '../db/db.js';
import { getHEIClassification } from '../utils/classification.js';

const router = express.Router();

// New controller logic for fetching user-specific samples
const getUserSamples = (req, res, next) => {
  const { userId, role } = req.user; // Get userId and role from the authenticated request

  let query;
  let params = [];
  
  // 🔑 FIX: NGO, Researcher, AND GUEST now retrieve Global data (All Samples)
  if (role === 'ngo' || role === 'researcher' || role === 'guest') {
    // Global Data: Retrieve ALL samples for NGOs, Researchers, and Guests
    query = `
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
      JOIN samples s ON pi.sample_id = s.sample_id
      JOIN locations l ON s.location_id = l.location_id
      ORDER BY l.name;
    `;
    // No parameters needed for global query
    params = []; 
  } else {
    // Fallback: This block is now unreachable with current defined roles.
    query = `
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
      JOIN samples s ON pi.sample_id = s.sample_id
      JOIN locations l ON s.location_id = l.location_id
      WHERE s.user_id = $1 -- Filter results by the authenticated user's ID
      ORDER BY l.name;
    `;
    params = [userId];
  }

  db.query(query, params)
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