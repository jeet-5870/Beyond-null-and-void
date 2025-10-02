import express from 'express';
import getFuturePrediction from '../controllers/predictionController.js'; // 🔑 FIX: Changed to default import

const router = express.Router();

router.get('/:location', getFuturePrediction);

export default router;