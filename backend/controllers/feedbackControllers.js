import db from '../db/db.js';

// Unified Controller: Handles BOTH authenticated and anonymous feedback submission
export const submitFeedback = async (req, res, next) => {
  const userId = req.user?.userId || null; // Optional: null if guest/public dry-run
  const { message } = req.body;

  if (!message || message.trim() === '') {
    return res.status(400).json({ error: 'Feedback message cannot be empty.' });
  }

  try {
    const result = await db.query(
      'INSERT INTO feedback (user_id, message) VALUES ($1, $2) RETURNING *',
      [userId, message]
    );
    res.status(201).json({
      message: 'Feedback submitted successfully.',
      feedback: result.rows[0]
    });
  } catch (err) {
    next(err);
  }
};

// Gets feedback submitted by the currently logged-in user
export const getUserFeedback = async (req, res, next) => {
  const userId = req.user?.userId;
  if (!userId) {
    return res.status(401).json({ error: 'Authentication required.' });
  }
  try {
    const result = await db.query(
      'SELECT * FROM feedback WHERE user_id = $1 ORDER BY submitted_at DESC', 
      [userId]
    );
    res.status(200).json(result.rows);
  } catch (err) {
    next(err);
  }
};

// Gets all system feedback for admin/dashboard list
export const getAllFeedback = async (req, res, next) => {
  try {
    const result = await db.query(`
      SELECT feedback_id, user_id, message, submitted_at
      FROM feedback
      ORDER BY submitted_at DESC
    `);
    res.status(200).json(result.rows);
  } catch (err) {
    next(err);
  }
};

















// import db from '../db/db.js';

// // Submits new feedback from an authenticated user
// export const submitFeedback = async (req, res, next) => {
//   const userId = req.user?.userId;
//   const { message } = req.body;

//   if (!userId) {
//     return res.status(401).json({ error: 'Authentication required.' });
//   }
//   if (!message) {
//     return res.status(400).json({ error: 'Feedback message cannot be empty.' });
//   }

//   try {
//     const result = await db.query(
//       'INSERT INTO feedback (user_id, message) VALUES ($1, $2) RETURNING *',
//       [userId, message]
//     );
//     res.status(201).json(result.rows[0]);
//   } catch (err) {
//     next(err);
//   }
// };

// // Gets feedback submitted by the currently logged-in user
// export const getUserFeedback = async (req, res, next) => {
//   const userId = req.user?.userId;

//   if (!userId) {
//     return res.status(401).json({ error: 'Authentication required.' });
//   }

//   try {
//     const result = await db.query('SELECT * FROM feedback WHERE user_id = $1 ORDER BY submitted_at DESC', [userId]);
//     res.status(200).json(result.rows);
//   } catch (err) {
//     next(err);
//   }
// };

// // 🔑 FIX: Added the missing getAllFeedback function
// // Gets all feedback from all users, joining with the users table
// export const getAllFeedback = async (req, res, next) => {
//   try {
//     const result = await db.query(`
//       SELECT feedback_id, message, submitted_at
//       FROM feedback
//       ORDER BY submitted_at DESC
//     `);
//     res.status(200).json(result.rows);
//   } catch (err) {
//     next(err);
//   }
// };
