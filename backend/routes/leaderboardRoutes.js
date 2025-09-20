import express from 'express';
import { getLeaderboardData, getTimelineData } from '../controllers/leaderboardController.js';

const router = express.Router();

router.get('/', getLeaderboardData);
router.get('/:city', getTimelineData);

export default router;
