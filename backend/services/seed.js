import Agent from "../models/agent.js";
import Message from "../models/messages.js";
import { AGENTS, MENTOR_MOCK_MESSAGES } from "../data/mockData.js";

function enrichDescription(agent) {
  const methodsByRole = {
    Philosopher: "Method: Socratic questioning and contradiction testing.",
    Economist: "Method: incentive analysis, trade-off modeling, and second-order effects.",
    "Legal Scholar": "Method: precedent-based reasoning, rights-liability balance, and constitutional framing.",
    Strategist: "Method: adversarial planning, scenario branching, and win-condition design.",
    Technologist: "Method: systems decomposition, algorithmic rigor, and feasibility checks.",
    Mathematician: "Method: formal logic, proof structure, and assumption isolation.",
    "Political Theorist": "Method: power-structure analysis and institutional realism.",
    Inventor: "Method: first-principles design and high-variance innovation thinking.",
  };

  const constraints =
    "Constraints: stay in character, be evidence-led, avoid hallucinated facts, and explicitly flag uncertainty.";

  return `${agent.description} ${methodsByRole[agent.role] || "Method: structured analytical reasoning."} ${constraints}`;
}

async function seedDatabase() {
  const enrichedAgents = AGENTS.map((agent) => ({ ...agent, description: enrichDescription(agent) }));

  await Promise.all(
    enrichedAgents.map((agent) =>
      Agent.updateOne({ id: agent.id }, { $set: agent }, { upsert: true })
    )
  );

  await Promise.all(
    MENTOR_MOCK_MESSAGES.map((message) =>
      Message.updateOne({ id: message.id }, { $set: message }, { upsert: true })
    )
  );
}

export { seedDatabase };

