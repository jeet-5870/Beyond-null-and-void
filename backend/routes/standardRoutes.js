// backend/routes/standardRoutes.js

import express from 'express';
import multer from 'multer';
import csv from 'csv-parser';
import fs from 'fs';
import db from '../db/db.js';
import path from 'path';

const router = express.Router();
const upload = multer({ dest: path.join(process.cwd(), 'uploads') });

router.post('/', upload.single('file'), async (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const standards = [];
  const requiredHeaders = ['metal_name', 'mac_ppm', 'standard_ppm'];
  let client;

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
        if (!headersValid) return;
        standards.push({
          metal_name: row.metal_name,
          mac_ppm: parseFloat(row.mac_ppm),
          standard_ppm: parseFloat(row.standard_ppm),
        });
      });

      csvStream.on('end', resolve);
      csvStream.on('error', reject);
    });

    client = await db.connect();
    await client.query('BEGIN');
    await client.query('DELETE FROM metal_standards');

    for (const s of standards) {
      await client.query(
        `INSERT INTO metal_standards (metal_name, mac_ppm, standard_ppm)
         VALUES ($1, $2, $3)`,
        [s.metal_name, s.mac_ppm, s.standard_ppm]
      );
    }

    await client.query('COMMIT');
    res.status(200).json({ message: 'Metal standards uploaded successfully.' });
  } catch (error) {
    if (client) {
      try {
        await client.query('ROLLBACK');
      } catch (rollbackErr) {
        console.error('Rollback failed:', rollbackErr);
      }
    }
    next(error);
  } finally {
    if (client) {
      client.release();
    }
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
  }
});

export default router;
