import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import appRoutes from "./routes/appRoutes.js";

const app = express();

// ✅ VERY IMPORTANT CORS FIX
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "http://localhost:5176"],
    credentials: true,
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

export default app;
