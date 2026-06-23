import React, { useState, useRef, useEffect } from "react";
import { 
  MessageSquare, 
  Send, 
  Brain, 
  Sparkles, 
  Bookmark, 
  User, 
  Compass, 
  Briefcase,
  Flame,
  Frown,
  BookOpen
} from "lucide-react";
import { ChatMessage, UserProfile } from "../types";

interface CoachViewProps {
  userProfile: UserProfile | null;
  chatHistory: ChatMessage[];
  onSendMessage: (text: string) => Promise<any>;
}

export default function CoachView({ userProfile, chatHistory, onSendMessage }: CoachViewProps) {
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const presets = [
    { title: "Exam Preparation Plan", text: "Create a detailed step-by-step preparation plan for an upcoming engineering paper in 4 days. Stress on parsers and testing strategies.", icon: BookOpen, color: "text-purple-400" },
    { title: "Interview Ready Blueprint", text: "Outline a checklist and major technical themes for a Senior React + Node developer backend developer career roadmap.", icon: Briefcase, color: "text-blue-400" },
    { title: "Mitigate Extreme Burnout", text: "I have 8 active tasks and I am feeling overwhelmed and locked. Give me a practical cognitive grounding exercise to restore productivity focus.", icon: Frown, color: "text-pink-400" },
    { title: "Study Schedule Sprints", text: "How do I split my college study schedules to maintain consistency streaks without losing motivation?", icon: Flame, color: "text-orange-400" }
  ];

  const handleSend = async (text: string) => {
    if (!text.trim() || loading) return;
    setLoading(true);
    setInputText("");
    try {
      await onSendMessage(text);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  return (
    <div id="coach-tab-content" className="p-6 md:p-8 bg-transparent text-white min-h-screen flex flex-col h-[calc(100vh-2px)] space-y-4">
      
      {/* Header section (Fixed size) */}
      <div className="flex-shrink-0">
        <h1 className="text-4xl sm:text-5xl font-display font-black tracking-tighter uppercase leading-none text-white">
          AI COACH <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">MENTOR</span>
        </h1>
        <p className="text-xs text-neutral-400 mt-1">Engage with our custom-trained chat companion to formulate study paths, exam roadmaps, or stress recovery guides instantly.</p>
      </div>

      {/* Main chat layout */}
      <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0">
        
        {/* Presets and accelerators panel (Left Col, 1/3 wide) */}
        <div id="ideas-coaching-presets" className="hidden lg:flex flex-col space-y-4 w-72 flex-shrink-0">
          <div className="p-5 rounded-3xl bg-white/[0.03] border border-white/10 backdrop-blur-xl space-y-4">
            <h3 className="text-xs font-display font-black uppercase text-neutral-200 flex items-center space-x-1.5 pb-2 border-b border-white/10">
              <Compass className="w-4 h-4 text-blue-400" />
              <span>Coaching Sessions</span>
            </h3>

            <div className="space-y-3">
              {presets.map((p, idx) => {
                const Icon = p.icon;
                return (
                  <button
                    id={`btn-preset-coaching-${idx}`}
                    key={idx}
                    onClick={() => handleSend(p.text)}
                    className="w-full p-3 bg-[#0c0c16]/50 border border-white/[0.06] hover:border-blue-500/50 rounded-2xl text-left transition-all hover:scale-[1.01] active:scale-95 text-[11px] font-medium leading-relaxed hover:text-white cursor-pointer flex items-start space-x-2.5"
                  >
                    <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${p.color}`} />
                    <div>
                      <p className="font-bold text-neutral-200">{p.title}</p>
                      <p className="text-[10px] text-neutral-500 truncate mt-0.5">{p.text}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-white/[0.01] border border-white/5 text-neutral-400 space-y-1.5 text-[10px] font-mono leading-relaxed">
            <p className="font-bold text-neutral-200">MENTOR COGNITIVE BIO:</p>
            <p>• Model: Gemini 2.5 Active Core</p>
            <p>• Tuning: Human-centric execution workflows</p>
            <p>• Scope: Strict productivity structures</p>
          </div>
        </div>

        {/* Chat Scrolling Workspace (Right Col, flexible 2/3 wide) */}
        <div className="flex-1 flex flex-col bg-white/[0.02] border border-white/10 backdrop-blur-md rounded-3xl p-5 min-h-0 relative">
          
          <div className="flex-1 overflow-y-auto space-y-4 pr-1 mb-4" id="chat-scroller-messages">
            {chatHistory.length === 0 ? (
              <div className="p-12 text-center h-full flex flex-col items-center justify-center space-y-4">
                <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 animate-pulse">
                  <Brain className="w-10 h-10" />
                </div>
                <h4 className="text-base font-display font-black text-neutral-100 uppercase tracking-wider">Momentum Coaching Channel Active</h4>
                <p className="text-xs text-neutral-400 max-w-sm leading-relaxed font-medium">
                  Hi {userProfile?.name}! How can I assist you today? Select an exam blueprint preset on the left panel or type custom constraints into the message board below.
                </p>
              </div>
            ) : (
              chatHistory.map((msg) => {
                const isUser = msg.role === "user";
                return (
                  <div 
                    key={msg.id}
                    className={`flex items-start gap-3 max-w-[85%] ${isUser ? "ml-auto flex-row-reverse" : "mr-auto"}`}
                  >
                    {/* Badge */}
                    <div className={`p-2 rounded-xl flex-shrink-0 ${
                      isUser ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white" : "bg-[#0b0b14] border border-blue-900/40 text-blue-400"
                    }`}>
                      {isUser ? <User className="w-4 h-4" /> : <Brain className="w-4 h-4" />}
                    </div>

                    {/* Bubble */}
                    <div className={`p-4 rounded-2xl whitespace-pre-wrap text-xs sm:text-sm leading-relaxed ${
                      isUser 
                        ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-tr-none" 
                        : "bg-[#050510]/55 border border-white/[0.07] text-neutral-200 rounded-tl-none font-medium"
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                );
              })
            )}

            {/* AI Generator loader bubble */}
            {loading && (
              <div className="flex items-start gap-3 mr-auto max-w-[80%]">
                <div id="ai-loading-badge" className="p-1.5 bg-blue-950 border border-blue-800/40 text-blue-400 rounded-lg animate-spin">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="p-3.5 rounded-2xl rounded-tl-none bg-neutral-900/40 border border-neutral-850 text-neutral-500 italic text-xs animate-pulse">
                  Gemini Productivity coach is organizing diagnostic recommendations...
                </div>
              </div>
            )}
            
            <div ref={bottomRef} />
          </div>

          {/* Preset Buttons for mobile triggers */}
          <div className="lg:hidden flex space-x-2 overflow-x-auto pb-3 border-b border-neutral-900 mb-3 text-[10px]">
            {presets.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSend(p.text)}
                className="bg-neutral-900 px-3 py-1.5 rounded-full border border-neutral-800 text-neutral-400 truncate whitespace-nowrap"
              >
                {p.title}
              </button>
            ))}
          </div>

          {/* Form input bar */}
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(inputText); }}
            className="flex-shrink-0 flex items-center space-x-2 bg-neutral-950 p-2 rounded-xl border border-neutral-850"
            id="chat-input-form"
          >
            <input 
              type="text" 
              placeholder="State your focus blockages, target achievements, or ask regarding workload stress..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 bg-transparent text-white focus:outline-none text-xs sm:text-sm font-semibold px-2"
            />
            <button
              id="btn-send-message-coach"
              type="submit"
              disabled={loading || !inputText.trim()}
              className="p-3 bg-blue-600 hover:bg-blue-500 disabled:bg-neutral-800 text-white rounded-xl transition-all flex items-center justify-center cursor-pointer shadow shadow-blue-600/10"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
