// backend/routes/feedbackRoutes.js
import express from 'express';
import { getPublicFeedback, getUserFeedback, submitFeedback } from '../controllers/feedbackControllers.js';

const router = express.Router();

// Public route (Main Page: Gets all/recent community feedback)
router.get('/', getPublicFeedback); 
router.post('/', submitFeedback); // Complaint submission uses token if available

// Protected route (Dashboard: Gets only the logged-in user's submissions)
router.get('/user/feedback', authMiddleware, getUserFeedback); 

export default router;

// ---