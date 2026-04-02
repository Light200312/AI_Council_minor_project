# AI Council

An AI-powered debate arena where you assemble a council of personas, pick strategies, and run structured  debate amoung personas or with other opponents. The app blends drafting, live response generation, and post-round analytics to create a tactical, replayable debating experience.

**Architecture Visualization**
- The repo includes a root-level Dependency Cruiser setup for visualizing module relationships across `frontend/src` and `backend`.
- Run `npm install` at the repo root once to install the tooling.
- Run `npm run depcruise:validate` to check architecture rules.
- Run `npm run depcruise:html` to generate `dependency-report.html`, a browsable dependency report.
- Run `npm run depcruise:json` to generate `dependency-graph.json` for custom analysis or tooling.
- Run `npm run depcruise:dot` to generate `dependency-graph.dot` if you want to render the graph with Graphviz.

Starter rules currently enforced in [`.dependency-cruiser.cjs`](/home/roshan-singh/All_Code/projects/AICouncil_frontend/.dependency-cruiser.cjs):
- `frontend/src` cannot import from `backend`
- `backend/routes` cannot import directly from `backend/DB`
- `backend/models` cannot import from `backend/routes`
- circular dependencies are flagged as warnings

**Features**
- User registration, login, and profile lookup with token-based auth
- Persistent client session state (Zustand + local persistence)
- Multi-step setup flow for mode, topic, and roster selection
- Multiple modes including combat and mentor-style orchestration
- Persona/agent management: list, create, update, delete
- AI-powered agent suggestions from a topic and agent drafts from a name
- Draft-style team selection with opponent team auto-selection
- Coin toss to decide first turn in combat
- Strategy selection with preview generation and tweakable drafts
- Turn-based combat loop with opponent speaker selection and strategy choice
- AI judge for each round with scores, winner, reasoning, and probabilities
- Combat log pairing and round-by-round transcript display
- Final results screen with per-round verdicts and total score
- Discussion history loading, grouping by session and topic, with replay
- Mentor/orchestrator mode that chooses the next speaker and guides user responses
- Conversation memory summarization (minimal/rich) with topic memory storage
- Bias control slider and live analytics panels
- Pluggable LLM providers with fallback routing

**Objectives**
- Build a multi-agent debate sandbox where different personas can argue, mentor, critique, and adapt over time.
- Make debates feel tactical rather than one-shot by combining drafting, turn order, strategy selection, judging, and replayable transcripts.
- Keep each agent distinct by grounding responses in explicit persona fields such as role, traits, lore, speech style, and domain.
- Support both competitive and coaching-style experiences: combat mode for scored debates, mentor mode for guided discussion.
- Preserve useful context across turns with lightweight memory so agents can stay consistent without sending the full transcript every time.
- Keep the LLM layer flexible so the app can run with provider-specific routing, a single provider, or local-first setups.

**Orchestration**

The app supports two orchestration styles in mentor-style sessions: `fast` and `dynamic`. Both are triggered from the frontend store by `sendMentorMessage`, which sends the current topic, selected council members, prior messages, API routing mode, orchestrator mode, and memory mode to `POST /api/orchestrator/run`. The backend then runs `orchestrateTask` in [`backend/services/orchestrator.js`](/home/roshan-singh/All_Code/projects/AICouncil_frontend/backend/services/orchestrator.js).

In both modes, the orchestrator follows the same high-level lifecycle:
1. Load the selected candidate agents from the database.
2. Resolve conversation scope using `taskGoal`, `topic`, `sessionId`, and recent messages.
3. Insert an opening orchestrator message if the session is just starting.
4. Choose the next speaking agent.
5. Run exactly one agent turn through the agent runtime.
6. Queue the next likely speaker and hand control back to the user with a follow-up prompt.

`Fast` mode is optimized for low latency and predictability:
- It does not ask an LLM to choose the next speaker.
- It uses simple rotation with `pickNextByRotation`, based on who spoke last.
- The orchestrator still adds a coordination message, but the turn selection itself is deterministic.
- After the selected agent speaks, the next speaker is again chosen by rotation.
- This is useful when you want steady pacing, low cost, and minimal orchestration overhead.

