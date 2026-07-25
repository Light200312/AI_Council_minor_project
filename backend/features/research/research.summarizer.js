import { extractFirstJsonObject, truncateText } from "../../shared/helpers.js";
import { callOrchestratorLLM } from "../../shared/llmClient.js";

const EMPTY_RESEARCH_REPORT = {
  executiveSummary: "",
  keyFindings: [],
  supportingEvidence: [],
  conflictingEvidence: [],
  limitations: [],
  recommendations: [],
  overallConfidence: 0,
};

function normalizeStringArray(value) {
  return Array.isArray(value)
    ? value.map((item) => String(item || "").trim()).filter(Boolean)
    : [];
}

function normalizeConfidence(value) {
  const confidence = Number(value);
  if (!Number.isFinite(confidence)) return 0;
  return Math.max(0, Math.min(1, confidence));
}

function normalizeResearchReport(value) {
  return {
    executiveSummary: String(value?.executiveSummary || "").trim(),
    keyFindings: normalizeStringArray(value?.keyFindings),
    supportingEvidence: normalizeStringArray(value?.supportingEvidence),
    conflictingEvidence: normalizeStringArray(value?.conflictingEvidence),
    limitations: normalizeStringArray(value?.limitations),
    recommendations: normalizeStringArray(value?.recommendations),
    overallConfidence: normalizeConfidence(value?.overallConfidence),
  };
}

function formatEvidence(evidence = []) {
  return evidence
    .map((item, index) => {
      const rawResult = truncateText(String(item?.rawResult || ""), 1800);
      return `${index + 1}. Tool: ${item?.toolName || "unknown"}
Source: ${item?.source || "not provided"}
Evidence confidence: ${Number(item?.confidence || 0)}
Summary: ${item?.summary || "No summary available."}
Raw result: ${rawResult || "No raw result available."}`;
    })
    .join("\n\n");
}

export async function summarizeResearch({ topic, discussionMode = "", evidence = [] } = {}) {
  const safeEvidence = Array.isArray(evidence) ? evidence : [];
  if (!safeEvidence.length) return { ...EMPTY_RESEARCH_REPORT };

  const system = "You are a careful research report writer. Use only the supplied evidence and never add outside facts.";
  const prompt = `Research topic:
${String(topic || "").trim()}

Discussion mode:
${String(discussionMode || "").trim() || "general"}

Collected evidence:
${formatEvidence(safeEvidence)}

Rules:
- Use only the collected evidence above. Do not infer unstated facts or cite outside sources.
- Treat failed or low-confidence evidence as limitations, not findings.
- If evidence conflicts or is insufficient, state that clearly.
- Return strict JSON only with this exact shape:
{
  "executiveSummary": "string",
  "keyFindings": ["string"],
  "supportingEvidence": ["string"],
  "conflictingEvidence": ["string"],
  "limitations": ["string"],
  "recommendations": ["string"],
  "overallConfidence": 0.0
}`;

  try {
    const raw = await callOrchestratorLLM({ system, prompt, temperature: 0.2 });
    const json = extractFirstJsonObject(raw);
    if (!json) return { ...EMPTY_RESEARCH_REPORT };

    return normalizeResearchReport(JSON.parse(json));
  } catch {
    return { ...EMPTY_RESEARCH_REPORT };
  }
}

export { EMPTY_RESEARCH_REPORT };
