import express from "express";
import { createServer } from "node:http";
import cors from "cors";
import dotenv from "dotenv";
import { getAuth } from "firebase-admin/auth";
import { Server as SocketServer } from "socket.io";
import { connectDB, getMongoStatus } from "./config/db.js";
import User from "./models/User.js";
import userRoutes from "./routes/users.js";
import gameRoutes from "./routes/games.js";
import squadRoutes from "./routes/squads.js";
import friendRoutes from "./routes/friends.js";
import chatRoutes from "./routes/chat.js";
dotenv.config();

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 5000;
const clientOrigin = process.env.CLIENT_ORIGIN || "http://localhost:5173";
const io = new SocketServer(server, {
  cors: {
    origin: clientOrigin,
    credentials: true,
  },
});

io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("Authentication required."));

    const decoded = await getAuth().verifyIdToken(token);
    const user = await User.findOne({ firebaseUid: decoded.uid }).select("_id firebaseUid");
    if (!user) return next(new Error("User not found. Sync required."));

    socket.data.user = { id: user._id.toString(), firebaseUid: user.firebaseUid };
    return next();
  } catch (error) {
    return next(new Error("Invalid or expired token."));
  }
});

io.on("connection", (socket) => {
  socket.join(`user:${socket.data.user.firebaseUid}`);
});

app.set("io", io);

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
app.use("/api/chat", chatRoutes);
server.listen(PORT, () => {
  console.log(`SquadUp API listening on port ${PORT}`);
  console.log(`CORS origin: ${clientOrigin}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});

connectDB();
