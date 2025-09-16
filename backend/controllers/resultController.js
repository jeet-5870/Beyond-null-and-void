import sqlite3 from "sqlite3";
const db = new sqlite3.Database('./db.sqlite');
import { calculateCF, calculatePLI, calculateHPI, calculateMPI } from '../utils/formulaEngine.js';

export function computeResults(req, res) {
  const query = `
    SELECT location, lat, lng, metal_name, concentration, classification, standard
    FROM samples
    ORDER BY location
  `;

  db.all(query, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });

    const grouped = groupByLocation(rows);
    const results = grouped.map((group) => {
      const concentrations = group.metals.map((m) => m.concentration);
      const standards = group.metals.map((m) => m.standard);

      const cfArray = concentrations.map((c, i) => calculateCF(c, standards[i]));
      const pli = calculatePLI(cfArray);
      const hpi = calculateHPI(concentrations, standards);
      const mpi = calculateMPI(concentrations);

      return {
        location: group.location,
        lat: group.lat,
        lng: group.lng,
        classification: group.classification,
        indices: { CF: cfArray, PLI: pli, HPI: hpi, MPI: mpi },
        metals: group.metals.map((m) => m.metal_name),
      };
    });

    res.json(results);
  });
}

function groupByLocation(rows) {
  const map = new Map();

  for (const row of rows) {
    const key = `${row.location}-${row.lat}-${row.lng}`;
    if (!map.has(key)) {
      map.set(key, {
        location: row.location,
        lat: row.lat,
        lng: row.lng,
        classification: row.classification,
        metals: [],
      });
    }
    map.get(key).metals.push({
      metal_name: row.metal_name,
      concentration: row.concentration,
      standard: row.standard,
    });
  }

  return Array.from(map.values());
}
