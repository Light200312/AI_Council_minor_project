export async function factCheckClaim(text) {
  try {
    const res = await fetch("http://localhost:3002/mcp/fact-check", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ claim: text }),
    });

    return await res.json();
  } catch (err) {
    console.error("Fact check failed:", err);
    return null;
  }
}
