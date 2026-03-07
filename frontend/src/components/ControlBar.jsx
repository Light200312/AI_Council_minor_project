import { Download, Users, Plus } from "lucide-react";
import { Button } from "./ui/Button";
import { useAppStore } from "../store/useAppStore";

// ControlBar shows session-level actions and live status.
function ControlBar() {
  const apiRoutingMode = useAppStore((state) => state.apiRoutingMode);
  const setApiRoutingMode = useAppStore((state) => state.setApiRoutingMode);
  const orchestratorMode = useAppStore((state) => state.orchestratorMode);
  const setOrchestratorMode = useAppStore((state) => state.setOrchestratorMode);
  const apiModes = [
    { id: "persona", label: "Per Personality" },
    { id: "ollama_only", label: "Ollama Only" },
    { id: "openrouter_only", label: "OpenRouter Only" },
  ];
  const orchestrationModes = [
    { id: "dynamic", label: "Dynamic" },
    { id: "fast", label: "Fast" },
  ];

  return <div className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-20">
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-bold text-slate-900">
          Debate Session #4029
        </h2>
        <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-mono rounded-full border border-green-200 flex items-center gap-1">
          <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
          LIVE
        </span>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-2 py-1">
          <span className="text-xs font-medium text-slate-700">API Mode:</span>
          <div className="flex items-center gap-1">
            {apiModes.map((mode) => (
              <button
                key={mode.id}
                type="button"
                onClick={() => setApiRoutingMode(mode.id)}
                className={`rounded px-2 py-1 text-[11px] font-medium transition-colors ${
                  apiRoutingMode === mode.id
                    ? "bg-slate-900 text-white"
                    : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-100"
                }`}
              >
                {mode.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-2 py-1">
          <span className="text-xs font-medium text-slate-700">Orchestrator:</span>
          <div className="flex items-center gap-1">
            {orchestrationModes.map((mode) => (
              <button
                key={mode.id}
                type="button"
                onClick={() => setOrchestratorMode(mode.id)}
                className={`rounded px-2 py-1 text-[11px] font-medium transition-colors ${
                  orchestratorMode === mode.id
                    ? "bg-slate-900 text-white"
                    : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-100"
                }`}
              >
                {mode.label}
              </button>
            ))}
          </div>
        </div>
        <Button
    variant="secondary"
    size="small"
    leftIcon={<Users className="w-4 h-4" />}
  >

          Audience Mode
        </Button>
        <Button
    variant="secondary"
    size="small"
    leftIcon={<Download className="w-4 h-4" />}
  >

          Export Verdict
        </Button>
        <Button
    variant="primary"
    size="small"
    leftIcon={<Plus className="w-4 h-4" />}
  >

          New Debate
        </Button>
      </div>
    </div>;
}
export {
  ControlBar
};
