import express from "express";
import Agent from "../models/agent.js";
import { runAgentStep } from "../services/agentRuntime.js";
import authGuard from "../middleware/auth.js";

const router = express.Router();

router.get("/", authGuard, async (_req, res) => {
  try {
    const agents = await Agent.find({}).sort({ id: 1 }).lean();
    return res.json({ agents });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch agents.", error: error.message });
  }
});

router.get("/:id", authGuard, async (req, res) => {
  try {
    const agent = await Agent.findOne({ id: req.params.id }).lean();
    if (!agent) return res.status(404).json({ message: "Agent not found." });
    return res.json({ agent });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch agent.", error: error.message });
  }
});

router.post("/:id/respond", authGuard, async (req, res) => {
  try {
    const { taskGoal, messages = [], outputConstraints, apiRoutingMode = "persona" } = req.body || {};
    if (!taskGoal) return res.status(400).json({ message: "taskGoal is required." });

    const response = await runAgentStep({
      agentId: req.params.id,
      taskGoal,
      messages,
      outputConstraints,
      apiRoutingMode,
    });

    return res.json({ response });
  } catch (error) {
    return res.status(500).json({ message: "Agent response failed.", error: error.message });
  }
});

export default router;
