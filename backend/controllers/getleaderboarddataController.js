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
// 🔑 FIX: Removed the redundant 'getTimelineData' function. 
// The authoritative definition is in backend/controllers/gettimelinedataController.js.