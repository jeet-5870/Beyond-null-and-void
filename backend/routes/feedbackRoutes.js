// backend/routes/feedbackRoutes.js

import express from 'express';
import { submitFeedback, getUserFeedback, getAllFeedback } from '../controllers/feedbackControllers.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// Public route: POST /api/feedback (for ComplaintForm)
router.post('/', submitFeedback); 
router.get('/', getAllFeedback); 

// Protected routes for authenticated users
router.post('/submit', authMiddleware, submitFeedback);
router.get('/user-feedback', authMiddleware, getUserFeedback);

export default router;
