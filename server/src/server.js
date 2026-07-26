import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import morgan from "morgan";
import { Server } from "socket.io";
import { createServer } from "node:http";
import authRoutes from "./routes/auth.js";
import shopRoutes from "./routes/shops.js";
import queueRoutes from "./routes/queue.js";
import { requireAuthConfig, requireDatabase } from "./middleware/database.js";
import { sanitizeRequest } from "./middleware/sanitize.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });
dotenv.config();
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: process.env.CLIENT_URL || "http://localhost:5173" },
});
app.set("io", io);
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }));
app.use(express.json({ limit: "20kb" }));
app.use(sanitizeRequest);
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 200 }));
app.use(morgan("dev"));
app.get("/api/health", (_, res) =>
  res.json({
    status: "ok",
    database:
      mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    authConfigured: Boolean(
      process.env.JWT_SECRET && process.env.JWT_SECRET.length >= 32,
    ),
  }),
);
app.use("/api/auth", requireAuthConfig, requireDatabase, authRoutes);
app.use("/api/shops", requireAuthConfig, requireDatabase, shopRoutes);
app.use("/api/queue", requireAuthConfig, requireDatabase, queueRoutes);
app.use((err, req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({
    message: err.message || "Something went wrong. Please try again.",
  });
});
io.on("connection", (socket) =>
  socket.on("shop:watch", (shopId) => socket.join(`shop:${shopId}`)),
);
const port = process.env.PORT || 5000;
httpServer.listen(port, () => console.log(`QueueLess API on :${port}`));
if (!process.env.MONGODB_URI)
  console.warn(
    "MONGODB_URI is not configured. API database routes will return 503.",
  );
else
  mongoose
    .connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 8000 })
    .then(() => console.log("MongoDB connected"))
    .catch((err) => console.error("MongoDB connection failed:", err.message));
