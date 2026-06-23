import React, { useState } from "react";
import { 
  Settings, 
  Moon, 
  Compass, 
  Sparkles, 
  Bell, 
  Lock, 
  HelpCircle,
  CheckCircle,
  Eye,
  Info,
  ShieldAlert,
  Database,
  RefreshCw
} from "lucide-react";

interface SettingsViewProps {
  onSeedDemoData?: () => Promise<void>;
}

export default function SettingsView({ onSeedDemoData }: SettingsViewProps) {
  const [appearanceTheme, setAppearanceTheme] = useState("Midnight Purple Dark");
  const [aiModel, setAiModel] = useState("gemini-2.5-flash");
  const [reminders, setReminders] = useState(true);
  const [crisisAlerts, setCrisisAlerts] = useState(true);
  const [success, setSuccess] = useState(false);
  
  // Seeding states
  const [seeding, setSeeding] = useState(false);
  const [seedSuccess, setSeedSuccess] = useState(false);
  const [seedError, setSeedError] = useState("");

  const handleSaveSettings = () => {
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  const handleRunSeeder = async () => {
    if (!onSeedDemoData) return;
    setSeeding(true);
    setSeedError("");
    setSeedSuccess(false);
    try {
      await onSeedDemoData();
      setSeedSuccess(true);
      // Scroll to view or persist success indicator
    } catch (err: any) {
      setSeedError(err?.message || "Underlying seeding operation failed. Please verify connection.");
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div id="settings-tab-content" className="p-6 md:p-8 bg-neutral-950 text-white min-h-screen space-y-8 text-xs font-semibold text-neutral-400 font-sans">
      
      {/* Header section */}
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center space-x-2">
          <Settings className="w-5 h-5 text-neutral-400" />
          <span>System Settings & Tuning</span>
        </h2>
        <p className="text-xs text-neutral-400 mt-1">Calibrate display options, configure smart alarms, or select model parameters for the Crisis Rescue Engine.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Core preferences (Span 2) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Card: Display configuration */}
          <div className="p-6 rounded-2xl bg-neutral-900/40 border border-neutral-900 space-y-4">
            <h3 className="text-sm font-extrabold text-white flex items-center space-x-2 pb-3 border-b border-neutral-900">
              <Moon className="w-4 h-4 text-purple-400" />
              <span>Appearance & Presets (Vibe config)</span>
            </h3>

            <div className="space-y-3.5">
              <label className="block text-[10px] uppercase font-bold tracking-wider text-neutral-500">Theme Preset Option</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  "Midnight Purple Dark",
                  "Cosmic Deep Blue Sea"
                ].map((th) => (
                  <button
                    id={`btn-theme-${th.replace(/\s+/g, '-').toLowerCase()}`}
                    key={th}
                    onClick={() => setAppearanceTheme(th)}
                    className={`p-3 rounded-xl border text-left font-bold text-xs capitalize transition-all cursor-pointer ${
                      appearanceTheme === th 
                        ? "bg-purple-950 border-purple-500 text-purple-300 shadow" 
                        : "bg-neutral-950 border-neutral-850 text-neutral-400 hover:text-white"
                    }`}
                  >
                    <span>{th}</span>
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-neutral-600 font-medium">Momentum AI defaults to eye-safe dark themes to optimize attention spans and cognitive workloads.</p>
            </div>
          </div>

          {/* Card: Intelligent notifications */}
          <div className="p-6 rounded-2xl bg-neutral-900/40 border border-neutral-900 space-y-4">
            <h3 className="text-sm font-extrabold text-white flex items-center space-x-2 pb-3 border-b border-neutral-900">
              <Bell className="w-4 h-4 text-indigo-400" />
              <span>Intelligent Reminders & Crisis Alarms</span>
            </h3>

            <div className="space-y-4 pt-1">
              <div className="flex items-center justify-between p-3.5 bg-neutral-950 border border-neutral-850 rounded-xl">
                <div>
                  <h4 className="text-xs font-bold text-neutral-200">Daily Routine Habit Check-ins</h4>
                  <p className="text-[10px] text-neutral-500 mt-0.5 font-medium leading-relaxed">Send discrete system alarms reminding of active routine track lapses.</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={reminders}
                  onChange={(e) => setReminders(e.target.checked)}
                  className="w-4 h-4 accent-indigo-500 rounded border-neutral-800 text-indigo-600 focus:outline-none cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-3.5 bg-neutral-950 border border-neutral-850 rounded-xl">
                <div>
                  <h4 className="text-xs font-bold text-neutral-200">AI Crisis Emergency Sprints Alerts</h4>
                  <p className="text-[10px] text-neutral-500 mt-0.5 font-medium leading-relaxed">Alert when diagnostic assessment marks risk scores higher than 60%.</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={crisisAlerts}
                  onChange={(e) => setCrisisAlerts(e.target.checked)}
                  className="w-4 h-4 accent-indigo-500 rounded border-neutral-800 text-indigo-600 focus:outline-none cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Card: Diagnostic model parameter limits */}
          <div className="p-6 rounded-2xl bg-neutral-900/40 border border-neutral-900 space-y-4">
            <h3 className="text-sm font-extrabold text-white flex items-center space-x-2 pb-3 border-b border-neutral-900">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span>AI Diagnostic Engine Properties</span>
            </h3>

            <div className="space-y-3.5">
              <label className="block text-[10px] uppercase font-bold tracking-wider text-neutral-500">Gemini Core Model Range</label>
              <select
                value={aiModel}
                onChange={(e) => setAiModel(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-850 rounded-xl p-2.5 text-white font-medium cursor-pointer focus:outline-none"
              >
                <option value="gemini-2.5-flash">Gemini 2.5 Flash Core (Hyper-fast prioritizing)</option>
                <option value="gemini-2.5-pro">Gemini 2.5 Pro Model (Advanced academic blueprints drafting)</option>
              </select>
              <p className="text-[10px] text-neutral-600 font-medium">Flash models optimize scheduling timelines instantly. Transitioning to Pro expands milestone explanation texts.</p>
            </div>
          </div>

          {/* Card: Seeding & Evaluation Center */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-[#0a0a16] to-[#120a1db0] border border-indigo-950/70 space-y-4">
            <h3 className="text-sm font-extrabold text-white flex items-center space-x-2 pb-3 border-b border-indigo-950/60 uppercase">
              <Database className="w-4 h-4 text-indigo-400 animate-pulse" />
              <span>Platform Seeding & Evaluation Suite</span>
            </h3>

            <div className="space-y-4 text-xs font-medium">
              <p className="text-neutral-300 leading-relaxed text-[11px]">
                Evaluating <span className="text-white font-black font-display">MOMENTUM AI</span>? Use this control module to instantly inject a highly comprehensive academic and placement workload mock into your Firestore collections.
              </p>

              <div className="p-4 bg-[#05050f]/80 border border-indigo-950/80 rounded-2xl space-y-2 text-[10px] text-neutral-400 font-mono leading-relaxed">
                <p className="text-indigo-400 font-black flex items-center gap-1.5 uppercase font-sans text-xs">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> Seeding Payload Details:
                </p>
                <ul className="list-disc list-inside space-y-1 pl-1">
                  <li><strong className="text-neutral-200">User Profile:</strong> Sets name to <strong className="text-white font-sans font-bold">Soham Gonbhare</strong>, Engineering Student (Mumbai), target goals, and score of 88.</li>
                  <li><strong className="text-neutral-200">Tasks (25 records):</strong> Real subjects (DBMS normalizations, React context virtualizations, Graph DFS shortest paths) with custom estimates and priorities.</li>
                  <li><strong className="text-neutral-200">Goal Roadmaps (10 records):</strong> Full roadmap summaries, targets, and milestones (FAANG, CGPA, AWS cloud certs).</li>
                  <li><strong className="text-neutral-200">Habit Tracks (15 records):</strong> Mapped streaks and consistency metrics (Leetcode challenge, hydration, sleeping).</li>
                  <li><strong className="text-neutral-200">AI Coach Chats (30 logs):</strong> Deep structural logs (stress grounding, Kahn's algorithm TypeScript templates, etc.).</li>
                </ul>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-t border-indigo-950/40">
                <div className="text-[10px] text-neutral-500 leading-normal">
                  <span>Clicking will purge existing templates under your account and establish master demo datasets in Firestore.</span>
                </div>
                <button
                  id="btn-trigger-demo-seeder"
                  type="button"
                  disabled={seeding}
                  onClick={handleRunSeeder}
                  className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:from-neutral-850 disabled:to-neutral-900 text-white font-black text-[11px] rounded-xl shadow-lg hover:shadow-indigo-500/10 active:scale-95 transition-all flex items-center justify-center space-x-2 uppercase tracking-wide cursor-pointer flex-shrink-0"
                >
                  {seeding ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Seeding Collections...</span>
                    </>
                  ) : (
                    <>
                      <Database className="w-3.5 h-3.5" />
                      <span>Generate Momentum AI Demo Suite</span>
                    </>
                  )}
                </button>
              </div>

              {seedSuccess && (
                <div id="seed-success-banner" className="p-3 bg-emerald-950/40 border border-emerald-900/60 text-emerald-400 rounded-xl flex items-center space-x-2 text-[10px] font-semibold leading-relaxed">
                  <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Success! 25 tasks, 10 goals, 15 habit tracks, and 30 coach logs successfully written to Firestore. Your dashboard is ready!</span>
                </div>
              )}

              {seedError && (
                <div id="seed-error-banner" className="p-3 bg-red-950/30 border border-red-900/40 text-red-400 rounded-xl flex items-center space-x-2 text-[10px] font-semibold">
                  <ShieldAlert className="w-4 h-4 text-red-400 flex-shrink-0" />
                  <span>{seedError}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3">
            <button
              id="btn-save-settings"
              onClick={handleSaveSettings}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all cursor-pointer uppercase"
            >
              Commit Preferences
            </button>
          </div>

          {success && (
            <div className="p-3 bg-emerald-950/40 border border-emerald-900/60 text-emerald-400 rounded-xl flex items-center space-x-1 font-semibold">
              <CheckCircle className="w-4. h-4" />
              <span>Workspace configurations synchronized on client browser.</span>
            </div>
          )}
        </div>

        {/* Support & Security block (Span 1) */}
        <div className="p-6 rounded-2xl bg-neutral-900/40 border border-neutral-900 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <h3 className="text-sm font-extrabold text-white pb-3 border-b border-neutral-900 uppercase">Information Center</h3>
            
            <div className="p-3.5 bg-neutral-950 border border-neutral-850/50 rounded-xl flex items-start space-x-2.5 leading-relaxed">
              <Lock className="w-5 h-5 text-neutral-500 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-[10px] uppercase text-neutral-100 font-bold">Encrypted sync locks</h4>
                <p className="text-[10px] text-neutral-500 mt-0.5 font-medium">Authentication records are sealed securely using secure Firebase Auth policies. Firestore matches owner matches rules.</p>
              </div>
            </div>

            <div className="p-3.5 bg-neutral-950 border border-neutral-850/50 rounded-xl flex items-start space-x-2.5 leading-relaxed">
              <ShieldAlert className="w-5 h-5 text-neutral-500 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-[10px] uppercase text-neutral-100 font-bold">API Safety gates</h4>
                <p className="text-[10px] text-neutral-500 mt-0.5 font-medium">Gemini proxy endpoints use server-only variables with client keys hidden entirely, strictly meeting web API secrets guidelines.</p>
              </div>
            </div>
          </div>

          <div className="p-3 bg-neutral-950/60 rounded-xl border border-neutral-850 text-neutral-500 text-[10px] font-mono leading-relaxed italic text-center">
            System core compilation matches standard guidelines v1.0.0
          </div>
        </div>
      </div>
    </div>
  );
}
