import { useState } from "react";
import { Sidebar } from "./components/Sidebar";
import { ControlBar } from "./components/ControlBar";
import { DraftBoard } from "./components/DraftBoard";
import { Arena } from "./components/Arena";
import { DirectorChoice } from "./components/DirectorChoice";
import { LiveAnalytics } from "./components/LiveAnalytics";
import { BiasSlider } from "./components/BiasSlider";
import { CoinToss } from "./components/CoinToss";
import { PersonaEditor } from "./components/PersonaEditor";
import { ModeSelect } from "./components/ModeSelect";
import { TopicSelect } from "./components/TopicSelect";
import { MemberSelect } from "./components/MemberSelect";
import { MentorDashboard } from "./components/MentorDashboard";
import { AGENTS, STRATEGIES, MOCK_HEATMAP } from "./data/mockData";
function App() {
  const [gameState, setGameState] = useState({
    mode: "combat",
    setupPhase: "modeSelect",
    phase: "draft",
    currentRound: 1,
    totalRounds: 5,
    playerTeam: [],
    opponentTeam: [],
    playerScore: 0,
    opponentScore: 0,
    biasLevel: 50,
    topic: ""
  });
  const [activeTab, setActiveTab] = useState("arena");
  const [isPersonaEditorOpen, setIsPersonaEditorOpen] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [activeSpeakerId, setActiveSpeakerId] = useState();
  const handleModeSelect = (mode) => {
    setGameState((prev) => ({
      ...prev,
      mode,
      setupPhase: "topicSelect"
    }));
  };
  const handleTopicSelect = (topic, temperature) => {
    setGameState((prev) => ({
      ...prev,
      topic,
      temperature,
      setupPhase: "memberSelect"
    }));
  };
  const handleMemberToggle = (agentId) => {
    if (gameState.playerTeam.find((a) => a.id === agentId)) {
      setGameState((prev) => ({
        ...prev,
        playerTeam: prev.playerTeam.filter((a) => a.id !== agentId)
      }));
    } else if (gameState.playerTeam.length < 3) {
      const agent = AGENTS.find((a) => a.id === agentId);
      if (agent) {
        setGameState((prev) => ({
          ...prev,
          playerTeam: [...prev.playerTeam, agent]
        }));
      }
    }
  };
  const handleSetupComplete = () => {
    if (gameState.mode === "combat") {
      const remainingAgents = AGENTS.filter(
        (a) => !gameState.playerTeam.includes(a)
      );
      const opponentTeam = remainingAgents.slice(0, 3);
      setGameState((prev) => ({
        ...prev,
        opponentTeam,
        setupPhase: "ready",
        phase: "coinToss"
        // Skip draft board since we did member select
      }));
    } else {
      setGameState((prev) => ({
        ...prev,
        setupPhase: "ready"
      }));
    }
  };
  const handleDraftAgent = (agentId) => {
    handleMemberToggle(agentId);
  };
  const confirmDraft = () => {
    const remainingAgents = AGENTS.filter(
      (a) => !gameState.playerTeam.includes(a)
    );
    const opponentTeam = remainingAgents.slice(0, 3);
    setGameState((prev) => ({
      ...prev,
      opponentTeam,
      phase: "coinToss"
    }));
  };
  const handleCoinTossComplete = (winner) => {
    setGameState((prev) => ({
      ...prev,
      phase: "combat"
    }));
    simulateTurn(
      winner === "player" ? gameState.playerTeam[0].id : gameState.opponentTeam[0].id
    );
  };
  const simulateTurn = (speakerId) => {
    setActiveSpeakerId(speakerId);
    setIsSpeaking(true);
    setTimeout(() => {
      setIsSpeaking(false);
      setActiveSpeakerId(void 0);
    }, 3e3);
  };
  const handleStrategySelect = (option) => {
    const speaker = gameState.playerTeam[gameState.currentRound % gameState.playerTeam.length];
    simulateTurn(speaker.id);
    setGameState((prev) => ({
      ...prev,
      playerScore: prev.playerScore + 10 + Math.floor(Math.random() * 5),
      currentRound: Math.min(prev.currentRound + 1, prev.totalRounds)
    }));
  };
  if (gameState.setupPhase === "modeSelect") {
    return <ModeSelect onSelectMode={handleModeSelect} />;
  }
  if (gameState.setupPhase === "topicSelect") {
    return <TopicSelect
      onSelectTopic={handleTopicSelect}
      onBack={() => setGameState((prev) => ({
        ...prev,
        setupPhase: "modeSelect"
      }))}
    />;
  }
  if (gameState.setupPhase === "memberSelect") {
    return <MemberSelect
      availableAgents={AGENTS}
      selectedAgents={gameState.playerTeam.map((a) => a.id)}
      onToggleAgent={handleMemberToggle}
      onConfirm={handleSetupComplete}
      onBack={() => setGameState((prev) => ({
        ...prev,
        setupPhase: "topicSelect"
      }))}
    />;
  }
  return <div className="flex h-screen w-full bg-[#f5f5f7] text-[#1f2933] font-sans overflow-hidden">
      <Sidebar
    activeTab={activeTab}
    onTabChange={setActiveTab}
    currentMode={gameState.mode}
    currentTopic={gameState.topic}
    currentMembers={gameState.playerTeam}
    currentTemperature={gameState.temperature}
    onNewSession={() => setGameState({
      mode: "combat",
      setupPhase: "modeSelect",
      phase: "draft",
      currentRound: 1,
      totalRounds: 5,
      playerTeam: [],
      opponentTeam: [],
      playerScore: 0,
      opponentScore: 0,
      biasLevel: 50,
      topic: ""
    })}
  />


      <div className="flex-1 ml-64 flex flex-col h-full overflow-hidden">
        <ControlBar />

        <main className="flex-1 overflow-y-auto p-6">
          {gameState.mode === "mentor" || gameState.mode === "historical" ? <MentorDashboard
    topic={gameState.topic}
    members={gameState.playerTeam}
  /> : (
    // Combat Mode Logic
    <>
              {gameState.phase === "draft" ? <DraftBoard
      availableAgents={AGENTS}
      selectedAgents={gameState.playerTeam.map((a) => a.id)}
      onSelectAgent={handleDraftAgent}
      onConfirmDraft={confirmDraft}
    /> : <div className="grid grid-cols-12 gap-6 h-full">
                  <div className="col-span-9 flex flex-col gap-6">
                    <Arena
      playerTeam={gameState.playerTeam}
      opponentTeam={gameState.opponentTeam}
      currentRound={{
        roundNumber: gameState.currentRound,
        topic: gameState.topic,
        transcript: []
      }}
      isSpeaking={isSpeaking}
      activeSpeakerId={activeSpeakerId}
    />


                    <DirectorChoice
      options={STRATEGIES}
      onSelect={handleStrategySelect}
      isLoading={isSpeaking}
    />

                  </div>

                  <div className="col-span-3 space-y-6">
                    <BiasSlider
      value={gameState.biasLevel}
      onChange={(val) => setGameState((prev) => ({
        ...prev,
        biasLevel: val
      }))}
    />

                    <LiveAnalytics
      heatmapData={MOCK_HEATMAP}
      playerScore={gameState.playerScore}
      opponentScore={gameState.opponentScore}
    />

                  </div>
                </div>}
            </>
  )}
        </main>
      </div>

      {
    /* Overlays */
  }
      {gameState.phase === "coinToss" && gameState.mode === "combat" && <CoinToss onComplete={handleCoinTossComplete} />}

      <PersonaEditor
    isOpen={isPersonaEditorOpen}
    onClose={() => setIsPersonaEditorOpen(false)}
    onSave={(agent) => console.log("New agent:", agent)}
  />

    </div>;
}
export default App;
