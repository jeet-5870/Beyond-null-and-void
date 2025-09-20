import db from "../db/db.js"

export const getTimelineData = async (req, res, next) => {
  const { city } = req.params;
  const { timeframe } = req.query;

  let interval;
  switch (timeframe) {
    case '7d': interval = '7 days'; break;
    case '15d': interval = '15 days'; break;
    case '1m': interval = '1 month'; break;
    case '3m': interval = '3 months'; break;
    case '6m': interval = '6 months'; break;
    default: return res.status(400).json({ error: 'Invalid timeframe provided.' });
  }

  try {
    const query = `
      SELECT
        s.sample_date::DATE as date,
        AVG(pi.hpi) as hpi
      FROM pollution_indices pi
      JOIN samples s ON pi.sample_id = s.sample_id
      JOIN locations l ON s.location_id = l.location_id
      WHERE l.name = $1 AND s.sample_date >= NOW() - INTERVAL '${interval}'
      GROUP BY s.sample_date
      ORDER BY s.sample_date ASC;
    `;
    const { rows } = await db.query(query, [city]);
    res.json(rows);
  } catch (err) {
    next(err);
  }
};