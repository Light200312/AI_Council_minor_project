import { useMemo, useState } from "react";
import { Check, ChevronLeft, Search } from "lucide-react";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { AgentCard } from "./AgentCard";
function MemberSelect({
  availableAgents,
  selectedAgents,
  onToggleAgent,
  onConfirm,
  onBack,
  maxSelection = 3
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const remaining = maxSelection - selectedAgents.length;
  const isComplete = remaining === 0;
  const filteredAgents = useMemo(() => {
    if (!searchQuery.trim()) return availableAgents;
    const q = searchQuery.toLowerCase();
    return availableAgents.filter(
      (agent) => agent.name.toLowerCase().includes(q) || agent.role.toLowerCase().includes(q) || agent.era.toLowerCase().includes(q) || agent.description.toLowerCase().includes(q) || agent.specialAbility.toLowerCase().includes(q)
    );
  }, [availableAgents, searchQuery]);
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

        <div className="mb-6 max-w-md">
          <Input
    placeholder="Search experts by name, role, era..."
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
    startAdornment={<Search className="w-4 h-4 text-slate-400" />}
  />

        </div>

        {searchQuery.trim() && <p className="text-xs font-mono text-slate-400 mb-4">
            {filteredAgents.length} expert
            {filteredAgents.length !== 1 ? "s" : ""} found
          </p>}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-24">
          {filteredAgents.map(
    (agent) => <div key={agent.id} className="relative">
              <AgentCard
      agent={agent}
      isSelected={selectedAgents.includes(agent.id)}
      onClick={() => onToggleAgent(agent.id)}
    />

            </div>
  )}
          {filteredAgents.length === 0 && <div className="col-span-full text-center py-12">
              <p className="text-slate-400 font-mono">
                No experts match "{searchQuery}"
              </p>
              <button
    className="mt-2 text-sm text-slate-500 underline hover:text-slate-700"
    onClick={() => setSearchQuery("")}
  >

                Clear search
              </button>
            </div>}
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
