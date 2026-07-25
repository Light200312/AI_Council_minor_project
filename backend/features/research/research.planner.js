import { callOrchestratorLLM } from "../../shared/llmClient.js";
import { extractFirstJsonObject } from "../../shared/helpers.js";
import { buildToolCatalogText, getPreferredToolsForMode } from "../../tools/tools.js";

const MAX_TOOL_CALLS = 3;

function normalizeToolCall(toolCall = {}) {
  return {
    toolName: String(toolCall?.toolName || toolCall?.tool || "").trim(),
    args:
      toolCall?.args && typeof toolCall.args === "object"
        ? toolCall.args
        : toolCall?.arguments && typeof toolCall.arguments === "object"
        ? toolCall.arguments
        : {},
  };
}

function normalizeToolCalls(toolCalls = [], discussionMode = "") {
  const allowedToolNames = new Set(getPreferredToolsForMode(discussionMode));

  return (Array.isArray(toolCalls) ? toolCalls : [])
    .slice(0, MAX_TOOL_CALLS)
    .map(normalizeToolCall)
    .filter((toolCall) => toolCall.toolName && allowedToolNames.has(toolCall.toolName));
}

export async function planResearchToolCalls({ topic, discussionMode = "" } = {}) {
  const safeTopic = String(topic || "").trim();
  const safeDiscussionMode = String(discussionMode || "").trim();

  if (!safeTopic) {
    return { needsTools: false, reason: "No research topic was provided.", toolCalls: [] };
  }

  const toolCatalog = buildToolCatalogText({ discussionMode: safeDiscussionMode });
  const system = "You are a research planning assistant. Plan only necessary factual research tool calls.";
  const prompt = `Research topic:
${safeTopic}

Discussion mode:
${safeDiscussionMode || "general"}

Available tools:
${toolCatalog}

Rules:
- Use tools when current, factual, legal, medical, scientific, economic, geopolitical, or source-verification research would improve the result.
- Do not use tools for purely creative, subjective, or opinion-only topics.
- Select at most ${MAX_TOOL_CALLS} tools and provide complete arguments for each selected tool.
- Return strict JSON only in this shape:
{"needsTools":true,"reason":"short reason","toolCalls":[{"tool":"tool_name","arguments":{"query":"..."}}]}
- If no tools are required, return:
{"needsTools":false,"reason":"short reason","toolCalls":[]}`;

  try {
    const raw = await callOrchestratorLLM({ system, prompt, temperature: 0.1 });
    const json = extractFirstJsonObject(raw);
    if (!json) {
      return { needsTools: false, reason: "Research planner returned no JSON.", toolCalls: [] };
    }

    const parsed = JSON.parse(json);
    const toolCalls = normalizeToolCalls(parsed?.toolCalls, safeDiscussionMode);

    return {
      needsTools: Boolean(parsed?.needsTools) && toolCalls.length > 0,
      reason: String(parsed?.reason || "").trim(),
      toolCalls,
    };
  } catch (error) {
    return {
      needsTools: false,
      reason: `Research planner unavailable: ${error.message}`,
      toolCalls: [],
    };
  }
}

export { normalizeToolCalls };
