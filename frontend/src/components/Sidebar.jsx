import {
  Swords,
  BarChart3,
  Settings,
  LogOut,
  GraduationCap,
  Clock,
  RotateCcw
} from "lucide-react";
import { DEBATE_TEMPERATURES } from "../data/mockData";
const NAV_ITEMS = [
  {
    id: "combat",
    label: "Council Combat",
    icon: Swords,
    isMode: true
  },
  {
    id: "mentor",
    label: "Mentor Dashboard",
    icon: GraduationCap,
    isMode: true
  },
  {
    id: "historical",
    label: "Time-Capsule",
    icon: Clock,
    isMode: true
  },
  {
    id: "analytics",
    label: "Live Analytics",
    icon: BarChart3,
    isMode: false
  },
  {
    id: "settings",
    label: "Settings",
    icon: Settings,
    isMode: false
  }
];
function Sidebar({
  activeTab,
  onTabChange,
  currentMode,
  currentTopic,
  currentMembers,
  currentTemperature,
  onNewSession
}) {
  const tempInfo = currentTemperature ? DEBATE_TEMPERATURES.find((t) => t.id === currentTemperature) : null;
  return <div className="w-64 h-full bg-slate-50 border-r border-slate-200 flex flex-col fixed left-0 top-0 z-10">
      {
    /* Logo Area */
  }
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-slate-900 rounded-md flex items-center justify-center">
            <span className="text-white font-bold font-mono">AI</span>
          </div>
          <div>
            <h1 className="font-bold text-slate-900 text-lg leading-tight">
              COUNCIL
            </h1>
            <p className="text-xs text-slate-500 font-mono tracking-wider">
              PLATFORM v1.0
            </p>
          </div>
        </div>
      </div>

      {
    /* Current Session Info */
  }
      {currentMode && <div className="p-4 border-b border-slate-200 space-y-3">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">
            Active Session
          </span>

          {
    /* Temperature Badge */
  }
          {tempInfo && <div className="flex items-center gap-2 bg-white rounded-md border border-slate-200 px-3 py-2">
              <span className="text-base">{tempInfo.emoji}</span>
              <div className="min-w-0">
                <span className="text-xs font-bold text-slate-900 block">
                  {tempInfo.label}
                </span>
                <span className="text-[10px] font-mono text-slate-400 truncate block">
                  {tempInfo.tagline}
                </span>
              </div>
            </div>}

          {
    /* Topic */
  }
          {currentTopic && <div className="bg-white rounded-md border border-dashed border-slate-200 p-3">
              <span className="text-[10px] font-mono text-slate-400 uppercase block mb-1">
                Topic
              </span>
              <p className="text-xs text-slate-700 font-medium leading-snug line-clamp-2">
                {currentTopic}
              </p>
            </div>}

          {
    /* Members */
  }
          {currentMembers && currentMembers.length > 0 && <div>
              <span className="text-[10px] font-mono text-slate-400 uppercase block mb-2">
                Council
              </span>
              <div className="flex -space-x-1.5">
                {currentMembers.map(
    (member) => <div
      key={member.id}
      className="w-7 h-7 rounded-full bg-slate-200 border-2 border-slate-50 flex items-center justify-center font-mono text-[9px] font-bold text-slate-600"
      title={member.name}
    >

                    {member.avatarInitials}
                  </div>
  )}
              </div>
            </div>}
        </div>}

      {
    /* Unified Navigation */
  }
      <nav className="flex-1 p-4 space-y-4 overflow-y-auto">
        {
    /* Modes Section */
  }
        <div>
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block mb-2 px-1">
            Debate Modes
          </span>
          <div className="space-y-1">
            {NAV_ITEMS.filter((i) => i.isMode).map((item) => {
    const Icon = item.icon;
    const isActive = currentMode === item.id;
    return <button
      key={item.id}
      onClick={() => onTabChange(item.id)}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-colors ${isActive ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"}`}
    >

                  <Icon className="w-5 h-5" />
                  <span className="flex-1 text-left">{item.label}</span>
                  {isActive && <span className="w-2 h-2 rounded-full bg-green-400" />}
                </button>;
  })}
          </div>
        </div>

        {
    /* Tools Section */
  }
        <div>
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block mb-2 px-1">
            Tools
          </span>
          <div className="space-y-1">
            {NAV_ITEMS.filter((i) => !i.isMode).map((item) => {
    const Icon = item.icon;
    const isActive = activeTab === item.id;
    return <button
      key={item.id}
      onClick={() => onTabChange(item.id)}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-colors ${isActive ? "bg-slate-200 text-slate-900" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"}`}
    >

                  <Icon className="w-5 h-5" />
                  {item.label}
                </button>;
  })}
          </div>
        </div>
      </nav>

      {
    /* Footer */
  }
      <div className="p-4 border-t border-slate-200 space-y-2">
        {onNewSession && <button
    onClick={onNewSession}
    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 hover:text-slate-900 rounded-md transition-colors"
  >

            <RotateCcw className="w-4 h-4" />
            New Session
          </button>}
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="w-8 h-8 rounded-full bg-slate-300 border border-slate-400" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-900 truncate">
              Director Alpha
            </p>
            <p className="text-xs text-slate-500 truncate">
              Level 42 Strategist
            </p>
          </div>
        </div>
        <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors">
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </div>;
}
export {
  Sidebar
};
