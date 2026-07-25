import { executeToolCall, getPreferredToolsForMode, listToolDefinitions } from "../../tools/tools.js";
import { planResearchToolCalls } from "./research.planner.js";

function normalizeTopic(topic) {
  return String(topic || "").trim();
}

function normalizeToolResult(result) {
  return {
    toolName: String(result?.toolName || "").trim(),
    args: result?.args && typeof result.args === "object" ? result.args : {},
    ok: Boolean(result?.ok),
    text: String(result?.text || "").trim(),
    durationMs: Number(result?.durationMs || 0),
  };
}

function extractSourcesFromText(text) {
  const rawLines = String(text || "").split(/\r?\n+/);
  return rawLines
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const urlMatch = line.match(/https?:\/\/\S+/i);
      return {
        title: line.length > 180 ? `${line.slice(0, 177)}...` : line,
        url: urlMatch ? urlMatch[0] : "",
        raw: line,
      };
    });
}

function dedupeSources(sources = []) {
  const seen = new Set();
  return sources.filter((source) => {
    const key = `${String(source.title || "").toLowerCase()}|${String(source.url || "").toLowerCase()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function normalizeProvidedToolCall(toolCall) {
  return {
    toolName: String(toolCall?.toolName || "").trim(),
    args: toolCall?.args && typeof toolCall.args === "object" ? toolCall.args : null,
  };
}

function skippedTool(toolName, args, message) {
  return {
    toolName,
    args: args ?? {},
    ok: false,
    text: message,
    durationMs: 0,
  };
}

export async function performResearch({ topic, discussionMode = "", toolCalls = [] } = {}) {
  const safeTopic = normalizeTopic(topic);
  if (!safeTopic) {
    throw new Error("topic is required.");
  }

  const safeDiscussionMode = String(discussionMode || "").trim();
  const safeToolCalls = Array.isArray(toolCalls) ? toolCalls : [];
  const generatedAt = new Date().toISOString();
  const cached = false;
  const allowedToolNames = new Set(listToolDefinitions().map((tool) => tool.name));
  const preferredToolNames = getPreferredToolsForMode(safeDiscussionMode);
  const preferredToolSet = new Set(preferredToolNames);
  const hasCallerToolCalls = safeToolCalls.length > 0;
  const plannerResult = hasCallerToolCalls
    ? {
        needsTools: false,
        reason: "Using caller-provided tool calls.",
        toolCalls: safeToolCalls.map(normalizeProvidedToolCall),
      }
    : await planResearchToolCalls({ topic: safeTopic, discussionMode: safeDiscussionMode });
  const incomingToolCalls = plannerResult.toolCalls;

  // Reuse the shared registry and executor so research stays aligned with the rest of the backend.
  // This keeps tool behavior centralized and avoids duplicating tool logic here.
  const executedToolCalls = [];
  const collectedSources = [];

  for (const toolCall of incomingToolCalls) {
    if (!toolCall.toolName || !allowedToolNames.has(toolCall.toolName)) {
      executedToolCalls.push(
        skippedTool(
          toolCall.toolName || "unknown tool",
          toolCall.args,
          `Unknown tool: ${toolCall.toolName || "unknown tool"}`
        )
      );
      continue;
    }

    if (!preferredToolSet.has(toolCall.toolName)) {
      executedToolCalls.push(
        skippedTool(
          toolCall.toolName,
          toolCall.args,
          "Tool skipped because it is not allowed for this discussion mode."
        )
      );
      continue;

    }

    if (!toolCall.args) {
      executedToolCalls.push(
        skippedTool(
          toolCall.toolName,
          toolCall.args,
          "Tool skipped because required arguments were not provided."
        )
      );
      continue;

    }

    try {
      const result = await executeToolCall({ toolName: toolCall.toolName, args: toolCall.args });
      const normalizedResult = normalizeToolResult(result);
      executedToolCalls.push(normalizedResult);

      if (normalizedResult.ok && normalizedResult.text) {
        // TODO: aggregate richer structured source metadata when tools expose it.
        collectedSources.push(...extractSourcesFromText(normalizedResult.text).map((source) => ({
          ...source,
          toolName: normalizedResult.toolName,
        })));
      }
    } catch (error) {
      executedToolCalls.push({
        toolName: toolCall.toolName,
        args: toolCall.args,
        ok: false,
        text: String(error?.message || "Tool execution failed."),
        durationMs: 0,
      });
    }
  }

  const sources = dedupeSources(
    collectedSources.map((source) => ({
      title: String(source.title || "").trim(),
      url: String(source.url || "").trim(),
      raw: String(source.raw || "").trim(),
      toolName: String(source.toolName || "").trim(),
    }))
  );

  // TODO: summarize the aggregated research into a concise answer.
  // TODO: add caching so repeated topics can reuse prior results.

  return {
    topic: safeTopic,
    generatedAt,
    sources,
    summary: "",
    metadata: {
      toolCalls: executedToolCalls.length,
      cached,
      planner: {
        used: !hasCallerToolCalls,
        needsTools: plannerResult.needsTools,
        reason: plannerResult.reason,
      },
    },
  };
}
