export async function factCheckClaim(text) {
  try {
    const res = await fetch("http://localhost:3002/mcp/fact-check", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ claim: text }),
    });

    const data = await res.json();
    if (!res.ok) {
      return {
        verdict: "ERROR",
        confidence: 0,
        explanation: data?.message || data?.error || "Fact check request failed.",
        sources: [],
      };
    }

    return data;
  } catch (err) {
    console.error("Fact check failed:", err);
    return {
      verdict: "ERROR",
      confidence: 0,
      explanation: err instanceof Error ? err.message : "Could not reach the fact-check server.",
      sources: [],
    };
  }
}
