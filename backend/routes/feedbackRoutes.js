// backend/routes/feedbackRoutes.js

import express from 'express';
import { submitFeedback, getUserFeedback, getAllFeedback } from '../controllers/feedbackControllers.js';
import { submitFeedback as submitPublicFeedback } from '../controllers/submitfeedbackController.js'; 
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// Public route: POST /api/feedback (for ComplaintForm)
router.post('/', submitPublicFeedback); 

// Public route: GET /api/feedback (for FeedbackList component, reads all feedback)
// 🔑 FIX: Explicitly ensure this route is defined for the GET request
router.get('/', getAllFeedback); 

// Protected routes for authenticated users
router.post('/submit', authMiddleware, submitFeedback);
router.get('/user-feedback', authMiddleware, getUserFeedback);

export default router;
