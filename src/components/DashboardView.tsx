import React, { useState } from "react";
import { 
  Sparkles, 
  Flame, 
  Target, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Plus, 
  Zap, 
  ChevronRight, 
  Hourglass, 
  Calendar,
  Layers,
  ArrowUpRight,
  TrendingUp,
  Brain,
  X,
  Play
} from "lucide-react";
import { Task, Goal, Habit, UserProfile } from "../types";
import { motion, AnimatePresence } from "motion/react";
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from "recharts";

interface DashboardViewProps {
  userProfile: UserProfile | null;
  tasks: Task[];
  goals: Goal[];
  habits: Habit[];
  onAddTask: (task: Omit<Task, "taskId" | "createdAt" | "riskScore">) => Promise<void>;
  onCompleteTask: (taskId: string) => Promise<void>;
  onToggleHabit: (habitId: string) => Promise<void>;
  onToggleMilestone: (goalId: string, milestoneId: string) => Promise<void>;
  onTriggerRescue: (task: Task) => Promise<any>;
  onTriggerPrioritize: (task: Task) => Promise<any>;
  onTriggerWeeklyReview: () => Promise<any>;
}

export default function DashboardView({
  userProfile,
  tasks,
  goals,
  habits,
  onAddTask,
  onCompleteTask,
  onToggleHabit,
  onToggleMilestone,
  onTriggerRescue,
  onTriggerPrioritize,
  onTriggerWeeklyReview
}: DashboardViewProps) {
  // Quick Add State
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [qTitle, setQTitle] = useState("");
  const [qCategory, setQCategory] = useState<Task["category"]>("Study");
  const [qPriority, setQPriority] = useState<Task["priority"]>("Medium");
  const [qDeadline, setQDeadline] = useState("");
  const [qHours, setQHours] = useState(2);
  const [qDesc, setQDesc] = useState("");

  // AI Weekly Review states
  const [loadingReview, setLoadingReview] = useState(false);
  const [reviewResult, setReviewResult] = useState<any>(null);

  // Active Rescue popup state
  const [activeRescuePlan, setActiveRescuePlan] = useState<any>(null);
  const [rescuingTaskId, setRescuingTaskId] = useState<string | null>(null);

  // Focus simulation mode
  const [focusingTask, setFocusingTask] = useState<Task | null>(null);
  const [focusTimer, setFocusTimer] = useState<number>(0);
  const [focusIntervalId, setFocusIntervalId] = useState<any>(null);

  const todayStr = new Date().toISOString().split('T')[0];

  // Logic: Today's Tasks
  const todayTasks = tasks.filter(t => t.status === "pending" && t.deadline === todayStr);
  const totalWorkloadHours = tasks.filter(t => t.status === "pending").reduce((sum, t) => sum + t.estimatedHours, 0);

  // Upcoming soonest tasks
  const upcomingTasks = tasks
    .filter(t => t.status === "pending" && t.deadline !== todayStr)
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
    .slice(0, 4);

  // High Risk Tasks
  const highRiskTasks = tasks.filter(t => t.status === "pending" && t.riskScore >= 60);

  // Core Quick Add handler
  const handleQuickAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!qTitle || !qDeadline) return;
    try {
      await onAddTask({
        title: qTitle,
        description: qDesc,
        category: qCategory,
        priority: qPriority,
        deadline: qDeadline,
        estimatedHours: Number(qHours),
        status: "pending"
      });
      // Reset
      setQTitle("");
      setQDesc("");
      setQDeadline("");
      setQHours(2);
      setShowQuickAdd(false);
    } catch (err) {
      console.error(err);
    }
  };

  // AI Weekly Review fetch
  const handleGenerateWeeklyReview = async () => {
    setLoadingReview(true);
    setReviewResult(null);
    try {
      const audit = await onTriggerWeeklyReview();
      setReviewResult(audit);
    } catch (err) {
      console.error("Audit creation error:", err);
    } finally {
      setLoadingReview(false);
    }
  };

  // Activate Crisis Rescue Model
  const handleActivateRescuePlan = async (task: Task) => {
    setRescuingTaskId(task.taskId);
    setActiveRescuePlan(null);
    try {
      const plan = await onTriggerRescue(task);
      setActiveRescuePlan({ task, plan });
    } catch (err) {
      console.error("Rescue configuration failed:", err);
    } finally {
      setRescuingTaskId(null);
    }
  };

  // Setup reactive chart dataset based on current task entries
  const getTasksDistributionDataset = () => {
    const categories: { [key: string]: number } = { Study: 0, Work: 0, Personal: 0, Finance: 0, Health: 0, Career: 0, Projects: 0 };
    tasks.forEach(t => {
      if (t.status === "completed") {
        categories[t.category] = (categories[t.category] || 0) + 1;
      }
    });

    return Object.keys(categories).map(cat => ({
      name: cat,
      completed: categories[cat]
    }));
  };

  const getWeeklyCompletedDataset = () => {
    // Generate mock completed task history spread over past 6 days for analytics
    const weekdayName = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const dataset = [];
    const todayNum = new Date().getDay();

    for (let i = 5; i >= 0; i--) {
      const index = (todayNum - i + 7) % 7;
      dataset.push({
        day: weekdayName[index],
        completed: Math.floor(Math.random() * 3) + (i === 0 ? 1 : 0),
        momentum: 60 + Math.floor(Math.random() * 25)
      });
    }
    // inject current day's real completed count
    const todayCompletedCount = tasks.filter(t => t.status === "completed" && t.completedAt?.startsWith(todayStr)).length;
    dataset.push({
      day: "Today",
      completed: todayCompletedCount,
      momentum: userProfile?.productivityScore || 78
    });

    return dataset;
  };

  return (
    <div id="dashboard-tab-content" className="p-6 md:p-8 space-y-8 bg-transparent text-white min-h-screen">
      
      {/* Toast Alert / TOP NOTIFICATION */}
      {highRiskTasks.length > 0 && (
        <div className="p-4 rounded-2xl bg-red-950/20 border border-red-500/20 backdrop-blur-md flex items-start justify-between">
          <div className="flex space-x-3 text-red-200 text-xs sm:text-sm font-display font-bold">
            <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 animate-pulse" />
            <div>
              <p className="uppercase tracking-wider">MOMENTUM WARNING: {highRiskTasks.length} High Risk tasks detected on database log.</p>
              <p className="text-[11px] text-neutral-400 font-medium mt-1">Deadlines are approaching and workload capacity is strained. Please activate Rescue Mode below.</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Grid: Welcome card and statistics highlights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Welcome Card & Burnout Predictor (Span 2) */}
        <div className="lg:col-span-2 p-8 rounded-3xl bg-white/[0.03] border border-white/10 backdrop-blur-xl flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-[-50px] right-[-50px] w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div>
            <div className="flex items-center justify-between">
              <div className="px-3 py-1 bg-white/5 border border-white/10 text-[10px] font-mono font-black text-indigo-300 rounded-full tracking-widest uppercase">
                Productivity Compass Workspace
              </div>
              <span className="text-xs text-neutral-400 font-mono">Date: {todayStr}</span>
            </div>

            <h1 className="text-4xl sm:text-5xl font-display font-black tracking-tighter uppercase leading-none mt-6 text-white">
              Step Into Focus,<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400">{userProfile?.name || "Strategist"}</span>
            </h1>
            <p className="text-neutral-300 text-xs sm:text-sm mt-3 leading-relaxed max-w-xl font-medium">
              Your overall momentum index scores <strong className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400 font-display font-black text-lg italic">{userProfile?.productivityScore || 78}/100</strong>. You have <strong className="text-indigo-300">{tasks.filter(t => t.status === "pending").length} active tasks</strong> pending and <strong className="text-emerald-400">{habits.length} habits</strong> in tracking.
            </p>

            {/* Burnout Predictor / AI weekly prompt */}
            <div className="mt-8 p-5 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex space-x-3.5">
                <div className="p-3 bg-purple-950/40 border border-purple-800/30 rounded-xl text-purple-400 flex-shrink-0">
                  <Brain className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h4 className="text-xs font-display font-bold uppercase tracking-wider text-neutral-100 flex items-center space-x-1.5">
                    <span>AI Burnout Predictor & Weekly review</span>
                    <span className="px-1.5 py-0.5 bg-indigo-950/80 text-indigo-400 text-[8px] rounded font-black tracking-wider font-mono">GEMINI 2.5</span>
                  </h4>
                  <p className="text-[11px] text-neutral-400 mt-0.5 italic">
                    Analyze active workload distribution to forecast physical exhaust index.
                  </p>
                </div>
              </div>

              <button
                id="btn-evaluate-burnout"
                onClick={handleGenerateWeeklyReview}
                disabled={loadingReview}
                className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:from-neutral-800 disabled:to-neutral-900 text-white font-display font-bold text-xs rounded-xl transition-all flex items-center space-x-2 flex-shrink-0 cursor-pointer shadow-lg shadow-purple-500/20 hover:scale-[1.02] active:scale-95"
              >
                <span>{loadingReview ? "Assessing details..." : "Predict Burnout"}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-6 text-[11px] text-neutral-400 border-t border-white/5 pt-4 mt-8 font-mono">
            <span className="flex items-center space-x-1">
              <Flame className="w-4 h-4 text-pink-500" />
              <span>STREAK: {habits.reduce((max, h) => Math.max(max, h.currentStreak), 0)}D</span>
            </span>
            <span className="flex items-center space-x-1">
              <Target className="w-4 h-4 text-yellow-500" />
              <span>GOALS: {goals.length}</span>
            </span>
            <span className="flex items-center space-x-1">
              <Clock className="w-4 h-4 text-amber-500" />
              <span>WORKLOAD: {totalWorkloadHours}H</span>
            </span>
          </div>
        </div>

        {/* Global score circle Card */}
        <div className="p-8 rounded-3xl bg-white/[0.03] border border-white/10 backdrop-blur-xl flex flex-col items-center justify-between text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-tr from-indigo-500/10 to-purple-500/10 rounded-bl-full pointer-events-none" />
          <h4 className="text-[11px] font-display font-bold text-neutral-400 uppercase tracking-widest">Active Momentum Velocity</h4>
          
          <div className="my-6 relative flex items-center justify-center">
            {/* Simulated circular progress */}
            <svg className="w-32 h-32 transform -rotate-90">
              <circle cx="64" cy="64" r="54" stroke="rgba(255,255,255,0.02)" strokeWidth="8" fill="transparent" />
              <circle 
                cx="64" 
                cy="64" 
                r="54" 
                stroke="url(#purpleBlueGlow)" 
                strokeWidth="10" 
                fill="transparent" 
                strokeDasharray="339.29" 
                strokeDashoffset={339.29 - (339.29 * (userProfile?.productivityScore || 78)) / 100} 
                strokeLinecap="round"
              />
              <defs>
                <linearGradient id="purpleBlueGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#818cf8" />
                  <stop offset="100%" stopColor="#c084fc" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-4xl font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400 italic leading-none">{userProfile?.productivityScore || 78}</span>
              <span className="text-[9px] text-neutral-500 font-black uppercase tracking-wider mt-1 font-mono">MOMENTUM</span>
            </div>
          </div>

          <p className="text-[10px] text-neutral-400 italic max-w-[200px]">
            Computed by AI based on daily task completion rates and habits consistency.
          </p>

          <button
            id="btn-quick-add-task-modal"
            onClick={() => setShowQuickAdd(true)}
            className="mt-6 px-4 py-3 w-full bg-indigo-600 hover:bg-indigo-500 text-white font-display font-extrabold text-xs tracking-wider uppercase rounded-xl flex items-center justify-center space-x-1.5 cursor-pointer hover:scale-[1.01] active:scale-95 transition-all shadow-lg shadow-indigo-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>Quick add Task</span>
          </button>
        </div>
      </div>

      {/* RENDER DYNAMIC WEEKLY REVIEW RESULTS IF GENERATED */}
      {reviewResult && (
        <div id="ai-review-block" className="p-6 rounded-2xl bg-gradient-to-br from-purple-950/30 to-neutral-900/60 border border-purple-800/20 shadow-xl relative">
          <button 
            onClick={() => setReviewResult(null)}
            className="absolute top-4 right-4 text-neutral-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center space-x-2 text-purple-400 mb-4">
            <Brain className="w-5 h-5" />
            <h3 className="text-base font-bold uppercase tracking-wide">Weekly Productivity Audit & Burnout predictor</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1 p-4 rounded-xl bg-neutral-950 border border-neutral-900 flex flex-col justify-center">
              <span className="text-xs text-neutral-500 font-bold uppercase tracking-widest">Predicated Exhaust Risk</span>
              <span className={`text-2xl font-black mt-1 ${
                reviewResult.burnoutLevel === "High" ? "text-red-400" : reviewResult.burnoutLevel === "Medium" ? "text-amber-400" : "text-emerald-400"
              }`}>
                {reviewResult.burnoutLevel} Risk
              </span>
              <p className="text-[11px] text-neutral-400 leading-relaxed mt-2 p-2 bg-neutral-900 border border-neutral-800 rounded">
                {reviewResult.burnoutExplanation}
              </p>
            </div>

            <div className="md:col-span-2 space-y-4">
              <div>
                <h4 className="text-xs text-indigo-400 font-bold uppercase tracking-wider font-mono">Performance Summary:</h4>
                <p className="text-xs text-neutral-300 leading-relaxed mt-1">
                  {reviewResult.weeklySummary}
                </p>
              </div>

              <div>
                <h4 className="text-xs text-indigo-400 font-bold uppercase tracking-wider font-mono">Action Recommendation Feed:</h4>
                <ul className="mt-1.5 space-y-1.5">
                  {reviewResult.actionFeed?.map((item: string, idx: number) => (
                    <li key={idx} className="text-xs text-neutral-400 flex items-start space-x-2">
                      <span className="p-1 px-1.5 bg-purple-950 text-[10px] text-purple-400 rounded-full font-bold leading-none mt-0.5">{idx + 1}</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Flagship: Crisis Rescue Alert List */}
      <h3 className="text-xl font-display font-black uppercase tracking-tight text-white flex items-center space-x-2.5 pt-4">
        <div className="p-1.5 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
          <AlertTriangle className="w-5 h-5 animate-pulse" />
        </div>
        <span>Crisis Rescue Control Unit</span>
      </h3>
      {highRiskTasks.length === 0 ? (
        <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 text-center">
          <p className="text-xs text-neutral-400 font-medium">🎉 All system tracks are optimal! No tasks are currently flagged at high failure risk.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="rescue-dashboard-grid">
          {highRiskTasks.map(task => (
            <div 
              key={task.taskId}
              className="p-6 rounded-3xl bg-white/[0.02] border border-white/[0.08] backdrop-blur-xl flex flex-col justify-between hover:border-red-500/30 hover:bg-white/[0.03] transition-all duration-300"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 bg-red-950/60 text-red-400 text-[9px] rounded-lg border border-red-900/30 font-black uppercase tracking-wider font-mono">
                    Urgent Risk: {task.riskScore}%
                  </span>
                  <span className="text-[10px] text-neutral-400 font-mono font-bold">Due: {task.deadline}</span>
                </div>

                <h4 className="text-base font-display font-black text-white mt-4">{task.title}</h4>
                <p className="text-xs text-neutral-400 truncate mt-1">{task.description || "No description provided."}</p>
                <div className="bg-red-500/[0.03] border border-red-500/10 rounded-xl p-3 mt-3">
                  <p className="text-xs text-red-300 flex items-center space-x-1.5 font-bold">
                    <Clock className="w-3.5 h-3.5 flex-shrink-0 text-red-400" />
                    <span>Requires {task.estimatedHours} Hours intensive block segments.</span>
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-white/[0.05] flex items-center justify-between gap-4">
                <span className="text-[9px] text-neutral-500 font-mono font-bold">Dynamic Rescue mode active</span>
                <button
                  id={`btn-rescue-task-${task.taskId}`}
                  onClick={() => handleActivateRescuePlan(task)}
                  disabled={rescuingTaskId === task.taskId}
                  className="px-4 py-2.5 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-display font-black text-[10px] tracking-wider uppercase rounded-xl flex items-center space-x-1.5 transition-all shadow-lg shadow-red-500/20 hover:scale-[1.01] cursor-pointer"
                >
                  <Flame className="w-3.5 h-3.5 animate-bounce" />
                  <span>{rescuingTaskId === task.taskId ? "Formulating directive..." : "Launch Crisis Recovery"}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* RENDER CRISIS RESCUE POPUP DETAILS */}
      <AnimatePresence>
        {activeRescuePlan && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-neutral-950/80 backdrop-blur-md" onClick={() => setActiveRescuePlan(null)} />
            
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-2xl bg-neutral-900 border border-red-900/60 p-6 rounded-2xl shadow-2xl relative z-10 max-h-[85vh] overflow-y-auto text-left"
            >
              <button 
                onClick={() => setActiveRescuePlan(null)}
                className="absolute top-4 right-4 text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center space-x-2.5 text-red-400 mb-4 border-b border-neutral-800 pb-3">
                <Flame className="w-6 h-6 animate-pulse" />
                <h3 className="text-lg font-bold uppercase tracking-wider">AI Crisis Rescue Recovery Directive</h3>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between bg-red-950/20 p-3 rounded-xl border border-red-950">
                  <div>
                    <h4 className="text-xs text-neutral-400 font-bold uppercase">Task Triggered:</h4>
                    <p className="text-sm font-semibold text-white mt-0.5">{activeRescuePlan.task.title}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-neutral-500 font-bold uppercase">Completion Chance</span>
                    <p className="text-xl font-mono font-black text-emerald-400">{activeRescuePlan.plan.completionProbability}%</p>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs text-red-300 font-bold uppercase tracking-wide">AI Hazard Explanation:</h4>
                  <p className="text-xs text-neutral-300 leading-relaxed bg-neutral-950 p-2.5 rounded border border-neutral-900 mt-1">
                    {activeRescuePlan.plan.riskExplanation}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-xs text-indigo-400 font-bold uppercase tracking-wide">Chronological Recovery Sprints:</h4>
                    <ul className="mt-1.5 space-y-1 bg-neutral-950 p-2.5 rounded border border-neutral-900">
                      {activeRescuePlan.plan.recoveryPlan?.map((item: string, idx: number) => (
                        <li key={idx} className="text-xs text-neutral-300 flex items-start space-x-2">
                          <span className="text-red-400 font-bold">✓</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-xs text-indigo-400 font-bold uppercase tracking-wide">Emergency Task Breakdown Checklist:</h4>
                    <div className="mt-1.5 space-y-1.5 bg-neutral-950 p-2.5 rounded border border-neutral-900">
                      {activeRescuePlan.plan.taskBreakdown?.map((item: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between text-xs text-neutral-300 border-b border-neutral-900 pb-1 last:border-0 last:pb-0">
                          <span>{item.step}</span>
                          <span className="text-[10px] font-mono text-neutral-500 px-1 py-0.5 bg-neutral-900 rounded">{item.estMinutes} mins</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs text-indigo-400 font-bold uppercase tracking-wide">Proposed Emergency Time-Blocking Calendar:</h4>
                  <div className="p-3 bg-neutral-950 border border-neutral-900 rounded-xl text-xs font-mono text-neutral-300 mt-1 whitespace-pre-line leading-relaxed">
                    {activeRescuePlan.plan.emergencySchedule}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setFocusingTask(activeRescuePlan.task);
                    setFocusTimer(activeRescuePlan.task.estimatedHours * 60); // minutes
                    setActiveRescuePlan(null);
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-red-600 to-indigo-600 text-white font-bold text-xs rounded-xl flex items-center space-x-1.5 cursor-pointer hover:scale-[1.01]"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Launch Focused Pomodoro Session now</span>
                </button>
                <button
                  onClick={() => setActiveRescuePlan(null)}
                  className="px-4 py-2 bg-neutral-800 hover:bg-neutral-750 text-neutral-300 font-bold text-xs rounded-xl"
                >
                  Close Plan
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Focus Timer panel overlay if active */}
      {focusingTask && (
        <div className="p-5 rounded-2xl bg-indigo-950/80 border border-indigo-500/40 shadow-lg flex flex-col md:flex-row items-center justify-between gap-4 animate-pulse">
          <div className="flex items-center space-x-3">
            <Hourglass className="w-6 h-6 text-indigo-400 animate-spin" />
            <div>
              <p className="text-xs text-indigo-300 font-bold uppercase tracking-widest">Active Focused Pomodoro Session</p>
              <h4 className="text-sm font-extrabold text-white">{focusingTask.title}</h4>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-xl font-mono font-bold text-indigo-400">
              {Math.floor(focusTimer / 60)}m {focusTimer % 60}s remaining
            </div>
            <button
              onClick={() => {
                onCompleteTask(focusingTask.taskId);
                setFocusingTask(null);
              }}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center space-x-1.5 cursor-pointer"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Complete Task</span>
            </button>
            <button
              onClick={() => setFocusingTask(null)}
              className="text-xs text-neutral-400 hover:text-white"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Mid Level Content: Work distribution details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Today's Focus Card (Col span 2) */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-neutral-900/40 border border-neutral-900">
          <div className="flex justify-between items-center pb-4 border-b border-neutral-900">
            <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-100 flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-purple-400" />
              <span>Today's Focus Map ({todayTasks.length} pending)</span>
            </h3>
            <span className="text-xs font-semibold text-neutral-500 font-mono">Workload: {totalWorkloadHours} hrs total</span>
          </div>

          {todayTasks.length === 0 ? (
            <div className="p-8 text-center text-neutral-500 text-xs">
              😴 No tasks due today. Work on upcoming assignments or generate habit check-ins!
            </div>
          ) : (
            <div className="space-y-4 mt-4" id="todays-tasks-list">
              {todayTasks.map(task => (
                <div 
                  key={task.taskId}
                  className="p-4 rounded-xl bg-neutral-950 border border-neutral-900/80 flex items-center justify-between hover:border-indigo-900/60 transition-all group"
                >
                  <div className="flex items-center space-x-3.5">
                    <button
                      id={`btn-complete-task-dash-${task.taskId}`}
                      onClick={() => onCompleteTask(task.taskId)}
                      className="w-5 h-5 rounded-full border border-neutral-700 hover:border-emerald-500 flex items-center justify-center text-transparent hover:text-emerald-500 transition-colors"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                    </button>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-indigo-400 transition-colors">{task.title}</h4>
                      <p className="text-[11px] text-neutral-500 truncate max-w-md">{task.description || "No description provided."}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span className="px-2 py-0.5 bg-neutral-900 border border-neutral-800 text-[10px] text-neutral-400 rounded">
                      {task.estimatedHours} Hrs
                    </span>
                    <span className={`px-2 py-0.5 text-[10px] rounded font-bold uppercase ${
                      task.priority === "Critical" ? "bg-red-950 text-red-400" :
                      task.priority === "High" ? "bg-orange-950 text-orange-400" :
                      task.priority === "Medium" ? "bg-indigo-950 text-indigo-400" : "bg-neutral-800 text-neutral-400"
                    }`}>
                      {task.priority}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Upcoming Schedule tracker */}
          <h4 className="text-xs font-bold uppercase tracking-widest text-neutral-500 mt-6 pt-4 border-t border-neutral-900/60">Upcoming Deadlines Timeline</h4>
          <div className="space-y-3 mt-4" id="upcoming-tasks-list">
            {upcomingTasks.map(task => (
              <div 
                key={task.taskId}
                className="p-3 rounded-xl bg-neutral-950/70 border border-neutral-900/40 flex items-center justify-between text-xs hover:border-neutral-800 transition-all"
              >
                <div>
                  <h5 className="font-semibold text-neutral-200">{task.title}</h5>
                  <div className="flex items-center space-x-2 mt-1 text-[10px] text-neutral-500">
                    <span>{task.category}</span>
                    <span>•</span>
                    <span>Load: {task.estimatedHours}h</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-neutral-400 font-mono tracking-wider">DUE: {task.deadline}</span>
                  <p className="text-[10px] text-neutral-500 font-bold mt-0.5 uppercase tracking-wide">Risk: {task.riskScore}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Habits Checklist Box (Span 1) */}
        <div className="p-6 rounded-2xl bg-neutral-900/40 border border-neutral-900 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-100 flex items-center space-x-2 pb-4 border-b border-neutral-900">
              <Flame className="w-4 h-4 text-pink-500" />
              <span>Today's Habits Progress</span>
            </h3>

            {habits.length === 0 ? (
              <div className="p-6 text-center text-neutral-500 text-xs mt-4">
                No active tracking habits. Head to "Habit Tracker" to start dynamic streaks!
              </div>
            ) : (
              <div className="space-y-4 mt-4" id="todays-habits-list">
                {habits.map(habit => {
                  const doneToday = !!habit.history[todayStr];
                  return (
                    <div 
                      key={habit.habitId}
                      className="flex items-center justify-between p-3.5 rounded-xl bg-neutral-950 border border-neutral-900/80 hover:border-pink-900/30 transition-all"
                    >
                      <div className="flex items-center space-x-3">
                        <button
                          id={`btn-check-habit-${habit.habitId}`}
                          onClick={() => onToggleHabit(habit.habitId)}
                          className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                            doneToday 
                              ? "bg-pink-600 border-pink-500 text-white" 
                              : "border-neutral-700 hover:border-pink-500 text-transparent"
                          }`}
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                        </button>
                        <div>
                          <h4 className="text-xs font-semibold text-neutral-200">{habit.habitName}</h4>
                          <span className="text-[10px] text-neutral-500 font-mono">Streak: {habit.currentStreak} Days</span>
                        </div>
                      </div>
                      <div className="p-1 px-2.5 bg-pink-950 text-pink-400 text-[10px] font-mono font-bold rounded-full">
                        {habit.consistencyScore}%
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-neutral-900/60 text-center">
            <span className="text-[11px] text-neutral-400 font-semibold italic">Maintain streaks to build cognitive momentum scores!</span>
          </div>
        </div>
      </div>

      {/* Analytics Graph Rows */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Weekly Productivity Flow */}
        <div className="p-6 rounded-2xl bg-neutral-900/40 border border-neutral-900">
          <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-100 flex items-center space-x-2 mb-4">
            <TrendingUp className="w-4 h-4 text-indigo-400" />
            <span>Weekly Momentum Flow Velocity</span>
          </h3>
          
          <div className="h-60 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={getWeeklyCompletedDataset()}>
                <defs>
                  <linearGradient id="colorMomentum" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                <XAxis dataKey="day" stroke="#737373" style={{ fontSize: "10px", fontFamily: "monospace" }} />
                <YAxis stroke="#737373" style={{ fontSize: "10px", fontFamily: "monospace" }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#171717", borderColor: "#404040", borderRadius: "10px", fontSize: "11px", color: "#fff" }} 
                />
                <Area type="monotone" dataKey="momentum" stroke="#6366f1" strokeWidth={2.5} fillOpacity={1} fill="url(#colorMomentum)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Task Completion by Categories */}
        <div className="p-6 rounded-2xl bg-neutral-900/40 border border-neutral-900">
          <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-100 flex items-center space-x-2 mb-4">
            <Layers className="w-4 h-4 text-purple-400" />
            <span>Completed Tasks Category Distribution</span>
          </h3>

          <div className="h-60 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={getTasksDistributionDataset()}>
                <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                <XAxis dataKey="name" stroke="#737373" style={{ fontSize: "10px" }} />
                <YAxis stroke="#737373" style={{ fontSize: "10px" }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#171717", borderColor: "#404040", borderRadius: "10px", fontSize: "11px", color: "#fff" }} 
                />
                <Bar dataKey="completed" fill="#a855f7" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* QUICK ADD MODAL */}
      <AnimatePresence>
        {showQuickAdd && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-neutral-950/80 backdrop-blur-md" onClick={() => setShowQuickAdd(false)} />
            
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg bg-neutral-900 border border-neutral-800 p-6 rounded-2xl shadow-2xl relative z-10 text-left text-xs"
            >
              <button 
                onClick={() => setShowQuickAdd(false)} 
                className="absolute top-4 right-4 text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
                <Plus className="w-5 h-5 text-indigo-400" />
                <span>Instantly Add New Workspace Task</span>
              </h3>

              <form onSubmit={handleQuickAddSubmit} className="space-y-4 font-semibold text-neutral-400">
                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-wider mb-1.5 text-neutral-500">Task Title *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Enter short descriptive task summary name..."
                    value={qTitle}
                    onChange={(e) => setQTitle(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-850 rounded-xl p-2.5 text-white text-xs font-semibold focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase font-bold tracking-wider mb-1.5 text-neutral-500">Category</label>
                    <select 
                      value={qCategory}
                      onChange={(e) => setQCategory(e.target.value as Task["category"])}
                      className="w-full bg-neutral-950 border border-neutral-850 rounded-xl p-2 text-white font-medium cursor-pointer focus:outline-none"
                    >
                      <option value="Study">Study</option>
                      <option value="Work">Work</option>
                      <option value="Personal">Personal</option>
                      <option value="Finance">Finance</option>
                      <option value="Health">Health</option>
                      <option value="Career">Career</option>
                      <option value="Projects">Projects</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold tracking-wider mb-1.5 text-neutral-500">Priority Level</label>
                    <select 
                      value={qPriority}
                      onChange={(e) => setQPriority(e.target.value as Task["priority"])}
                      className="w-full bg-neutral-950 border border-neutral-850 rounded-xl p-2 text-white font-medium cursor-pointer focus:outline-none"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Critical">Critical</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase font-bold tracking-wider mb-1.5 text-neutral-500">Deadline Target *</label>
                    <input 
                      type="date" 
                      required
                      value={qDeadline}
                      onChange={(e) => setQDeadline(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-850 rounded-xl p-2 text-white text-xs font-medium cursor-pointer focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold tracking-wider mb-1.5 text-neutral-500">Estimated Workload (Hours)</label>
                    <input 
                      type="number" 
                      min="1" 
                      max="12"
                      value={qHours}
                      onChange={(e) => setQHours(Number(e.target.value))}
                      className="w-full bg-neutral-950 border border-neutral-850 rounded-xl p-2 text-white font-medium focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-wider mb-1.5 text-neutral-500">Detailed Description</label>
                  <textarea 
                    rows={3}
                    placeholder="Provide supportive parameters, milestones, or constraints details for AI prioritization scoring..."
                    value={qDesc}
                    onChange={(e) => setQDesc(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-850 rounded-xl p-2.5 text-white font-medium focus:outline-none resize-none"
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg transition-all cursor-pointer"
                >
                  Confirm Addition & Trigger AI priority Engine
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
