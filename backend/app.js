import express from "express";
import cors from "cors";
import uploadRoutes from "./routes/uploadRoutes.js";
import mapRoutes from "./routes/mapRoutes.js";
import resultRoutes from "./routes/resultRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import standardRoutes from "./routes/standardRoutes.js";
import './db/initSchema.js'; // Auto-initialize DB schema
import errorHandler from "./middleware/errorHandler.js";
import { seedDatabase } from "./db/seed.js";

const app = express();
app.use(cors());
app.use(express.json());

// Mount routes
app.use('/upload', uploadRoutes);
app.use('/map-data', mapRoutes);
app.use('/api/samples', resultRoutes);
app.use('/api/report', reportRoutes);
app.use('/api/standard', standardRoutes);
app.use(errorHandler);

// Root route
app.get('/', (req, res) => {
  res.send("👋 Welcome to Beyond Null and Void.\nThis server powers groundwater insights.");
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, async() => {
  console.log(`🚀 Server is live on port ${PORT}`);
  try{
    seedDatabase();
  }catch(err){
    console.log("Failed to seed database on startup: ", err);
  }
});
