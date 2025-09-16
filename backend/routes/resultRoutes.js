import express from 'express';
import db from '../db/db.js';
import { calculatePLI, calculateMPI } from '../utils/formulaEngine.js'; 

const router = express.Router();

router.get('/', (req, res) => {
  const query = `
    SELECT
      l.name AS location,
      pi.hpi,
      pi.hei,
      mc.concentration_ppm AS concentration
    FROM pollution_indices pi
    JOIN samples s ON pi.sample_id = s.sample_id
    JOIN locations l ON s.location_id = l.location_id
    JOIN metal_concentrations mc ON s.sample_id = mc.sample_id
  `;

  // Use db.query() for PostgreSQL and handle the promise
  db.query(query)
    .then(result => {
      const rows = result.rows;

      const grouped = rows.reduce((acc, row) => {
        if (!acc[row.location]) {
          acc[row.location] = { hpi: row.hpi, hei: row.hei, concentrations: [] };
        }
        acc[row.location].concentrations.push(row.concentration);
        return acc;
      }, {});

      const finalResult = Object.entries(grouped).map(([location, vals]) => {
        // Correct PLI and MPI calculations using your formulaEngine
        const pli = calculatePLI(vals.concentrations);
        const mpi = calculateMPI(vals.concentrations);
        
        const hpi = vals.hpi;
        const hei = vals.hei;
        
        // Assuming a simple classification based on HPI or HEI values
        const classification = hpi > 1 || hei > 1 ? 'Unsafe' : 'Safe';

        return { location, hpi, pli, mpi, hei, classification };
      });

      res.json(finalResult);
    })
    .catch(err => {
      console.error('❌ DB query failed:', err.message);
      res.status(500).json({ error: 'Failed to fetch data' });
    });
});

export default router;