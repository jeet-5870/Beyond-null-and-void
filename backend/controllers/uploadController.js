import fs from 'fs';
import csv from 'csv-parser';
import db from '../db/db.js'; // Adjust path if needed

export default function handleUpload(req, res) {
  const filePath = req.file?.path;
  if (!filePath) return res.status(400).json({ error: 'No file uploaded' });

  // Clear existing data from all tables
  db.serialize(() => {
    db.run(`DELETE FROM pollution_indices`);
    db.run(`DELETE FROM metal_concentrations`);
    db.run(`DELETE FROM samples`);
    db.run(`DELETE FROM locations`);
  });

  const rowsByLocation = {};

  fs.createReadStream(filePath)
    .pipe(csv())
    .on('data', (row) => {
      const key = `${row.location}_${row.lat}_${row.lng}`;
      if (!rowsByLocation[key]) rowsByLocation[key] = [];
      rowsByLocation[key].push(row);
    })
    .on('end', () => {
      let insertedCount = 0;

      Object.entries(rowsByLocation).forEach(([key, metals]) => {
        const { location, lat, lng } = metals[0];

        // This logic remains the same for inserting new data
        // after the tables have been cleared.
        db.get(
          `SELECT location_id FROM locations WHERE name = ?`,
          [location],
          (err, loc) => {
            if (err) return console.error('Location lookup failed:', err);
            
            // ... (rest of the insertion logic) ...
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

      fs.unlinkSync(filePath);
      res.json({ message: 'Upload complete', inserted: insertedCount });
    });
}