`Dynamic` mode is optimized for relevance and balance:
- It builds candidate participation profiles from recent session history.
- Each candidate profile includes role, domain, specialization, number of turns already taken, and how long it has been since they last spoke.
- The orchestrator LLM receives:
  - the topic,
  - eligible candidates,
  - all candidates,
  - recent conversation,
  - last speaker id,
  - recent speaker ids,
  - fairness rules.
- The LLM returns strict JSON with the next `agentId` and a short reason.
- The backend validates that choice and can override it if:
  - the selected speaker is invalid,
  - the speaker would immediately repeat unnecessarily,
  - the choice violates fairness by overusing a speaker compared to underused alternatives.
- If the LLM selection fails or looks unfair, the backend falls back to a fairness-aware rotation strategy.

The fairness system is important in `dynamic` mode:
- `buildParticipationStats` counts how many turns each agent has taken and when they last spoke.
- `getSoftEligibleCandidates` prefers agents who have not spoken yet, or agents with fewer turns when usage becomes uneven.
- `shouldOverrideForFairness` prevents the orchestrator from repeatedly choosing a popular agent when another candidate is underused by two or more turns.
- This means `dynamic` mode is not just “pick the smartest agent.” It tries to keep the discussion coherent and still distribute speaking time across the council.

After speaker selection, both modes call `runAgentStep` from [`backend/services/agentRuntime.js`](/home/roshan-singh/All_Code/projects/AICouncil_frontend/backend/services/agentRuntime.js). The orchestrator gives the agent a focused coaching instruction:
- teach the user directly,
- evaluate the user's last point,
- correct mistakes,
- praise valid reasoning,
- give one concrete improvement step,
- stay concise.

The result returned to the frontend includes:
- updated messages,
- a trace entry describing which agent was selected and why,
- a clarifying question for the user,
- a suggestion for how to respond next,
- a termination note explaining that one orchestrated turn has completed.

**Memory In Orchestration**

Orchestration also depends on memory mode from [`backend/services/memoryService.js`](/home/roshan-singh/All_Code/projects/AICouncil_frontend/backend/services/memoryService.js):

`Minimal` memory:
- Summarizes older non-orchestrator messages into a compact topic summary.
- Focuses on durable facts, decisions, and unresolved points.
- Keeps prompt size small while preserving continuity.

`Rich` memory:
- Stores a summary plus explicit `keyFacts` and `openQuestions`.
- Retrieval is triggered especially when the user refers back to earlier parts of the conversation with phrases like “earlier,” “remember,” or “as we said.”
- This gives the agent more structured recall when a discussion becomes long or layered.

The active prompt context is a combination of:
- retrieved topic memory, and
- the most recent message window.

That design keeps costs controlled while still giving the orchestrator and speaking agents enough continuity to feel coherent.

**Agent Persona Model**

The agent model lives in [`backend/models/agent.js`](/home/roshan-singh/All_Code/projects/AICouncil_frontend/backend/models/agent.js) and is central to both orchestration and response generation. An agent is not just a display card. Its fields become structured prompt ingredients, routing hints, and gameplay metadata.

How persona fields affect LLM behavior:

`id`
- Primary stable identifier for the agent.
- Used for selection, turn tracking, session messages, and model routing.
- In persona routing mode, the `id` can map to a preferred provider/model in [`backend/services/agentModelRegistry.js`](/home/roshan-singh/All_Code/projects/AICouncil_frontend/backend/services/agentModelRegistry.js).

`name`
- Used in the system prompt as the speaking identity.
- Helps the model maintain first-person consistency and role continuity.

`role`
- Frames the expert lens the agent should use.
- Strongly shapes what kinds of arguments the model prioritizes: legal, philosophical, technical, political, tactical, and so on.
- Also appears in orchestrator candidate profiles when deciding who should speak next.

`era`
- Adds historical grounding and helps style the agent’s perspective.
- Useful for distinguishing modern reasoning from ancient, classical, or fictional framing.

