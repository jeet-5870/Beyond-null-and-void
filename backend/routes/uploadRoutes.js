import express from 'express';
import multer from 'multer';
import fs from 'fs';
import handleUpload from '../controllers/uploadController.js';

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

router.post('/', upload.single('file'), async (req, res, next) => {
  try {
    console.log(`📁 Received file: ${req.file?.originalname}, size: ${req.file?.size} bytes`);
    await handleUpload(req, res);
  } catch (err) {
    next(err);
  }
});

export default router;