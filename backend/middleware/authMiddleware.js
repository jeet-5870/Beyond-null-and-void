import jwt from 'jsonwebtoken';

export default function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1]; // Extract the token from the "Bearer <token>" header

  if (!token) {
    return res.status(401).json({ error: 'Malformed token' });
  }

  try {
    // 🔑 Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach the decoded user payload to the request
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}