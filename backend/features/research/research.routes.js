import express from "express";
import { researchAction } from "./research.controller.js";

const router = express.Router();

router.post("/", researchAction);

export default router;