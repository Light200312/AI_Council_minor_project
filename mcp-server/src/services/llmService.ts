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

type GeminiResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>;
    };
  }>;
};

type OllamaResponse = {
  response?: string;
};

const OPENAI_CHAT_URL = "https://api.openai.com/v1/chat/completions";
const OPENROUTER_CHAT_URL = "https://openrouter.ai/api/v1/chat/completions";
const OPENAI_MODEL = process.env.OPENAI_FACT_CHECK_MODEL || "gpt-4o-mini";
const GEMINI_MODEL = process.env.GEMINI_FACT_CHECK_MODEL || process.env.GEMINI_MODEL || "gemini-1.5-flash";
const OPENROUTER_MODEL =
  process.env.OPENROUTER_FACT_CHECK_MODEL || process.env.OPENROUTER_MODEL || "google/gemini-2.0-flash-001";
const OLLAMA_MODEL = process.env.OLLAMA_FACT_CHECK_MODEL || process.env.OLLAMA_MODEL || "llama3.1";
const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || "http://localhost:11434";
const LLM_TIMEOUT_MS = Number(process.env.FACT_CHECK_LLM_TIMEOUT_MS || 20000);

const promptForFactCheck = (claim: string, evidence: string): string => `
You are a strict fact-checking AI. Given a claim and evidence, return JSON verdict.

Return ONLY valid JSON matching this schema:
{
  "verdict": "TRUE" | "FALSE" | "PARTIALLY TRUE" | "UNKNOWN",
  "confidence": number between 0 and 1,
  "explanation": string
}

Use UNKNOWN only when the supplied evidence is missing, unrelated, or too weak to judge the claim.
If search snippets and fetched source text support a likely judgment, choose TRUE, FALSE, or PARTIALLY TRUE with appropriate confidence.

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
  const trimmed = raw.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    const objectMatch = trimmed.match(/\{[\s\S]*\}/);
    if (objectMatch?.[0]) {
      return JSON.parse(objectMatch[0]);
    }
    throw new Error("Model response was not valid JSON.");
  }
};

const normalizeVerdict = (value: string): FactCheckVerdict => {
  const upper = value.toUpperCase();
  if (upper === "TRUE" || upper === "FALSE" || upper === "PARTIALLY TRUE" || upper === "UNKNOWN") {
    return upper;
  }
  return "UNKNOWN";
};

const normalizeLlmResponse = (rawContent: string): LlmFactCheckResponse => {
  if (!rawContent) {
    throw new Error("LLM response did not include content.");
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

const getProviderPreference = (): string[] => {
  const preferred = String(process.env.FACT_CHECK_PROVIDER || "")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
  const providers: string[] = [];
  const add = (provider: string, enabled: boolean) => {
    if (enabled && !providers.includes(provider)) providers.push(provider);
  };

  preferred.forEach((provider) => add(provider, true));
  add("openai", Boolean(process.env.OPENAI_API_KEY));
  add("gemini", Boolean(process.env.GEMINI_API_KEY));
  add("openrouter", Boolean(process.env.OPENROUTER_API_KEY));
  add(
    "ollama",
    String(process.env.FACT_CHECK_USE_OLLAMA || "").toLowerCase() === "true" ||
      Boolean(process.env.OLLAMA_FACT_CHECK_MODEL)
  );

  return providers;
};

const errorMessage = (error: unknown): string => {
  const maybeAxiosError = error as {
    response?: { status?: number; data?: { error?: { message?: string }; message?: string } };
    message?: string;
  };
  const status = maybeAxiosError.response?.status;
  const message =
    maybeAxiosError.response?.data?.error?.message ||
    maybeAxiosError.response?.data?.message ||
    maybeAxiosError.message ||
    String(error);
  return status ? `HTTP ${status}: ${message}` : message;
};

const callOpenAi = async (prompt: string): Promise<string> => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is missing.");

  const response = await axios.post<OpenAIChatResponse>(
    OPENAI_CHAT_URL,
    {
      model: OPENAI_MODEL,
      temperature: 0.1,
      response_format: { type: "json_object" },
      messages: [{ role: "user", content: prompt }]
    },
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      timeout: LLM_TIMEOUT_MS
    }
  );

  return response.data.choices?.[0]?.message?.content ?? "";
};

const callGemini = async (prompt: string): Promise<string> => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is missing.");

  const response = await axios.post<GeminiResponse>(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
    {
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.1,
        responseMimeType: "application/json"
      }
    },
    { timeout: LLM_TIMEOUT_MS }
  );

  return response.data.candidates?.[0]?.content?.parts?.map((part) => part.text || "").join("\n") ?? "";
};

const callOpenRouter = async (prompt: string): Promise<string> => {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error("OPENROUTER_API_KEY is missing.");

  const response = await axios.post<OpenAIChatResponse>(
    OPENROUTER_CHAT_URL,
    {
      model: OPENROUTER_MODEL,
      temperature: 0.1,
      response_format: { type: "json_object" },
      messages: [{ role: "user", content: prompt }]
    },
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      timeout: LLM_TIMEOUT_MS
    }
  );

  return response.data.choices?.[0]?.message?.content ?? "";
};

const callOllama = async (prompt: string): Promise<string> => {
  const response = await axios.post<OllamaResponse>(
    `${OLLAMA_BASE_URL.replace(/\/$/, "")}/api/generate`,
    {
      model: OLLAMA_MODEL,
      prompt,
      stream: false,
      format: "json",
      options: { temperature: 0.1 }
    },
    { timeout: LLM_TIMEOUT_MS }
  );

  return response.data.response ?? "";
};

const callProvider = async (provider: string, prompt: string): Promise<string> => {
  switch (provider) {
    case "gemini":
      return callGemini(prompt);
    case "openrouter":
      return callOpenRouter(prompt);
    case "ollama":
      return callOllama(prompt);
    case "openai":
    default:
      return callOpenAi(prompt);
  }
};

export const analyzeClaimWithLlm = async (
  claim: string,
  evidence: string
): Promise<LlmFactCheckResponse> => {
  const providers = getProviderPreference();
  if (!providers.length) {
    throw new Error(
      "No fact-check LLM provider configured. Set OPENAI_API_KEY, GEMINI_API_KEY, OPENROUTER_API_KEY, or FACT_CHECK_USE_OLLAMA=true."
    );
  }

  const prompt = promptForFactCheck(claim, evidence);
  const failures: string[] = [];

  for (const provider of providers) {
    try {
      const rawContent = await callProvider(provider, prompt);
      const result = normalizeLlmResponse(rawContent);
      return {
        ...result,
        explanation: `[${provider}] ${result.explanation}`
      };
    } catch (error) {
      failures.push(`${provider}: ${errorMessage(error)}`);
    }
  }

  throw new Error(`All fact-check LLM providers failed. ${failures.join(" | ")}`);
};
