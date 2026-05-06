import dotenv from "dotenv";
import path from "path";

dotenv.config({
  path: path.resolve(process.cwd(), ".env"),
});

// ✅ NOW env is loaded
console.log("OPENAI KEY:", process.env.OPENAI_API_KEY);
console.log("SERPER KEY:", process.env.SERPER_API_KEY);

import express, { Request, Response, NextFunction } from "express";
import { router } from "./routes";


const app = express();
const port = Number(process.env.PORT ?? 3001);

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