import { Worker } from 'bullmq';
import Redis from 'ioredis';
import { processUploadData } from '../services/uploadService.js';
import { io } from '../app.js'; // Imports our non-circular io instance from app.js
import { logger } from '../config/logger.js';

const redisConnection = new Redis(process.env.REDIS_URL || 'redis://127.0.0.1:6379', {
  maxRetriesPerRequest: null
});

const uploadWorker = new Worker(
  'data-upload',
  async (job) => {
    const { filePath, historicalDate, userId, socketId } = job.data;
    logger.info(`Starting background processing for Job ID: ${job.id}`);

    try {
      // 1. Core Heavy Processing (CSV Parsing, Z-Score math, K-Means clustering)
      const result = await processUploadData(filePath, historicalDate, userId);

      // 2. Broadcast push notifications to the user if they are online
      if (socketId) {
        io.to(socketId).emit('upload-complete', {
          success: true,
          message: 'Your dataset ingestion is complete.',
          insertedSamples: result.insertedSamples,
          alertsCount: result.alerts.length
        });

        // Loop and stream individual live critical warnings onto the dashboard feed
        result.alerts.forEach((alert) => {
          io.to(socketId).emit('anomaly-alert', alert);
        });
      }

      logger.info(`Job ID: ${job.id} completed successfully.`);
      return result;
    } catch (error) {
      logger.error(`Job ID: ${job.id} failed structural validation: ${error.message}`);
      
      if (socketId) {
        io.to(socketId).emit('upload-error', {
          error: true,
          message: error.message || 'Dataset processing pipeline failed.'
        });
      }
      throw error;
    }
  },
  { 
    connection: redisConnection,
    autorun: false // Managed manually by our server startup trigger in app.js
  }
);

export default uploadWorker;
