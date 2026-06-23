import React, { useState } from "react";
import { 
  Calendar, 
  Clock, 
  Zap, 
  Smile, 
  CheckCircle, 
  Sparkles, 
  ArrowRight,
  Info,
  Timer,
  Heart,
  Coffee
} from "lucide-react";
import { Task, PlannerSchedule } from "../types";

interface PlannerViewProps {
  tasks: Task[];
  onTriggerPlanner: (availableHours: number, energyLevel: PlannerSchedule["energyLevel"]) => Promise<any>;
}

export default function PlannerView({ tasks, onTriggerPlanner }: PlannerViewProps) {
  const [availableHours, setAvailableHours] = useState(6);
  const [energyLevel, setEnergyLevel] = useState<PlannerSchedule["energyLevel"]>("medium");
  const [loadingSchedule, setLoadingSchedule] = useState(false);
  const [schedule, setSchedule] = useState<PlannerSchedule | null>(null);

  const activePendingTasks = tasks.filter(t => t.status === "pending");

  const handleGeneratePlanner = async () => {
    setLoadingSchedule(true);
    try {
      const result = await onTriggerPlanner(availableHours, energyLevel);
      setSchedule({
        dateStr: new Date().toISOString().split('T')[0],
        availableHours,
        energyLevel,
        scheduleBlocks: result.scheduleBlocks || [],
        breakSuggestions: result.breakSuggestions || [],
        aiSummary: result.aiSummary || ""
      });
    } catch (error) {
      console.error("Planner generation failure:", error);
    } finally {
      setLoadingSchedule(false);
    }
  };

  return (
    <div id="planner-tab-content" className="p-6 md:p-8 bg-transparent text-white min-h-screen space-y-8">
      
      {/* Header section */}
      <div>
        <h1 className="text-4xl sm:text-5xl font-display font-black tracking-tighter uppercase leading-none text-white">
          AI DAILY <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">PLANNER</span>
        </h1>
        <p className="text-xs text-neutral-400 mt-1">Calibrate available capacity and leverage Gemini to compute tailored work sprints and focus cycles.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Parameters input widget (Span 1) */}
        <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/10 backdrop-blur-xl h-fit space-y-6">
          <h3 className="text-sm font-display font-black text-white pb-3 border-b border-white/10 flex items-center space-x-2 uppercase tracking-wide">
            <Timer className="w-5 h-5 text-emerald-400" />
            <span>Schedule Calibration</span>
          </h3>

          <div className="space-y-5">
            {/* Hours input Slider */}
            <div>
              <div className="flex justify-between items-center mb-1.5 font-mono">
                <label className="text-[10px] uppercase tracking-wider font-extrabold text-neutral-400">Available Workload Hours</label>
                <span className="text-xs font-black text-emerald-400">{availableHours} Hrs Capacity</span>
              </div>
              <input 
                type="range" 
                min="1" 
                max="12" 
                value={availableHours}
                onChange={(e) => setAvailableHours(Number(e.target.value))}
                className="w-full accent-emerald-500 focus:outline-none cursor-pointer bg-neutral-800 rounded-lg h-2"
              />
              <div className="flex justify-between text-[10px] text-neutral-500 font-mono mt-1">
                <span>1 Hr (Sprint)</span>
                <span>12 Hrs (Overload)</span>
              </div>
            </div>

            {/* Energy selections */}
            <div>
              <label className="block text-[10px] uppercase tracking-wider font-mono font-extrabold mb-2.5 text-neutral-400">Current Biological Energy Level</label>
              <div className="grid grid-cols-3 gap-2">
                {(["low", "medium", "high"] as const).map(level => (
                  <button
                    id={`btn-energy-${level}`}
                    key={level}
                    type="button"
                    onClick={() => setEnergyLevel(level)}
                    className={`p-2.5 rounded-xl border font-bold text-xs capitalize transition-all cursor-pointer ${
                      energyLevel === level 
                        ? "bg-emerald-950/60 border-emerald-500/80 text-emerald-300 shadow-md" 
                        : "bg-black/30 border-white/[0.06] text-neutral-400 hover:text-white"
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Current listing stats context summary */}
          <div className="p-4 bg-black/40 rounded-2xl border border-white/5 space-y-3 font-mono">
            <h4 className="text-[10px] uppercase font-bold text-neutral-400 flex items-center space-x-1.5">
              <Info className="w-3.5 h-3.5 text-neutral-400" />
              <span>Session Payload Context:</span>
            </h4>
            <ul className="space-y-1.5 text-[11px] text-neutral-400">
              <li className="flex justify-between">
                <span>Pending task load:</span>
                <strong className="text-white font-bold">{activePendingTasks.length} elements</strong>
              </li>
              <li className="flex justify-between">
                <span>Database deadline queues:</span>
                <strong className="text-white font-bold">{activePendingTasks.filter(t => t.priority === "Critical" || t.priority === "High").length} hazardous</strong>
              </li>
            </ul>
          </div>

          <button
            id="btn-trigger-ai-planner"
            onClick={handleGeneratePlanner}
            disabled={loadingSchedule || activePendingTasks.length === 0}
            className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:from-neutral-900 disabled:to-neutral-950 disabled:text-neutral-500 font-display font-black text-white text-xs rounded-xl tracking-wider uppercase transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center space-x-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>{loadingSchedule ? "Constructing timeline..." : "Compute AI Timeline Sprints"}</span>
          </button>
          
          {activePendingTasks.length === 0 && (
            <p className="text-[10px] text-red-400 italic text-center mt-2 font-medium">Please add pending tasks first to map the timeline scheduler.</p>
          )}
        </div>

        {/* Schedule Output Blocks (Span 2) */}
        <div id="ai-planner-results" className="lg:col-span-2 space-y-6">
          {schedule ? (
            <div className="space-y-6 animate-fade-in">
              
              {/* Daily coach brief */}
              {schedule.aiSummary && (
                <div className="p-4 rounded-xl bg-emerald-950/15 border border-emerald-900/30 flex items-start space-x-3">
                  <div className="p-2 bg-emerald-950 text-emerald-400 rounded-lg">
                    <Smile className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-neutral-100 flex items-center space-x-1.5">
                      <span>Schedule Alignment Digest:</span>
                      <span className="px-1.5. py-0.5 bg-emerald-950 text-emerald-400 text-[10px] rounded font-semibold font-mono uppercase tracking-widest text-[9px]">GEMINI</span>
                    </h4>
                    <p className="text-xs text-neutral-300 italic mt-1 leading-relaxed">"{schedule.aiSummary}"</p>
                  </div>
                </div>
              )}

              {/* Timeblock chronologies */}
              <div className="p-6 rounded-2xl bg-neutral-900/40 border border-neutral-900 space-y-4">
                <h3 className="text-sm font-extrabold text-white flex items-center space-x-2 pb-3 border-b border-neutral-900">
                  <Calendar className="w-4 h-4 text-emerald-400" />
                  <span>Proposed Workspace Timeblocks ({schedule.dateStr})</span>
                </h3>

                <div className="space-y-3.5 pt-2">
                  {schedule.scheduleBlocks?.map((block, idx) => (
                    <div 
                      key={idx}
                      className={`p-3.5 rounded-xl border flex items-center justify-between gap-4 transition-all ${
                        block.type === "break"
                          ? "bg-neutral-950 border-neutral-850 text-neutral-400"
                          : "bg-emerald-950/5 border-emerald-950/20 text-white hover:border-emerald-900/30"
                      }`}
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`p-1.5 rounded-lg text-xs font-mono font-bold font-semibold min-w-[90px] text-center uppercase ${
                          block.type === "break" ? "bg-neutral-850 text-neutral-500" : "bg-emerald-950 text-emerald-400 border border-emerald-800/30"
                        }`}>
                          {block.time}
                        </div>
                        <div>
                          <h4 className="text-xs font-extrabold">{block.taskTitle}</h4>
                          <span className="text-[10px] text-neutral-500 font-mono capitalize">{block.type} Block duration</span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        {block.type === "break" ? (
                          <Coffee className="w-4 h-4 text-neutral-500" />
                        ) : (
                          <CheckCircle className="w-4 h-4 text-emerald-500 animate-pulse" />
                        )}
                        <span className="text-[10px] text-neutral-500 font-mono">{block.duration} Mins</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Wellness Break Checklists */}
              {schedule.breakSuggestions?.length > 0 && (
                <div id="wellness-breaks-block" className="p-6 rounded-2xl bg-neutral-900/40 border border-neutral-900 space-y-4">
                  <h3 className="text-sm font-extrabold text-white flex items-center space-x-2 pb-3 border-b border-neutral-900">
                    <Heart className="w-4 h-4 text-pink-500" />
                    <span>AI Sensorial Rest & Sensory Break Suggestions</span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    {schedule.breakSuggestions.map((item, index) => (
                      <div key={index} className="px-4 py-3 bg-neutral-950 border border-neutral-850 rounded-xl leading-relaxed text-xs text-neutral-300 hover:border-pink-900/30 transition-all flex items-start space-x-2">
                        <span className="p-1 px-1.5 bg-pink-950 text-pink-400 rounded text-[9px] font-bold mt-0.5 font-mono">B{index + 1}</span>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-12 bg-neutral-900/10 rounded-2xl border border-neutral-900 text-center flex flex-col items-center justify-center space-y-3 h-full min-h-[400px]">
              <Calendar className="w-8 h-8 text-neutral-700" />
              <p className="text-sm font-bold text-neutral-400">Timeblock Calendar currently non-initialized.</p>
              <p className="text-xs text-neutral-500 max-w-sm">Calibrate daily active bounds and trigger the Gemini Engine to lay chronological focus grids.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
