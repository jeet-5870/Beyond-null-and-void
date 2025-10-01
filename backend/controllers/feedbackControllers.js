import db from '../db/db.js';

// --- Shared Helper ---
// Placeholder if the feedback submission route is public but we still want the user ID if authenticated.
// The frontend handles authentication, so we expect req.user to be present if a token was sent.
const getUserId = (req) => req.user ? req.user.userId : null;

// 1. Handles submission of new feedback/complaints
export const submitFeedback = async (req, res, next) => {
  const { feedback } = req.body;
  const userId = getUserId(req); // Get user ID from middleware, if available.
  
  if (!feedback) {
    return res.status(400).json({ error: 'Feedback message cannot be empty.' });
  }

  try {
    // 🔑 If userId is present, link the feedback to the user's ID.
    const query = userId 
      ? 'INSERT INTO feedback (user_id, message) VALUES ($1, $2) RETURNING *'
      : 'INSERT INTO feedback (message) VALUES ($1) RETURNING *';
      
    const params = userId ? [userId, feedback] : [feedback];

    const result = await db.query(query, params);
    
    res.status(201).json({ 
      message: 'Feedback submitted successfully.', 
      feedback: result.rows[0] 
    });
  } catch (err) {
    next(err);
  }
};

// 2. Fetches all recent feedback (for public display on the main page)
export const getPublicFeedback = async (req, res, next) => {
  try {
    const result = await db.query(
      'SELECT message, submitted_at FROM feedback ORDER BY submitted_at DESC LIMIT 5'
    );
    res.status(200).json(result.rows);
  } catch (err) {
    next(err);
  }
};

// 3. Fetches only the logged-in user's feedback (protected route for dashboard)
// This function assumes it is only called after authMiddleware has run successfully.
export const getUserFeedback = async (req, res, next) => {
  // 🔑 Extract userId from the decoded JWT payload attached by authMiddleware
  const { userId } = req.user; 

  try {
    const result = await db.query(
      'SELECT message, submitted_at FROM feedback WHERE user_id = $1 ORDER BY submitted_at DESC',
      [userId]
    );
    res.status(200).json(result.rows);
  } catch (err) {
    next(err);
  }
};