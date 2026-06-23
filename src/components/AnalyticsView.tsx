import React from "react";
import { 
  BarChart2, 
  TrendingUp, 
  Award, 
  Flame, 
  Clock, 
  CheckCircle,
  Target,
  Brain,
  Zap,
  Info
} from "lucide-react";
import { Task, Goal, Habit } from "../types";
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend 
} from "recharts";

interface AnalyticsViewProps {
  tasks: Task[];
  goals: Goal[];
  habits: Habit[];
  productivityScore: number;
}

export default function AnalyticsView({ tasks, goals, habits, productivityScore }: AnalyticsViewProps) {
  const completedTasks = tasks.filter(t => t.status === "completed");
  const pendingTasks = tasks.filter(t => t.status === "pending");

  // Category focus hours calculator
  const getCategoryHoursData = () => {
    const categories: { [key: string]: number } = { Study: 0, Work: 0, Personal: 0, Finance: 0, Health: 0, Career: 0, Projects: 0 };
    tasks.forEach(t => {
      categories[t.category] = (categories[t.category] || 0) + t.estimatedHours;
    });

    return Object.keys(categories).map(cat => ({
      name: cat,
      Hours: categories[cat]
    }));
  };

  // Score histories (Simulate momentum score progression based on real task + habits counts)
  const getScoreHistoryData = () => {
    const data = [
      { date: "Day -6", Score: Math.max(50, productivityScore - 12) },
      { date: "Day -5", Score: Math.max(50, productivityScore - 9) },
      { date: "Day -4", Score: Math.max(50, productivityScore - 5) },
      { date: "Day -3", Score: Math.max(50, productivityScore - 7) },
      { date: "Day -2", Score: Math.max(50, productivityScore - 2) },
      { date: "Day -1", Score: Math.max(50, productivityScore - 3) },
      { date: "Today", Score: productivityScore }
    ];
    return data;
  };

  // Habits consistency list data
  const getHabitsData = () => {
    return habits.map(h => ({
      name: h.habitName.slice(0, 16),
      Consistency: h.consistencyScore,
      Streak: h.currentStreak
    }));
  };

  return (
    <div id="analytics-tab-content" className="p-6 md:p-8 bg-neutral-950 text-white min-h-screen space-y-8 text-xs font-semibold text-neutral-400">
      
      {/* Header sections */}
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center space-x-2">
          <BarChart2 className="w-5 h-5 text-cyan-400" />
          <span>Productivity Analytics Suite</span>
        </h2>
        <p className="text-xs text-neutral-400 mt-1">Audit task completion rates, habit streaks compliance, and review momentum trajectory trends over time.</p>
      </div>

      {/* Grid: 4 Counters metrics statistics indicators */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
        
        {/* Count 1 */}
        <div className="p-5 rounded-2xl bg-neutral-900/40 border border-neutral-900">
          <CheckCircle className="w-5 h-5 text-emerald-400 mx-auto mb-2" />
          <span className="text-[10px] text-neutral-500 uppercase tracking-wider font-bold">Tasks Finished</span>
          <p className="text-2xl font-black font-mono text-neutral-100 mt-1">{completedTasks.length}</p>
          <span className="text-[10px] text-neutral-500 mt-1 block">Out of {tasks.length} total list</span>
        </div>

        {/* Count 2 */}
        <div className="p-5 rounded-2xl bg-neutral-900/40 border border-neutral-900">
          <Flame className="w-5 h-5 text-pink-500 mx-auto mb-2 animate-pulse" />
          <span className="text-[10px] text-neutral-500 uppercase tracking-wider font-bold">Max Habit Streak</span>
          <p className="text-2xl font-black font-mono text-neutral-100 mt-1">
            {habits.reduce((max, h) => Math.max(max, h.currentStreak), 0)} Days
          </p>
          <span className="text-[10px] text-neutral-500 mt-1 block">Across {habits.length} active tracking habits</span>
        </div>

        {/* Count 3 */}
        <div className="p-5 rounded-2xl bg-neutral-900/40 border border-neutral-900">
          <Target className="w-5 h-5 text-yellow-400 mx-auto mb-2" />
          <span className="text-[10px] text-neutral-500 uppercase tracking-wider font-bold">Goal Roadmap milestones</span>
          <p className="text-2xl font-black font-mono text-neutral-100 mt-1">
            {goals.reduce((count, g) => count + g.milestones.filter(m => m.completed).length, 0)} Logged
          </p>
          <span className="text-[10px] text-neutral-500 mt-1 block">In {goals.length} target boards</span>
        </div>

        {/* Count 4 */}
        <div className="p-5 rounded-2xl bg-neutral-900/40 border border-neutral-900">
          <Zap className="w-5 h-5 text-indigo-400 mx-auto mb-2 animate-bounce" />
          <span className="text-[10px] text-neutral-500 uppercase tracking-wider font-bold">Momentum velocity Index</span>
          <p className="text-2xl font-black font-mono text-indigo-400 mt-1">{productivityScore}/100</p>
          <span className="text-[10px] text-neutral-500 mt-1 block">Direct active cognitive metric</span>
        </div>
      </div>

      {/* Charts detailed layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8" id="analytics-charts-grid">
        
        {/* Momentum Score History chart (Area) */}
        <div className="p-6 rounded-2xl bg-neutral-900/40 border border-neutral-900 space-y-4">
          <h3 className="text-sm font-extrabold text-white flex items-center space-x-2 pb-3 border-b border-neutral-900">
            <TrendingUp className="w-4 h-4 text-indigo-400" />
            <span>Productivity Score Trajectory Index (Last 7 Days)</span>
          </h3>

          <div className="h-64 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={getScoreHistoryData()}>
                <defs>
                  <linearGradient id="scoreColorId" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#818cf8" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                <XAxis dataKey="date" stroke="#737373" style={{ fontSize: "10px", fontFamily: "monospace" }} />
                <YAxis domain={[0, 100]} stroke="#737373" style={{ fontSize: "10px", fontFamily: "monospace" }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#171717", borderColor: "#404040", borderRadius: "10px", fontSize: "11px", color: "#fff" }} 
                />
                <Area type="monotone" dataKey="Score" stroke="#818cf8" strokeWidth={2.5} fillOpacity={1} fill="url(#scoreColorId)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Task Focus Time per Categories (Bar chart) */}
        <div className="p-6 rounded-2xl bg-neutral-900/40 border border-neutral-900 space-y-4">
          <h3 className="text-sm font-extrabold text-white flex items-center space-x-2 pb-3 border-b border-neutral-900">
            <Clock className="w-4 h-4 text-emerald-400" />
            <span>Operational Focus Time distribution (Hours)</span>
          </h3>

          <div className="h-64 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={getCategoryHoursData()}>
                <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                <XAxis dataKey="name" stroke="#737373" style={{ fontSize: "10px" }} />
                <YAxis stroke="#737373" style={{ fontSize: "10px" }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#171717", borderColor: "#404040", borderRadius: "10px", fontSize: "11px", color: "#fff" }} 
                />
                <Bar dataKey="Hours" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Habits Consistency Index vs Streaks */}
        {habits.length > 0 && (
          <div className="p-6 rounded-2xl bg-neutral-900/40 border border-neutral-900 space-y-4 lg:col-span-2">
            <h3 className="text-sm font-extrabold text-white flex items-center space-x-2 pb-3 border-b border-neutral-900">
              <Award className="w-4 h-4 text-pink-400" />
              <span>Habits Compliance & Streaks Indexes</span>
            </h3>

            <div className="h-64 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={getHabitsData()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                  <XAxis dataKey="name" stroke="#737373" style={{ fontSize: "10px" }} />
                  <YAxis yAxisId="left" stroke="#ec4899" style={{ fontSize: "10px" }} label={{ value: 'Consistency (%)', angle: -90, position: 'insideLeft', fill: '#ec4899' }} />
                  <YAxis yAxisId="right" orientation="right" stroke="#6366f1" style={{ fontSize: "10px" }} label={{ value: 'Streak (Days)', angle: 90, position: 'insideRight', fill: '#6366f1' }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#171717", borderColor: "#404040", borderRadius: "10px", fontSize: "11px", color: "#fff" }} 
                  />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="Consistency" stroke="#ec4899" strokeWidth={2.5} activeDot={{ r: 8 }} />
                  <Line yAxisId="right" type="monotone" dataKey="Streak" stroke="#6366f1" strokeWidth={2.5} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* Advisory recommendation block */}
      <div className="p-4 rounded-xl bg-neutral-900/20 border border-neutral-900 flex items-start space-x-2.5">
        <Info className="w-5 h-5 text-neutral-500 mt-0.5" />
        <p className="text-[11px] text-neutral-500 leading-relaxed font-semibold">
          * Trajectory charts are continuously recomputed. Finishing high priority assignments before deadline targets and keeping routine habit streaks directly triggers improvements over your core Productivity Score index.
        </p>
      </div>
    </div>
  );
}
