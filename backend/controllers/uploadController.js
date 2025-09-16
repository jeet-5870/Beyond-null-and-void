import fs from 'fs';
import csv from 'csv-parser';
import db from '../db/db.js';

export default async function handleUpload(req, res) {
  const filePath = req.file?.path;
  if (!filePath) return res.status(400).json({ error: 'No file uploaded' });

  const rowsByLocation = {};

  // Parse CSV
  await new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        const key = `${row.location}_${row.lat}_${row.lng}`;
        if (!rowsByLocation[key]) rowsByLocation[key] = [];
        rowsByLocation[key].push(row);
      })
      .on('end', resolve)
      .on('error', reject);
  });

  let insertedCount = 0;

  try {
    if (db.query) {
      // PostgreSQL
      await db.query(`DELETE FROM pollution_indices`);
      await db.query(`DELETE FROM metal_concentrations`);
      await db.query(`DELETE FROM samples`);
      await db.query(`DELETE FROM locations`);

      for (const [key, metals] of Object.entries(rowsByLocation)) {
        const { location, lat, lng } = metals[0];

        let locRes = await db.query(
          `SELECT location_id FROM locations WHERE name = $1`,
          [location]
        );

        let location_id;
        if (locRes.rows.length > 0) {
          location_id = locRes.rows[0].location_id;
        } else {
          const insertLoc = await db.query(
            `INSERT INTO locations (name, latitude, longitude, district, state)
             VALUES ($1, $2, $3, $4, $5) RETURNING location_id`,
            [location, lat, lng, location, 'UP']
          );
          location_id = insertLoc.rows[0].location_id;
        }

        const sampleRes = await db.query(
          `INSERT INTO samples (location_id, sample_date, source_type, notes)
           VALUES ($1, $2, $3, $4) RETURNING sample_id`,
          [location_id, new Date().toISOString(), 'Groundwater', 'CSV import']
        );
        const sample_id = sampleRes.rows[0].sample_id;

        let hpiSum = 0;
        let heiSum = 0;

        for (const m of metals) {
          const cf = parseFloat(m.concentration) / parseFloat(m.standard);
          hpiSum += cf;
          heiSum += cf;

          await db.query(
            `INSERT INTO metal_concentrations (sample_id, metal_name, concentration_ppm)
             VALUES ($1, $2, $3)`,
            [sample_id, m.metal_name, m.concentration]
          );
        }

        await db.query(
          `INSERT INTO pollution_indices (sample_id, hpi, hei)
           VALUES ($1, $2, $3)`,
          [sample_id, hpiSum, heiSum]
        );

        insertedCount += metals.length;
      }
    } else {
      // SQLite
      db.serialize(() => {
        db.run(`DELETE FROM pollution_indices`);
        db.run(`DELETE FROM metal_concentrations`);
        db.run(`DELETE FROM samples`);
        db.run(`DELETE FROM locations`);

        Object.entries(rowsByLocation).forEach(([key, metals]) => {
          const { location, lat, lng } = metals[0];

          db.get(
            `SELECT location_id FROM locations WHERE name = ?`,
            [location],
            (err, loc) => {
              if (err) return console.error('Location lookup failed:', err);

              const insertLocation = () => {
                db.run(
                  `INSERT INTO locations (name, latitude, longitude, district, state)
                   VALUES (?, ?, ?, ?, ?)`,
                  [location, lat, lng, location, 'UP'],
                  function () {
                    insertSample(this.lastID, metals);
                  }
                );
              };

              const insertSample = (location_id, metals) => {
                db.run(
                  `INSERT INTO samples (location_id, sample_date, source_type, notes)
                   VALUES (?, ?, ?, ?)`,
                  [location_id, new Date().toISOString(), 'Groundwater', 'CSV import'],
                  function () {
                    const sample_id = this.lastID;
                    let hpiSum = 0;
                    let heiSum = 0;

                    metals.forEach((m) => {
                      const cf = parseFloat(m.concentration) / parseFloat(m.standard);
                      hpiSum += cf;
                      heiSum += cf;

                      db.run(
                        `INSERT INTO metal_concentrations (sample_id, metal_name, concentration_ppm)
                         VALUES (?, ?, ?)`,
                        [sample_id, m.metal_name, m.concentration]
                      );
                    });

                    db.run(
                      `INSERT INTO pollution_indices (sample_id, hpi, hei)
                       VALUES (?, ?, ?)`,
                      [sample_id, hpiSum, heiSum]
                    );

                    insertedCount += metals.length;
                  }
                );
              };

              if (loc) insertSample(loc.location_id, metals);
              else insertLocation();
            }
          );
        });
      });
    }

    fs.unlinkSync(filePath);
    res.json({ message: 'Upload complete', inserted: insertedCount });
  } catch (err) {
    console.error('❌ Upload failed:', err);
    res.status(500).json({ error: 'Upload failed', details: err.message });
  }
}
