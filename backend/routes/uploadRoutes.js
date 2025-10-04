import express from 'express';
import multer from 'multer';
import handleUpload from '../controllers/uploadController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();
const upload = multer({ dest: 'backend/uploads/' });

router.post('/', authMiddleware, upload.single('file'), handleUpload);
router.post('/historical', authMiddleware, upload.single('file'), handleUpload);

export default router;