`stats.logic`, `stats.rhetoric`, `stats.bias`
- These are mainly game and selection metadata rather than direct prompt text in the current runtime.
- They influence combat balancing and heuristic fallback behavior such as opponent team selection.
- For example, `scoreCandidate` uses logic and rhetoric when fallback opponent selection is needed.

`description`
- This is one of the most important prompt fields.
- In `runAgentStep`, it becomes part of the system prompt under “Persona and reasoning method.”
- It tells the LLM how this agent thinks, what style of analysis to use, and what the agent is generally good at.

`personalityTraits`
- Adds behavioral texture on top of the formal role.
- Helps the model choose tone, intensity, patience, aggressiveness, curiosity, empathy, and argument style.
- Also helps the orchestrator summarize a candidate’s specialization if no better field is available.

`backstoryLore`
- Gives the model durable character grounding, especially for historical and fantasy personas.
- This reduces flat, generic outputs by anchoring the agent in biography, worldview, and lived experience.

`speechStyle`
- Directly shapes sentence rhythm, verbosity, framing, and wording choices.
- This is especially helpful for making multiple agents sound distinct even when they share the same topic.

`domain`
- Used by the orchestrator when deciding relevance.
- Helps the selection policy match the current discussion to the most appropriate expert lens.

`specialAbility`
- Used more as a short specialization hook than a literal power.
- In dynamic orchestration, the candidate profile uses `specialAbility` first when summarizing what an agent brings to the table.
- This makes it easier for the orchestrator to choose speakers based on a compact strength description.

`isFantasy`, `sourceTitle`, `sourceType`, `genre`
- These fields matter for fictional characters.
- In `runAgentStep`, fantasy characters receive an extra source line in the system prompt so responses stay closer to the original work and setting.

`avatarInitials`, `imageUrl`
- Mostly UI metadata, but still important for a readable multi-agent conversation surface.

`createdBy`, `createdFrom`, `sourceTopic`, `sourceNameQuery`, `tags`
- Provenance and management metadata.
- These fields matter less for runtime prompting, but help track how an agent was generated and why it exists.

When an agent actually responds, `runAgentStep` assembles a prompt in two layers:

System prompt:
- identity: “You are {name}, role: {role}”
- persona and reasoning method
- personality traits
- backstory/lore
- speech style
- optional source information for fantasy characters
- instruction to stay within persona and constraints

User prompt:
- task goal
- summarized context from memory + recent conversation
- output constraints for the current situation

That separation is important:
- the system prompt defines who the agent is,
- the user prompt defines what the agent should do right now.

**API Routing And Persona Handling**

The app has three routing modes exposed in the UI and stored in Zustand:
- `persona`
- `ollama_only`
- `openrouter_only`

How they work:

`persona`
- Intended to allow per-agent model preferences.
- `resolveAgentModelConfig(agentId, "persona")` checks if a specific model is mapped for that agent id.
- If no direct mapping applies, it falls back to a preferred provider.
- In the current implementation, if `OPENROUTER_API_KEY` exists, the resolver prefers OpenRouter globally before falling back to the agent-specific map. So persona-specific mapping is strongest when OpenRouter is not taking precedence.

`ollama_only`
- Forces all agent generations to use the configured Ollama model.
- Useful for local/offline or low-cost operation.

`openrouter_only`
- Forces all agent generations to use the configured OpenRouter model.
- Useful when you want consistency across all personas or want to use a single hosted model.

So persona handling has two layers:
- persona content: the fields that shape the prompt and make the agent sound/think differently,
- persona routing: the model-selection policy that can decide which backend model serves that agent.

**Verdict Feature**

The verdict system has two levels: round verdicts and final debate verdicts.

Round verdicts:
- In combat mode, the user drafts a response and sends it.
- The opponent then responds.
- Once both sides have spoken for the round, the frontend calls `combatJudgeRound`.
- That hits `POST /api/combat/judge-round`, which runs `judgeRound` in [`backend/services/combat.js`](/home/roshan-singh/All_Code/projects/AICouncil_frontend/backend/services/combat.js).

`judgeRound` works like this:
1. It sends the topic, player argument, and opponent argument to the judge LLM.
2. The judge must return strict JSON:
   - winner,
   - playerScore,
   - opponentScore,
   - confidence,
   - probability split,
   - short reasoning.
