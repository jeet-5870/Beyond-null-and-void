// backend/routes/analysisRoutes.js

import express from 'express';
import { getAnalysisResults } from '../controllers/analysisController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// Protected route to get analysis results
router.get('/', authMiddleware, getAnalysisResults);

export default router;