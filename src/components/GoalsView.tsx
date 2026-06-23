import React, { useState } from "react";
import { 
  Target, 
  Plus, 
  Map, 
  CheckCircle2, 
  Sparkles, 
  Trash2, 
  Clock, 
  BookOpen, 
  UserCheck, 
  DollarSign, 
  Heart,
  X,
  Compass
} from "lucide-react";
import { Goal } from "../types";

interface GoalsViewProps {
  goals: Goal[];
  onAddGoal: (goal: Omit<Goal, "goalId" | "progress">) => Promise<void>;
  onEditGoal: (goalId: string, updatedFields: Partial<Goal>) => Promise<void>;
  onDeleteGoal: (goalId: string) => Promise<void>;
  onTriggerRoadmap: (goal: Goal) => Promise<any>;
}

export default function GoalsView({
  goals,
  onAddGoal,
  onEditGoal,
  onDeleteGoal,
  onTriggerRoadmap
}: GoalsViewProps) {
  // Goals Modal Add State
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [category, setCategory] = useState<Goal["category"]>("Academic");
  const [targetDate, setTargetDate] = useState("");
  const [milestonesInput, setMilestonesInput] = useState("");

  // Roadmap states
  const [loadingRoadmapId, setLoadingRoadmapId] = useState<string | null>(null);

  // Core Goal submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !targetDate) return;

    // Convert comma-separated milestones into objects
    const milestoneItems = milestonesInput
      .split(",")
      .map(m => m.trim())
      .filter(m => m.length > 0)
      .map((m, idx) => ({
        id: `m-${Date.now()}-${idx}`,
        name: m,
        completed: false
      }));

    if (milestoneItems.length === 0) {
      milestoneItems.push({
        id: `m-${Date.now()}-0`,
        name: "Define project targets and constraints",
        completed: false
      });
    }

    try {
      await onAddGoal({
        goalName: name,
        description: desc,
        category,
        targetDate,
        milestones: milestoneItems
      });

      // Reset
      setName("");
      setDesc("");
      setCategory("Academic");
      setTargetDate("");
      setMilestonesInput("");
      setIsAddOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  // Milestone toggler
  const handleToggleMilestone = async (goal: Goal, milestoneId: string) => {
    const updatedMilestones = goal.milestones.map(m => {
      if (m.id === milestoneId) {
        return { ...m, completed: !m.completed };
      }
      return m;
    });

    // Calculate progression percentage based on completed milestones
    const completedCount = updatedMilestones.filter(m => m.completed).length;
    const progress = Math.round((completedCount / updatedMilestones.length) * 100);

    try {
      await onEditGoal(goal.goalId, {
        milestones: updatedMilestones,
        progress
      });
    } catch (err) {
      console.error("Milestone status update error:", err);
    }
  };

  // Generate AI Career / Academic Roadmap block
  const handleGenerateRoadmap = async (goal: Goal) => {
    setLoadingRoadmapId(goal.goalId);
    try {
      const result = await onTriggerRoadmap(goal);
      await onEditGoal(goal.goalId, {
        roadmap: result.roadmap
      });
    } catch (err) {
      console.error("Roadmap generation failed:", err);
    } finally {
      setLoadingRoadmapId(null);
    }
  };

  const getCategoryIcon = (cat: Goal["category"]) => {
    switch (cat) {
      case "Academic": return <BookOpen className="w-5 h-5 text-purple-400" />;
      case "Career": return <UserCheck className="w-5 h-5 text-blue-400" />;
      case "Financial": return <DollarSign className="w-5 h-5 text-emerald-400" />;
      case "Health": return <Heart className="w-5 h-5 text-pink-400" />;
      default: return <Compass className="w-5 h-5 text-yellow-400" />;
    }
  };

  return (
    <div id="goals-tab-content" className="p-6 md:p-8 bg-neutral-950 text-white min-h-screen space-y-8 text-xs font-semibold text-neutral-400">
      
      {/* Upper action details */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center space-x-2">
            <Target className="w-5 h-5 text-yellow-400" />
            <span>Strategic Goal Roadmaps</span>
          </h2>
          <p className="text-xs text-neutral-400 mt-1">Configure major personal and academic objectives, map tactical milestones, and design AI paths.</p>
        </div>

        <button
          id="btn-add-goal-open"
          onClick={() => setIsAddOpen(true)}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-white font-bold text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer shadow shadow-indigo-600/20"
        >
          <Plus className="w-4 h-4" />
          <span>Launch Strategic Goal</span>
        </button>
      </div>

      {/* Grid listing goals cards */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8" id="goals-cards-grid">
        {goals.length === 0 ? (
          <div className="xl:col-span-2 p-12 bg-neutral-900/10 rounded-2xl border border-neutral-900 text-center">
            <p className="text-sm font-semibold text-neutral-400">No active goals registered inside database timeline.</p>
            <p className="text-xs text-neutral-500 mt-1">Construct an academic, financial, or career goal above to formulate milestones.</p>
          </div>
        ) : (
          goals.map(goal => (
            <div 
              key={goal.goalId}
              className="p-6 rounded-2xl bg-neutral-900/30 border border-neutral-900/80 hover:border-indigo-900/30 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-neutral-900">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-neutral-950 border border-neutral-850 rounded-xl">
                      {getCategoryIcon(goal.category)}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-neutral-100">{goal.goalName}</h3>
                      <span className="text-[10px] text-neutral-500 font-mono uppercase">{goal.category} Objective</span>
                    </div>
                  </div>

                  <button
                    id={`btn-delete-goal-${goal.goalId}`}
                    onClick={() => onDeleteGoal(goal.goalId)}
                    className="p-2 bg-neutral-950 hover:bg-red-950/80 rounded-xl text-neutral-400 hover:text-red-400 border border-neutral-850 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Progress bar info */}
                <div className="mt-4 space-y-1.5">
                  <div className="flex justify-between items-center text-[10px] uppercase font-bold text-neutral-500">
                    <span>Progression</span>
                    <span className="font-mono text-indigo-400">{goal.progress}% Achieved</span>
                  </div>
                  <div className="w-full bg-neutral-950 p-0.5 rounded-full border border-neutral-850">
                    <div 
                      className="bg-gradient-to-r from-purple-500 to-indigo-500 h-2 rounded-full transition-all duration-500" 
                      style={{ width: `${goal.progress}%` }}
                    />
                  </div>
                  <p className="text-xs text-neutral-400 leading-relaxed font-semibold italic pt-1">{goal.description || "No description provided."}</p>
                </div>

                {/* Milestones checklists */}
                <div className="mt-6">
                  <h4 className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider">Milestones Trackers</h4>
                  <div className="space-y-2 mt-2">
                    {goal.milestones?.map((m) => (
                      <div 
                        key={m.id}
                        className="flex items-center space-x-2.5 p-2 bg-neutral-950 border border-neutral-850/60 rounded-xl text-xs hover:border-neutral-800 transition-all"
                      >
                        <button
                          id={`btn-toggle-milestone-${goal.goalId}-${m.id}`}
                          onClick={() => handleToggleMilestone(goal, m.id)}
                          className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                            m.completed 
                              ? "bg-indigo-600 border-indigo-500 text-white" 
                              : "border-neutral-700 hover:border-indigo-500 text-transparent"
                          }`}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </button>
                        <span className={`font-semibold ${m.completed ? "line-through text-neutral-500 text-xs" : "text-neutral-300"}`}>{m.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ROADMAP ACCORDION ELEMENT */}
                {goal.roadmap ? (
                  <div className="mt-6 pt-4 border-t border-neutral-900/60 font-semibold leading-relaxed">
                    <h4 className="text-[10px] uppercase font-bold text-indigo-400 flex items-center space-x-1.5">
                      <Map className="w-3.5 h-3.5" />
                      <span>Gemini Blueprint Roadmap Block</span>
                    </h4>
                    
                    <div className="mt-2.5 p-3.5 rounded-2xl bg-neutral-950 border border-neutral-850 max-h-48 overflow-y-auto text-[11px] text-neutral-300 whitespace-pre-line shadow-inner">
                      {goal.roadmap}
                    </div>
                  </div>
                ) : null}
              </div>

              {/* Strategy generation activator */}
              <div className="mt-6 pt-4 border-t border-neutral-950 flex items-center justify-between">
                <span className="text-[10px] text-neutral-500 font-mono">DUE TARGET: {goal.targetDate}</span>
                {!goal.roadmap && (
                  <button
                    id={`btn-trigger-roadmap-${goal.goalId}`}
                    onClick={() => handleGenerateRoadmap(goal)}
                    disabled={loadingRoadmapId === goal.goalId}
                    className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl flex items-center space-x-1.5 transition-all shadow shadow-indigo-600/20 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                    <span>{loadingRoadmapId === goal.goalId ? "Drawing blueprints..." : "Formulate AI Roadmap Sprints"}</span>
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* STRATEGIC GOAL LAUNCH DRAWER/MODAL */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-neutral-950/80 backdrop-blur-sm" onClick={() => setIsAddOpen(false)} />
          
          <div className="w-full max-w-lg bg-neutral-900 border border-neutral-850 p-6 rounded-2xl shadow-xl relative z-10 text-left text-xs font-semibold text-neutral-400">
            <button 
              onClick={() => setIsAddOpen(false)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-black text-white mb-4">Launch New Strategic Goal</h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider mb-1.5 text-neutral-500">Goal Title Summary *</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Pass Compiler Systems Exam with A+..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-850 rounded-xl p-2.5 text-white text-xs font-medium focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-wider mb-1.5 text-neutral-500">Category</label>
                  <select 
                    value={category}
                    onChange={(e) => setCategory(e.target.value as Goal["category"])}
                    className="w-full bg-neutral-950 border border-neutral-850 rounded-xl p-2.5 text-white font-medium cursor-pointer focus:outline-none"
                  >
                    <option value="Academic">Academic</option>
                    <option value="Career">Career</option>
                    <option value="Financial">Financial</option>
                    <option value="Health">Health</option>
                    <option value="Personal">Personal</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-wider mb-1.5 text-neutral-500">Due Completion Target *</label>
                  <input 
                    type="date" 
                    required
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-850 rounded-xl p-2 text-white font-medium cursor-pointer focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider mb-1.5 text-neutral-500">Description details</label>
                <textarea 
                  rows={3}
                  placeholder="Detail supportive milestones, exam guidelines, syllabus constraints..."
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-850 rounded-xl p-2.5 text-white font-medium focus:outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider mb-1.5 text-neutral-500">Custom Milestones (Comma separated list)</label>
                <input 
                  type="text" 
                  placeholder="e.g. Read Parsing syllabus, Complete mock questions, Build parsing matrix"
                  value={milestonesInput}
                  onChange={(e) => setMilestonesInput(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-850 rounded-xl p-2.5 text-white text-xs font-medium focus:outline-none"
                />
                <span className="text-[10px] text-neutral-600 font-medium mt-1 block">Separating by commas automatically generates checkbox subtasks milestones.</span>
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
                  Instantiate Strategic Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
