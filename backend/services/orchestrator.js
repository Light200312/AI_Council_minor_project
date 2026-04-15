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

function truncateText(text = "", maxChars = 140) {
  const safe = String(text || "").trim();
  return safe.length > maxChars ? `${safe.slice(0, maxChars - 1)}...` : safe;
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

function sortCandidatesBySelectionOrder(candidates, selectedAgentIds = []) {
  if (!selectedAgentIds.length) return candidates;

  const orderMap = new Map(selectedAgentIds.map((id, index) => [String(id), index]));
  return [...candidates].sort((a, b) => {
    const aOrder = orderMap.get(String(a.id));
    const bOrder = orderMap.get(String(b.id));
    if (aOrder == null && bOrder == null) return 0;
    if (aOrder == null) return 1;
    if (bOrder == null) return -1;
    return aOrder - bOrder;
  });
}

function getRecentSpeakerIds(messages, candidates, limit = candidates.length) {
  const candidateIds = new Set(candidates.map((c) => String(c.id)));
  const recentSpeakerIds = [];

  for (let i = messages.length - 1; i >= 0; i -= 1) {
    const speakerId = String(messages[i]?.speakerId || "");
    if (!candidateIds.has(speakerId) || recentSpeakerIds.includes(speakerId)) continue;
    recentSpeakerIds.push(speakerId);
    if (recentSpeakerIds.length >= limit) break;
  }

  return recentSpeakerIds;
}

function buildParticipationStats(messages, candidates) {
  const candidateIds = new Set(candidates.map((c) => String(c.id)));
  const orderedMessages = [...messages].sort((a, b) => Number(a?.timestamp || 0) - Number(b?.timestamp || 0));
  const stats = new Map(
    candidates.map((candidate) => [
      String(candidate.id),
      {
        turnsTaken: 0,
        lastSpokeTimestamp: 0,
        lastSpokeTurnIndex: -1,
      },
    ])
  );

  let speakingTurnIndex = 0;
  orderedMessages.forEach((message) => {
    const speakerId = String(message?.speakerId || "");
    if (!candidateIds.has(speakerId)) return;
    const entry = stats.get(speakerId);
    if (!entry) return;
    entry.turnsTaken += 1;
    entry.lastSpokeTimestamp = Number(message?.timestamp || 0);
    entry.lastSpokeTurnIndex = speakingTurnIndex;
    speakingTurnIndex += 1;
  });

  return {
    stats,
    totalAgentTurns: speakingTurnIndex,
  };
}

function buildCandidateProfile(candidate, participationStats, totalAgentTurns) {
  const agentId = String(candidate.id);
  const stats = participationStats.get(agentId) || {
    turnsTaken: 0,
    lastSpokeTimestamp: 0,
    lastSpokeTurnIndex: -1,
  };
  const turnsSinceLastSpeak =
    stats.lastSpokeTurnIndex < 0 ? "never" : String(Math.max(0, totalAgentTurns - stats.lastSpokeTurnIndex - 1));

  return {
    id: agentId,
    name: String(candidate.name || ""),
    role: String(candidate.role || ""),
    domain: String(candidate.domain || "other"),
    specialization: truncateText(
      candidate.specialAbility || candidate.description || candidate.personalityTraits || candidate.role,
      100
    ),
    turnsTaken: stats.turnsTaken,
    turnsSinceLastSpeak,
    hasSpokenYet: stats.turnsTaken > 0,
  };
}

function buildCandidateProfiles(candidates, messages) {
  const { stats, totalAgentTurns } = buildParticipationStats(messages, candidates);
  return candidates.map((candidate) => buildCandidateProfile(candidate, stats, totalAgentTurns));
}

function formatCandidateProfiles(candidateProfiles = []) {
  return candidateProfiles
    .map(
      (candidate) =>
        `- id: ${candidate.id} | ${candidate.name} | ${candidate.role} | domain: ${candidate.domain} | strengths: ${candidate.specialization} | turnsTaken: ${candidate.turnsTaken} | turnsSinceLastSpeak: ${candidate.turnsSinceLastSpeak}`
    )
    .join("\n");
}

function getSoftEligibleCandidates(candidateProfiles, lastSpeakerId = "") {
  const lastSpeaker = String(lastSpeakerId || "");
  const nonRepeatingProfiles = candidateProfiles.filter((candidate) => candidate.id !== lastSpeaker);
  const pool = nonRepeatingProfiles.length ? nonRepeatingProfiles : candidateProfiles;
  const unspokenProfiles = pool.filter((candidate) => !candidate.hasSpokenYet);
  if (unspokenProfiles.length >= 2) return unspokenProfiles;

  const turnCounts = pool.map((candidate) => candidate.turnsTaken);
  const minTurns = Math.min(...turnCounts);
  const maxTurns = Math.max(...turnCounts);
  if (maxTurns - minTurns >= 2) {
    return pool.filter((candidate) => candidate.turnsTaken === minTurns);
  }

  return pool;
}

function shouldOverrideForFairness(selectedProfile, eligibleProfiles = []) {
  if (!selectedProfile || !eligibleProfiles.length) return false;
  if (eligibleProfiles.some((candidate) => candidate.id === selectedProfile.id)) return false;

  const minTurns = Math.min(...eligibleProfiles.map((candidate) => candidate.turnsTaken));
  return selectedProfile.turnsTaken - minTurns >= 2;
}

function pickNextByRotation(candidates, lastSpeakerId = "", excludeIds = []) {
  if (!candidates.length) return null;
  const normalizedLast = String(lastSpeakerId || "");
  const excluded = new Set(excludeIds.map((id) => String(id)));
  const startIndex = Math.max(
    candidates.findIndex((c) => String(c.id) === normalizedLast),
    -1
  );

  for (let offset = 1; offset <= candidates.length; offset += 1) {
    const candidate = candidates[(startIndex + offset) % candidates.length];
    if (!excluded.has(String(candidate.id))) return candidate;
  }

  return candidates[(startIndex + 1 + candidates.length) % candidates.length] || candidates[0];
}

function pickFairFallbackCandidate({ candidates, messages, lastSpeakerId = "" }) {
  const candidateProfiles = buildCandidateProfiles(candidates, messages);
  const eligibleIds = new Set(getSoftEligibleCandidates(candidateProfiles, lastSpeakerId).map((candidate) => candidate.id));
  const preferredCandidates = candidates.filter((candidate) => eligibleIds.has(String(candidate.id)));
  const recentSpeakerIds = getRecentSpeakerIds(messages, preferredCandidates.length ? preferredCandidates : candidates);
  const candidatePoolSource = preferredCandidates.length ? preferredCandidates : candidates;
  const unseenCandidates = candidatePoolSource.filter(
    (candidate) => !recentSpeakerIds.includes(String(candidate.id))
  );
  const candidatePool = unseenCandidates.length ? unseenCandidates : candidatePoolSource;
  return pickNextByRotation(candidatePool, lastSpeakerId);
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
  ollamaModel = "",
}) {
  const candidateProfiles = buildCandidateProfiles(candidates, messages);
  const recentSpeakerIds = getRecentSpeakerIds(messages, candidates, Math.min(3, candidates.length));
  const eligibleProfiles = getSoftEligibleCandidates(candidateProfiles, lastSpeakerId);
  const system = "You are an orchestration policy controller for a teaching council.";
  const prompt = `Select the next agent id from the eligible set below.

Topic:
${taskGoal}

Eligible candidates:
${formatCandidateProfiles(eligibleProfiles) || "none"}

All candidates:
${formatCandidateProfiles(candidateProfiles) || "none"}

Recent conversation:
${formatMessages(messages, 6) || "none"}

Last speaking agent id: ${lastSpeakerId || "none"}
Recent speaker ids: ${recentSpeakerIds.join(", ") || "none"}

Rules:
- choose ONE next speaker only
- optimize first for relevance to the current discussion and user need
- maintain continuity, but do not overfit to the same small subset of agents
- avoid selecting the same speaker as the last turn unless there is no strong alternative
- if multiple candidates are similarly relevant, prefer an underused candidate
- do NOT perform strict round-robin rotation
- return strict JSON: {"agentId":"<id>","reason":"<short reason>"}
`;

  const raw = await callOrchestratorLLM({ system, prompt, temperature: 0.2, ollamaModel });
  try {
    const parsed = JSON.parse(raw);
    const selectedAgentId = String(parsed.agentId || "");
    const isValidCandidate = candidates.some((c) => String(c.id) === selectedAgentId);
    const selectedProfile = candidateProfiles.find((candidate) => candidate.id === selectedAgentId);
    const isImmediateRepeat =
      selectedAgentId &&
      lastSpeakerId &&
      selectedAgentId === String(lastSpeakerId) &&
      candidates.length > 1;
    const fairnessOverride = shouldOverrideForFairness(selectedProfile, eligibleProfiles);

    if (isValidCandidate && !isImmediateRepeat && !fairnessOverride) {
      return {
        agentId: selectedAgentId,
        reason: String(parsed.reason || "Selected for relevance."),
      };
    }
  } catch (_) {}

  const fallback = pickFairFallbackCandidate({ candidates, messages, lastSpeakerId });
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
  ollamaModel = "",
  orchestratorMode = "fast",
  memoryMode = "minimal",
  topic = "",
  sessionId = "",
}) {
  const agentsQuery = selectedAgentIds.length ? { id: { $in: selectedAgentIds } } : {};
  const fetchedCandidates = await Agent.find(agentsQuery).lean();
  const candidates = sortCandidatesBySelectionOrder(fetchedCandidates, selectedAgentIds);

  if (!taskGoal) throw new Error("Task goal is required.");
  if (!candidates.length) throw new Error("No agents available for orchestration.");

  const messages = [...priorMessages];
  const performance = [];
  const trace = [];
  const lastSpeakerId = getLastSpeakingAgentId(messages, candidates);
  const mode = resolveOrchestratorMode(orchestratorMode);
  const scope = resolveConversationScope({ taskGoal, topic, sessionId, messages });
  const candidateProfiles = buildCandidateProfiles(candidates, messages);

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
      ollamaModel,
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
      ollamaModel,
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
      ollamaModel,
    });
    upcomingAgent =
      candidates.find((c) => String(c.id) === String(upcoming.agentId)) ||
      pickFairFallbackCandidate({ candidates, messages, lastSpeakerId: String(selected.id) });
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
    selectedAgentModel: resolveAgentModelConfig(selected.id, apiRoutingMode, ollamaModel),
    selectionReason: nextAgent.reason,
    confidence: 0.7,
    candidateProfiles,
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
