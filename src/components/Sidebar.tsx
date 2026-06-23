import React from "react";
import { 
  LayoutDashboard, 
  CheckSquare, 
  Calendar, 
  MessageSquare, 
  Target, 
  Flame, 
  BarChart2, 
  User, 
  Settings, 
  LogOut,
  Sparkles,
  Award
} from "lucide-react";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  userProfile: { name: string; email: string; productivityScore: number; profession?: string } | null;
  onLogout: () => void;
}

export default function Sidebar({ activeTab, onTabChange, userProfile, onLogout }: SidebarProps) {
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, color: "text-indigo-400" },
    { id: "tasks", label: "Task Management", icon: CheckSquare, color: "text-purple-400" },
    { id: "planner", label: "AI Planner", icon: Calendar, color: "text-emerald-400" },
    { id: "coach", label: "AI Coach Chat", icon: MessageSquare, color: "text-blue-400" },
    { id: "goals", label: "Goal Roadmaps", icon: Target, color: "text-yellow-400" },
    { id: "habits", label: "Habit Tracker", icon: Flame, color: "text-pink-400" },
    { id: "analytics", label: "Analytics Hub", icon: BarChart2, color: "text-cyan-400" },
    { id: "profile", label: "UserProfile", icon: User, color: "text-neutral-300" },
    { id: "settings", label: "Settings", icon: Settings, color: "text-neutral-400" },
  ];

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      onLogout();
    } catch (error) {
      console.error("Logout failure:", error);
    }
  };

  return (
    <aside id="app-sidebar" className="w-64 bg-[#050510]/60 backdrop-blur-xl border-r border-white/10 flex flex-col h-screen sticky top-0 flex-shrink-0 z-30">
      
      {/* Platform Branding Title */}
      <div className="p-6 border-b border-white/10 flex items-center space-x-2.5">
        <div className="p-1.5 bg-gradient-to-tr from-purple-600 to-indigo-500 rounded-xl shadow-lg">
          <Sparkles className="w-4 h-4 text-white animate-pulse" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-display font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white to-neutral-400">MOMENTUM AI</span>
          <span className="text-[9px] font-mono text-indigo-400 font-extrabold uppercase tracking-widest leading-none mt-0.5">workspace v2.5</span>
        </div>
      </div>

      {/* User Progress Mini Badge */}
      {userProfile && (
        <div className="px-6 py-4 border-b border-white/5">
          <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/15 flex items-center space-x-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-purple-600/20 to-indigo-600/20 border border-white/20 flex items-center justify-center font-display font-bold text-indigo-300 text-xs">
              {userProfile.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-display font-bold text-neutral-100 truncate">{userProfile.name}</h4>
              <p className="text-[9px] text-neutral-500 font-semibold truncate mt-0.5">{userProfile.profession || "Ambitious Leader"}</p>
            </div>
            <div className="flex flex-col items-center flex-shrink-0 bg-indigo-500/10 border border-indigo-500/20 px-2 py-1 rounded-lg">
              <span className="text-[8px] text-neutral-400 font-mono tracking-wide leading-none">SCORE</span>
              <span className="text-xs font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400 font-mono mt-0.5">{userProfile.productivityScore}</span>
            </div>
          </div>
        </div>
      )}

      {/* Navigation list */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              id={`sidebar-tab-${item.id}`}
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center space-x-3 px-3.5 py-3 rounded-xl text-[11px] font-display font-bold tracking-tight transition-all uppercase cursor-pointer group ${
                isActive 
                  ? "bg-white/10 border border-white/15 text-white shadow-lg" 
                  : "bg-transparent border border-transparent text-neutral-400 hover:text-white hover:bg-white/5 hover:scale-[1.01]"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? item.color : "text-neutral-500 group-hover:text-neutral-300"}`} />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Log out footer */}
      <div className="p-4 border-t border-white/5 bg-transparent">
        <button
          id="btn-sidebar-logout"
          onClick={handleSignOut}
          className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-[10px] font-display font-bold text-red-400 hover:text-red-300 hover:bg-red-950/25 border border-transparent hover:border-red-900/35 transition-all uppercase cursor-pointer"
        >
          <LogOut className="w-4 h-4 text-red-400" />
          <span>Leave workspace</span>
        </button>
      </div>
    </aside>
  );
}
