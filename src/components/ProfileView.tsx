import React, { useState } from "react";
import { 
  User, 
  Mail, 
  School, 
  Briefcase, 
  Award, 
  Calendar, 
  Download, 
  CheckCircle,
  TrendingUp,
  Sparkles,
  Zap,
  CheckCircle2,
  Lock
} from "lucide-react";
import { UserProfile, Task, Goal, Habit } from "../types";

interface ProfileViewProps {
  userProfile: UserProfile | null;
  tasks: Task[];
  goals: Goal[];
  habits: Habit[];
  onUpdateProfile: (updatedFields: Partial<UserProfile>) => Promise<void>;
}

export default function ProfileView({
  userProfile,
  tasks,
  goals,
  habits,
  onUpdateProfile
}: ProfileViewProps) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(userProfile?.name || "");
  const [college, setCollege] = useState(userProfile?.college || "");
  const [profession, setProfession] = useState(userProfile?.profession || "Student");
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Stats calculators
  const completedTasksCount = tasks.filter(t => t.status === "completed").length;
  const activeHabitsCount = habits.length;
  const activeGoalsCount = goals.length;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    try {
      await onUpdateProfile({
        name,
        college,
        profession
      });
      setSuccess(true);
      setEditing(false);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Export Data: Single Click download of JSON bundle pack
  const handleExportData = () => {
    const dataBundle = {
      profile: userProfile,
      tasks: tasks,
      goals: goals,
      habits: habits,
      exportedAt: new Date().toISOString(),
      platform: "Momentum AI Workspace v2.5"
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(dataBundle, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `momentum_ai_workspace_export_${userProfile?.uid || "user"}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div id="profile-tab-content" className="p-6 md:p-8 bg-neutral-950 text-white min-h-screen space-y-8 text-xs font-semibold text-neutral-400">
      
      {/* Header section */}
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center space-x-2">
          <User className="w-5 h-5 text-neutral-300" />
          <span>Momentum Profile & Strategy Stats</span>
        </h2>
        <p className="text-xs text-neutral-400 mt-1">Configure physical parameters, view momentum score analytics, and obtain complete database exports.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Core details & Edit panel (Span 2) */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-neutral-900/40 border border-neutral-900 space-y-6">
          <div className="flex justify-between items-center pb-4 border-b border-neutral-900">
            <h3 className="text-sm font-extrabold text-white">Identity Dossier</h3>
            {!editing && (
              <button 
                id="btn-edit-profile-open"
                onClick={() => setEditing(true)}
                className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-xl text-neutral-300 hover:text-white transition-all cursor-pointer text-xs font-bold"
              >
                Modify Identity
              </button>
            )}
          </div>

          {editing ? (
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider mb-1.5 text-neutral-500">FullName Dossier *</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-4 h-4 text-neutral-500" />
                  <input 
                    type="text" 
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-850 rounded-xl py-2.5 pl-10 pr-4 text-white text-xs font-medium focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-wider mb-1.5 text-neutral-500">College / Company</label>
                  <div className="relative">
                    <School className="absolute left-3 top-3 w-4 h-4 text-neutral-500" />
                    <input 
                      type="text" 
                      value={college}
                      onChange={(e) => setCollege(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-850 rounded-xl py-2.5 pl-10 pr-4 text-white text-xs font-medium focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-wider mb-1.5 text-neutral-500">Profession Range</label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-3 w-4 h-4 text-neutral-500" />
                    <select
                      value={profession}
                      onChange={(e) => setProfession(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-850 rounded-xl py-2.5 pl-10 pr-4 text-white text-xs font-medium focus:outline-none cursor-pointer"
                    >
                      <option value="Student">Student</option>
                      <option value="Researcher">Researcher</option>
                      <option value="Entrepreneur">Entrepreneur</option>
                      <option value="Engineer">Engineer</option>
                      <option value="Manager">Manager</option>
                      <option value="Freelancer">Freelancer</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setEditing(false); setName(userProfile?.name || ""); }}
                  className="px-4 py-2.5 bg-neutral-805 hover:bg-neutral-800 text-neutral-300 font-bold text-xs rounded-xl"
                >
                  Discard Changes
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl cursor-pointer"
                >
                  {loading ? "Syncing..." : "Commit Modifications"}
                </button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 leading-relaxed">
              <div className="flex items-center space-x-3.5 p-3.5 rounded-xl bg-neutral-950/60 border border-neutral-850/40">
                <User className="w-5 h-5 text-indigo-400 flex-shrink-0" />
                <div>
                  <span className="text-[10px] uppercase font-bold text-neutral-500">Full Name</span>
                  <p className="text-neutral-200 mt-0.5">{userProfile?.name}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3.5 p-3.5 rounded-xl bg-neutral-950/60 border border-neutral-850/40">
                <Mail className="w-5 h-5 text-indigo-400 flex-shrink-0" />
                <div>
                  <span className="text-[10px] uppercase font-bold text-neutral-500">Registered Email</span>
                  <p className="text-neutral-200 mt-0.5 mt-0.5">{userProfile?.email}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3.5 p-3.5 rounded-xl bg-neutral-950/60 border border-neutral-850/40">
                <School className="w-5 h-5 text-indigo-400 flex-shrink-0" />
                <div>
                  <span className="text-[10px] uppercase font-bold text-neutral-500">College / Organization</span>
                  <p className="text-neutral-200 mt-0.5">{userProfile?.college || "N/A"}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3.5 p-3.5 rounded-xl bg-neutral-950/60 border border-neutral-850/40">
                <Briefcase className="w-5 h-5 text-indigo-400 flex-shrink-0" />
                <div>
                  <span className="text-[10px] uppercase font-bold text-neutral-500">Profession</span>
                  <p className="text-neutral-200 mt-0.5">{userProfile?.profession || "Strategic Learner"}</p>
                </div>
              </div>
            </div>
          )}

          {success && (
            <div className="p-3 bg-emerald-950/40 border border-emerald-900/60 text-emerald-400 rounded-xl flex items-center space-x-1 font-semibold">
              <CheckCircle className="w-4 h-4" />
              <span>Dossier successfully updated on database registry.</span>
            </div>
          )}

          {/* Export Action block */}
          <div className="pt-6 border-t border-neutral-900/85">
            <h4 className="text-xs font-extrabold text-white mb-2">Export Workspace Logs</h4>
            <p className="text-xs text-neutral-500 leading-relaxed mb-4">
              Obtain complete local copies of active tasks, milestones achievements, habit trackers streaks configurations, and biological parameters formatted cleanly as structured JSON arrays.
            </p>
            <button
              id="btn-export-dossier"
              onClick={handleExportData}
              className="px-5 py-3 bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 text-neutral-200 font-bold hover:text-white rounded-xl flex items-center space-x-2 cursor-pointer transition-all uppercase text-[11px]"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>Initiate Database Pack Export (.json)</span>
            </button>
          </div>
        </div>

        {/* Profile Stats Overview Widget (Span 1) */}
        <div className="p-6 rounded-2xl bg-neutral-900/40 border border-neutral-900 flex flex-col justify-between text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-bl-full pointer-events-none" />
          
          <div>
            <h3 className="text-sm font-extrabold text-white pb-3 border-b border-neutral-900 uppercase">Velocity Portfolio</h3>
            
            <div className="py-6 flex flex-col items-center">
              <div className="p-4 bg-indigo-950 border border-indigo-800/40 rounded-full text-indigo-400 mb-2">
                <Award className="w-8 h-8 animate-pulse" />
              </div>
              <span className="text-2xl font-black font-mono text-indigo-400 leading-none">{userProfile?.productivityScore || 78}</span>
              <span className="text-[9px] uppercase tracking-wider text-neutral-500 mt-1 font-bold">Productivity Momentum index</span>
            </div>

            <div className="space-y-3.5 pt-2">
              <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-950 border border-neutral-850/60 text-xs">
                <span className="text-neutral-500">Tasks Completed</span>
                <span className="font-bold text-neutral-300 font-mono">{completedTasksCount} items</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-950 border border-neutral-850/60 text-xs">
                <span className="text-neutral-500">Habits Tracked</span>
                <span className="font-bold text-neutral-300 font-mono">{activeHabitsCount} logs</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-950 border border-neutral-850/60 text-xs">
                <span className="text-neutral-500">Active Strategic Boards</span>
                <span className="font-bold text-neutral-300 font-mono">{activeGoalsCount} boards</span>
              </div>
            </div>
          </div>

          <div className="p-3 bg-neutral-950/60 rounded-xl border border-neutral-850 text-neutral-500 mt-6 text-[10px] font-mono leading-relaxed italic">
            Joined Platform: {userProfile ? new Date(userProfile.createdAt).toLocaleDateString() : new Date().toLocaleDateString()}
          </div>
        </div>
      </div>
    </div>
  );
}
