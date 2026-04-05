import express from "express";
import authGuard from "../middleware/auth.js";
import { chooseOpponentTeam, chooseOpponentTurn, judgeRound, finalizeDebateVerdict } from "../services/combat.js";

const router = express.Router();

router.post("/opponent/select-team", authGuard, async (req, res) => {
  try {
    const { topic, candidateIds = [], count = 3, difficulty = "standard" } = req.body || {};
    if (!topic) return res.status(400).json({ message: "topic is required." });
    const result = await chooseOpponentTeam({ topic, candidateIds, count, difficulty });
    return res.json(result);
  } catch (error) {
    console.error("Combat select-team failed:", error);
    return res.status(500).json({ message: "Failed to select opponent team.", error: error.message });
  }
});

router.post("/opponent/next-turn", authGuard, async (req, res) => {
  try {
    const { topic, opponentTeamIds = [], userArgument = "", strategies = [], difficulty = "standard" } = req.body || {};
    if (!topic) return res.status(400).json({ message: "topic is required." });
    if (!opponentTeamIds.length) return res.status(400).json({ message: "opponentTeamIds is required." });
    if (!strategies.length) return res.status(400).json({ message: "strategies is required." });
    const result = await chooseOpponentTurn({ topic, opponentTeamIds, userArgument, strategies, difficulty });
    return res.json(result);
  } catch (error) {
    console.error("Combat next-turn failed:", error);
    return res.status(500).json({ message: "Failed to select opponent turn.", error: error.message });
  }
});

router.post("/judge", authGuard, async (req, res) => {
  try {
    const { topic, playerArgument, opponentArgument } = req.body || {};
    if (!topic) return res.status(400).json({ message: "topic is required." });
    if (!playerArgument || !opponentArgument) {
      return res.status(400).json({ message: "playerArgument and opponentArgument are required." });
    }
    const result = await judgeRound({ topic, playerArgument, opponentArgument });
    return res.json(result);
  } catch (error) {
    console.error("Combat judge failed:", error);
    return res.status(500).json({ message: "Failed to judge round.", error: error.message });
  }
});

router.post("/verdict", authGuard, async (req, res) => {
  try {
    const {
      topic,
      playerTeam = [],
      opponentTeam = [],
      combatLog = [],
      roundResults = [],
      scores = {},
    } = req.body || {};
    if (!topic) return res.status(400).json({ message: "topic is required." });
    const verdict = await finalizeDebateVerdict({
      topic,
      playerTeam,
      opponentTeam,
      combatLog,
      roundResults,
      scores,
    });
    return res.json({ verdict });
  } catch (error) {
    console.error("Combat final verdict failed:", error);
    return res.status(500).json({ message: "Failed to finalize verdict.", error: error.message });
  }
});

export default router;
