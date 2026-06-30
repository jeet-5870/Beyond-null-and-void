import { Queue } from 'bullmq';
import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

// Connect to your Redis cluster instance
const redisConnection = new Redis(process.env.REDIS_URL || 'redis://127.0.0.1:6379', {
  maxRetriesPerRequest: null // Required configuration rule for BullMQ
});

export const uploadQueue = new Queue('data-upload', {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3, // Automatically retry a failed file ingestion 3 times
    backoff: {
      type: 'exponential',
      delay: 5000, // Wait 5 seconds before retrying
    },
  },
});
