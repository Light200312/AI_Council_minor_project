import { useState } from "react";
import { Download, Users, Plus, SlidersHorizontal } from "lucide-react";
import { Button } from "./ui/Button";
import { Dialog, DialogContent, DialogHeader } from "./ui/Dialog";
import { useAppStore } from "../store/useAppStore";

function getSessionDisplayCode(sessionId) {
  const normalized = String(sessionId || "").trim();
  if (!normalized) return "----";

  const digitCode = normalized.replace(/\D/g, "").slice(-4);
  if (digitCode.length === 4) return digitCode;

  return normalized.replace(/[^a-zA-Z0-9]/g, "").slice(-4).toUpperCase() || "----";
}

// ControlBar shows session-level actions and live status.
function ControlBar() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const sessionId = useAppStore((state) => state.gameState.sessionId);
  const apiRoutingMode = useAppStore((state) => state.apiRoutingMode);
  const setApiRoutingMode = useAppStore((state) => state.setApiRoutingMode);
  const orchestratorMode = useAppStore((state) => state.orchestratorMode);
  const setOrchestratorMode = useAppStore((state) => state.setOrchestratorMode);
  const memoryMode = useAppStore((state) => state.memoryMode);
  const setMemoryMode = useAppStore((state) => state.setMemoryMode);
  const apiModes = [
    { id: "persona", label: "Per Personality" },
    { id: "ollama_only", label: "Ollama Only" },
    { id: "openrouter_only", label: "OpenRouter Only" },
  ];
  const orchestrationModes = [
    { id: "dynamic", label: "Dynamic" },
    { id: "fast", label: "Fast" },
  ];
  const memoryModes = [
    { id: "minimal", label: "Memory: Minimal" },
    { id: "rich", label: "Memory: Rich" },
  ];
  const selectedApiMode = apiModes.find((mode) => mode.id === apiRoutingMode)?.label || "Per Personality";
  const selectedOrchestratorMode =
    orchestrationModes.find((mode) => mode.id === orchestratorMode)?.label || "Fast";
  const selectedMemoryMode = memoryModes.find((mode) => mode.id === memoryMode)?.label || "Memory: Minimal";
  const sessionDisplayCode = getSessionDisplayCode(sessionId);

  const renderOptionGroup = ({ title, options, selectedValue, onChange }) => (
    <section className="space-y-3">
      <div>
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      </div>
      <div className="grid gap-2">
        {options.map((option) => {
          const isActive = selectedValue === option.id;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onChange(option.id)}
              className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-left transition-colors ${
                isActive
                  ? "border-slate-900 bg-slate-900 text-white shadow-sm"
                  : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              <span className="text-sm font-medium">{option.label}</span>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] ${
                  isActive ? "bg-white/15 text-slate-100" : "bg-slate-100 text-slate-500"
                }`}
              >
                {isActive ? "Active" : "Set"}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );

  return <>
      <div className="min-h-16 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 px-4 py-3 sticky top-0 z-20 lg:px-6">
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-bold text-slate-900">
          Debate Session #{sessionDisplayCode}
        </h2>
        <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-mono rounded-full border border-green-200 flex items-center gap-1">
          <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
          LIVE
        </span>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-2">
        <button
          type="button"
          onClick={() => setIsSettingsOpen(true)}
          className="inline-flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-left transition-colors hover:border-slate-300 hover:bg-slate-100"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white text-slate-700 shadow-sm">
            <SlidersHorizontal className="h-4 w-4" />
          </span>
          <span className="hidden sm:block">
            <span className="block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Settings
            </span>
            <span className="block text-sm font-medium text-slate-900">
              {selectedApiMode} • {selectedOrchestratorMode} • {selectedMemoryMode.replace("Memory: ", "")}
            </span>
          </span>
        </button>
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
    </div>

      <Dialog
      isOpen={isSettingsOpen}
      onClose={setIsSettingsOpen}
      position="right"
      backdrop="blur"
      className="relative border-l border-slate-200"
    >
        <DialogHeader className="bg-slate-50">
          <div className="pr-10">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Session Settings
            </p>
            <p className="mt-1 text-lg font-semibold text-slate-900">
              Routing and memory controls
            </p>
          </div>
        </DialogHeader>
        <DialogContent className="space-y-8 overflow-y-auto">
          {renderOptionGroup({
            title: "API Mode",
            options: apiModes,
            selectedValue: apiRoutingMode,
            onChange: setApiRoutingMode,
          })}
          {renderOptionGroup({
            title: "Orchestrator",
            options: orchestrationModes,
            selectedValue: orchestratorMode,
            onChange: setOrchestratorMode,
          })}
          {renderOptionGroup({
            title: "Context Memory",
            options: memoryModes,
            selectedValue: memoryMode,
            onChange: setMemoryMode,
          })}
        </DialogContent>
      </Dialog>
    </>;
}
export {
  ControlBar
};
