import express from 'express';
import multer from 'multer';
import handleUpload from '../controllers/uploadController.js';

const upload = multer({ dest: 'uploads/' });
const router = express.Router();

router.post('/', upload.single('file'), handleUpload);

export default router;
