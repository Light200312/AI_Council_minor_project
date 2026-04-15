import express from "express";
import authGuard from "../../shared/authGuard.js";
import {
  listAgents, createAgent, getAgent, updateAgent, deleteAgent,
  suggestAgents, findAgent, agentRespond,
} from "./agent.controller.js";

const router = express.Router();

router.get("/", authGuard, listAgents);
router.post("/", authGuard, createAgent);
router.get("/:id", authGuard, getAgent);
router.put("/:id", authGuard, updateAgent);
router.delete("/:id", authGuard, deleteAgent);
router.post("/suggest", authGuard, suggestAgents);
router.post("/find", authGuard, findAgent);
router.post("/:id/respond", authGuard, agentRespond);

export default router;
