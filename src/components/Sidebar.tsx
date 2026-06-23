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
  ShieldAlert,
  Bell,
  X
} from "lucide-react";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  userProfile: { name: string; email: string; productivityScore: number; profession?: string } | null;
  onLogout: () => void;
  unreadNotificationsCount: number;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export default function Sidebar({ 
  activeTab, 
  onTabChange, 
  userProfile, 
  onLogout,
  unreadNotificationsCount,
  mobileOpen,
  onMobileClose
}: SidebarProps) {
  
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, color: "text-indigo-400" },
    { id: "tasks", label: "Tasks", icon: CheckSquare, color: "text-purple-400" },
    { id: "goals", label: "Goals", icon: Target, color: "text-amber-400" },
    { id: "habits", label: "Habits", icon: Flame, color: "text-pink-400" },
    { id: "planner", label: "Calendar Planner", icon: Calendar, color: "text-emerald-400" },
    { id: "rescue", label: "Rescue Mode", icon: ShieldAlert, color: "text-red-400", accent: "font-bold text-red-400" },
    { id: "analytics", label: "Analytics", icon: BarChart2, color: "text-cyan-400" },
    { id: "coach", label: "AI Coach", icon: MessageSquare, color: "text-blue-400" },
    { id: "notifications", label: "Notifications", icon: Bell, color: "text-yellow-400", badge: unreadNotificationsCount },
    { id: "profile", label: "Profile", icon: User, color: "text-neutral-300" },
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

  const menuList = (
    <div className="flex flex-col h-full bg-[#050510]/95 backdrop-blur-2xl border-r border-[#1e1a38]/80 text-white select-none">
      {/* Header / Brand */}
      <div className="p-5 border-b border-indigo-950/40 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 bg-gradient-to-tr from-purple-600 to-indigo-500 rounded-xl shadow-lg shadow-indigo-600/20">
            <Sparkles className="w-4.5 h-4.5 text-white animate-pulse" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-sans font-black tracking-widest text-white leading-none">MOMENTUM AI</span>
            <span className="text-[8px] font-mono text-indigo-400 font-extrabold uppercase tracking-widest mt-1">SaaS Copilot v3.0</span>
          </div>
        </div>
        
        {/* Mobile close button */}
        <button 
          onClick={onMobileClose} 
          className="md:hidden p-1.5 rounded-lg bg-neutral-800/40 border border-neutral-700/30 text-neutral-400 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Profile summary banner */}
      {userProfile && (
        <div className="px-5 py-4 border-b border-[#1e1a38]/40">
          <div className="p-3 rounded-xl bg-white/[0.02] border border-indigo-950/40 flex items-center space-x-3 hover:bg-white/[0.04] transition-colors duration-150">
            <div className="w-8.5 h-8.5 rounded-lg bg-gradient-to-tr from-purple-500/20 to-indigo-500/10 border border-indigo-500/30 flex items-center justify-center font-bold text-indigo-300 text-xs">
              {userProfile.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-bold text-white truncate">{userProfile.name}</h4>
              <p className="text-[9px] text-[#8c8cb3] font-medium truncate mt-0.5">{userProfile.profession || "Workspace Leader"}</p>
            </div>
            <div className="flex flex-col items-center flex-shrink-0 bg-indigo-500/10 border border-indigo-550/25 px-1.5 py-0.5 rounded">
              <span className="text-[7px] text-gray-400 font-mono tracking-wider leading-none">SCORE</span>
              <span className="text-xs font-black text-indigo-300 font-mono mt-0.5">{userProfile.productivityScore}</span>
            </div>
          </div>
        </div>
      )}

      {/* Nav Menu Scrollable Area */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-thin">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              id={`sidebar-tab-${item.id}`}
              key={item.id}
              onClick={() => {
                onTabChange(item.id);
                onMobileClose();
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-[11px] font-semibold tracking-tight transition-all duration-155 cursor-pointer uppercase group ${
                isActive 
                  ? "bg-indigo-600/90 border border-indigo-400/20 text-white shadow-md shadow-indigo-600/10" 
                  : "bg-transparent border border-transparent text-neutral-400 hover:text-white hover:bg-[#121326]/60 hover:translate-x-1"
              }`}
            >
              <div className="flex items-center space-x-3.5">
                <Icon className={`w-4 h-4 ${isActive ? "text-white" : `${item.color} group-hover:scale-110 transition-transform duration-150`}`} />
                <span className={item.accent || ""}>{item.label}</span>
              </div>
              
              {/* Badge for Notifications or unread items */}
              {item.badge !== undefined && item.badge > 0 && (
                <span className={`px-2 py-0.5 text-[9px] font-mono font-black rounded-full leading-none flex items-center justify-center ${
                  isActive ? "bg-white text-indigo-600" : "bg-red-500/20 border border-red-500/60 text-red-400"
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Workspace Footer / Signout */}
      <div className="p-4 border-t border-[#1e1a38]/40 bg-black/10">
        <button
          id="btn-sidebar-logout"
          onClick={handleSignOut}
          className="w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-[10px] font-bold text-red-400/90 hover:text-red-300 hover:bg-red-950/20 border border-transparent hover:border-red-900/35 transition-all uppercase cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Exit workspace</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar Sidebar Container */}
      <aside 
        id="app-sidebar-desktop" 
        className="hidden md:flex flex-col w-64 h-screen sticky top-0 flex-shrink-0 z-30 transition-all duration-300 border-r border-[#1e1a38]/60"
      >
        {menuList}
      </aside>

      {/* Mobile Drawer Slide Panel overlay */}
      {mobileOpen && (
        <div 
          onClick={onMobileClose}
          className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-xs transition-opacity duration-200" 
        />
      )}
      
      <div 
        id="app-sidebar-mobile"
        className={`md:hidden fixed top-0 bottom-0 left-0 w-64 z-50 transition-transform duration-300 transform ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {menuList}
      </div>
    </>
  );
}
