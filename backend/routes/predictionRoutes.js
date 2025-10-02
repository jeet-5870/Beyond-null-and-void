import express from 'express';
import { getFuturePrediction } from '../controllers/predictionController.js';

const router = express.Router();

router.get('/:location', getFuturePrediction);

export default router;