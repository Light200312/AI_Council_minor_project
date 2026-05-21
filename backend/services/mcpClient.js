export async function verifyClaim(claim) {
  try {
    const res = await fetch("http://localhost:3002/mcp/fact-check", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ claim }),
    });

    return await res.json();
  } catch (err) {
    console.log("MCP ERROR:", err.message);
    return null;
  }
}