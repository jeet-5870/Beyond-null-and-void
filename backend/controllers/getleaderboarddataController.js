import db from '../db/db.js';

export const getLeaderboardData = async (req, res, next) => {
  const { page = 1, limit = 10, sort = 'desc' } = req.query; // Add sort parameter, default to desc
  const offset = (page - 1) * limit;
  const sortOrder = sort === 'asc' ? 'ASC' : 'DESC'; // Sanitize sort order

  try {
    const leaderboardQuery = `
      WITH latest_samples AS (
        SELECT DISTINCT ON (location_id)
          sample_id,
          location_id
        FROM samples
        ORDER BY location_id, sample_date DESC
      )
      SELECT
        l.name AS city,
        AVG(pi.hpi) AS "pollutionIndex"
      FROM pollution_indices pi
      JOIN latest_samples ls ON pi.sample_id = ls.sample_id
      JOIN locations l ON ls.location_id = l.location_id
      GROUP BY l.name
      ORDER BY "pollutionIndex" ${sortOrder}
      OFFSET $1
      LIMIT $2;
    `;

    const statsQuery = `
      SELECT
        AVG(pi.hpi) AS "averageHPI",
        MIN(pi.hpi) AS "lowestHPI",
        MAX(pi.hpi) AS "highestHPI"
      FROM pollution_indices pi;
    `;

    const leaderboardRes = await db.query(leaderboardQuery, [offset, limit]);
    const statsRes = await db.query(statsQuery);
    
    const countQuery = 'SELECT COUNT(DISTINCT location_id) FROM samples';
    const countRes = await db.query(countQuery);
    const totalCount = parseInt(countRes.rows[0].count);

    res.json({
      cities: leaderboardRes.rows,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: parseInt(page),
      stats: statsRes.rows[0]
    });
  } catch (err) {
    next(err);
  }
};