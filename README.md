# AI Council

An AI-powered debate arena where you assemble a council of personas, pick strategies, and run structured  debate amoung personas or with other opponents. The app blends drafting, live response generation, and post-round analytics to create a tactical, replayable debating experience.

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
