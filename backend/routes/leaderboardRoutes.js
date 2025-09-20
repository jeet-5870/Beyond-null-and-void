import express from 'express';
import { getLeaderboardData } from '../controllers/getleaderboarddataController.js';
import { getTimelineData } from '../controllers/gettimelinedataController.js';

const router = express.Router();

router.get('/', getLeaderboardData);
router.get('/:city', getTimelineData);

export default router;