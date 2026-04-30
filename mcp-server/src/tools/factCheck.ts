import { analyzeClaimWithLlm } from "../services/llmService";
import { webFetch } from "./webFetch";
import { webSearch } from "./webSearch";

export type FactCheckResult = {
  verdict: "TRUE" | "FALSE" | "PARTIALLY TRUE" | "UNKNOWN";
  confidence: number;
  explanation: string;
  sources: string[];
};

const EVIDENCE_SOURCE_LIMIT = 3;
const EVIDENCE_CHAR_LIMIT = 24000;

export const factCheck = async (claim: string): Promise<FactCheckResult> => {
  let candidateUrls: string[] = [];
  try {
    const searchResults = await webSearch(claim, 5);
    candidateUrls = searchResults.slice(0, EVIDENCE_SOURCE_LIMIT).map((item) => item.link);
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

  const evidence = evidenceParts.join("\n\n---\n\n").slice(0, EVIDENCE_CHAR_LIMIT);

  let llmResult;
  try {
    llmResult = await analyzeClaimWithLlm(
      claim,
      evidence || "No reliable evidence could be extracted from the fetched URLs."
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      verdict: "UNKNOWN",
      confidence: 0,
      explanation: `Could not complete LLM verification: ${message}`,
      sources
    };
  }

  return {
    verdict: llmResult.verdict,
    confidence: llmResult.confidence,
    explanation: llmResult.explanation,
    sources
  };
};
