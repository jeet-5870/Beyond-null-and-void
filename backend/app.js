import http from 'http';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { Server } from 'socket.io';

// Route Imports
import authRoutes from './routes/authRoutes.js';
import leaderboardRoutes from './routes/leaderboardRoutes.js';
import feedbackRoutes from './routes/feedbackRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import resultRoutes from './routes/resultRoutes.js';
import mapRoutes from './routes/mapRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import standardRoutes from './routes/standardRoutes.js';
import predictionRoutes from './routes/predictionRoutes.js';
import analysisRoutes from './routes/analysisRoutes.js';

// Middleware & Utilities
import authMiddleware from './middleware/authMiddleware.js';
import errorHandler from './middleware/errorHandler.js';
import uploadWorker from './workers/uploadWorker.js'; 
import { logger } from './config/logger.js';

dotenv.config();

const app = express();
const httpServer = http.createServer(app);

// 1. Initialize real-time stateful streaming server
export const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true
  },
});

// 2. Global Core Middlewares 
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true // 🔒 Required to accept secure HttpOnly cookies from the frontend
}));

app.use(express.json());
app.use(cookieParser()); // 🔒 Parses incoming cookies into req.cookies cleanly

// 3. Attach io instance to the request lifecycle
app.use((req, res, next) => {
  req.io = io;
  next();
});

// 4. Public API Router Declarations
app.use('/api/auth', authRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/upload', uploadRoutes);

// 5. Protected API Router Declarations (Guarded by Cookie Verification)
app.use('/api/samples', authMiddleware, resultRoutes);
app.use('/api/map-data', authMiddleware, mapRoutes);
app.use('/api/report', authMiddleware, reportRoutes);
app.use('/api/standards', authMiddleware, standardRoutes);
app.use('/api/prediction', authMiddleware, predictionRoutes);
app.use('/api/analysis', authMiddleware, analysisRoutes);

// 6. Centralized Error Interceptor
app.use(errorHandler);

// 7. Establish Cluster Listener
const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  logger.info(`Enterprise cluster executing on port ${PORT}`);
  
  // Initialize BullMQ background asynchronous worker thread immediately on boot
  uploadWorker.run();
});
