import express from "express";
import cors from "cors";
import uploadRoutes from "./routes/uploadRoutes.js"
import mapRoutes from "./routes/mapRoutes.js";
import resultRoutes from "./routes/resultRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";

const app = express();
app.use(cors());
app.use(express.json());

app.use('/upload', uploadRoutes);
app.use('/map-data', mapRoutes);
app.use('/api/samples', resultRoutes);
app.use('/api/report', reportRoutes);

app.get('/', (req, res)=>{
  res.send("Hello");
});

const PORT = process.env.PORT||3000;

app.listen(3000, ()=>{
    console.log(`Server for null and void is listen on port ${PORT}`);
});