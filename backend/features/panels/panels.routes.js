import express from "express";
import authGuard from "../../shared/authGuard.js";
import { lawPanel, interviewPanel, medicalPanel } from "./panels.controller.js";

const router = express.Router();
router.post("/law-panel", authGuard, lawPanel);
router.post("/interview-panel", authGuard, interviewPanel);
router.post("/medical-panel", authGuard, medicalPanel);

export default router;