3. The backend clamps numeric fields into valid ranges so malformed model outputs do not break the app.
4. If parsing fails, it falls back to a simple heuristic based on argument length.

The frontend then:
- updates cumulative player and opponent scores,
- stores the round result in `roundResults`,
- shows reasoning and probabilities in the results UI.

Final verdicts:
- When the user clicks `Export Verdict` in combat mode, the frontend calls `combatFinalizeVerdict`.
- That sends:
  - topic,
  - player team,
  - opponent team,
  - full combat log,
  - all round results,
  - aggregate scores.

`finalizeDebateVerdict` then:
1. Recomputes aggregate totals from round results and provided scores.
2. Builds a judge prompt containing:
   - topic,
   - both council rosters,
   - aggregate score so far,
   - summarized round results,
   - full debate transcript.
3. Instructs the chief judge LLM to evaluate the entire debate, not just score totals.
4. Requires strict JSON with:
   - overall winner,
   - confidence,
   - final score,
   - summary,
   - key moments,
   - strengths and weaknesses for both sides,
   - final reasoning.
5. Validates and normalizes the returned structure.
6. Falls back to aggregate round totals if JSON parsing fails or the model output is unusable.

Why this two-stage design matters:
- Round verdicts provide immediate tactical feedback after each exchange.
- The final verdict considers the debate as a whole: consistency, adaptation, rebuttals, and momentum across rounds.
- This prevents the final decision from being only a naive sum of prior scores.

On the frontend, the export flow in [`frontend/src/App.jsx`](/home/roshan-singh/All_Code/projects/AICouncil_frontend/frontend/src/App.jsx):
- requests the final verdict,
- builds PDF sections including summary, reasoning, key moments, strengths, weaknesses, round verdicts, and transcript highlights,
- downloads the report using the PDF helper in [`frontend/src/lib/pdf.js`](/home/roshan-singh/All_Code/projects/AICouncil_frontend/frontend/src/lib/pdf.js).

In mentor-style modes, the separate conclude-debate flow generates a discussion report PDF from the transcript, highlighting main arguments, counter-arguments, and concluding statements. That feature is different from the combat verdict system: it is a report-generation flow, not a competitive judge score.

**Tech Stack**
- Frontend: React, Vite, Tailwind CSS, Zustand
- Backend: Node.js, Express, MongoDB (Mongoose)
- LLM orchestration: pluggable providers via API keys

**Project Structure**
```
AI Council
|-- backend
|   |-- controllers        # Request handlers
|   |-- routes             # API route groups
|   |-- models             # Mongoose schemas
|   |-- services           # LLM orchestration, seeding, utilities
|   |-- DB                 # Database config
|   `-- server.js          # API entry point
|-- frontend
|   |-- public
|   |-- src
|   |   |-- components      # UI building blocks
|   |   |-- data            # Mock data and constants
|   |   |-- store           # Zustand state
|   |   |-- lib             # Helpers and utilities
|   |   |-- App.jsx         # Main app shell
|   |   `-- main.jsx        # React entry point
|   `-- index.html
`-- README.md
```

**Getting Started**
1. Install dependencies

```
cd backend
npm install
cd ../frontend
npm install
```

2. Configure backend environment variables (create `backend/.env`)

```
PORT=3000
MONGO_URI=mongodb://localhost:27017/ai-council
FRONTEND_ORIGIN=http://localhost:5173
```

Optional LLM provider keys:

```
OPENROUTER_API_KEY=...
GEMINI_API_KEY=...
CLAUDE_API_KEY=...
DEEPSEEK_API_KEY=...
OLLAMA_API_KEY=http://localhost:11434
```

3. Start the backend

```
cd backend
npm start
```

4. Start the frontend

```
cd frontend
npm run dev
```

The frontend runs on `http://localhost:5173` and the backend API on `http://localhost:3000`.

**Inspirations**
- Competitive debate formats and adjudication
- Sports-style drafting and team composition
- Role-playing personas with distinct rhetorical styles
- Director''s cut editing workflows for creative drafting
