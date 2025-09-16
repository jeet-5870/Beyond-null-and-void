import sqlite3 from "sqlite3";
const db = new sqlite3.Database('./db.sqlite');

/**
 * Fetch geo-tagged groundwater data with classification and metal types
 */
export default function getMapData (req, res) {
  const query = `
    SELECT
      s.sample_id AS id,
      l.name AS location,
      l.latitude AS lat,
      l.longitude AS lng,
      pi.hpi,
      pi.hei
    FROM samples s
    JOIN locations l ON s.location_id = l.location_id
    JOIN pollution_indices pi ON s.sample_id = pi.sample_id
    ORDER BY s.sample_id
  `;

  db.all(query, [], (err, rows) => {
    if (err) {
      console.error('DB error in getMapData:', err.message);
      return res.status(500).json({ error: 'Failed to fetch map data' });
    }

    const grouped = groupBySample(rows);
    res.json(grouped);
  });
};

/**
 * Groups metal names by sample ID
 * @param {Array} rows - Raw DB rows
 * @returns {Array} - Grouped data for frontend map
 */
function groupBySample(rows) {
  const map = new Map();

  for (const row of rows) {
    if (!map.has(row.id)) {
      map.set(row.id, {
        id: row.id,
        location: row.location,
        lat: row.lat,
        lng: row.lng,
        classification: row.classification,
        metals: [],
      });
    }
    map.get(row.id).metals.push(row.metal_name);
  }

  return Array.from(map.values());
}
