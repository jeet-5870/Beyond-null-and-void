import { logger } from '../config/logger.js';

export default function errorHandler(err, req, res, next) {
  const status = err.status || err.statusCode || 500;
  
  // 1. Log structured telemetry data to your application log files
  logger.error({
    message: err.message || 'Internal server error exception occurred.',
    status: status,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined, // Strip messy tracks in prod
    path: req.path,
    method: req.method,
    ip: req.ip,
    userId: req.user?.userId || 'anonymous'
  });

  // 2. Prevent leaking secure database configurations to public clients
  const clientMessage = status === 500 && process.env.NODE_ENV === 'production'
    ? 'An unexpected error occurred on our systems. Please contact support.'
    : err.message;

  return res.status(status).json({
    success: false,
    error: clientMessage
  });
}
