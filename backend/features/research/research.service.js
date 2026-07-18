function normalizeTopic(topic) {
  return String(topic || "").trim();
}

export async function performResearch(topic, options = {}) {
  const safeTopic = normalizeTopic(topic);
  if (!safeTopic) {
    throw new Error("topic is required.");
  }

  const generatedAt = new Date().toISOString();
const cached = false;

  // TODO: execute tools for gathering research data.
  // TODO: aggregate sources from tool outputs and other inputs.
  // TODO: deduplicate overlapping or repeated sources.
  // TODO: summarize the aggregated research into a concise answer.
  // TODO: add caching so repeated topics can reuse prior results.

  return {
    topic: safeTopic,
    generatedAt,
    sources: [],
    summary: "",
    metadata: {
      toolCalls: 0,
      cached: false,
    },
  };
}
