import { Card, CardContent, CardHeader, CardFooter } from "./ui/Card";
import { Brain, MessageSquare, Scale, Info } from "lucide-react";
function AgentCard({
  agent,
  isSelected,
  onClick,
  compact = false
}) {
  return <Card
    variant={isSelected ? "filled" : "outlined"}
    isClickable={!!onClick}
    className={`transition-all duration-200 ${isSelected ? "ring-2 ring-slate-900 ring-offset-2" : ""}`}
  >

      <div onClick={onClick} className="h-full flex flex-col">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div
    className={`w-10 h-10 rounded-full flex items-center justify-center font-mono font-bold text-lg border ${isSelected ? "bg-white text-slate-900 border-slate-900" : "bg-slate-100 text-slate-600 border-slate-200"}`}
  >

                {agent.avatarInitials}
              </div>
              <div>
                <h3 className="font-bold text-slate-900">{agent.name}</h3>
                <p className="text-xs text-slate-500 font-mono uppercase">
                  {agent.role}
                </p>
              </div>
            </div>
            {isSelected && <div className="bg-slate-900 text-white text-xs px-2 py-1 rounded font-mono">
                SELECTED
              </div>}
          </div>
        </CardHeader>

        <CardContent className="py-2 flex-1">
          {!compact && <p className="text-sm text-slate-600 mb-4 line-clamp-2">
              {agent.description}
            </p>}

          <div className="grid grid-cols-3 gap-2">
            <div className="bg-slate-50 p-2 rounded border border-slate-100 text-center">
              <div className="flex justify-center mb-1 text-slate-400">
                <Brain className="w-4 h-4" />
              </div>
              <div className="text-xs text-slate-500 uppercase font-mono text-[10px]">
                Logic
              </div>
              <div className="font-bold text-slate-900">
                {agent.stats.logic}
              </div>
            </div>
            <div className="bg-slate-50 p-2 rounded border border-slate-100 text-center">
              <div className="flex justify-center mb-1 text-slate-400">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div className="text-xs text-slate-500 uppercase font-mono text-[10px]">
                Rhetoric
              </div>
              <div className="font-bold text-slate-900">
                {agent.stats.rhetoric}
              </div>
            </div>
            <div className="bg-slate-50 p-2 rounded border border-slate-100 text-center">
              <div className="flex justify-center mb-1 text-slate-400">
                <Scale className="w-4 h-4" />
              </div>
              <div className="text-xs text-slate-500 uppercase font-mono text-[10px]">
                Bias
              </div>
              <div className="font-bold text-slate-900">{agent.stats.bias}</div>
            </div>
          </div>
        </CardContent>

        {!compact && <CardFooter className="pt-2 border-t border-slate-100 mt-auto">
            <div className="flex items-center gap-2 text-xs text-slate-500 w-full">
              <Info className="w-3 h-3" />
              <span className="font-mono truncate">
                Special: {agent.specialAbility}
              </span>
            </div>
          </CardFooter>}
      </div>
    </Card>;
}
export {
  AgentCard
};
