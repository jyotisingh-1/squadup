import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB, getMongoStatus } from "./config/db.js";
import userRoutes from "./routes/users.js";
import gameRoutes from "./routes/games.js";
import squadRoutes from "./routes/squads.js";
import friendRoutes from "./routes/friends.js";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const clientOrigin = process.env.CLIENT_ORIGIN || "http://localhost:5173";

app.use(
  cors({
    origin: clientOrigin,
    credentials: true,
  })
);
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "squadup-api",
    mongodb: getMongoStatus(),
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/users", userRoutes);
app.use("/api/games", gameRoutes);
app.use("/api/squads", squadRoutes);
app.use("/api/friends", friendRoutes);
app.listen(PORT, () => {
  console.log(`SquadUp API listening on port ${PORT}`);
  console.log(`CORS origin: ${clientOrigin}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});

connectDB();
