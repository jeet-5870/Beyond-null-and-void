import express from 'express';
import { submitFeedback, getUserFeedback, getAllFeedback } from '../controllers/feedbackControllers.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/submit', authMiddleware, submitFeedback);
router.get('/user-feedback', authMiddleware, getUserFeedback);
router.get('/', getAllFeedback); 

export default router;