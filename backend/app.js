import express from "express";
import cors from "cors";
import dotenv from 'dotenv';
import uploadRoutes from "./routes/uploadRoutes.js";
import mapRoutes from "./routes/mapRoutes.js";
import resultRoutes from "./routes/resultRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import standardRoutes from "./routes/standardRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import leaderboardRoutes from "./routes/leaderboardRoutes.js";
import feedbackRoutes from "./routes/feedbackRoutes.js";
import predictionRoutes from "./routes/predictionRoutes.js"; 
import analysisRoutes from "./routes/analysisRoutes.js"; 
import errorHandler from "./middleware/errorHandler.js";
import authMiddleware from "./middleware/authMiddleware.js";
import { initPostgresSchema } from './db/initSchema.js';
import { seedDatabase } from "./db/seed.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Public routes
app.use('/api/auth', authRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/upload', uploadRoutes); // Use the upload routes here

// Protected routes (The '/api/upload' base path is now public, but the POST '/' route within it is protected by middleware)
// No changes needed here for other routes
app.use('/map-data', authMiddleware, mapRoutes);
app.use('/api/samples', authMiddleware, resultRoutes);
app.use('/api/report', authMiddleware, reportRoutes);
app.use('/api/standards', authMiddleware, standardRoutes);
app.use('/api/prediction', authMiddleware, predictionRoutes);
app.use('/api/analysis', authMiddleware, analysisRoutes);

app.use(errorHandler);

// Health check
app.get('/', (req, res) => {
  res.send("👋 Welcome to Beyond Null and Void.\nThis server powers groundwater insights.");
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
  console.log(`🚀 Server is live on port ${PORT}`);

  try {
    await initPostgresSchema();
    await seedDatabase();
  } catch (err) {
    console.error("❌ Failed to set up database on startup: ", err);
  }
});