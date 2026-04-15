import Agent from "../models/agent.js";
import { callOrchestratorLLM } from "./llmClient.js";

function extractFirstJsonObject(text = "") {
  const s = String(text || "");
  const start = s.indexOf("{");
  const end = s.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;
  return s.slice(start, end + 1);
}

function clampNumber(value, { min, max, fallback }) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

function summarizeCombatLog(combatLog = []) {
  return (combatLog || [])
    .map((entry, index) => {
      const speaker = entry?.speakerName || (entry?.isUser ? "Player" : "Opponent");
      return `${index + 1}. ${speaker}: ${String(entry?.text || "").trim()}`;
    })
    .join("\n");
}

function summarizeRoundResults(roundResults = []) {
  return (roundResults || [])
    .map(
      (result) =>
        `Round ${result.round}: winner=${result.winner}, playerScore=${result.playerScore}, opponentScore=${result.opponentScore}, reasoning=${String(
          result.reasoning || ""
        ).trim()}`
    )
    .join("\n");
}

function computeAggregateScores(roundResults = [], scores = {}) {
  const playerFromRounds = roundResults.reduce((sum, result) => sum + Number(result?.playerScore || 0), 0);
  const opponentFromRounds = roundResults.reduce((sum, result) => sum + Number(result?.opponentScore || 0), 0);
  const playerTotal = Math.max(playerFromRounds, Number(scores?.playerScore || 0));
  const opponentTotal = Math.max(opponentFromRounds, Number(scores?.opponentScore || 0));
  return { playerTotal, opponentTotal };
}

function scoreCandidate(agent, topic, difficulty = "standard") {
  const topicTokens = String(topic || "")
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length > 3);
  const text = `${agent.role || ""} ${agent.description || ""}`.toLowerCase();
  const matchScore = topicTokens.reduce((acc, token) => (text.includes(token) ? acc + 3 : acc), 0);
  const logic = Number(agent.stats?.logic || 50);
  const rhetoric = Number(agent.stats?.rhetoric || 50);
  const baseSkill = logic * 0.6 + rhetoric * 0.4;
  if (difficulty === "easy") return matchScore + (100 - baseSkill) * 0.2;
  if (difficulty === "hard") return matchScore + baseSkill * 0.4;
  return matchScore + baseSkill * 0.25;
}

async function chooseOpponentTeam({
  topic,
  candidateIds = [],
  count = 3,
  difficulty = "standard",
  ollamaModel = "",
}) {
  const safeCount = clampNumber(count, { min: 1, max: 8, fallback: 3 });
  const candidates = await Agent.find(candidateIds.length ? { id: { $in: candidateIds } } : {}).lean();
  if (!candidates.length) throw new Error("No candidates available.");

  const roster = candidates.map((c) => ({
    id: c.id,
    name: c.name,
    role: c.role,
    era: c.era,
    description: c.description,
    stats: c.stats,
  }));

  const system = "You select an opponent team for a debate game. Return strict JSON only.";
  const prompt = `Topic: ${topic}
Difficulty: ${difficulty}

Pick ${safeCount} agent ids from this roster that best fit the topic and difficulty.

Roster:
${roster.map((r) => `${r.id} | ${r.name} | ${r.role} | ${r.era}`).join("\n")}

Return JSON: {"ids":["id1","id2"],"reason":"short reason"}`;

  const raw = await callOrchestratorLLM({ system, prompt, temperature: 0.2, ollamaModel });
  const jsonText = extractFirstJsonObject(raw);
  try {
    const parsed = JSON.parse(jsonText || "{}");
    const ids = Array.isArray(parsed.ids) ? parsed.ids.map((id) => String(id)) : [];
    const picked = candidates.filter((c) => ids.includes(String(c.id)));
    if (picked.length >= Math.min(safeCount, candidates.length)) {
      return {
        opponentTeam: picked.slice(0, safeCount),
        reason: String(parsed.reason || "Selected by AI."),
      };
    }
  } catch (_) {}

  const sorted = [...candidates].sort(
    (a, b) => scoreCandidate(b, topic, difficulty) - scoreCandidate(a, topic, difficulty)
  );
  const fallback = difficulty === "easy" ? sorted.reverse().slice(0, safeCount) : sorted.slice(0, safeCount);
  return {
    opponentTeam: fallback,
    reason: "Fallback heuristic selection.",
  };
}

