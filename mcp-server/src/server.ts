import dotenv from "dotenv";
import path from "path";

dotenv.config({
  path: path.resolve(__dirname, "../.env"),
});
dotenv.config({
  path: path.resolve(__dirname, "../../backend/.env"),
});

import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import { router } from "./routes";


const app = express();
const port = Number(process.env.PORT ?? 3001);

// Enable CORS for all routes
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: false,
}));

app.use(express.json({ limit: "1mb" }));
app.use(router);

app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({ status: "ok" });
});

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  const message = err instanceof Error ? err.message : "Unexpected server error";
  res.status(500).json({ error: message });
});

app.listen(port, () => {
  console.log(`MCP fact-check server running on port ${port}`);
});
