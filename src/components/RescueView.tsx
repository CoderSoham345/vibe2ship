import React, { useState } from "react";
import { 
  ShieldAlert, 
  Clock, 
  Zap, 
  HelpCircle, 
  AlertTriangle, 
  CheckSquare, 
  CheckCircle,
  Play,
  RotateCcw,
  TrendingDown,
  Lock,
  ArrowRight,
  Sparkles,
  Loader2
} from "lucide-react";
import { Task } from "../types";

interface RescueViewProps {
  tasks: Task[];
  onTriggerRescue: (task: Task) => Promise<any>;
  onUpdateTask: (task: Task) => Promise<void>;
}

export default function RescueView({ tasks, onTriggerRescue, onUpdateTask }: RescueViewProps) {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMess, setErrorMess] = useState<string | null>(null);
  const [rescueResults, setRescueResults] = useState<{
    riskExplanation: string;
    recoveryPlan: string[];
    taskBreakdown: { step: string; estMinutes: number }[];
    emergencySchedule: string;
    completionProbability: number;
  } | null>(null);

  // Filter tasks that have High/Critical urgency, or are close to deadlines, or have rescuePlan loaded
  const pendingTasksList = tasks.filter(t => t.status === "pending");
  const criticalTasks = pendingTasksList.filter(t => 
    t.priority === "Critical" || 
    t.priority === "High" || 
    (t.riskScore && t.riskScore > 60)
  );

  const displayTasks = criticalTasks.length > 0 ? criticalTasks : pendingTasksList.slice(0, 4);

  const triggerRescueBlueprint = async (task: Task) => {
    setLoading(true);
    setErrorMess(null);
    setSelectedTask(task);
    setRescueResults(null);
    try {
      const data = await onTriggerRescue(task);
      setRescueResults(data);
      
      // Update task on Firestore with the rescued plan
      const updated = {
        ...task,
        riskScore: data.riskExplanation ? 85 : (task.riskScore || 70),
        rescuePlan: {
          riskExplanation: data.riskExplanation,
          recoveryPlan: data.recoveryPlan,
          taskBreakdown: data.taskBreakdown,
          emergencySchedule: data.emergencySchedule,
          completionProbability: data.completionProbability
        }
      };
      await onUpdateTask(updated);
    } catch (err: any) {
      console.error(err);
      setErrorMess("Temporarily utilizing automated tactical guide. Let's draft your solution now.");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckboxChange = async (task: Task) => {
    const updated = {
      ...task,
      status: "completed" as const,
      completedAt: new Date().toISOString()
    };
    await onUpdateTask(updated);
    if (selectedTask?.taskId === task.taskId) {
      setSelectedTask(null);
      setRescueResults(null);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto py-2">
      {/* Red Alert Header Banner */}
      <div className="relative p-6 md:p-8 rounded-3xl bg-gradient-to-r from-[#1c0710] via-[#0f0408] to-[#04040a] border border-red-500/25 overflow-hidden shadow-xl shadow-red-500/5">
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/10 rounded-full filter blur-[90px] pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-red-500/15 border border-red-500/40 text-[10px] font-bold text-red-400 uppercase tracking-wider leading-none">
              <ShieldAlert className="w-3.5 h-3.5 animate-pulse" />
              <span>SaaS Rescue Control</span>
            </div>
            <h1 className="text-xl md:text-2xl font-black text-white leading-tight font-display tracking-tight uppercase">
              Emergency Recovery Corridor
            </h1>
            <p className="text-[11px] text-neutral-400 leading-normal max-w-xl font-medium">
              When workloads accumulate or target deadlines squeeze closer, activate the AI Rescue protocol. 
              The engine structures simplified phases, isolates environment noise, and outputs minute-by-minute action plans.
            </p>
          </div>
          <div className="p-4 bg-red-950/25 border border-red-900/30 rounded-2xl flex flex-col items-center justify-center flex-shrink-0 text-center min-w-[140px]">
            <span className="text-[10px] text-red-300 font-mono tracking-widest font-extrabold uppercase">CRITICAL RISKS</span>
            <span className="text-3xl font-black font-mono text-red-500 mt-1 animate-pulse">
              {criticalTasks.length}
            </span>
            <span className="text-[9px] text-neutral-400 mt-1 font-medium">pending attention</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Column - High Risk Items selection */}
        <div className="md:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs uppercase font-mono font-black text-white tracking-widest">
              Risk Backlog Queue
            </h3>
            <span className="text-[10px] text-neutral-500 px-2 py-0.5 rounded bg-neutral-900 font-bold">
              {displayTasks.length} total
            </span>
          </div>

          {displayTasks.length === 0 ? (
            <div className="p-6 rounded-2xl bg-[#090915] border border-neutral-900 text-center space-y-2.5">
              <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto" />
              <h4 className="text-xs font-bold text-neutral-200 uppercase">Clear Radar Screen</h4>
              <p className="text-[10px] text-neutral-400">
                Excellent! You have 0 pending critical tasks. All deadlines are well within safe velocity limits.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {displayTasks.map((t) => {
                const isSelected = selectedTask?.taskId === t.taskId;
                return (
                  <div 
                    key={t.taskId}
                    className={`p-3.5 rounded-2xl border transition-all ${
                      isSelected 
                        ? "bg-red-500/10 border-red-500/60 ring-1 ring-red-500/30" 
                        : "bg-[#06060f]/60 hover:bg-[#0c0c1b]/80 border-neutral-850"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <label className="flex items-start space-x-2.5 cursor-pointer mt-0.5">
                        <input
                          type="checkbox"
                          checked={t.status === "completed"}
                          onChange={() => handleCheckboxChange(t)}
                          className="rounded border-neutral-700 bg-neutral-900 text-red-500 focus:ring-0 w-3.5 h-3.5 mt-0.5"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className={`text-xs font-bold text-neutral-100 ${t.status === "completed" ? "line-through text-neutral-500 font-normal" : ""}`}>
                            {t.title}
                          </h4>
                          <span className="text-[9px] font-mono text-neutral-400 mt-0.5 inline-block">
                            Due {t.deadline || "ASAP"}
                          </span>
                        </div>
                      </label>

                      <div className="flex flex-col items-end gap-1 flex-shrink-0">
                        <span className={`px-1.5 py-0.5 text-[8px] font-extrabold uppercase rounded font-mono ${
                          t.priority === "Critical" 
                            ? "bg-red-500/15 border border-red-500/40 text-red-400" 
                            : "bg-amber-500/15 border border-amber-500/40 text-amber-400"
                        }`}>
                          {t.priority}
                        </span>
                        
                        {t.riskScore && (
                          <span className="text-[8px] font-medium text-[#ff7171] font-mono leading-none mt-1">
                            Risk {t.riskScore}%
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-neutral-900 flex items-center justify-between">
                      <span className="text-[9px] text-neutral-400 font-medium font-sans">
                        ⏱ Est: {t.estimatedHours} Hrs
                      </span>
                      
                      <button
                        onClick={() => triggerRescueBlueprint(t)}
                        disabled={loading}
                        className="px-2.5 py-1 bg-red-600 hover:bg-red-500 text-white font-bold text-[8px] uppercase tracking-wider rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Zap className="w-2.5 h-2.5 text-white" />
                        <span>Rescue Blueprint</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column - Active Plan Screen results */}
        <div className="md:col-span-7">
          {loading ? (
            <div className="h-full min-h-[300px] flex flex-col items-center justify-center p-8 bg-[#04040a]/40 border border-neutral-850 rounded-3xl space-y-3">
              <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
              <div className="text-center space-y-1">
                <h4 className="text-xs font-black text-white uppercase tracking-wider font-mono">
                  Running Risk Calibrator...
                </h4>
                <p className="text-[10px] text-neutral-400 leading-normal max-w-xs">
                  Momentum AI is breaking down deliverables, synthesizing emergency steps, and building your tactical mitigation schedule.
                </p>
              </div>
            </div>
          ) : selectedTask && rescueResults ? (
            <div className="bg-[#050510]/80 p-5 md:p-6 rounded-3xl border border-red-500/30 space-y-5 animate-in fade-in zoom-in-95 duration-200">
              
              {/* Header Active task */}
              <div className="flex items-start justify-between border-b border-red-950/40 pb-4">
                <div className="space-y-1 max-w-[80%]">
                  <span className="text-[8px] font-mono font-black text-red-400 uppercase tracking-widest leading-none">
                    MITIGATION SPRINT FOR:
                  </span>
                  <h3 className="text-sm font-black text-white tracking-tight">
                    {selectedTask.title}
                  </h3>
                </div>
                
                {/* Completion Probability Circle */}
                <div className="flex flex-col items-center bg-red-500/10 border border-red-500/30 px-3 py-1 rounded-xl">
                  <span className="text-[8px] text-[#ff7171] uppercase font-mono font-bold leading-none">PROBABILITY</span>
                  <span className="text-lg font-black text-red-400 font-mono mt-0.5">
                    {rescueResults.completionProbability}%
                  </span>
                </div>
              </div>

              {/* Diagnosis Box */}
              <div className="space-y-1.5 p-3.5 bg-red-950/15 border border-red-505/20 rounded-2xl">
                <h4 className="text-[10px] uppercase font-mono font-black text-red-300 flex items-center gap-1.5 leading-none">
                  <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                  AI Risk Assessment
                </h4>
                <p className="text-[10px] text-[#ffc6c6] leading-relaxed font-sans font-medium">
                  {rescueResults.riskExplanation}
                </p>
              </div>

              {/* Action Rules List */}
              <div className="space-y-2">
                <h4 className="text-[10px] uppercase font-mono font-black text-white tracking-widest">
                  Tactical Action Guidelines
                </h4>
                <ul className="space-y-2">
                  {rescueResults.recoveryPlan.map((rule, i) => (
                    <li key={i} className="flex items-start space-x-2 text-[10px] text-neutral-300">
                      <span className="text-red-500 text-xs mt-0.5">•</span>
                      <span className="leading-normal font-sans font-medium">{rule}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Steps Timeline Grid */}
              <div className="space-y-2.5">
                <h4 className="text-[10px] uppercase font-mono font-black text-white tracking-widest">
                  Progressive Task Breakdown
                </h4>
                <div className="grid grid-cols-1 gap-1.5">
                  {rescueResults.taskBreakdown.map((step, i) => (
                    <div key={i} className="flex items-center justify-between p-2.5 bg-white/[0.01] hover:bg-white/[0.03] border border-neutral-900 rounded-xl transition-colors">
                      <div className="flex items-center space-x-2.5">
                        <span className="w-4 h-4 rounded bg-red-950/40 border border-red-500/30 text-[9px] font-mono font-bold text-red-400 flex items-center justify-center">
                          {i + 1}
                        </span>
                        <span className="text-[10px] text-neutral-200 font-semibold truncate max-w-[220px]">
                          {step.step}
                        </span>
                      </div>
                      <span className="text-[9px] font-mono font-bold text-neutral-400 bg-neutral-900 border border-neutral-800 px-2 py-0.5 rounded-md flex-shrink-0">
                        ⏱ {step.estMinutes} mins
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Emergency Schedule markdown code box */}
              <div className="space-y-1.5">
                <h4 className="text-[10px] uppercase font-mono font-black text-white tracking-widest">
                  Emergency Hour-by-Hour Timeline
                </h4>
                <div className="p-3 bg-neutral-950 border border-neutral-850 rounded-2xl font-mono text-[9px] text-[#ffbcbc] leading-relaxed whitespace-pre-wrap">
                  {rescueResults.emergencySchedule}
                </div>
              </div>

              {/* Completed action button */}
              <button
                onClick={() => handleCheckboxChange(selectedTask)}
                className="w-full py-2.5 bg-red-600 hover:bg-red-500 border border-red-400/20 text-white font-black text-[10px] uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-red-650/10 active:scale-97 cursor-pointer"
              >
                Complete Mitigated Sprints & De-escalate Alert
              </button>

            </div>
          ) : (
            <div className="h-full min-h-[300px] flex flex-col items-center justify-center p-8 bg-dashed border-2 border-neutral-900 rounded-3xl text-center space-y-3.5">
              <div className="p-3 rounded-full bg-neutral-900">
                <ShieldAlert className="w-8 h-8 text-neutral-600" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wide">
                  Rescue Diagnostic Console
                </h4>
                <p className="text-[10px] text-neutral-500 max-w-xs leading-normal">
                  Select a critical task from your left backlog panel and launch the "Rescue Blueprint" command to model a real-time crisis schedule.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
