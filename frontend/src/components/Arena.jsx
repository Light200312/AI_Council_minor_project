import { Mic } from "lucide-react";

// Arena renders the live debate table and highlights the current speaker.
function Arena({
  playerTeam,
  opponentTeam,
  currentRound,
  isSpeaking,
  activeSpeakerId
}) {
  return <div className="relative h-[600px] bg-slate-50 rounded-2xl border-2 border-dashed border-slate-300 overflow-hidden flex items-center justify-center p-8">
      {
    /* Background Grid */
  }
      <div
    className="absolute inset-0 opacity-5"
    style={{
      backgroundImage: "radial-gradient(#000 1px, transparent 1px)",
      backgroundSize: "20px 20px"
    }}
  />


      {
    /* Central Table */
  }
      <div className="relative w-[500px] h-[500px] rounded-full border-4 border-slate-200 bg-white shadow-sm flex items-center justify-center">
        <div className="absolute inset-4 rounded-full border border-slate-100" />

        {
    /* Topic Display (Center) */
  }
        <div className="text-center max-w-xs z-10 p-6">
          <div className="text-xs font-mono text-slate-400 uppercase tracking-widest mb-2">
            Current Topic
          </div>
          <h3 className="text-xl font-bold text-slate-900 leading-tight">
            "{currentRound.topic}"
          </h3>
          {isSpeaking && <div className="mt-4 flex justify-center">
              <div className="flex gap-1">
                {[1, 2, 3, 4].map(
    (i) => <div
      key={i}
      className="w-1 bg-slate-900 animate-pulse"
      style={{
        height: `${Math.random() * 20 + 10}px`,
        animationDelay: `${i * 0.1}s`
      }}
    >
              </div>
  )}
              </div>
            </div>}
        </div>

        {
    /* Player Team (Bottom Semi-circle) */
  }
        {playerTeam.map((agent, index) => {
    const total = playerTeam.length;
    const angle = 45 + 90 / (total - 1 || 1) * index;
    const isActive = activeSpeakerId === agent.id;
    return <div
      key={agent.id}
      className={`absolute w-24 transition-all duration-500 ${isActive ? "scale-110 z-20" : "z-10"}`}
      style={{
        bottom: "10%",
        left: `${(index + 1) * (100 / (total + 1))}%`,
        transform: `translateX(-50%) ${isActive ? "translateY(-20px)" : ""}`
      }}
    >

              <div className="flex flex-col items-center">
                <div
      className={`relative w-20 h-20 rounded-full border-4 flex items-center justify-center bg-white shadow-lg mb-2 ${isActive ? "border-blue-500 shadow-blue-100" : "border-slate-200"}`}
    >

                  <span className="font-mono font-bold text-2xl text-slate-800">
                    {agent.avatarInitials}
                  </span>
                  {isActive && <div className="absolute -top-2 -right-2 bg-blue-500 text-white p-1 rounded-full">
                      <Mic className="w-4 h-4" />
                    </div>}
                </div>
                <div className="bg-white px-3 py-1 rounded-full border border-slate-200 shadow-sm text-xs font-bold text-slate-700 whitespace-nowrap">
                  {agent.name}
                </div>
              </div>
            </div>;
  })}

        {
    /* Opponent Team (Top Semi-circle) */
  }
        {opponentTeam.map((agent, index) => {
    const isActive = activeSpeakerId === agent.id;
    return <div
      key={agent.id}
      className={`absolute w-24 transition-all duration-500 ${isActive ? "scale-110 z-20" : "z-10"}`}
      style={{
        top: "10%",
        left: `${(index + 1) * (100 / (opponentTeam.length + 1))}%`,
        transform: `translateX(-50%) ${isActive ? "translateY(20px)" : ""}`
      }}
    >

              <div className="flex flex-col items-center">
                <div className="bg-slate-50 px-3 py-1 rounded-full border border-slate-200 shadow-sm text-xs font-bold text-slate-500 whitespace-nowrap mb-2 opacity-70">
                  {agent.name}
                </div>
                <div
      className={`relative w-16 h-16 rounded-full border-4 flex items-center justify-center bg-slate-50 shadow-sm ${isActive ? "border-red-400" : "border-slate-200"}`}
    >

                  <span className="font-mono font-bold text-lg text-slate-400">
                    {agent.avatarInitials}
                  </span>
                </div>
              </div>
            </div>;
  })}
      </div>
    </div>;
}
export {
  Arena
};
