const AGENT_MODEL_MAP = {
  "1": { provider: "gemini", model: process.env.GEMINI_MODEL || "gemini-1.5-flash" },
  "2": { provider: "deepseek", model: process.env.DEEPSEEK_MODEL || "deepseek-chat" },
  "3": { provider: "claude", model: process.env.CLAUDE_MODEL || "claude-3-5-sonnet-latest" },
  "4": { provider: "ollama", model: process.env.OLLAMA_AGENT_MODEL || process.env.OLLAMA_MODEL || "qwen2.5:latest" },
  "5": { provider: "gemini", model: process.env.GEMINI_MODEL || "gemini-1.5-flash" },
  "6": { provider: "deepseek", model: process.env.DEEPSEEK_MODEL || "deepseek-chat" },
  "7": { provider: "claude", model: process.env.CLAUDE_MODEL || "claude-3-5-sonnet-latest" },
  "8": { provider: "ollama", model: process.env.OLLAMA_AGENT_MODEL || process.env.OLLAMA_MODEL || "qwen2.5:latest" },
};

function getPreferredApiConfig() {
  if (process.env.OPENROUTER_API_KEY) {
    return {
      provider: "openrouter",
      model: process.env.OPENROUTER_MODEL || "google/gemini-2.0-flash-001",
    };
  }

  return {
    provider: "ollama",
    model: process.env.OLLAMA_AGENT_MODEL || process.env.OLLAMA_MODEL || "qwen2.5:latest",
  };
}

function getAgentModelConfig(agentId) {
  return AGENT_MODEL_MAP[String(agentId)] || getPreferredApiConfig();
}

function resolveAgentModelConfig(agentId, apiRoutingMode = "persona") {
  if (apiRoutingMode === "ollama_only") {
    return {
      provider: "ollama",
      model: process.env.OLLAMA_AGENT_MODEL || process.env.OLLAMA_MODEL || "qwen2.5:latest",
    };
  }
  if (apiRoutingMode === "openrouter_only") {
    return {
      provider: "openrouter",
      model: process.env.OPENROUTER_MODEL || "google/gemini-2.0-flash-001",
    };
  }
  if (process.env.OPENROUTER_API_KEY) {
    return {
      provider: "openrouter",
      model: process.env.OPENROUTER_MODEL || "google/gemini-2.0-flash-001",
    };
  }
  return getAgentModelConfig(agentId);
}

export { AGENT_MODEL_MAP, getAgentModelConfig, resolveAgentModelConfig };
