const SUMMARY_LIMIT = 280;

function normalizeText(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function extractSource(rawResult) {
  const text = String(rawResult || "");
  const url = text.match(/https?:\/\/[^\s)\]}>,]+/i)?.[0];
  if (url) return url;

  const source = text.match(/(?:^|\n)\s*source\s*:\s*([^\n]+)/i)?.[1];
  return normalizeText(source);
}

function buildSummary(rawResult) {
  const normalized = normalizeText(rawResult);
  if (!normalized) return "No result was returned.";
  return normalized.length <= SUMMARY_LIMIT
    ? normalized
    : `${normalized.slice(0, SUMMARY_LIMIT - 3).trimEnd()}...`;
}

function calculateConfidence(result, source) {
  if (!result?.ok) return 0;
  if (!normalizeText(result?.text)) return 0.2;
  if (source) return 0.85;
  return 0.6;
}

function collectEvidence(executedToolResults = []) {
  return (Array.isArray(executedToolResults) ? executedToolResults : []).map((result) => {
    const rawResult = String(result?.text || "");
    const source = extractSource(rawResult);

    return {
      toolName: String(result?.toolName || "unknown").trim() || "unknown",
      summary: buildSummary(rawResult),
      source,
      confidence: calculateConfidence(result, source),
      rawResult,
    };
  });
}

export { collectEvidence };
