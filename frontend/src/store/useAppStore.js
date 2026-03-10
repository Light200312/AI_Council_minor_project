import { create } from "zustand";
import { persist } from "zustand/middleware";
import { AGENTS as FALLBACK_AGENTS } from "../data/mockData";
import { api } from "../lib/api";

function createSessionId() {
  return `s-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function initialGameState() {
  return {
    mode: "combat",
    setupPhase: "modeSelect",
    phase: "draft",
    currentRound: 1,
    totalRounds: 5,
    playerTeam: [],
    opponentTeam: [],
    maxMembers: 3,
    playerScore: 0,
    opponentScore: 0,
    biasLevel: 50,
    topic: "",
    temperature: null,
    sessionId: "",
  };
}

const useAppStore = create(
  persist(
    (set, get) => ({
      token: "",
      user: null,
      apiRoutingMode: "persona",
      orchestratorMode: "fast",
      agents: FALLBACK_AGENTS,
      messages: [],
      discussionHistory: [],
      isLoadingHistory: false,
      knowledgeGrowth: 45,
      appreciationLevel: 72,
      isLoadingReply: false,
      followupQuestion: "",
      suggestion: "",
      gameState: initialGameState(),

      bootstrapSession: async () => {
        const token = get().token;
        if (!token) return;
        try {
          const [{ user }, { agents }] = await Promise.all([api.me(token), api.listAgents(token)]);
          set({
            user,
            agents: agents?.length ? agents : FALLBACK_AGENTS,
          });
        } catch (_) {
          get().signOut();
        }
      },

      reloadAgents: async () => {
        const token = get().token;
        if (!token) return;
        try {
          const { agents } = await api.listAgents(token);
          set({ agents: agents?.length ? agents : FALLBACK_AGENTS });
        } catch (_) {
          set({ agents: FALLBACK_AGENTS });
        }
      },

      createAgent: async (payload) => {
        const token = get().token;
        if (!token) throw new Error("Not authenticated.");
        const { agent } = await api.createAgent(payload, token);
        await get().reloadAgents();
        return agent;
      },

      suggestAgents: async ({ topic, maxSuggestions } = {}) => {
        const token = get().token;
        if (!token) throw new Error("Not authenticated.");
        return api.suggestAgents({ topic, maxSuggestions }, token);
      },

      findAgentDraft: async ({ name, topic } = {}) => {
        const token = get().token;
        if (!token) throw new Error("Not authenticated.");
        return api.findAgentDraft({ name, topic }, token);
      },

      authenticate: async (mode, payload) => {
        const response = mode === "register" ? await api.register(payload) : await api.login(payload);
        set({ token: response.token, user: response.user });
      },

      signOut: () =>
        set({
          token: "",
          user: null,
          apiRoutingMode: "persona",
          orchestratorMode: "fast",
          gameState: initialGameState(),
          messages: [],
          discussionHistory: [],
          followupQuestion: "",
          suggestion: "",
        }),

      loadMessages: async () => {
        const token = get().token;
        const { topic, sessionId } = get().gameState;
        if (!token || !topic || !sessionId) {
          set({ messages: [] });
          return;
        }
        try {
          const { messages } = await api.listMessages(token, { topic, sessionId });
          set({ messages: messages || [] });
        } catch (_) {
          set({ messages: [] });
        }
      },

      loadDiscussionHistory: async () => {
        const token = get().token;
        if (!token) {
          set({ discussionHistory: [] });
          return;
        }

        set({ isLoadingHistory: true });
        try {
          const { messages } = await api.listMessages(token);
          const grouped = new Map();

          (messages || []).forEach((msg) => {
            const sessionId = String(msg.sessionId || "");
            const topic = String(msg.topic || "");
            if (!sessionId || !topic) return;

            const key = `${sessionId}::${topic}`;
            const existing = grouped.get(key) || {
              sessionId,
              topic,
              messages: [],
              lastTimestamp: 0,
              totalMessages: 0,
            };

            existing.messages.push(msg);
            existing.totalMessages += 1;
            existing.lastTimestamp = Math.max(existing.lastTimestamp, Number(msg.timestamp || 0));
            grouped.set(key, existing);
          });

          const discussionHistory = Array.from(grouped.values())
            .map((entry) => ({
              ...entry,
              messages: entry.messages.sort((a, b) => Number(a.timestamp || 0) - Number(b.timestamp || 0)),
            }))
            .sort((a, b) => b.lastTimestamp - a.lastTimestamp);

          set({ discussionHistory });
        } catch (_) {
          set({ discussionHistory: [] });
        } finally {
          set({ isLoadingHistory: false });
        }
      },

      openHistoryDiscussion: (entry) =>
        set((state) => ({
          gameState: {
            ...state.gameState,
            mode: "mentor",
            setupPhase: "ready",
            topic: entry.topic,
            sessionId: entry.sessionId,
          },
          messages: entry.messages || [],
          followupQuestion: "",
          suggestion: "",
        })),

      sendMentorMessage: async (text) => {
        const token = get().token;
        const { gameState, messages } = get();
        if (!token || !text.trim() || !gameState.topic || !gameState.sessionId) return;

        const userMessage = {
          sessionId: gameState.sessionId,
          topic: gameState.topic,
          speakerId: "user",
          speakerName: "You",
          speakerInitials: "ME",
          isUser: true,
          text: text.trim(),
          timestamp: Date.now(),
        };

        const optimisticMessageId = `local-orchestrator-${Date.now()}`;
        const mergedMessages = [...messages, { ...userMessage, id: `local-${Date.now()}` }];
        const optimisticOrchestratorMessage = {
          id: optimisticMessageId,
          speakerId: "orchestrator",
          speakerName: "Orchestrator",
          speakerInitials: "OR",
          isUser: false,
          text: "Selecting next speaker...",
          timestamp: Date.now(),
        };
        set((state) => ({
          messages: [...mergedMessages, optimisticOrchestratorMessage],
          followupQuestion: "",
          suggestion: "",
          knowledgeGrowth: Math.min(100, state.knowledgeGrowth + 5),
          appreciationLevel: Math.min(100, state.appreciationLevel + 2),
        }));

        try {
          await api.createMessage(userMessage, token);
        } catch (_) {}

        set({ isLoadingReply: true });
        try {
          const result = await api.runOrchestrator(
            {
              taskGoal: gameState.topic || "Advance the discussion with clear, role-grounded reasoning.",
              selectedAgentIds: gameState.playerTeam.map((m) => m.id),
              priorMessages: mergedMessages,
              maxIterations: 1,
              allowMetaMemory: true,
              metaMemory: { summary: "" },
              apiRoutingMode: get().apiRoutingMode,
              orchestratorMode: get().orchestratorMode,
            },
            token
          );

          const scopedMessages = (result.messages || []).filter(
            (m) => !m.topic || (m.topic === gameState.topic && m.sessionId === gameState.sessionId)
          );
          const resolvedMessages = scopedMessages.length ? scopedMessages : get().messages;

          set({
            messages: resolvedMessages,
            followupQuestion: result.clarifyingQuestion || "",
            suggestion: result.suggestion || "",
          });

          const newAgentMessages = resolvedMessages.filter(
            (m) => !m.isUser && Number(m.timestamp || 0) >= userMessage.timestamp
          );
          await Promise.all(
            newAgentMessages.map((m) =>
              api.createMessage(
                {
                  sessionId: gameState.sessionId,
                  topic: gameState.topic,
                  speakerId: m.speakerId,
                  speakerName: m.speakerName,
                  speakerInitials: m.speakerInitials,
                  isUser: false,
                  text: m.text,
                  timestamp: m.timestamp || Date.now(),
                },
                token
              ).catch(() => null)
            )
          );
        } catch (_) {
          set((state) => ({
            messages: state.messages.filter((m) => m.id !== optimisticMessageId),
            followupQuestion: "Temporary orchestration issue. Please send again.",
          }));
        } finally {
          set({ isLoadingReply: false });
        }
      },

      setMode: (mode) =>
        set((state) => ({
          gameState: { ...state.gameState, mode, setupPhase: "topicSelect" },
        })),

      setTopic: (topic, temperature) =>
        set((state) => ({
          gameState: {
            ...state.gameState,
            topic,
            temperature,
            sessionId: createSessionId(),
            setupPhase: "memberSelect",
          },
          messages: [],
          followupQuestion: "",
          suggestion: "",
        })),

      goToSetupPhase: (setupPhase) =>
        set((state) => ({ gameState: { ...state.gameState, setupPhase } })),

      setMaxMembers: (value) =>
        set((state) => {
          const nextValue = Math.max(1, Math.min(8, Number(value) || 3));
          const nextTeam = state.gameState.playerTeam.slice(0, nextValue);
          return {
            gameState: {
              ...state.gameState,
              maxMembers: nextValue,
              playerTeam: nextTeam,
            },
          };
        }),

      toggleMember: (agentId) => {
        const { gameState, agents } = get();
        const exists = gameState.playerTeam.find((a) => a.id === agentId);
        if (exists) {
          set((state) => ({
            gameState: {
              ...state.gameState,
              playerTeam: state.gameState.playerTeam.filter((a) => a.id !== agentId),
            },
          }));
          return;
        }
        if (gameState.playerTeam.length >= gameState.maxMembers) return;
        const agent = agents.find((a) => a.id === agentId);
        if (!agent) return;
        set((state) => ({
          gameState: { ...state.gameState, playerTeam: [...state.gameState.playerTeam, agent] },
        }));
      },

      completeSetup: () =>
        set((state) => {
          if (state.gameState.mode === "combat") {
            const remainingAgents = state.agents.filter((a) => !state.gameState.playerTeam.includes(a));
            return {
              gameState: {
                ...state.gameState,
                opponentTeam: remainingAgents.slice(0, state.gameState.maxMembers),
                setupPhase: "ready",
                phase: "coinToss",
              },
            };
          }
          return {
            gameState: { ...state.gameState, setupPhase: "ready" },
          };
        }),

      confirmDraft: () =>
        set((state) => {
          const remainingAgents = state.agents.filter((a) => !state.gameState.playerTeam.includes(a));
          return {
            gameState: {
              ...state.gameState,
              opponentTeam: remainingAgents.slice(0, state.gameState.maxMembers),
              phase: "coinToss",
            },
          };
        }),

      setCombatStarted: () =>
        set((state) => ({ gameState: { ...state.gameState, phase: "combat" } })),

      applyStrategyRound: () =>
        set((state) => ({
          gameState: {
            ...state.gameState,
            playerScore: state.gameState.playerScore + 10 + Math.floor(Math.random() * 5),
            currentRound: Math.min(state.gameState.currentRound + 1, state.gameState.totalRounds),
          },
        })),

      setBiasLevel: (biasLevel) =>
        set((state) => ({ gameState: { ...state.gameState, biasLevel } })),

      setApiRoutingMode: (apiRoutingMode) => set({ apiRoutingMode }),
      setOrchestratorMode: (orchestratorMode) => set({ orchestratorMode }),

      resetSession: () =>
        set({
          gameState: initialGameState(),
          messages: [],
          discussionHistory: [],
          followupQuestion: "",
          suggestion: "",
        }),
    }),
    {
      name: "ai-council-store",
      partialize: (state) => ({
        token: state.token,
        user: state.user,
      }),
    }
  )
);

export { useAppStore, initialGameState };
