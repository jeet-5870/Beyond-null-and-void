import dotenv from 'dotenv';
dotenv.config();

const requiredEnvVars = [
  'DATABASE_URL',
  'REDIS_URL',
  'JWT_SECRET',
  'CLIENT_URL'
];

// Check if any required configuration keys are missing
const missingVars = requiredEnvVars.filter((key) => !process.env[key]);

if (missingVars.length > 0) {
  throw new Error(
    `❌ CRITICAL CONFIGURATION ERROR: Missing required environment variables in .env:\n${missingVars.join('\n')}\nServer startup aborted.`
  );
}

export const env = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL,
  redisUrl: process.env.REDIS_URL,
  jwtSecret: process.env.JWT_SECRET,
  clientUrl: process.env.CLIENT_URL,
  sendgridApiKey: process.env.SENDGRID_API_KEY,
  senderEmail: process.env.SENDER_EMAIL
};
