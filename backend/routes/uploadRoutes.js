// backend/routes/uploadRoutes.js
import express from 'express';
import multer from 'multer';
import fs from 'fs';
import handleUpload from '../controllers/uploadController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import path from 'path'; // 🔑 NEW IMPORT

// 🔑 REMOVED: Manual directory creation logic removed

const upload = multer({
  // 🔑 FIX: Use path.join(process.cwd(), 'uploads') to create a directory inside the project root
  dest: path.join(process.cwd(), 'uploads'),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv') cb(null, true);
    else cb(new Error('Only CSV files are allowed'));
  }
});

const router = express.Router();

// Protected route for standard uploads from the dashboard
router.post('/', authMiddleware, upload.single('file'), handleUpload);

export default router;