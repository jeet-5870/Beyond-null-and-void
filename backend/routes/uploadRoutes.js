// backend/routes/uploadRoutes.js
import express from 'express';
import multer from 'multer';
import fs from 'fs';
import handleUpload from '../controllers/uploadController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import path from 'path'; 


const router = express.Router();

const upload = multer({
  // FIX: Use path.join(process.cwd(), 'uploads') to create a directory inside the project root
  dest: path.join(process.cwd(), 'uploads'),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv') cb(null, true);
    else cb(new Error('Only CSV files are allowed'));
  }
});

// Endpoint 1: Public Educational Dry-Run historical report ingest
router.post('/historical', upload.single('file'), handleUpload);

// Endpoint 2: Protected route for standard uploads from the dashboard
router.post('/', authMiddleware, upload.single('file'), handleUpload);

export default router;
