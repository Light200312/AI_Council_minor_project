import { useMemo, useState } from "react";
import { Check, ChevronLeft, Search } from "lucide-react";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { AgentCard } from "./AgentCard";

// MemberSelect filters and selects council members during setup.
function MemberSelect({
  availableAgents,
  selectedAgents,
  onToggleAgent,
  onConfirm,
  onBack,
  onOpenPersonaEditor,
  maxSelection = 3,
  onMaxSelectionChange,
  argumentLimit = 10,
  onArgumentLimitChange,
  difficulty = "standard",
  onDifficultyChange
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [domainFilter, setDomainFilter] = useState("all");
  const remaining = maxSelection - selectedAgents.length;
  const isComplete = remaining === 0;
  const domainLabel = useMemo(
    () => ({
      philosophy: "Philosophy",
      tech: "Tech",
      math: "Math",
      economics: "Economics",
      law: "Law",
      politics: "Politics",
      history: "History",
      science: "Science",
      other: "Other"
    }),
    []
  );
  const inferDomain = (agent) => {
    const tagText = (agent.tags || []).map((t) => String(t).toLowerCase());
    if (tagText.includes("philosophy")) return "philosophy";
    if (tagText.includes("tech") || tagText.includes("technology")) return "tech";
    if (tagText.includes("math") || tagText.includes("mathematics")) return "math";
    if (tagText.includes("economics")) return "economics";
    if (tagText.includes("law") || tagText.includes("legal")) return "law";
    if (tagText.includes("politics") || tagText.includes("political")) return "politics";
    if (tagText.includes("history") || tagText.includes("historical")) return "history";
    if (tagText.includes("science") || tagText.includes("scientist")) return "science";

    const roleText = `${agent.role || ""} ${agent.description || ""}`.toLowerCase();
    if (roleText.includes("philosoph")) return "philosophy";
    if (roleText.includes("technolog") || roleText.includes("engineer") || roleText.includes("inventor")) return "tech";
    if (roleText.includes("math") || roleText.includes("statistic")) return "math";
    if (roleText.includes("econom")) return "economics";
    if (roleText.includes("law") || roleText.includes("legal") || roleText.includes("jurist")) return "law";
    if (roleText.includes("politic") || roleText.includes("strateg")) return "politics";
    if (roleText.includes("histor")) return "history";
    if (roleText.includes("science") || roleText.includes("scientist") || roleText.includes("physician")) return "science";
    return "other";
  };
  const availableDomains = useMemo(() => {
    const domainSet = new Set();
    availableAgents.forEach((agent) => domainSet.add(inferDomain(agent)));
    return Array.from(domainSet);
  }, [availableAgents]);
  // Filter experts by searchable profile fields and domain.
  const filteredAgents = useMemo(() => {
    const domainFiltered =
      domainFilter === "all"
        ? availableAgents
        : availableAgents.filter((agent) => inferDomain(agent) === domainFilter);
    const q = searchQuery.toLowerCase();
    if (!searchQuery.trim()) return domainFiltered;
    return domainFiltered.filter(
      (agent) => agent.name.toLowerCase().includes(q) || agent.role.toLowerCase().includes(q) || agent.era.toLowerCase().includes(q) || agent.description.toLowerCase().includes(q) || agent.specialAbility.toLowerCase().includes(q)
    );
  }, [availableAgents, searchQuery, domainFilter]);
  const groupedAgents = useMemo(() => {
    const groups = {};
    filteredAgents.forEach((agent) => {
      const key = inferDomain(agent);
      if (!groups[key]) groups[key] = [];
      groups[key].push(agent);
    });
    return groups;
  }, [filteredAgents]);
  return <div className="min-h-screen bg-[#f5f5f7] p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Button
    variant="tertiary"
    leftIcon={<ChevronLeft className="w-4 h-4" />}
    onClick={onBack}
  >

            Back to Topics
          </Button>

          <div className="text-right">
            <h1 className="text-2xl font-bold text-slate-900">
              Select Council Members
            </h1>
            <p className="text-slate-500 font-mono">
              {remaining > 0 ? `Select ${remaining} more members` : "Selection Complete"}
            </p>
          </div>
        </div>

        <div className="mb-4 flex items-end justify-between gap-4">
          <div className="max-w-md w-full">
            <Input
              placeholder="Search experts by name, role, era..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              startAdornment={<Search className="w-4 h-4 text-slate-400" />}
            />
          </div>
          <div className="flex items-end gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-mono text-slate-500">Council size</label>
              <select
                className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700"
                value={maxSelection}
                onChange={(e) => onMaxSelectionChange?.(e.target.value)}
              >
                {[3, 4, 5, 6, 7, 8].map((n) => (
                  <option key={n} value={n}>
                    {n} members
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-mono text-slate-500">Arguments</label>
              <select
                className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700"
                value={argumentLimit}
                onChange={(e) => onArgumentLimitChange?.(e.target.value)}
              >
                <option value={10}>10 rounds</option>
                <option value={20}>20 rounds</option>
                <option value="infinite">Infinite</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-mono text-slate-500">Difficulty</label>
              <select
                className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700"
                value={difficulty}
                onChange={(e) => onDifficultyChange?.(e.target.value)}
              >
                <option value="easy">Easy</option>
                <option value="standard">Standard</option>
                <option value="hard">Hard</option>
              </select>
            </div>
            {onOpenPersonaEditor ? (
              <Button size="large" onClick={onOpenPersonaEditor}>
                Create Agent
              </Button>
            ) : null}
          </div>
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          <button
            type="button"
            className={`px-3 py-1.5 rounded-full text-xs font-medium border ${
              domainFilter === "all"
                ? "bg-slate-900 text-white border-slate-900"
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
            }`}
            onClick={() => setDomainFilter("all")}
          >
            All Domains
          </button>
          {availableDomains.map((domain) => (
            <button
              key={domain}
              type="button"
              className={`px-3 py-1.5 rounded-full text-xs font-medium border ${
                domainFilter === domain
                  ? "bg-slate-900 text-white border-slate-900"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
              }`}
              onClick={() => setDomainFilter(domain)}
            >
              {domainLabel[domain] || domain}
            </button>
          ))}
        </div>

        {searchQuery.trim() && <p className="text-xs font-mono text-slate-400 mb-4">
            {filteredAgents.length} expert
            {filteredAgents.length !== 1 ? "s" : ""} found
          </p>}

        <div className="space-y-8 mb-24">
          {Object.keys(groupedAgents).length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-400 font-mono">
                No experts match "{searchQuery}"
              </p>
              <button
                className="mt-2 text-sm text-slate-500 underline hover:text-slate-700"
                onClick={() => setSearchQuery("")}
              >
                Clear search
              </button>
            </div>
          ) : (
            (domainFilter === "all" ? Object.keys(groupedAgents) : [domainFilter]).map((domainKey) => {
              const items = groupedAgents[domainKey] || [];
              if (!items.length) return null;
              return (
                <div key={domainKey}>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-mono text-slate-600 uppercase tracking-wide">
                      {domainLabel[domainKey] || domainKey}
                    </h3>
                    <span className="text-xs text-slate-400">{items.length} members</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {items.map((agent) => (
                      <div key={agent.id} className="relative">
                        <AgentCard
                          agent={agent}
                          isSelected={selectedAgents.includes(agent.id)}
                          onClick={() => onToggleAgent(agent.id)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-6 shadow-lg z-20">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex -space-x-2">
                {selectedAgents.map((id) => {
    const agent = availableAgents.find((a) => a.id === id);
    return <div
      key={id}
      className="w-10 h-10 rounded-full border-2 border-white bg-slate-800 text-white flex items-center justify-center font-mono text-xs font-bold"
      title={agent?.name}
    >

                      {agent?.avatarInitials}
                    </div>;
  })}
                {Array(remaining).fill(0).map(
    (_, i) => <div
      key={`empty-${i}`}
      className="w-10 h-10 rounded-full border-2 border-slate-200 bg-slate-50 border-dashed flex items-center justify-center text-slate-300"
    >

                      ?
                    </div>
  )}
              </div>
              <span className="text-sm text-slate-500 font-mono">
                {selectedAgents.length} / {maxSelection} Selected
              </span>
            </div>

            <Button
    size="large"
    disabled={!isComplete}
    onClick={onConfirm}
    rightIcon={<Check className="w-5 h-5" />}
  >

              Confirm Council
            </Button>
          </div>
        </div>
      </div>
    </div>;
}
export {
  MemberSelect
};
