import express from "express";
import cors from "cors";
import uploadRoutes from "./routes/uploadRoutes.js";
import mapRoutes from "./routes/mapRoutes.js";
import resultRoutes from "./routes/resultRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import standardRoutes from "./routes/standardRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import errorHandler from "./middleware/errorHandler.js";
import authMiddleware from "./middleware/authMiddleware.js";
import { initPostgresSchema } from './db/initSchema.js'; // ✅ Corrected import
import { seedDatabase } from "./db/seed.js";

const app = express();
app.use(cors());
app.use(express.json());

// 🔐 Public routes (login/auth)
app.use('/api/auth', authRoutes);

// 🔒 Protected routes (require authentication)
app.use(authMiddleware);
app.use('/upload', uploadRoutes);
app.use('/map-data', mapRoutes);
app.use('/api/samples', resultRoutes);
app.use('/api/report', reportRoutes);
app.use('/api/standards', standardRoutes);

app.use(errorHandler);

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
    // ✅ Ensure schema is initialized before seeding
    await initPostgresSchema();
    await seedDatabase();
  } catch (err) {
    console.error("❌ Failed to set up database on startup: ", err);
  }
});