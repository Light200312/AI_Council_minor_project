import Agent from "../models/agent.js";
import { callAgentLLM } from "./llmClient.js";
import { resolveAgentModelConfig } from "./agentModelRegistry.js";

function summarizeHistory(messages = [], limit = 8) {
  return messages
    .slice(-limit)
    .map((m) => `${m.speakerName}: ${m.text}`)
    .join("\n");
}

function buildAgentPrompt({ agent, taskGoal, contextSummary, outputConstraints }) {
  return `Task goal:\n${taskGoal}\n\nContext:\n${contextSummary || "No prior context."}\n\nOutput constraints:\n${outputConstraints || "Be concise, actionable, and role-consistent."}\n\nDeliver your contribution now.`;
}

async function runAgentStep({
  agentId,
  taskGoal,
  messages,
  outputConstraints,
  temperature = 0.5,
  apiRoutingMode = "persona",
}) {
  const agent = await Agent.findOne({ id: agentId }).lean();
  if (!agent) throw new Error(`Agent not found: ${agentId}`);

  const personaLines = [
    `Persona and reasoning method: ${agent.description}`,
    agent.personalityTraits ? `Personality traits: ${agent.personalityTraits}` : null,
    agent.backstoryLore ? `Backstory/lore: ${agent.backstoryLore}` : null,
    agent.speechStyle ? `Speech style: ${agent.speechStyle}` : null,
    agent.isFantasy
      ? `Source: ${agent.sourceTitle || "Unknown"} (${agent.sourceType || "Unknown"}, ${agent.genre || "Unknown"})`
      : null,
  ].filter(Boolean);

  const system = `You are ${agent.name}, role: ${agent.role}.\n${personaLines.join("\n")}\nStay within this persona and constraints.`;
  const prompt = buildAgentPrompt({
    agent,
    taskGoal,
    contextSummary: summarizeHistory(messages),
    outputConstraints,
  });

  const modelConfig = resolveAgentModelConfig(agent.id, apiRoutingMode);
  const text = await callAgentLLM({
    provider: modelConfig.provider,
    model: modelConfig.model,
    system,
    prompt,
    temperature,
  });

  return {
    id: `m-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    speakerId: agent.id,
    speakerName: agent.name,
    speakerInitials: agent.avatarInitials,
    isUser: false,
    text,
    timestamp: Date.now(),
    modelProvider: modelConfig.provider,
    modelName: modelConfig.model,
  };
}

export { runAgentStep };
