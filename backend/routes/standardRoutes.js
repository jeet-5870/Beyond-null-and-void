// backend/routes/standardRoutes.js

import express from 'express';
import multer from 'multer';
import csv from 'csv-parser';
import fs from 'fs';
import db from '../db/db.js';
import path from 'path'; // 🔑 FIX: Import path

const router = express.Router();
// 🔑 FIX: Use the robust, consistent path configuration
const upload = multer({ dest: path.join(process.cwd(), 'uploads') });

router.post('/', upload.single('file'), async (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const standards = [];
  const requiredHeaders = ['metal_name', 'mac_ppm', 'standard_ppm'];

  try {
    const csvStream = fs.createReadStream(req.file.path).pipe(csv());
    
    await new Promise((resolve, reject) => {
      let headersValid = false;
      
      csvStream.on('headers', (headers) => {
        const missingHeaders = requiredHeaders.filter(header => !headers.includes(header));
        if (missingHeaders.length > 0) {
          csvStream.destroy(new Error(`Missing required CSV headers: ${missingHeaders.join(', ')}`));
        } else {
          headersValid = true;
        }
      });
      
      csvStream.on('data', (row) => {
        if (headersValid) {
          standards.push({
            metal_name: row.metal_name,
            mac_ppm: parseFloat(row.mac_ppm),
            standard_ppm: parseFloat(row.standard_ppm),
          });
        }
      });
      
      csvStream.on('end', resolve);
      csvStream.on('error', reject);
    });

    await db.query('BEGIN');
    await db.query('DELETE FROM metal_standards');

    for (const s of standards) {
      await db.query(
        `INSERT INTO metal_standards (metal_name, mac_ppm, standard_ppm)
         VALUES ($1, $2, $3)`,
        [s.metal_name, s.mac_ppm, s.standard_ppm]
      );
    }

    await db.query('COMMIT');
    res.status(200).json({ message: 'Metal standards uploaded successfully.' });

  } catch (error) {
    await db.query('ROLLBACK');
    next(error);

  } finally {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
  }
});

export default router;