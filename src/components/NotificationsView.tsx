import React, { useState } from "react";
import { 
  Bell, 
  Check, 
  Trash2, 
  Sparkles, 
  ShieldAlert, 
  Target, 
  Flame, 
  CheckSquare,
  Clock,
  MailOpen,
  Filter
} from "lucide-react";
import { SmartNotification } from "../types";

interface NotificationsViewProps {
  notifications: SmartNotification[];
  onMarkRead: (id: string) => Promise<void>;
  onMarkAllRead: () => Promise<void>;
  onClearAll: () => Promise<void>;
}

type CategoryFilter = "all" | "tasks" | "goals" | "habits" | "ai" | "rescue";

export default function NotificationsView({ 
  notifications, 
  onMarkRead, 
  onMarkAllRead, 
  onClearAll 
}: NotificationsViewProps) {
  const [filter, setFilter] = useState<CategoryFilter>("all");

  const filtered = notifications.filter(n => {
    if (filter === "all") return true;
    if (filter === "tasks" && n.category === "tasks") return true;
    if (filter === "goals" && n.category === "goals") return true;
    if (filter === "habits" && n.category === "habits") return true;
    if (filter === "ai" && n.category === "ai") return true;
    if (filter === "rescue" && n.category === "rescue") return true;
    return false;
  });

  const getCategoryTheme = (category: string) => {
    switch (category) {
      case "rescue": 
        return { icon: ShieldAlert, bg: "bg-red-500/15 border-red-500/30 text-red-400" };
      case "ai": 
        return { icon: Sparkles, bg: "bg-blue-500/15 border-blue-500/30 text-blue-400" };
      case "goals": 
        return { icon: Target, bg: "bg-amber-500/15 border-amber-500/30 text-amber-400" };
      case "habits": 
        return { icon: Flame, bg: "bg-pink-500/15 border-pink-500/30 text-pink-400" };
      default: 
        return { icon: CheckSquare, bg: "bg-purple-500/15 border-purple-500/30 text-purple-400" };
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-2">
      
      {/* Dynamic Upper Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-[#070715]/80 border border-indigo-950/40 rounded-3xl">
        <div className="flex items-center space-x-3.5">
          <div className="p-3 bg-indigo-600/10 border border-indigo-550/20 rounded-2xl flex-shrink-0">
            <Bell className="w-5.5 h-5.5 text-indigo-400 animate-swing" />
          </div>
          <div>
            <h1 className="text-base font-black text-white font-display uppercase tracking-wide leading-none">
              Communication Center
            </h1>
            <p className="text-[10px] text-neutral-400 mt-1 font-medium">
              You have <strong className="text-indigo-300 font-mono font-bold">{unreadCount} unread</strong> notification alerts logged in this session workspace.
            </p>
          </div>
        </div>

        {/* Global Action buttons */}
        <div className="flex items-center gap-1.5 self-end sm:self-auto flex-wrap">
          <button
            onClick={onMarkAllRead}
            disabled={unreadCount === 0}
            className="px-3.5 py-1.5 bg-indigo-600/15 hover:bg-indigo-600/25 disabled:opacity-30 border border-indigo-500/30 disabled:border-indigo-500/10 text-indigo-300 font-bold text-[9px] uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Check className="w-3 h-3" />
            <span>Mark all read</span>
          </button>
          
          <button
            onClick={onClearAll}
            disabled={notifications.length === 0}
            className="px-3.5 py-1.5 bg-neutral-900 hover:bg-neutral-850 disabled:opacity-30 border border-neutral-800 text-neutral-400 hover:text-white font-bold text-[9px] uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Trash2 className="w-3 h-3" />
            <span>Clear archives</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs Row */}
      <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 select-none scrollbar-none">
        {[
          { id: "all", label: "All Logs" },
          { id: "rescue", label: "Alerts" },
          { id: "tasks", label: "Tasks" },
          { id: "goals", label: "Goals" },
          { id: "habits", label: "Habits" },
          { id: "ai", label: "AI Advice" }
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setFilter(item.id as CategoryFilter)}
            className={`px-3.5 py-1.5 rounded-xl text-[9px] font-bold uppercase tracking-wider transition-all cursor-pointer flex-shrink-0 ${
              filter === item.id 
                ? "bg-indigo-600 border border-indigo-400/25 text-white"
                : "bg-[#060611] hover:bg-neutral-900 border border-neutral-900 text-neutral-400"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Main Notifications Stack */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="p-12 border-2 border-dashed border-neutral-900 rounded-3xl text-center space-y-3 bg-[#04040a]/20">
            <div className="p-3 bg-neutral-900 inline-block rounded-full">
              <MailOpen className="w-6 h-6 text-neutral-600" />
            </div>
            <div className="space-y-1">
              <h4 className="text-xs font-black text-neutral-300 uppercase tracking-wide">
                No notification alerts found
              </h4>
              <p className="text-[10px] text-neutral-500 max-w-xs mx-auto leading-normal">
                There are no actions requiring immediate alerts inside your {filter !== "all" ? `'${filter}'` : ""} catalog.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((n) => {
              const { icon: CategoryIcon, bg: themeClass } = getCategoryTheme(n.category);
              return (
                <div 
                  key={n.notificationId || n.id}
                  className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-4 ${
                    n.read 
                      ? "bg-[#050510]/30 border-neutral-900 opacity-60 hover:opacity-90" 
                      : "bg-[#08081c]/80 border-indigo-950/80 shadow-md shadow-indigo-650/5 hover:-translate-y-0.5"
                  }`}
                >
                  <div className="flex items-start space-x-3.5 min-w-0 flex-1">
                    {/* Badge Category Icon */}
                    <div className={`p-2 rounded-xl border flex-shrink-0 mt-0.5 ${themeClass}`}>
                      <CategoryIcon className="w-4 h-4" />
                    </div>

                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                        <span className="text-[8px] uppercase font-mono font-black text-indigo-400 tracking-wider">
                          {n.category}
                        </span>
                        {!n.read && (
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                        )}
                      </div>
                      
                      <h4 className={`text-xs font-bold leading-normal text-neutral-100`}>
                        {n.title}
                      </h4>
                      
                      <p className="text-[10px] text-neutral-400 leading-normal font-sans font-medium">
                        {n.message}
                      </p>

                      <div className="flex items-center space-x-2 text-[8px] text-neutral-500 font-mono pt-1">
                        <Clock className="w-3 h-3 text-neutral-600" />
                        <span>{new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  </div>

                  {/* Mark single as Read button */}
                  {!n.read && (
                    <button
                      onClick={() => onMarkRead(n.notificationId || n.id || "")}
                      className="p-1.5 rounded-lg bg-indigo-950/35 hover:bg-indigo-600/20 border border-indigo-900/40 text-indigo-300 hover:text-white transition-all cursor-pointer flex-shrink-0"
                      title="Mark as read"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
