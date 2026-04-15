// ─────────────────────────────────────────────────────────────
// Orchestrator service — multi-agent conversation flow.
// ─────────────────────────────────────────────────────────────

import Agent from "../agent/agent.model.js";
import { runAgentStep } from "../agent/agentRuntime.service.js";
import { resolveAgentModelConfig } from "../../shared/agentModelRegistry.js";
import { callOrchestratorLLM } from "../../shared/llmClient.js";
import { truncateText, generateMessageId } from "../../shared/helpers.js";

// ─── Message Formatting ────────────────────────────────────

function formatMessages(messages = [], limit = 12) {
  return messages.slice(-limit).map((m) => `${m.speakerName}: ${m.text}`).join("\n");
}

function makeOrchestratorMessage(text) {
  return { id: generateMessageId(), speakerId: "orchestrator", speakerName: "Orchestrator", speakerInitials: "OR", isUser: false, text, timestamp: Date.now() };
}

// ─── Speaker History Helpers ────────────────────────────────

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

function getRecentSpeakerIds(messages, candidates, limit = candidates.length) {
  const candidateIds = new Set(candidates.map((c) => String(c.id)));
  const recent = [];
  for (let i = messages.length - 1; i >= 0; i -= 1) {
    const speakerId = String(messages[i]?.speakerId || "");
    if (!candidateIds.has(speakerId) || recent.includes(speakerId)) continue;
    recent.push(speakerId);
    if (recent.length >= limit) break;
  }
  return recent;
}

// ─── Candidate Sorting & Profiling ──────────────────────────

function sortCandidatesBySelectionOrder(candidates, selectedAgentIds = []) {
  if (!selectedAgentIds.length) return candidates;
  const orderMap = new Map(selectedAgentIds.map((id, i) => [String(id), i]));
  return [...candidates].sort((a, b) => {
    const aO = orderMap.get(String(a.id)); const bO = orderMap.get(String(b.id));
    if (aO == null && bO == null) return 0; if (aO == null) return 1; if (bO == null) return -1; return aO - bO;
  });
}

function buildParticipationStats(messages, candidates) {
  const candidateIds = new Set(candidates.map((c) => String(c.id)));
  const ordered = [...messages].sort((a, b) => Number(a?.timestamp || 0) - Number(b?.timestamp || 0));
  const stats = new Map(candidates.map((c) => [String(c.id), { turnsTaken: 0, lastSpokeTimestamp: 0, lastSpokeTurnIndex: -1 }]));
  let speakingTurnIndex = 0;
  ordered.forEach((m) => {
    const sid = String(m?.speakerId || ""); if (!candidateIds.has(sid)) return;
    const entry = stats.get(sid); if (!entry) return;
    entry.turnsTaken += 1; entry.lastSpokeTimestamp = Number(m?.timestamp || 0); entry.lastSpokeTurnIndex = speakingTurnIndex; speakingTurnIndex += 1;
  });
  return { stats, totalAgentTurns: speakingTurnIndex };
}

function buildCandidateProfile(candidate, participationStats, totalAgentTurns) {
  const agentId = String(candidate.id);
  const stats = participationStats.get(agentId) || { turnsTaken: 0, lastSpokeTimestamp: 0, lastSpokeTurnIndex: -1 };
  const turnsSinceLastSpeak = stats.lastSpokeTurnIndex < 0 ? "never" : String(Math.max(0, totalAgentTurns - stats.lastSpokeTurnIndex - 1));
  return { id: agentId, name: String(candidate.name || ""), role: String(candidate.role || ""), domain: String(candidate.domain || "other"), specialization: truncateText(candidate.specialAbility || candidate.description || candidate.personalityTraits || candidate.role, 100), turnsTaken: stats.turnsTaken, turnsSinceLastSpeak, hasSpokenYet: stats.turnsTaken > 0 };
}

function buildCandidateProfiles(candidates, messages) {
  const { stats, totalAgentTurns } = buildParticipationStats(messages, candidates);
  return candidates.map((c) => buildCandidateProfile(c, stats, totalAgentTurns));
}

function formatCandidateProfiles(profiles = []) {
  return profiles.map((c) => `- id: ${c.id} | ${c.name} | ${c.role} | domain: ${c.domain} | strengths: ${c.specialization} | turnsTaken: ${c.turnsTaken} | turnsSinceLastSpeak: ${c.turnsSinceLastSpeak}`).join("\n");
}

// ─── Fairness & Rotation Logic ──────────────────────────────

