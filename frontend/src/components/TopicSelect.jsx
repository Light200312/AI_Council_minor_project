import { useState } from "react";
import { ArrowRight, ChevronLeft, PenLine, Info, Check } from "lucide-react";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { TOPICS, DEBATE_TEMPERATURES } from "../data/mockData";
function TopicSelect({ onSelectTopic, onBack }) {
  const [customTopic, setCustomTopic] = useState("");
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [selectedTemp, setSelectedTemp] = useState(
    null
  );
  const [expandedInfo, setExpandedInfo] = useState(
    null
  );
  const activeTopic = selectedTopic || (customTopic.trim() ? customTopic.trim() : null);
  const canContinue = activeTopic && selectedTemp;
  const handleContinue = () => {
    if (activeTopic && selectedTemp) {
      onSelectTopic(activeTopic, selectedTemp);
    }
  };
  return <div className="min-h-screen bg-[#f5f5f7] p-8">
      <div className="max-w-3xl mx-auto">
        <Button
    variant="tertiary"
    leftIcon={<ChevronLeft className="w-4 h-4" />}
    onClick={onBack}
    className="mb-8"
  >

          Back to Modes
        </Button>

        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Configure Your Debate
          </h1>
          <p className="text-slate-500 font-mono">
            Set the topic and temperature before entering the council
          </p>
        </div>

        {
    /* ── STEP 1: Debate Temperature ── */
  }
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-bold font-mono flex items-center justify-center">
              1
            </span>
            <h2 className="text-base font-bold text-slate-900 uppercase tracking-wider">
              Debate Temperature
            </h2>
            {selectedTemp && <span className="ml-auto text-xs font-mono text-green-600 flex items-center gap-1">
                <Check className="w-3 h-3" /> Selected
              </span>}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {DEBATE_TEMPERATURES.map((temp) => {
    const isSelected = selectedTemp === temp.id;
    const isInfoOpen = expandedInfo === temp.id;
    return <div key={temp.id} className="flex flex-col gap-1">
                  <button
      onClick={() => {
        setSelectedTemp(temp.id);
        setExpandedInfo(null);
      }}
      className={`relative flex flex-col items-center gap-1.5 p-3 rounded-lg border-2 transition-all text-center ${isSelected ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white text-slate-700 hover:border-slate-400"}`}
    >

                    <span className="text-xl">{temp.emoji}</span>
                    <span className="text-[10px] font-bold leading-tight">
                      {temp.label}
                    </span>
                  </button>
                  <button
      onClick={(e) => {
        e.stopPropagation();
        setExpandedInfo(isInfoOpen ? null : temp.id);
      }}
      className="flex items-center justify-center gap-1 text-[10px] text-slate-400 hover:text-slate-600 font-mono py-0.5"
    >

                    <Info className="w-3 h-3" />
                    info
                  </button>
                </div>;
  })}
          </div>

          {
    /* Info Popover */
  }
          {expandedInfo && (() => {
    const t = DEBATE_TEMPERATURES.find((t2) => t2.id === expandedInfo);
    return <div className="mt-3 bg-white border border-slate-200 rounded-lg p-4 text-sm space-y-2">
                  <div className="flex items-center gap-2 font-bold text-slate-900">
                    <span>{t.emoji}</span>
                    <span>{t.label}</span>
                    <span className="text-slate-400 font-normal font-mono">
                      — {t.tagline}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-xs">
                    <div>
                      <span className="font-mono text-slate-400 uppercase block mb-0.5">
                        Goal
                      </span>
                      <span className="text-slate-700">{t.goal}</span>
                    </div>
                    <div>
                      <span className="font-mono text-slate-400 uppercase block mb-0.5">
                        Tone
                      </span>
                      <span className="text-slate-700">{t.tone}</span>
                    </div>
                    <div>
                      <span className="font-mono text-slate-400 uppercase block mb-0.5">
                        Focus
                      </span>
                      <span className="text-slate-700">{t.focus}</span>
                    </div>
                  </div>
                  <div className="text-xs text-slate-400 font-mono border-t border-slate-100 pt-2">
                    e.g. {t.example}
                  </div>
                </div>;
  })()}
        </div>

        {
    /* ── STEP 2: Topic ── */
  }
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-bold font-mono flex items-center justify-center">
              2
            </span>
            <h2 className="text-base font-bold text-slate-900 uppercase tracking-wider">
              Debate Topic
            </h2>
            {activeTopic && <span className="ml-auto text-xs font-mono text-green-600 flex items-center gap-1">
                <Check className="w-3 h-3" /> Selected
              </span>}
          </div>

          {
    /* Custom Topic Input */
  }
          <div
    className={`bg-white p-5 rounded-xl border-2 border-dashed mb-6 transition-colors ${customTopic.trim() && !selectedTopic ? "border-slate-900" : "border-slate-300"}`}
  >

            <div className="flex items-center gap-2 mb-3">
              <PenLine className="w-4 h-4 text-slate-500" />
              <span className="text-sm font-bold text-slate-700 uppercase tracking-wider">
                Custom Topic
              </span>
            </div>
            <Input
    placeholder="e.g. Is consciousness computable?"
    value={customTopic}
    onChange={(e) => {
      setCustomTopic(e.target.value);
      if (e.target.value.trim()) setSelectedTopic(null);
    }}
    onKeyDown={(e) => {
      if (e.key === "Enter" && customTopic.trim() && selectedTemp)
        handleContinue();
    }}
  />

          </div>

          {
    /* Divider */
  }
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
              Or choose a preset
            </span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          {
    /* Preset Topics */
  }
          <div className="space-y-3">
            {TOPICS.map((topic, idx) => {
    const isSelected = selectedTopic === topic;
    return <button
      key={idx}
      onClick={() => {
        setSelectedTopic(isSelected ? null : topic);
        setCustomTopic("");
      }}
      className={`w-full flex items-center justify-between p-4 rounded-lg border-2 transition-all text-left ${isSelected ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white text-slate-900 hover:border-slate-400"}`}
    >

                  <div className="flex items-center gap-4">
                    <span
      className={`w-8 h-8 rounded-md flex items-center justify-center font-mono font-bold text-sm flex-shrink-0 ${isSelected ? "bg-white text-slate-900" : "bg-slate-100 text-slate-500"}`}
    >

                      {idx + 1}
                    </span>
                    <span className="font-medium">{topic}</span>
                  </div>
                  {isSelected ? <Check className="w-4 h-4 flex-shrink-0" /> : <ArrowRight className="w-4 h-4 text-slate-300 flex-shrink-0" />}
                </button>;
  })}
          </div>
        </div>

        {
    /* ── Continue CTA ── */
  }
        <div
    className={`sticky bottom-6 transition-all ${canContinue ? "opacity-100" : "opacity-50 pointer-events-none"}`}
  >

          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-md flex items-center justify-between">
            <div className="text-sm text-slate-600">
              {selectedTemp && activeTopic ? <span className="font-mono">
                  <span className="font-bold text-slate-900">
                    {DEBATE_TEMPERATURES.find((t) => t.id === selectedTemp)?.emoji}{" "}
                    {DEBATE_TEMPERATURES.find((t) => t.id === selectedTemp)?.label}
                  </span>{" "}
                  ·{" "}
                  <span className="text-slate-500 truncate max-w-xs inline-block align-bottom">
                    {activeTopic}
                  </span>
                </span> : <span className="text-slate-400 font-mono">
                  {!selectedTemp && !activeTopic ? "Select temperature and topic to continue" : !selectedTemp ? "Select a temperature to continue" : "Select a topic to continue"}
                </span>}
            </div>
            <Button
    size="medium"
    disabled={!canContinue}
    rightIcon={<ArrowRight className="w-4 h-4" />}
    onClick={handleContinue}
  >

              Select Members
            </Button>
          </div>
        </div>
      </div>
    </div>;
}
export {
  TopicSelect
};
