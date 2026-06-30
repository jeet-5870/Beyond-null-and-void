// backend/src/config/logger.js
import winston from 'winston';
import 'winston-daily-rotate-file';

// 1. Configure log file auto-rotation (Prevents a single file from growing too large)
const transport = new winston.transports.DailyRotateFile({
  filename: 'logs/application-%DATE%.log', // Saved in a centralized 'logs' folder
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,                     // Compresses old files automatically
  maxSize: '20m',                          // Rotates when the file hits 20 Megabytes
  maxFiles: '14d'                          // Automatically deletes logs older than 14 days
});

// 2. Instantiate and export the structured logger instance
export const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()                  // Formats outputs as machine-readable JSON strings
  ),
  transports: [
    transport,
    new winston.transports.Console({
      format: winston.format.simple(),     // Prints clean, readable text to your terminal
    })
  ]
});
