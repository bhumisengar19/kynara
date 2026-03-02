import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import appRoutes from "./routes/appRoutes.js";

const app = express();

// Simple Request Logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// ✅ VERY IMPORTANT CORS FIX
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:5175",
      "http://localhost:5176",
      "http://127.0.0.1:5173",
      "http://127.0.0.1:5174",
      "http://127.0.0.1:5175",
      "http://127.0.0.1:5176",
      "http://localhost:5177",
      "http://127.0.0.1:5177"
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/apps", appRoutes);

app.get("/", (req, res) => {
  res.send("KYNARA API running 🚀");
});

// 404 Handler
app.use((req, res) => {
  console.log(`404 NOT FOUND: ${req.method} ${req.url}`);
  res.status(404).json({ message: "Route not found" });
});

export default app;
