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

// New public route for historical uploads
// 🔑 FIX: Simplified route handler chain for robustness to resolve 404 issue.
// router.post('/historical', upload.single('file'), handleUpload);

// Protected route for standard uploads from the dashboard
// 🔑 FIX: Simplified route handler chain for robustness to use handleUpload as the final controller.
router.post('/', authMiddleware, upload.single('file'), handleUpload);

export default router;