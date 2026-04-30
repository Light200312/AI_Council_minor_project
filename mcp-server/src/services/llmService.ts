import axios from "axios";

export type FactCheckVerdict = "TRUE" | "FALSE" | "PARTIALLY TRUE" | "UNKNOWN";

export type LlmFactCheckResponse = {
  verdict: FactCheckVerdict;
  confidence: number;
  explanation: string;
};

type OpenAIChatResponse = {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
};

const OPENAI_CHAT_URL = "https://api.openai.com/v1/chat/completions";

const promptForFactCheck = (claim: string, evidence: string): string => `
You are a strict fact-checking AI. Given a claim and evidence, return JSON verdict.

Return ONLY valid JSON matching this schema:
{
  "verdict": "TRUE" | "FALSE" | "PARTIALLY TRUE" | "UNKNOWN",
  "confidence": number,
  "explanation": string
}

Claim:
${claim}

Evidence:
${evidence}
`;

const safeParseJson = (raw: string): unknown => {
  const fenced = raw.match(/```json\s*([\s\S]*?)```/i);
  if (fenced?.[1]) {
    return JSON.parse(fenced[1]);
  }
  return JSON.parse(raw);
};

const normalizeVerdict = (value: string): FactCheckVerdict => {
  const upper = value.toUpperCase();
  if (upper === "TRUE" || upper === "FALSE" || upper === "PARTIALLY TRUE" || upper === "UNKNOWN") {
    return upper;
  }
  return "UNKNOWN";
};

export const analyzeClaimWithLlm = async (
  claim: string,
  evidence: string
): Promise<LlmFactCheckResponse> => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is missing.");
  }

  const response = await axios.post<OpenAIChatResponse>(
    OPENAI_CHAT_URL,
    {
      model: "gpt-4o-mini",
      temperature: 0.1,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "user",
          content: promptForFactCheck(claim, evidence)
        }
      ]
    },
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      timeout: 15000
    }
  );

  const rawContent = response.data.choices?.[0]?.message?.content ?? "";
  if (!rawContent) {
    throw new Error("OpenAI response did not include content.");
  }

  const parsed = safeParseJson(rawContent) as Partial<LlmFactCheckResponse>;
  const verdict = normalizeVerdict(String(parsed.verdict ?? "UNKNOWN"));
  const confidenceRaw = Number(parsed.confidence ?? 0);
  const confidence = Number.isFinite(confidenceRaw)
    ? Math.min(1, Math.max(0, confidenceRaw))
    : 0;
  const explanation = String(parsed.explanation ?? "No explanation provided.");

  return {
    verdict,
    confidence,
    explanation
  };
};