async function chooseOpponentTurn({
  topic,
  opponentTeamIds = [],
  userArgument = "",
  strategies = [],
  difficulty = "standard",
  ollamaModel = "",
}) {
  const candidates = await Agent.find({ id: { $in: opponentTeamIds } }).lean();
  if (!candidates.length) throw new Error("No opponent team available.");

  const system = "You are selecting the opponent speaker and response strategy. Return strict JSON only.";
  const prompt = `Topic: ${topic}
Difficulty: ${difficulty}
User argument: ${userArgument || "none"}

Opponent team:
${candidates.map((c) => `${c.id} | ${c.name} | ${c.role}`).join("\n")}

Available strategies:
${strategies.map((s) => `${s.type} | ${s.title} | ${s.description}`).join("\n")}

Return JSON: {"agentId":"<id>","strategyType":"<type>","reason":"short reason"}`;

  const raw = await callOrchestratorLLM({ system, prompt, temperature: 0.3, ollamaModel });
  const jsonText = extractFirstJsonObject(raw);
  try {
    const parsed = JSON.parse(jsonText || "{}");
    const agentId = String(parsed.agentId || "");
    const strategyType = String(parsed.strategyType || "");
    if (candidates.some((c) => String(c.id) === agentId) && strategies.some((s) => s.type === strategyType)) {
      return { agentId, strategyType, reason: String(parsed.reason || "Selected by AI.") };
    }
  } catch (_) {}

  const fallbackAgent =
    candidates.sort((a, b) => scoreCandidate(b, topic, difficulty) - scoreCandidate(a, topic, difficulty))[0] ||
    candidates[0];
  const fallbackStrategy = strategies.find((s) => s.type === "free_style") || strategies[0];
  return {
    agentId: String(fallbackAgent.id),
    strategyType: String(fallbackStrategy.type),
    reason: "Fallback selection.",
  };
}

async function judgeRound({ topic, playerArgument, opponentArgument, ollamaModel = "" }) {
  const system = "You are a neutral judge for a debate. Return strict JSON only.";
  const prompt = `Topic: ${topic}
Player argument: ${playerArgument}
Opponent argument: ${opponentArgument}

Return JSON:
{"winner":"player|opponent|tie","playerScore":0-100,"opponentScore":0-100,"confidence":0-1,"probabilities":{"player":0-1,"opponent":0-1},"reasoning":"short reasoning"}`;

  const raw = await callOrchestratorLLM({ system, prompt, temperature: 0.2, ollamaModel });
  const jsonText = extractFirstJsonObject(raw);
  try {
    const parsed = JSON.parse(jsonText || "{}");
    const playerScore = clampNumber(parsed.playerScore, { min: 0, max: 100, fallback: 50 });
    const opponentScore = clampNumber(parsed.opponentScore, { min: 0, max: 100, fallback: 50 });
    const winner = ["player", "opponent", "tie"].includes(parsed.winner) ? parsed.winner : "tie";
    return {
      winner,
      playerScore,
      opponentScore,
      confidence: clampNumber(parsed.confidence, { min: 0, max: 1, fallback: 0.5 }),
      probabilities: {
        player: clampNumber(parsed?.probabilities?.player, { min: 0, max: 1, fallback: 0.5 }),
        opponent: clampNumber(parsed?.probabilities?.opponent, { min: 0, max: 1, fallback: 0.5 }),
      },
      reasoning: String(parsed.reasoning || "Judged by AI."),
    };
  } catch (_) {}

  const playerScore = clampNumber(playerArgument?.length || 0, { min: 0, max: 100, fallback: 50 });
  const opponentScore = clampNumber(opponentArgument?.length || 0, { min: 0, max: 100, fallback: 50 });
  const winner = playerScore === opponentScore ? "tie" : playerScore > opponentScore ? "player" : "opponent";
  return {
    winner,
    playerScore,
    opponentScore,
    confidence: 0.4,
    probabilities: {
      player: playerScore >= opponentScore ? 0.6 : 0.4,
      opponent: opponentScore >= playerScore ? 0.6 : 0.4,
    },
    reasoning: "Fallback scoring by length and heuristics.",
  };
}

