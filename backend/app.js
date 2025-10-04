import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import resultRoutes from './routes/resultRoutes.js';
import mapRoutes from './routes/mapRoutes.js';
import analysisRoutes from './routes/analysisRoutes.js';
import predictionRoutes from './routes/predictionRoutes.js';
import standardRoutes from './routes/standardRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import leaderboardRoutes from './routes/leaderboardRoutes.js';
import feedbackRoutes from './routes/feedbackRoutes.js';
import errorHandler from './middleware/errorHandler.js';
import { initPostgresSchema } from './db/initSchema.js'; // Import schema initializer
import { seedDatabase } from "./db/seed.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/results', resultRoutes);
app.use('/api/map', mapRoutes);
app.use('/api/analysis', analysisRoutes);
app.use('/api/predictions', predictionRoutes);
app.use('/api/standards', standardRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/feedback', feedbackRoutes);

app.use(errorHandler);

const startServer = async () => {
  try {
    // Initialize schema and then seed the database
    await initPostgresSchema();
    await seedDatabase();

    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
  }
};

startServer();