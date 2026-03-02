import { useEffect, useState, useRef } from "react";
import { Send } from "lucide-react";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { Card } from "./ui/Card";
import { KnowledgeGrowth } from "./KnowledgeGrowth";
import { AppreciationMeter } from "./AppreciationMeter";
import { CRITIQUE_TAG_STYLES, MENTOR_MOCK_MESSAGES } from "../data/mockData";

// MentorDashboard hosts the guided discussion experience and side metrics.
function MentorDashboard({ topic, members }) {
  const [state, setState] = useState({
    messages: MENTOR_MOCK_MESSAGES,
    knowledgeGrowth: 45,
    appreciationLevel: 72,
    currentSpeakerIndex: 0,
    isDiscussionActive: true
  });
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef(null);
  // Keep the newest message visible when conversation updates.
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth"
    });
  };
  useEffect(() => {
    scrollToBottom();
  }, [state.messages]);
  // Append the user's message and update mentorship progress indicators.
  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    const newMessage = {
      id: `user-${Date.now()}`,
      speakerId: "user",
      speakerName: "You",
      speakerInitials: "ME",
      isUser: true,
      text: inputValue,
      timestamp: Date.now()
    };
    setState((prev) => ({
      ...prev,
      messages: [...prev.messages, newMessage],
      knowledgeGrowth: Math.min(100, prev.knowledgeGrowth + 5),
      appreciationLevel: Math.min(100, prev.appreciationLevel + 2)
    }));
    setInputValue("");
  };
  return <div className="grid grid-cols-12 gap-6 h-[calc(100vh-7rem)]">
      {
    /* Main Discussion Area */
  }
      <div className="col-span-9 flex flex-col min-h-0">
        <Card className="flex-1 flex flex-col overflow-hidden border-2 border-dashed border-slate-300 bg-slate-50">
          <div className="p-4 border-b border-slate-200 bg-white flex-shrink-0">
            <h2 className="text-lg font-bold text-slate-900">
              Council Discussion
            </h2>
            <p className="text-sm text-slate-500 font-mono">Topic: {topic}</p>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {state.messages.map(
    (msg) => <div
      key={msg.id}
      className={`flex gap-4 ${msg.isUser ? "flex-row-reverse" : ""}`}
    >

                {
      /* Avatar */
    }
                <div
      className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center border-2 font-mono font-bold text-sm ${msg.isUser ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-700 border-slate-300"}`}
    >

                  {msg.speakerInitials}
                </div>

                {
      /* Message Bubble */
    }
                <div
      className={`max-w-[70%] space-y-2 ${msg.isUser ? "items-end flex flex-col" : ""}`}
    >

                  <div className="flex items-baseline gap-2">
                    <span className="text-xs font-bold text-slate-700">
                      {msg.speakerName}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(msg.timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit"
    })}
                    </span>
                  </div>

                  <div
      className={`p-4 rounded-2xl text-sm leading-relaxed ${msg.isUser ? "bg-slate-900 text-white rounded-tr-none" : "bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-sm"}`}
    >

                    {msg.text}
                  </div>

                  {
      /* Critique Tags */
    }
                  {msg.critiqueTags && msg.critiqueTags.length > 0 && <div className="flex flex-wrap gap-2 mt-1">
                      {msg.critiqueTags.map(
      (tag) => <span
        key={tag.id}
        className={`text-[10px] uppercase font-bold px-2 py-1 rounded border ${CRITIQUE_TAG_STYLES[tag.type] || "bg-slate-100 text-slate-600 border-slate-200"}`}
      >

                          {tag.label}
                        </span>
    )}
                    </div>}
                </div>
              </div>
  )}
            <div ref={messagesEndRef} />
          </div>

          {
    /* Input Area */
  }
          <div className="p-4 bg-white border-t border-slate-200 flex-shrink-0">
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
    placeholder="Contribute to the discussion..."
    value={inputValue}
    onChange={(e) => setInputValue(e.target.value)}
    onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
  />

              </div>
              <Button
    onClick={handleSendMessage}
    rightIcon={<Send className="w-4 h-4" />}
  >

                Send
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {
    /* Right Sidebar - Mentor Stats (sticky) */
  }
      <div className="col-span-3 h-full overflow-y-auto">
        <div className="sticky top-0 space-y-6">
          <KnowledgeGrowth value={state.knowledgeGrowth} />
          <AppreciationMeter value={state.appreciationLevel} />

          <Card>
            <div className="p-4 border-b border-slate-200">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Present Members
              </h3>
            </div>
            <div className="p-4 space-y-3">
              {members.map(
    (member) => <div key={member.id} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-mono text-xs font-bold text-slate-600">
                    {member.avatarInitials}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900">
                      {member.name}
                    </div>
                    <div className="text-xs text-slate-500 font-mono">
                      {member.role}
                    </div>
                  </div>
                </div>
  )}
              <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
                <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center font-mono text-xs font-bold text-white">
                  ME
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900">You</div>
                  <div className="text-xs text-slate-500 font-mono">
                    Student
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>;
}
export {
  MentorDashboard
};