async function finalizeDebateVerdict({
  topic,
  playerTeam = [],
  opponentTeam = [],
  combatLog = [],
  roundResults = [],
  scores = {},
  ollamaModel = "",
}) {
  const { playerTotal, opponentTotal } = computeAggregateScores(roundResults, scores);
  const playerNames = playerTeam.map((agent) => agent?.name).filter(Boolean);
  const opponentNames = opponentTeam.map((agent) => agent?.name).filter(Boolean);
  const system = "You are a neutral chief judge producing a final debate verdict. Return strict JSON only.";
  const prompt = `Topic: ${topic}
Player council: ${playerNames.join(", ") || "Unknown"}
Opponent council: ${opponentNames.join(", ") || "Unknown"}
Aggregate score so far: player=${playerTotal}, opponent=${opponentTotal}

Round results:
${summarizeRoundResults(roundResults) || "No round-level verdicts recorded."}

Full debate transcript:
${summarizeCombatLog(combatLog) || "No transcript available."}

Consider the entire debate, including arguments, rebuttals, consistency, clarity, and adaptation over time.

Return JSON:
{
  "winner":"player|opponent|tie",
  "confidence":0-1,
  "finalScore":{"player":0-1000,"opponent":0-1000},
  "summary":"2-4 sentence final verdict",
  "keyMoments":["up to 4 concise moments"],
  "playerStrengths":["up to 4 strengths"],
  "playerWeaknesses":["up to 4 weaknesses"],
  "opponentStrengths":["up to 4 strengths"],
  "opponentWeaknesses":["up to 4 weaknesses"],
  "reasoning":"short judge explanation"
}`;

  const raw = await callOrchestratorLLM({ system, prompt, temperature: 0.2, ollamaModel });
  const jsonText = extractFirstJsonObject(raw);
  try {
    const parsed = JSON.parse(jsonText || "{}");
    const winner = ["player", "opponent", "tie"].includes(parsed.winner) ? parsed.winner : "tie";
    return {
      winner,
      confidence: clampNumber(parsed.confidence, { min: 0, max: 1, fallback: 0.5 }),
      finalScore: {
        player: clampNumber(parsed?.finalScore?.player, { min: 0, max: 1000, fallback: playerTotal }),
        opponent: clampNumber(parsed?.finalScore?.opponent, { min: 0, max: 1000, fallback: opponentTotal }),
      },
      summary: String(parsed.summary || "").trim(),
      keyMoments: Array.isArray(parsed.keyMoments) ? parsed.keyMoments.map((item) => String(item).trim()).filter(Boolean) : [],
      playerStrengths: Array.isArray(parsed.playerStrengths)
        ? parsed.playerStrengths.map((item) => String(item).trim()).filter(Boolean)
        : [],
      playerWeaknesses: Array.isArray(parsed.playerWeaknesses)
        ? parsed.playerWeaknesses.map((item) => String(item).trim()).filter(Boolean)
        : [],
      opponentStrengths: Array.isArray(parsed.opponentStrengths)
        ? parsed.opponentStrengths.map((item) => String(item).trim()).filter(Boolean)
        : [],
      opponentWeaknesses: Array.isArray(parsed.opponentWeaknesses)
        ? parsed.opponentWeaknesses.map((item) => String(item).trim()).filter(Boolean)
        : [],
      reasoning: String(parsed.reasoning || "Final verdict generated by AI judge.").trim(),
    };
  } catch (_) {}

  const winner =
    playerTotal === opponentTotal ? "tie" : playerTotal > opponentTotal ? "player" : "opponent";
  return {
    winner,
    confidence: 0.45,
    finalScore: {
      player: playerTotal,
      opponent: opponentTotal,
    },
    summary:
      winner === "tie"
        ? "The debate ended in a narrow tie after considering the full exchange of arguments and rebuttals."
        : `The ${winner === "player" ? "player" : "opponent"} side earned the stronger overall verdict after considering the full debate.`,
    keyMoments: roundResults.slice(0, 4).map((result) => `Round ${result.round}: ${result.reasoning || result.winner}`),
    playerStrengths: [],
    playerWeaknesses: [],
    opponentStrengths: [],
    opponentWeaknesses: [],
    reasoning: "Fallback final verdict based on aggregate round scores.",
  };
}

export { chooseOpponentTeam, chooseOpponentTurn, judgeRound, finalizeDebateVerdict };
