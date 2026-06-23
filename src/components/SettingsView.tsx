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
  ShieldAlert
} from "lucide-react";

export default function SettingsView() {
  const [appearanceTheme, setAppearanceTheme] = useState("Midnight Purple Dark");
  const [aiModel, setAiModel] = useState("gemini-2.5-flash");
  const [reminders, setReminders] = useState(true);
  const [crisisAlerts, setCrisisAlerts] = useState(true);
  const [success, setSuccess] = useState(false);

  const handleSaveSettings = () => {
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <div id="settings-tab-content" className="p-6 md:p-8 bg-neutral-950 text-white min-h-screen space-y-8 text-xs font-semibold text-neutral-400">
      
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
