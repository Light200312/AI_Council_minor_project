import express from "express";
import authGuard from "../middleware/auth.js";
import { orchestrateTask } from "../services/orchestrator.js";

const router = express.Router();

router.post("/run", authGuard, async (req, res) => {
  try {
    const {
      taskGoal,
      selectedAgentIds = [],
      priorMessages = [],
      maxIterations = 6,
      allowMetaMemory = false,
      metaMemory = null,
      apiRoutingMode = "persona",
      orchestratorMode = "fast",
    } = req.body || {};

    if (!taskGoal) return res.status(400).json({ message: "taskGoal is required." });

    const result = await orchestrateTask({
      taskGoal,
      selectedAgentIds,
      priorMessages,
      maxIterations,
      allowMetaMemory,
      metaMemory,
      apiRoutingMode,
      orchestratorMode,
    });

    return res.json(result);
  } catch (error) {
    return res.status(500).json({ message: "Orchestrator failed.", error: error.message });
  }
});

export default router;
