// backend/routes/uploadRoutes.js
import express from 'express';
import multer from 'multer';
import fs from 'fs';
import handleUpload from '../controllers/uploadController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const uploadDir = 'uploads/';
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const upload = multer({
  dest: uploadDir,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv') cb(null, true);
    else cb(new Error('Only CSV files are allowed'));
  }
});

const router = express.Router();

// Protected route for standard uploads from the dashboard
router.post('/', authMiddleware, upload.single('file'), async (req, res, next) => {
  try {
    console.log(`📁 Received file: ${req.file?.originalname}, size: ${req.file?.size} bytes`);
    await handleUpload(req, res, next);
  } catch (err) {
    next(err);
  }
});

// New public route for historical uploads
router.post('/historical', upload.single('file'), async (req, res, next) => {
  try {
    console.log(`📁 Received historical file: ${req.file?.originalname}, size: ${req.file?.size} bytes`);
    await handleUpload(req, res, next);
  } catch (err) {
    next(err);
  }
});

export default router;