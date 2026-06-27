// middleware/errorHandler.js
export default function errorHandler(err, req, res, next) {
  console.error('An error occurred:', err);
  const status = err.status || 500;
  const message = err.message || 'Internal server error.';
  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
}
