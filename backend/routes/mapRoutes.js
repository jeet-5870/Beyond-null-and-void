import express from "express";
const router = express.Router();
import getMapData from '../controllers/mapController.js';

router.get('/', getMapData);

export default  router;