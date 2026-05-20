import { analyzeClaimWithLlm } from "../services/llmService";
import { webFetch } from "./webFetch";
import { webSearch } from "./webSearch";

export type FactCheckResult = {
  verdict: "TRUE" | "FALSE" | "PARTIALLY TRUE" | "UNKNOWN";
  confidence: number;
  explanation: string;
  sources: string[];
  errorCode?: string;
};

const EVIDENCE_SOURCE_LIMIT = 3;
const EVIDENCE_CHAR_LIMIT = 24000;

const getFactCheckError = (error: unknown): { code?: string; message: string } => {
  const maybeAxiosError = error as {
    response?: { status?: number; data?: { error?: { message?: string }; message?: string } };
    message?: string;
  };
  const status = maybeAxiosError.response?.status;
  const apiMessage =
    maybeAxiosError.response?.data?.error?.message ||
    maybeAxiosError.response?.data?.message ||
    maybeAxiosError.message ||
    String(error);

  if (status === 429 || /\bHTTP 429\b|status code 429|rate.?limit|quota/i.test(apiMessage)) {
    return {
      code: "LLM_RATE_LIMIT",
      message:
        "The configured LLM provider rejected the verification request because of rate limits or quota. The server could search sources, but no configured fallback LLM could generate a final fact-check verdict."
    };
  }

  return {
    code: status ? `LLM_HTTP_${status}` : undefined,
    message: apiMessage
  };
};

export const factCheck = async (claim: string): Promise<FactCheckResult> => {
  let candidateUrls: string[] = [];
  let searchEvidence = "";
  try {
    const searchResults = await webSearch(claim, 5);
    const evidenceSearchResults = searchResults.slice(0, EVIDENCE_SOURCE_LIMIT);
    candidateUrls = evidenceSearchResults.map((item) => item.link);
    searchEvidence = evidenceSearchResults
      .map(
        (item, index) =>
          `Search result ${index + 1}: ${item.title}\nSource: ${item.link}\nSnippet: ${item.snippet || "No snippet available."}`
      )
      .join("\n\n");
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      verdict: "UNKNOWN",
      confidence: 0,
      explanation: `Could not search for evidence: ${message}`,
      sources: []
    };
  }

  const fetchResults = await Promise.allSettled(candidateUrls.map((url) => webFetch(url)));
  const evidenceParts: string[] = [];
  const sources: string[] = [];

  fetchResults.forEach((result, index) => {
    if (result.status === "fulfilled" && result.value.trim().length > 0) {
      sources.push(candidateUrls[index]);
      evidenceParts.push(`Source: ${candidateUrls[index]}\nContent: ${result.value}`);
    }
  });

  if (!sources.length) {
    sources.push(...candidateUrls);
  }

  const evidence = [searchEvidence, evidenceParts.join("\n\n---\n\n")]
    .filter(Boolean)
    .join("\n\n---\n\n")
    .slice(0, EVIDENCE_CHAR_LIMIT);

  let llmResult;
  try {
    llmResult = await analyzeClaimWithLlm(
      claim,
      evidence || "No reliable evidence could be extracted from the fetched URLs."
    );
  } catch (error) {
    const { code, message } = getFactCheckError(error);
    return {
      verdict: "UNKNOWN",
      confidence: sources.length ? 0.1 : 0,
      explanation: message,
      sources,
      errorCode: code
    };
  }

  return {
    verdict: llmResult.verdict,
    confidence: llmResult.confidence,
    explanation: llmResult.explanation,
    sources
  };
};
