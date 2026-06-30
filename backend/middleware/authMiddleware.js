import jwt from 'jsonwebtoken';

export default function authMiddleware(req, res, next) {
  // 🔒 Securely grab the JWT directly out of the encrypted cookies object
  const token = req.cookies?.jwt;

  if (!token) {
    return res.status(401).json({ error: 'Access Denied: No session token found. Please log in.' });
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    
    // Attach the verified user details payload directly onto the request context
    req.user = verified;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Authentication session expired or invalid.' });
  }
}
