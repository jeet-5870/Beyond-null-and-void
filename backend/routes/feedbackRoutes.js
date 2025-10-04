import express from 'express';
// This import will now work correctly
import { submitFeedback, getUserFeedback, getAllFeedback } from '../controllers/feedbackControllers.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// Protected routes for submitting and viewing user-specific feedback
router.post('/submit', authMiddleware, submitFeedback);
router.get('/user-feedback', authMiddleware, getUserFeedback);

// Public or admin-only route to get all feedback
router.get('/', getAllFeedback); 

export default router;