function getSoftEligibleCandidates(profiles, lastSpeakerId = "") {
  const nonRepeating = profiles.filter((c) => c.id !== String(lastSpeakerId || ""));
  const pool = nonRepeating.length ? nonRepeating : profiles;
  const unspoken = pool.filter((c) => !c.hasSpokenYet);
  if (unspoken.length >= 2) return unspoken;
  const turnCounts = pool.map((c) => c.turnsTaken);
  const minT = Math.min(...turnCounts); const maxT = Math.max(...turnCounts);
  if (maxT - minT >= 2) return pool.filter((c) => c.turnsTaken === minT);
  return pool;
}

function shouldOverrideForFairness(selectedProfile, eligible = []) {
  if (!selectedProfile || !eligible.length) return false;
  if (eligible.some((c) => c.id === selectedProfile.id)) return false;
  const minT = Math.min(...eligible.map((c) => c.turnsTaken));
  return selectedProfile.turnsTaken - minT >= 2;
}

function pickNextByRotation(candidates, lastSpeakerId = "", excludeIds = []) {
  if (!candidates.length) return null;
  const excluded = new Set(excludeIds.map((id) => String(id)));
  const startIndex = Math.max(candidates.findIndex((c) => String(c.id) === String(lastSpeakerId || "")), -1);
  for (let offset = 1; offset <= candidates.length; offset += 1) {
    const c = candidates[(startIndex + offset) % candidates.length];
    if (!excluded.has(String(c.id))) return c;
  }
  return candidates[(startIndex + 1 + candidates.length) % candidates.length] || candidates[0];
}

function pickFairFallbackCandidate({ candidates, messages, lastSpeakerId = "" }) {
  const profiles = buildCandidateProfiles(candidates, messages);
  const eligibleIds = new Set(getSoftEligibleCandidates(profiles, lastSpeakerId).map((c) => c.id));
  const preferred = candidates.filter((c) => eligibleIds.has(String(c.id)));
  const recentIds = getRecentSpeakerIds(messages, preferred.length ? preferred : candidates);
  const pool = preferred.length ? preferred : candidates;
  const unseen = pool.filter((c) => !recentIds.includes(String(c.id)));
  return pickNextByRotation(unseen.length ? unseen : pool, lastSpeakerId);
}

// ─── Mode & Scope Resolution ────────────────────────────────

function resolveOrchestratorMode(mode) { return mode === "dynamic" ? "dynamic" : "fast"; }

function resolveConversationScope({ taskGoal, topic, sessionId, messages }) {
  let t = String(topic || "").trim(); let s = String(sessionId || "").trim();
  if (!t) { const m = [...messages].reverse().find((m) => String(m?.topic || "").trim()); if (m) t = String(m.topic || "").trim(); }
  if (!t) t = String(taskGoal || "").trim();
  if (!s) { const m = [...messages].reverse().find((m) => String(m?.sessionId || "").trim()); if (m) s = String(m.sessionId || "").trim(); }
  return { topic: t, sessionId: s };
}

// ─── Dynamic Agent Selection ────────────────────────────────

async function selectNextAgent({ taskGoal, messages, candidates, lastSpeakerId = "", ollamaModel = "" }) {
  const profiles = buildCandidateProfiles(candidates, messages);
  const recentIds = getRecentSpeakerIds(messages, candidates, Math.min(3, candidates.length));
  const eligible = getSoftEligibleCandidates(profiles, lastSpeakerId);
  const system = "You are an orchestration policy controller for a teaching council.";
  const prompt = `Select the next agent id from the eligible set below.\n\nTopic:\n${taskGoal}\n\nEligible candidates:\n${formatCandidateProfiles(eligible) || "none"}\n\nAll candidates:\n${formatCandidateProfiles(profiles) || "none"}\n\nRecent conversation:\n${formatMessages(messages, 6) || "none"}\n\nLast speaking agent id: ${lastSpeakerId || "none"}\nRecent speaker ids: ${recentIds.join(", ") || "none"}\n\nRules:\n- choose ONE next speaker only\n- optimize for relevance\n- avoid selecting the same speaker as the last turn\n- return strict JSON: {"agentId":"<id>","reason":"<short reason>"}`;
  const raw = await callOrchestratorLLM({ system, prompt, temperature: 0.2, ollamaModel });
  try {
    const parsed = JSON.parse(raw); const selectedId = String(parsed.agentId || "");
    const isValid = candidates.some((c) => String(c.id) === selectedId);
    const selectedProfile = profiles.find((c) => c.id === selectedId);
    const isRepeat = selectedId && lastSpeakerId && selectedId === String(lastSpeakerId) && candidates.length > 1;
    const fairOverride = shouldOverrideForFairness(selectedProfile, eligible);
    if (isValid && !isRepeat && !fairOverride) return { agentId: selectedId, reason: String(parsed.reason || "Selected for relevance.") };
  } catch (_) {}
  const fallback = pickFairFallbackCandidate({ candidates, messages, lastSpeakerId });
  return { agentId: String(fallback.id), reason: "Fallback rotation to keep turns moving." };
}

