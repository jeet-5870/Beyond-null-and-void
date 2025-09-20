import db from '../db/db.js';

export const getLeaderboardData = async (req, res, next) => {
  const { page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;

  try {
    const query = `
      WITH latest_samples AS (
        SELECT DISTINCT ON (location_id)
          sample_id,
          location_id
        FROM samples
        ORDER BY location_id, sample_date DESC
      )
      SELECT
        l.name AS city,
        AVG(pi.hpi) AS pollutionIndex
      FROM pollution_indices pi
      JOIN latest_samples ls ON pi.sample_id = ls.sample_id
      JOIN locations l ON ls.location_id = l.location_id
      GROUP BY l.name
      ORDER BY pollutionIndex DESC
      OFFSET $1
      LIMIT $2;
    `;

    const { rows } = await db.query(query, [offset, limit]);
    
    const countQuery = 'SELECT COUNT(DISTINCT location_id) FROM samples';
    const countRes = await db.query(countQuery);
    const totalCount = parseInt(countRes.rows[0].count);

    res.json({
      cities: rows,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: parseInt(page),
    });
  } catch (err) {
    next(err);
  }
};

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
