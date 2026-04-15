import express from "express";
import authGuard from "../../shared/authGuard.js";
import { selectTeam, nextTurn, judge, verdict } from "./combat.controller.js";

const router = express.Router();
router.post("/opponent/select-team", authGuard, selectTeam);
router.post("/opponent/next-turn", authGuard, nextTurn);
router.post("/judge", authGuard, judge);
router.post("/verdict", authGuard, verdict);

export default router;
