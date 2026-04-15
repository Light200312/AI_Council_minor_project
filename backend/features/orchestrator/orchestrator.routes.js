import express from "express";
import authGuard from "../../shared/authGuard.js";
import { run } from "./orchestrator.controller.js";

const router = express.Router();
router.post("/run", authGuard, run);

export default router;