// ─── Main Orchestration Entry Point ─────────────────────────

async function orchestrateTask({ taskGoal, selectedAgentIds = [], priorMessages = [], maxIterations, allowMetaMemory = false, metaMemory = null, apiRoutingMode = "persona", ollamaModel = "", orchestratorMode = "fast", memoryMode = "minimal", topic = "", sessionId = "" }) {
  const fetched = await Agent.find(selectedAgentIds.length ? { id: { $in: selectedAgentIds } } : {}).lean();
  const candidates = sortCandidatesBySelectionOrder(fetched, selectedAgentIds);
  if (!taskGoal) throw new Error("Task goal is required.");
  if (!candidates.length) throw new Error("No agents available for orchestration.");

  const messages = [...priorMessages]; const performance = []; const trace = [];
  const lastSpeakerId = getLastSpeakingAgentId(messages, candidates);
  const mode = resolveOrchestratorMode(orchestratorMode);
  const scope = resolveConversationScope({ taskGoal, topic, sessionId, messages });
  const candidateProfiles = buildCandidateProfiles(candidates, messages);

  if (!hasOrchestratorOpening(messages)) messages.push(makeOrchestratorMessage(`Welcome to the council session on "${taskGoal}". I will coordinate one speaker at a time, and after each turn you can respond so the council can coach you.`));

  let nextAgent;
  if (mode === "dynamic") { nextAgent = await selectNextAgent({ taskGoal, messages, candidates, lastSpeakerId, ollamaModel }); }
  else { const rotated = pickNextByRotation(candidates, lastSpeakerId); nextAgent = { agentId: String(rotated.id), reason: "Fast mode rotation for low latency." }; }
  const selected = candidates.find((c) => String(c.id) === String(nextAgent.agentId)) || candidates[0];
  messages.push(makeOrchestratorMessage(`Decision: ${selected.name} (${selected.role}) will speak next. Reason: ${nextAgent.reason}`));

  let agentMessage;
  try {
    agentMessage = await runAgentStep({ agentId: selected.id, taskGoal, messages, outputConstraints: "Teach the user directly. Evaluate the user's last point, correct mistakes clearly, praise valid reasoning, and give one concrete improvement step. Keep it concise.", apiRoutingMode, ollamaModel, memoryMode, topic: scope.topic, sessionId: scope.sessionId });
  } catch (_) {
    agentMessage = { id: generateMessageId(), speakerId: String(selected.id), speakerName: selected.name, speakerInitials: selected.avatarInitials || "AI", isUser: false, text: "I could not respond due to a temporary model issue. Share your next point, and I will continue coaching.", timestamp: Date.now(), modelProvider: "fallback", modelName: "fallback" };
  }
  messages.push(agentMessage);

  let upcomingAgent, upcomingReason;
  if (mode === "dynamic") { const upcoming = await selectNextAgent({ taskGoal, messages, candidates, lastSpeakerId: String(selected.id), ollamaModel }); upcomingAgent = candidates.find((c) => String(c.id) === String(upcoming.agentId)) || pickFairFallbackCandidate({ candidates, messages, lastSpeakerId: String(selected.id) }); upcomingReason = upcoming.reason || "Dynamic selection."; }
  else { upcomingAgent = pickNextByRotation(candidates, String(selected.id)); upcomingReason = "Round-robin rotation for low-latency turn management."; }
  messages.push(makeOrchestratorMessage(`Decision: Next speaker is ${upcomingAgent.name} (${upcomingAgent.role}). Reason: ${upcomingReason}. Your turn first: share your view or question, then I will hand over to ${upcomingAgent.name}.`));

  trace.push({ iteration: 1, selectedAgentId: String(selected.id), selectedAgentModel: resolveAgentModelConfig(selected.id, apiRoutingMode, ollamaModel), selectionReason: nextAgent.reason, confidence: 0.7, candidateProfiles, suggestion: `One agent turn completed using ${mode} orchestrator mode. Awaiting user input for the next turn.` });
  performance.push({ iteration: 1, confidence: 0.7, completeness: 0.5, conflictDetected: false, improvementDetected: true });
  const summary = `Completed one guided turn on "${taskGoal}". ${selected.name} responded, and ${upcomingAgent.name} is queued for the next turn after user input.`;

  return { summary, messages, trace, performance, clarifyingQuestion: `Your turn: respond to ${selected.name}'s advice. Then ${upcomingAgent.name} will speak.`, suggestion: "Provide a specific claim and your reasoning so the next coach can critique it precisely.", termination: `Single-turn orchestration completed (${mode} mode).` };
}

export { orchestrateTask };
