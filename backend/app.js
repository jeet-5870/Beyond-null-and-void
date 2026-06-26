import http from 'http';
import { Server } from 'socket.io';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import analysisRoutes from "./routes/analysisRoutes.js"; 
import authRoutes from "./routes/authRoutes.js";
import feedbackRoutes from "./routes/feedbackRoutes.js";
import leaderboardRoutes from "./routes/leaderboardRoutes.js";
import mapRoutes from "./routes/mapRoutes.js";
import predictionRoutes from "./routes/predictionRoutes.js"; 
import reportRoutes from "./routes/reportRoutes.js";
import resultRoutes from "./routes/resultRoutes.js";
import standardRoutes from "./routes/standardRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";

import authMiddleware from "./middleware/authMiddleware.js";
import errorHandler from "./middleware/errorHandler.js";
import handleUpload from './controllers/uploadController.js';
import multer from 'multer';
import path from 'path';
import { initPostgresSchema } from './db/initSchema.js';
import { seedDatabase } from "./db/seed.js";

dotenv.config();

const app = express();
const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());

// Attach io to requests so controllers can emit
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Setup websocket listeners
io.on('connection', (socket) => {
  console.log('A user connected via WebSocket:', socket.id);
  socket.on('disconnect', () => {
    console.log('User disconnected from WebSocket:', socket.id);
  });
});

// Configure multer to use the safe uploads path
const upload = multer({dest: path.join(process.cwd(), 'uploads')});

// Public routes
app.use('/api/auth', authRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/upload', uploadRoutes);

app.post('/api/upload/historical', upload.single('file'), handleUpload); 

// Protected routes
app.use('/api/samples', authMiddleware, resultRoutes);
app.use('/api/map-data', authMiddleware, mapRoutes);
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

httpServer.listen(PORT, async () => {
  console.log(`Server is live on port ${PORT}`);

  try {
    await initPostgresSchema();
    await seedDatabase();
  } catch (err) {
    console.error("❌ Failed to set up database on startup: ", err);
  }
});
