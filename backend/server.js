import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./DB/config.js";
import { seedDatabase } from "./services/seed.js";
import authRoutes from "./routes/auth.routes.js";
import agentRoutes from "./routes/agent.routes.js";
import messageRoutes from "./routes/message.routes.js";
import orchestratorRoutes from "./routes/orchestrator.routes.js";
import combatRoutes from "./routes/combat.routes.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const origin = process.env.FRONTEND_ORIGIN || "http://localhost:5173";

app.use(
  cors({
    origin,
    credentials: true,
  })
);
app.use(express.json());

app.get("/", (_req, res) => {
  res.send("AI Council backend is running.");
});

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, timestamp: new Date().toISOString() });
});

app.use("/api/auth", authRoutes);
app.use("/api/agents", agentRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/orchestrator", orchestratorRoutes);
app.use("/api/combat", combatRoutes);

connectDB()
  .then(seedDatabase)
  .then(() => {
    app.listen(port, () => {
      console.log(`Server listening on port ${port}`);
    });
  })
  .catch((error) => {
    console.error("Startup failed:", error.message);
    process.exit(1);
  });
