import express from 'express';
import { submitFeedback } from '../controllers/submitfeedbackController.js';

const router = express.Router();

router.post('/', submitFeedback);

export default router;
