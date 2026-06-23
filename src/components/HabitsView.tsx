import React, { useState } from "react";
import { 
  Flame, 
  Plus, 
  Trash2, 
  Check, 
  Calendar, 
  Activity, 
  TrendingUp, 
  Award,
  Sparkles,
  Info,
  X
} from "lucide-react";
import { Habit } from "../types";

interface HabitsViewProps {
  habits: Habit[];
  onAddHabit: (habit: Omit<Habit, "habitId" | "currentStreak" | "longestStreak" | "consistencyScore" | "history">) => Promise<void>;
  onToggleHabit: (habitId: string, dateStr: string) => Promise<void>;
  onDeleteHabit: (habitId: string) => Promise<void>;
}

export default function HabitsView({
  habits,
  onAddHabit,
  onToggleHabit,
  onDeleteHabit
}: HabitsViewProps) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [habitName, setHabitName] = useState("");
  const [frequency, setFrequency] = useState<"daily" | "weekly">("daily");
  const [target, setTarget] = useState(5); // target actions per period

  const todayStr = new Date().toISOString().split("T")[0];
  const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split("T")[0];
  const twoDaysAgoStr = new Date(Date.now() - 172800000).toISOString().split("T")[0];

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!habitName) return;

    try {
      await onAddHabit({
        habitName,
        frequency,
        target: Number(target)
      });
      setHabitName("");
      setTarget(5);
      setIsAddOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div id="habits-tab-content" className="p-6 md:p-8 bg-neutral-950 text-white min-h-screen space-y-8 text-xs font-semibold text-neutral-400">
      
      {/* Header sections */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center space-x-2">
            <Flame className="w-5 h-5 text-pink-500 animate-pulse" />
            <span>Habits consistency engine</span>
          </h2>
          <p className="text-xs text-neutral-400 mt-1">Configure academic routines, sleep profiles, or exercise checkpoints. Keep streaks to boost cognitive score index.</p>
        </div>

        <button
          id="btn-add-habit-open"
          onClick={() => setIsAddOpen(true)}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-white font-bold text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer shadow shadow-indigo-600/20"
        >
          <Plus className="w-4 h-4" />
          <span>Track New Habit</span>
        </button>
      </div>

      {/* Grid listing habits parameters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="habits-list-grid">
        {habits.length === 0 ? (
          <div className="md:col-span-2 lg:col-span-3 p-12 bg-neutral-900/10 rounded-2xl border border-neutral-900 text-center">
            <p className="text-sm font-semibold text-neutral-400">No recurring habits configured inside workspace.</p>
            <p className="text-xs text-neutral-500 mt-1">Create a physical or academic ritual above to start logging streaks.</p>
          </div>
        ) : (
          habits.map(habit => {
            const hasDoneToday = !!habit.history[todayStr];
            const hasDoneYesterday = !!habit.history[yesterdayStr];
            const hasDoneTwoDaysAgo = !!habit.history[twoDaysAgoStr];

            return (
              <div 
                key={habit.habitId}
                className="p-5 rounded-2xl bg-neutral-900/40 border border-neutral-900 hover:border-pink-900/30 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-neutral-900">
                    <div>
                      <h3 className="text-sm font-extrabold text-neutral-100">{habit.habitName}</h3>
                      <span className="text-[10px] text-neutral-500 font-mono capitalize">{habit.frequency} rhythm</span>
                    </div>

                    <button
                      id={`btn-delete-habit-${habit.habitId}`}
                      onClick={() => onDeleteHabit(habit.habitId)}
                      className="p-1.5 bg-neutral-950 hover:bg-red-950 rounded-lg border border-neutral-850 hover:border-red-900/35 text-neutral-500 hover:text-red-400 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* High Stats overview */}
                  <div className="grid grid-cols-3 gap-2.5 my-4">
                    <div className="bg-neutral-950/60 p-2 rounded-xl text-center border border-neutral-850/40">
                      <span className="text-[9px] uppercase tracking-wider text-neutral-500">Streak</span>
                      <p className="text-sm font-black font-mono mt-0.5 text-pink-400">{habit.currentStreak} Days</p>
                    </div>

                    <div className="bg-neutral-950/60 p-2 rounded-xl text-center border border-neutral-850/40">
                      <span className="text-[9px] uppercase tracking-wider text-neutral-500">Longest</span>
                      <p className="text-sm font-black font-mono mt-0.5 text-neutral-300">{habit.longestStreak} Days</p>
                    </div>

                    <div className="bg-neutral-950/60 p-2 rounded-xl text-center border border-neutral-850/40">
                      <span className="text-[9px] uppercase tracking-wider text-neutral-500">Consistency</span>
                      <p className="text-sm font-black font-mono mt-0.5 text-indigo-400">{habit.consistencyScore}%</p>
                    </div>
                  </div>

                  {/* Logging selectors */}
                  <h4 className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider">Logging Workspace Check-ins</h4>
                  <div className="space-y-2 mt-2">
                    
                    {/* Today */}
                    <div className="flex items-center justify-between p-2 rounded-xl bg-neutral-950/80 border border-neutral-850/50">
                      <span className="text-xs text-neutral-300 font-semibold">Today ({todayStr})</span>
                      <button
                        id={`btn-toggle-habit-today-${habit.habitId}`}
                        onClick={() => onToggleHabit(habit.habitId, todayStr)}
                        className={`p-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center space-x-1 cursor-pointer ${
                          hasDoneToday
                            ? "bg-pink-600 text-white font-extrabold"
                            : "bg-neutral-900 hover:bg-neutral-800 text-neutral-400"
                        }`}
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>{hasDoneToday ? "Done" : "Mark"}</span>
                      </button>
                    </div>

                    {/* Yesterday */}
                    <div className="flex items-center justify-between p-2 rounded-xl bg-neutral-950/80 border border-neutral-850/50">
                      <span className="text-xs text-neutral-300 font-semibold font-medium">Yesterday ({yesterdayStr})</span>
                      <button
                        id={`btn-toggle-habit-yesterday-${habit.habitId}`}
                        onClick={() => onToggleHabit(habit.habitId, yesterdayStr)}
                        className={`p-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center space-x-1 cursor-pointer ${
                          hasDoneYesterday
                            ? "bg-pink-600/60 text-pink-100"
                            : "bg-neutral-900 hover:bg-neutral-800 text-neutral-400"
                        }`}
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>{hasDoneYesterday ? "Done" : "Mark"}</span>
                      </button>
                    </div>

                    {/* Day before yesterday */}
                    <div className="flex items-center justify-between p-2 rounded-xl bg-neutral-950/80 border border-neutral-850/50">
                      <span className="text-xs text-neutral-400 font-medium font-medium">2 Days Ago ({twoDaysAgoStr})</span>
                      <button
                        id={`btn-toggle-habit-two-days-${habit.habitId}`}
                        onClick={() => onToggleHabit(habit.habitId, twoDaysAgoStr)}
                        className={`p-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center space-x-1 cursor-pointer ${
                          hasDoneTwoDaysAgo
                            ? "bg-pink-600/40 text-pink-200"
                            : "bg-neutral-900 hover:bg-neutral-800 text-neutral-400"
                        }`}
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>{hasDoneTwoDaysAgo ? "Done" : "Mark"}</span>
                      </button>
                    </div>

                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-neutral-950/80 flex justify-between items-center text-[10px] text-neutral-500 font-mono">
                  <span>Goal: {habit.target} done intervals</span>
                  <Activity className="w-4 h-4 text-neutral-600" />
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ADD HABIT DIALOG DRAWERS */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-neutral-950/85 backdrop-blur-sm" onClick={() => setIsAddOpen(false)} />
          
          <div className="w-full max-w-md bg-neutral-900 border border-neutral-850 p-6 rounded-2xl shadow-xl relative z-10 text-left text-xs font-semibold text-neutral-400">
            <button 
              onClick={() => setIsAddOpen(false)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-black text-white mb-4">Start Tracking New Habit</h3>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider mb-1.5 text-neutral-500">Habit Name *</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Read 15 mins daily, Code 2 hours, Gym, Sleep at 11pm"
                  value={habitName}
                  onChange={(e) => setHabitName(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-850 rounded-xl p-2.5 text-white text-xs font-medium focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-wider mb-1.5 text-neutral-500">Frequency</label>
                  <select 
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value as "daily" | "weekly")}
                    className="w-full bg-neutral-950 border border-neutral-850 rounded-xl p-2.5 text-white font-medium cursor-pointer focus:outline-none"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-wider mb-1.5 text-neutral-500">Target frequency (Times)</label>
                  <input 
                    type="number" 
                    min="1" 
                    max="7"
                    value={target}
                    onChange={(e) => setTarget(Number(e.target.value))}
                    className="w-full bg-neutral-950 border border-neutral-850 rounded-xl p-2.5 text-white font-medium focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-5 py-2.5 bg-neutral-800 hover:bg-neutral-750 text-neutral-300 font-bold text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl cursor-pointer"
                >
                  Track Routine
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
