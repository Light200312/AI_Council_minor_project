import Agent from "../models/agent.js";
import { runAgentStep } from "./agentRuntime.js";
import { resolveAgentModelConfig } from "./agentModelRegistry.js";
import { callOrchestratorLLM } from "./llmClient.js";

function formatMessages(messages = [], limit = 12) {
  return messages
    .slice(-limit)
    .map((m) => `${m.speakerName}: ${m.text}`)
    .join("\n");
}

function makeOrchestratorMessage(text) {
  return {
    id: `m-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    speakerId: "orchestrator",
    speakerName: "Orchestrator",
    speakerInitials: "OR",
    isUser: false,
    text,
    timestamp: Date.now(),
  };
}

function getLastSpeakingAgentId(messages, candidates) {
  const candidateIds = new Set(candidates.map((c) => String(c.id)));
  for (let i = messages.length - 1; i >= 0; i -= 1) {
    const speakerId = String(messages[i]?.speakerId || "");
    if (candidateIds.has(speakerId)) return speakerId;
  }
  return "";
}

function hasOrchestratorOpening(messages = []) {
  return messages.some((m) => String(m.speakerId || "") === "orchestrator");
}

function pickNextByRotation(candidates, lastSpeakerId = "") {
  const normalizedLast = String(lastSpeakerId || "");
  const next = candidates.find((c) => String(c.id) !== normalizedLast);
  return next || candidates[0];
}

function resolveOrchestratorMode(orchestratorMode) {
  return orchestratorMode === "dynamic" ? "dynamic" : "fast";
}

function resolveConversationScope({ taskGoal, topic, sessionId, messages }) {
  let resolvedTopic = String(topic || "").trim();
  let resolvedSessionId = String(sessionId || "").trim();

  if (!resolvedTopic) {
    const lastWithTopic = [...messages].reverse().find((m) => String(m?.topic || "").trim());
    if (lastWithTopic) resolvedTopic = String(lastWithTopic.topic || "").trim();
  }
  if (!resolvedTopic) resolvedTopic = String(taskGoal || "").trim();

  if (!resolvedSessionId) {
    const lastWithSession = [...messages].reverse().find((m) => String(m?.sessionId || "").trim());
    if (lastWithSession) resolvedSessionId = String(lastWithSession.sessionId || "").trim();
  }

  return { topic: resolvedTopic, sessionId: resolvedSessionId };
}

async function selectNextAgent({
  taskGoal,
  messages,
  candidates,
  lastSpeakerId = "",
}) {
  const system = "You are an orchestration policy controller for a teaching council.";
  const prompt = `Select the next agent id from this list: ${candidates
    .map((c) => c.id)
    .join(", ")}.

Topic:
${taskGoal}

Recent conversation:
${formatMessages(messages, 6) || "none"}

Last speaking agent id: ${lastSpeakerId || "none"}

Rules:
- choose ONE next speaker only
- avoid selecting the same speaker as the last turn unless necessary
- rotate perspectives to teach the user
- return strict JSON: {"agentId":"<id>","reason":"<short reason>"}
`;

  const raw = await callOrchestratorLLM({ system, prompt, temperature: 0.2 });
  try {
    const parsed = JSON.parse(raw);
    if (parsed.agentId && candidates.some((c) => String(c.id) === String(parsed.agentId))) {
      return {
        agentId: String(parsed.agentId),
        reason: String(parsed.reason || "Selected for relevance."),
      };
    }
  } catch (_) {}

  const fallback = pickNextByRotation(candidates, lastSpeakerId);
  return { agentId: String(fallback.id), reason: "Fallback rotation to keep turns moving." };
}

async function orchestrateTask({
  taskGoal,
  selectedAgentIds = [],
  priorMessages = [],
  maxIterations, // retained for API compatibility
  allowMetaMemory = false, // retained for API compatibility
  metaMemory = null, // retained for API compatibility
  apiRoutingMode = "persona",
  orchestratorMode = "fast",
  memoryMode = "minimal",
  topic = "",
  sessionId = "",
}) {
  const agentsQuery = selectedAgentIds.length ? { id: { $in: selectedAgentIds } } : {};
  const candidates = await Agent.find(agentsQuery).lean();

  if (!taskGoal) throw new Error("Task goal is required.");
  if (!candidates.length) throw new Error("No agents available for orchestration.");

  const messages = [...priorMessages];
  const performance = [];
  const trace = [];
  const lastSpeakerId = getLastSpeakingAgentId(messages, candidates);
  const mode = resolveOrchestratorMode(orchestratorMode);
  const scope = resolveConversationScope({ taskGoal, topic, sessionId, messages });

  if (!hasOrchestratorOpening(messages)) {
    messages.push(
      makeOrchestratorMessage(
        `Welcome to the council session on "${taskGoal}". I will coordinate one speaker at a time, and after each turn you can respond so the council can coach you.`
      )
    );
  }

  let nextAgent;
  if (mode === "dynamic") {
    nextAgent = await selectNextAgent({
      taskGoal,
      messages,
      candidates,
      lastSpeakerId,
    });
  } else {
    const rotated = pickNextByRotation(candidates, lastSpeakerId);
    nextAgent = {
      agentId: String(rotated.id),
      reason: "Fast mode rotation for low latency.",
    };
  }
  const selected = candidates.find((c) => String(c.id) === String(nextAgent.agentId)) || candidates[0];

  messages.push(
    makeOrchestratorMessage(
      `Decision: ${selected.name} (${selected.role}) will speak next. Reason: ${nextAgent.reason}`
    )
  );

  let agentMessage;
  try {
    agentMessage = await runAgentStep({
      agentId: selected.id,
      taskGoal,
      messages,
      outputConstraints:
        "Teach the user directly. Evaluate the user's last point, correct mistakes clearly, praise valid reasoning, and give one concrete improvement step. Keep it concise.",
      apiRoutingMode,
      memoryMode,
      topic: scope.topic,
      sessionId: scope.sessionId,
    });
  } catch (_) {
    agentMessage = {
      id: `m-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      speakerId: String(selected.id),
      speakerName: selected.name,
      speakerInitials: selected.avatarInitials || "AI",
      isUser: false,
      text: "I could not respond due to a temporary model issue. Share your next point, and I will continue coaching.",
      timestamp: Date.now(),
      modelProvider: "fallback",
      modelName: "fallback",
    };
  }
  messages.push(agentMessage);

  let upcomingAgent;
  let upcomingReason;
  if (mode === "dynamic") {
    const upcoming = await selectNextAgent({
      taskGoal,
      messages,
      candidates,
      lastSpeakerId: String(selected.id),
    });
    upcomingAgent =
      candidates.find((c) => String(c.id) === String(upcoming.agentId)) ||
      pickNextByRotation(candidates, String(selected.id));
    upcomingReason = upcoming.reason || "Dynamic selection.";
  } else {
    upcomingAgent = pickNextByRotation(candidates, String(selected.id));
    upcomingReason = "Round-robin rotation for low-latency turn management.";
  }
  const userTurnPrompt = `Decision: Next speaker is ${upcomingAgent.name} (${upcomingAgent.role}). Reason: ${upcomingReason}. Your turn first: share your view or question, then I will hand over to ${upcomingAgent.name}.`;
  messages.push(makeOrchestratorMessage(userTurnPrompt));

  trace.push({
    iteration: 1,
    selectedAgentId: String(selected.id),
    selectedAgentModel: resolveAgentModelConfig(selected.id, apiRoutingMode),
    selectionReason: nextAgent.reason,
    confidence: 0.7,
    suggestion: `One agent turn completed using ${mode} orchestrator mode. Awaiting user input for the next turn.`,
  });

  performance.push({
    iteration: 1,
    confidence: 0.7,
    completeness: 0.5,
    conflictDetected: false,
    improvementDetected: true,
  });

  const summary = `Completed one guided turn on "${taskGoal}". ${selected.name} responded, and ${upcomingAgent.name} is queued for the next turn after user input.`;

  return {
    summary,
    messages,
    trace,
    performance,
    clarifyingQuestion: `Your turn: respond to ${selected.name}'s advice. Then ${upcomingAgent.name} will speak.`,
    suggestion: "Provide a specific claim and your reasoning so the next coach can critique it precisely.",
    termination: `Single-turn orchestration completed (${mode} mode).`,
  };
}

export { orchestrateTask };
