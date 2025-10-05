// backend/routes/feedbackRoutes.js

import express from 'express';
// This import will now work correctly
import { submitFeedback, getUserFeedback, getAllFeedback } from '../controllers/feedbackControllers.js';
// 🔑 NEW IMPORT: Import the separate controller for unauthenticated public feedback submission
import { submitFeedback as submitPublicFeedback } from '../controllers/submitfeedbackController.js'; 
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// 🔑 FIX: Added public POST route to handle /api/feedback from the main page form.
router.post('/', submitPublicFeedback); 

// Protected routes for submitting and viewing user-specific feedback
router.post('/submit', authMiddleware, submitFeedback);
router.get('/user-feedback', authMiddleware, getUserFeedback);

// Public or admin-only route to get all feedback
router.get('/', getAllFeedback); 

export default router;