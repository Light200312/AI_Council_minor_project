import { useEffect, useState } from "react";
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
import { DiscussionHistory } from "./components/DiscussionHistory";
import { AuthPage } from "./components/AuthPage";
import { Button } from "./components/ui/Button";
import { STRATEGIES, MOCK_HEATMAP } from "./data/mockData";
import { useAppStore } from "./store/useAppStore";

function App() {
  const token = useAppStore((state) => state.token);
  const agents = useAppStore((state) => state.agents);
  const gameState = useAppStore((state) => state.gameState);
  const authenticate = useAppStore((state) => state.authenticate);
  const signOut = useAppStore((state) => state.signOut);
  const bootstrapSession = useAppStore((state) => state.bootstrapSession);
  const setMode = useAppStore((state) => state.setMode);
  const setTopic = useAppStore((state) => state.setTopic);
  const goToSetupPhase = useAppStore((state) => state.goToSetupPhase);
  const toggleMember = useAppStore((state) => state.toggleMember);
  const completeSetup = useAppStore((state) => state.completeSetup);
  const confirmDraft = useAppStore((state) => state.confirmDraft);
  const resetSession = useAppStore((state) => state.resetSession);
  const loadDiscussionHistory = useAppStore((state) => state.loadDiscussionHistory);
  const openHistoryDiscussion = useAppStore((state) => state.openHistoryDiscussion);
  const discussionHistory = useAppStore((state) => state.discussionHistory);
  const isLoadingHistory = useAppStore((state) => state.isLoadingHistory);
  const setCombatStarted = useAppStore((state) => state.setCombatStarted);
  const applyStrategyRound = useAppStore((state) => state.applyStrategyRound);
  const setBiasLevel = useAppStore((state) => state.setBiasLevel);
  const reloadAgents = useAppStore((state) => state.reloadAgents);

  const [activeTab, setActiveTab] = useState("arena");
  const [isPersonaEditorOpen, setIsPersonaEditorOpen] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [activeSpeakerId, setActiveSpeakerId] = useState();
  const [showSetupHistory, setShowSetupHistory] = useState(false);

  useEffect(() => {
    bootstrapSession();
  }, [bootstrapSession]);

  const simulateTurn = (speakerId) => {
    setActiveSpeakerId(speakerId);
    setIsSpeaking(true);
    setTimeout(() => {
      setIsSpeaking(false);
      setActiveSpeakerId(void 0);
    }, 3000);
  };

  const handleCoinTossComplete = (winner) => {
    setCombatStarted();
    const firstSpeaker =
      winner === "player" ? gameState.playerTeam[0]?.id : gameState.opponentTeam[0]?.id;
    if (firstSpeaker) simulateTurn(firstSpeaker);
  };

  const handleStrategySelect = () => {
    const speaker = gameState.playerTeam[gameState.currentRound % gameState.playerTeam.length];
    if (speaker?.id) simulateTurn(speaker.id);
    applyStrategyRound();
  };

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    if (tabId === "history") {
      loadDiscussionHistory();
    }
  };

  if (!token) {
    return <AuthPage onAuthenticate={authenticate} />;
  }

  if (gameState.setupPhase === "modeSelect") {
    if (showSetupHistory) {
      return (
        <div className="min-h-screen bg-[#f5f5f7] p-8">
          <div className="max-w-6xl mx-auto space-y-4">
            <Button variant="secondary" onClick={() => setShowSetupHistory(false)}>
              Back To Mode Selection
            </Button>
            <DiscussionHistory
              discussions={discussionHistory}
              isLoading={isLoadingHistory}
              onOpenDiscussion={(entry) => {
                openHistoryDiscussion(entry);
                setShowSetupHistory(false);
              }}
            />
          </div>
        </div>
      );
    }

    return (
      <>
        <ModeSelect
          onSelectMode={setMode}
          onOpenHistory={() => {
            setShowSetupHistory(true);
            loadDiscussionHistory();
          }}
        />
        <PersonaEditor
          isOpen={isPersonaEditorOpen}
          onClose={() => setIsPersonaEditorOpen(false)}
          onCreated={async (agent) => {
            if (!agent?.id) return;
            await reloadAgents();
            toggleMember(agent.id);
          }}
        />
      </>
    );
  }
  if (gameState.setupPhase === "topicSelect") {
    return (
      <>
        <TopicSelect onSelectTopic={setTopic} onBack={() => goToSetupPhase("modeSelect")} />
        <PersonaEditor
          isOpen={isPersonaEditorOpen}
          onClose={() => setIsPersonaEditorOpen(false)}
          onCreated={async (agent) => {
            if (!agent?.id) return;
            await reloadAgents();
            toggleMember(agent.id);
          }}
        />
      </>
    );
  }
  if (gameState.setupPhase === "memberSelect") {
    return (
      <>
        <MemberSelect
          availableAgents={agents}
          selectedAgents={gameState.playerTeam.map((a) => a.id)}
          onToggleAgent={toggleMember}
          onConfirm={completeSetup}
          onBack={() => goToSetupPhase("topicSelect")}
          onOpenPersonaEditor={() => setIsPersonaEditorOpen(true)}
        />
        <PersonaEditor
          isOpen={isPersonaEditorOpen}
          onClose={() => setIsPersonaEditorOpen(false)}
          onCreated={async (agent) => {
            if (!agent?.id) return;
            await reloadAgents();
            toggleMember(agent.id);
          }}
        />
      </>
    );
  }

  return (
    <div className="flex h-screen w-full bg-[#f5f5f7] text-[#1f2933] font-sans overflow-hidden">
      <Sidebar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        currentMode={gameState.mode}
        currentTopic={gameState.topic}
        currentMembers={gameState.playerTeam}
        currentTemperature={gameState.temperature}
        onNewSession={resetSession}
        onSignOut={signOut}
      />

      <div className="flex-1 ml-64 flex flex-col h-full overflow-hidden">
        <ControlBar />
        <main className="flex-1 overflow-y-auto p-6">
          {activeTab === "history" ? (
            <DiscussionHistory
              discussions={discussionHistory}
              isLoading={isLoadingHistory}
              onOpenDiscussion={(entry) => {
                openHistoryDiscussion(entry);
                setActiveTab("arena");
              }}
            />
          ) : gameState.mode === "mentor" || gameState.mode === "historical" ? (
            <MentorDashboard topic={gameState.topic} members={gameState.playerTeam} />
          ) : (
            <>
              {gameState.phase === "draft" ? (
                <DraftBoard
                  availableAgents={agents}
                  selectedAgents={gameState.playerTeam.map((a) => a.id)}
                  onSelectAgent={toggleMember}
                  onConfirmDraft={confirmDraft}
                />
              ) : (
                <div className="grid grid-cols-12 gap-6 h-full">
                  <div className="col-span-9 flex flex-col gap-6">
                    <Arena
                      playerTeam={gameState.playerTeam}
                      opponentTeam={gameState.opponentTeam}
                      currentRound={{
                        roundNumber: gameState.currentRound,
                        topic: gameState.topic,
                        transcript: [],
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
                    <BiasSlider value={gameState.biasLevel} onChange={setBiasLevel} />
                    <LiveAnalytics
                      heatmapData={MOCK_HEATMAP}
                      playerScore={gameState.playerScore}
                      opponentScore={gameState.opponentScore}
                    />
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {gameState.phase === "coinToss" && gameState.mode === "combat" && (
        <CoinToss onComplete={handleCoinTossComplete} />
      )}

      <PersonaEditor
        isOpen={isPersonaEditorOpen}
        onClose={() => setIsPersonaEditorOpen(false)}
        onCreated={async (agent) => {
          if (!agent?.id) return;
          await reloadAgents();
          toggleMember(agent.id);
        }}
      />
    </div>
  );
}

export default App;
