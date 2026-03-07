import axios from "axios";

const OLLAMA_BASE_URL =
  process.env.OLLAMA_BASE_URL ||
  process.env.OLLAMA_API_KEY ||
  "http://localhost:11434";
const OLLAMA_ORCHESTRATOR_MODEL = process.env.OLLAMA_MODEL || "qwen2.5:latest";
const OLLAMA_TIMEOUT_MS = Number(process.env.OLLAMA_TIMEOUT_MS || 60000);
const ORCHESTRATOR_TIMEOUT_MS = Number(process.env.ORCHESTRATOR_TIMEOUT_MS || 15000);

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-1.5-flash";
const CLAUDE_MODEL = process.env.CLAUDE_MODEL || "claude-3-5-sonnet-latest";
const DEEPSEEK_MODEL = process.env.DEEPSEEK_MODEL || "deepseek-chat";
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || "openai/gpt-4o-mini";
const LLM_TIMEOUT_MS = Number(process.env.LLM_TIMEOUT_MS || 90000);

async function callOllama({
  system,
  prompt,
  model = OLLAMA_ORCHESTRATOR_MODEL,
  temperature = 0.4,
  timeoutMs = OLLAMA_TIMEOUT_MS,
}) {
  const response = await axios.post(
    `${OLLAMA_BASE_URL.replace(/\/$/, "")}/api/generate`,
    {
      model,
      system,
      prompt,
      stream: false,
      options: { temperature },
    },
    { timeout: timeoutMs }
  );
  return (response.data?.response || "").trim();
}

async function callGemini({ system, prompt, model = GEMINI_MODEL, temperature = 0.4 }) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("Missing GEMINI_API_KEY.");

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const response = await axios.post(
    url,
    {
      contents: [{ role: "user", parts: [{ text: `${system}\n\n${prompt}` }] }],
      generationConfig: { temperature },
    },
    { timeout: LLM_TIMEOUT_MS }
  );
  return (
    response.data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join("\n").trim() || ""
  );
}

async function callClaude({ system, prompt, model = CLAUDE_MODEL, temperature = 0.4 }) {
  const apiKey = process.env.CLAUDE_API_KEY;
  if (!apiKey) throw new Error("Missing CLAUDE_API_KEY.");

  const response = await axios.post(
    "https://api.anthropic.com/v1/messages",
    {
      model,
      max_tokens: 1200,
      temperature,
      system,
      messages: [{ role: "user", content: prompt }],
    },
    {
      timeout: LLM_TIMEOUT_MS,
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
    }
  );

  return (
    response.data?.content
      ?.filter((c) => c.type === "text")
      .map((c) => c.text)
      .join("\n")
      .trim() || ""
  );
}

async function callDeepSeek({ system, prompt, model = DEEPSEEK_MODEL, temperature = 0.4 }) {
  const apiKey = process.env.DEEPSEEK_API_KEY || process.env.DEEPSEARCH_API_KEY;
  if (!apiKey) throw new Error("Missing DEEPSEEK_API_KEY/DEEPSEARCH_API_KEY.");

  const response = await axios.post(
    "https://api.deepseek.com/chat/completions",
    {
      model,
      temperature,
      messages: [
        { role: "system", content: system },
        { role: "user", content: prompt },
      ],
    },
    {
      timeout: LLM_TIMEOUT_MS,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "content-type": "application/json",
      },
    }
  );

  return response.data?.choices?.[0]?.message?.content?.trim() || "";
}

async function callOpenRouter({ system, prompt, model = OPENROUTER_MODEL, temperature = 0.4 }) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error("Missing OPENROUTER_API_KEY.");

  const response = await axios.post(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      model,
      temperature,
      messages: [
        { role: "system", content: system },
        { role: "user", content: prompt },
      ],
    },
    {
      timeout: LLM_TIMEOUT_MS,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "content-type": "application/json",
      },
    }
  );

  return response.data?.choices?.[0]?.message?.content?.trim() || "";
}

async function callAgentLLM({ provider, model, system, prompt, temperature = 0.4 }) {
  try {
    switch (provider) {
      case "gemini":
        return callGemini({ system, prompt, model, temperature });
      case "claude":
        return callClaude({ system, prompt, model, temperature });
      case "deepseek":
        return callDeepSeek({ system, prompt, model, temperature });
      case "openrouter":
        return callOpenRouter({ system, prompt, model, temperature });
      case "ollama":
      default:
        return callOllama({ system, prompt, model, temperature });
    }
  } catch (_) {
    try {
      return await callOllama({
        system,
        prompt,
        model: process.env.OLLAMA_AGENT_MODEL || process.env.OLLAMA_MODEL || "qwen2.5:latest",
        temperature,
      });
    } catch (_) {
      return "I could not reach the model right now. Please continue and I will respond on the next turn.";
    }
  }
}

async function callOrchestratorLLM({ system, prompt, temperature = 0.4 }) {
  try {
    return await callOllama({
      system,
      prompt,
      model: OLLAMA_ORCHESTRATOR_MODEL,
      temperature,
      timeoutMs: ORCHESTRATOR_TIMEOUT_MS,
    });
  } catch (_) {
    return "{}";
  }
}

export {
  callAgentLLM,
  callOrchestratorLLM,
  callOllama,
  callGemini,
  callClaude,
  callDeepSeek,
  callOpenRouter,
  OLLAMA_ORCHESTRATOR_MODEL,
};
