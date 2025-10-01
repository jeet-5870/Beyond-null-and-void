import express from 'express';
// Note: Changed import names to match the controller functions
import { getPublicFeedback, submitFeedback, getUserFeedback } from '../controllers/feedbackControllers.js';
import authMiddleware from '../middleware/authMiddleware.js'; // Need to import authMiddleware for protected routes

const router = express.Router();

// Public routes (Used by the Main Page / anonymous users)
router.get('/', getPublicFeedback); 
router.post('/', submitFeedback); 

// Protected route (Used by the Dashboard)
// Must be placed before the app-level authMiddleware or explicitly defined here:
// Since this file is mounted *before* app.use(authMiddleware), we use authMiddleware explicitly here for this specific sub-route
router.get('/user/feedback', authMiddleware, getUserFeedback); 

export default router;
