import { orchestrateTask } from "./orchestrator.service.js";

export async function run(req, res) {
  try {
    const { taskGoal, selectedAgentIds = [], priorMessages = [], maxIterations = 6, allowMetaMemory = false, metaMemory = null, apiRoutingMode = "persona", ollamaModel = "", orchestratorMode = "fast", memoryMode = "minimal", topic = "", sessionId = "" } = req.body || {};
    if (!taskGoal) return res.status(400).json({ message: "taskGoal is required." });
    const result = await orchestrateTask({ taskGoal, selectedAgentIds, priorMessages, maxIterations, allowMetaMemory, metaMemory, apiRoutingMode, ollamaModel, orchestratorMode, memoryMode, topic, sessionId });
    return res.json(result);
  } catch (error) { console.error("Orchestrator run failed:", error); return res.status(500).json({ message: "Orchestrator failed.", error: error.message }); }
}
