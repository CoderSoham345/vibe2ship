import React, { useState } from "react";
import { 
  Plus, 
  Search, 
  Filter, 
  Trash2, 
  CheckSquare, 
  Archive, 
  Copy, 
  Sparkles, 
  Edit3, 
  Tag, 
  AlertOctagon, 
  ChevronDown, 
  Clock, 
  Zap,
  Info
} from "lucide-react";
import { Task } from "../types";

interface TasksViewProps {
  tasks: Task[];
  onAddTask: (task: Omit<Task, "taskId" | "createdAt" | "riskScore">) => Promise<void>;
  onEditTask: (taskId: string, updatedFields: Partial<Task>) => Promise<void>;
  onDeleteTask: (taskId: string) => Promise<void>;
  onTriggerPrioritize: (task: Task) => Promise<any>;
}

export default function TasksView({
  tasks,
  onAddTask,
  onEditTask,
  onDeleteTask,
  onTriggerPrioritize
}: TasksViewProps) {
  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [priorityFilter, setPriorityFilter] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState<string>("pending"); // pending, completed, archived, All

  // Form states for creating/editing task
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<Task["category"]>("Study");
  const [priority, setPriority] = useState<Task["priority"]>("Medium");
  const [deadline, setDeadline] = useState("");
  const [estimatedHours, setEstimatedHours] = useState(2);
  const [description, setDescription] = useState("");

  // AI triggering feedback list
  const [prioritizingTaskId, setPrioritizingTaskId] = useState<string | null>(null);

  // Form submit (Add or Edit)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !deadline) return;

    try {
      if (editingTaskId) {
        // Edit flow
        await onEditTask(editingTaskId, {
          title,
          description,
          category,
          priority,
          deadline,
          estimatedHours: Number(estimatedHours)
        });
      } else {
        // Add flow
        await onAddTask({
          title,
          description,
          category,
          priority,
          deadline,
          estimatedHours: Number(estimatedHours),
          status: "pending"
        });
      }
      resetForm();
    } catch (err) {
      console.error(err);
    }
  };

  const resetForm = () => {
    setTitle("");
    setCategory("Study");
    setPriority("Medium");
    setDeadline("");
    setEstimatedHours(2);
    setDescription("");
    setEditingTaskId(null);
    setIsFormOpen(false);
  };

  // Duplicate task helper
  const handleDuplicate = async (task: Task) => {
    try {
      await onAddTask({
        title: `${task.title} (Duplicate)`,
        description: task.description,
        category: task.category,
        priority: task.priority,
        deadline: task.deadline,
        estimatedHours: task.estimatedHours,
        status: "pending"
      });
    } catch (err) {
      console.error("Duplication error:", err);
    }
  };

  // Trigger individual task priority valuation
  const handlePrioritizeAI = async (task: Task) => {
    setPrioritizingTaskId(task.taskId);
    try {
      const result = await onTriggerPrioritize(task);
      // Result contains riskScore, suggestedAction, bestTimeToStart, etc.
      // Update the Firestore database model
      await onEditTask(task.taskId, {
        urgencyScore: result.urgencyScore,
        importanceScore: result.importanceScore,
        difficultyScore: result.difficultyScore,
        priorityRanking: result.priorityRanking,
        suggestedAction: result.suggestedAction,
        bestTimeToStart: result.bestTimeToStart,
        riskScore: result.riskScore || 20 // Default fallback safe risk
      });
    } catch (err) {
      console.error("AI Prioritization failed:", err);
    } finally {
      setPrioritizingTaskId(null);
    }
  };

  // Filtering Logic
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      task.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = categoryFilter === "All" || task.category === categoryFilter;
    const matchesPriority = priorityFilter === "All" || task.priority === priorityFilter;
    
    let matchesStatus = true;
    if (statusFilter !== "All") {
      matchesStatus = task.status === statusFilter;
    }

    return matchesSearch && matchesCategory && matchesPriority && matchesStatus;
  });

  return (
    <div id="tasks-tab-content" className="p-6 md:p-8 space-y-8 bg-transparent text-white min-h-screen">
      
      {/* Upper action and parameters area */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-4xl sm:text-5xl font-display font-black tracking-tighter uppercase leading-none text-white">
            Task <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">Suite</span>
          </h1>
          <p className="text-xs text-neutral-400 mt-1">Implement standard CRUD task structures and activate Gemini diagnostic prioritization layers.</p>
        </div>

        <button
          id="btn-add-task-suite"
          onClick={() => { setIsFormOpen(true); setEditingTaskId(null); }}
          className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-500 hover:from-purple-500 hover:to-indigo-400 rounded-xl text-white font-display font-black text-xs uppercase tracking-wider flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-lg shadow-purple-600/25"
        >
          <Plus className="w-4 h-4" />
          <span>Formulate New Task</span>
        </button>
      </div>

      {/* FILTER PANEL BAR */}
      <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-xl flex flex-col lg:flex-row items-center justify-between gap-4">
        
        {/* Search Input */}
        <div className="relative w-full lg:max-w-xs">
          <Search className="absolute left-3 top-3.5 w-4 h-4 text-neutral-400" />
          <input 
            type="text" 
            placeholder="Search custom task parameters..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-xs font-semibold text-white focus:outline-none focus:border-purple-500"
          />
        </div>

        {/* Option filters */}
        <div className="flex flex-wrap items-center justify-end gap-3 w-full lg:w-auto text-xs">
          {/* Status filter selection */}
          <div className="flex items-center space-x-1.5 bg-black/40 px-3 py-2 rounded-xl border border-white/10">
            <span className="text-[9px] text-neutral-400 uppercase font-black tracking-wider">Status</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-white focus:outline-none font-bold cursor-pointer font-display"
            >
              <option value="pending" className="bg-[#0f0f18] text-white">Pending</option>
              <option value="completed" className="bg-[#0f0f18] text-white">Completed</option>
              <option value="archived" className="bg-[#0f0f18] text-white">Archived</option>
              <option value="All" className="bg-[#0f0f18] text-white">All Tracks</option>
            </select>
          </div>

          {/* Category Filter */}
          <div className="flex items-center space-x-1.5 bg-black/40 px-3 py-2 rounded-xl border border-white/10">
            <Tag className="w-3.5 h-3.5 text-purple-400" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-transparent text-white focus:outline-none font-bold cursor-pointer font-display"
            >
              <option value="All" className="bg-[#0f0f18] text-white">All Categories</option>
              <option value="Study" className="bg-[#0f0f18] text-white">Study</option>
              <option value="Work" className="bg-[#0f0f18] text-white">Work</option>
              <option value="Personal" className="bg-[#0f0f18] text-white">Personal</option>
              <option value="Finance" className="bg-[#0f0f18] text-white">Finance</option>
              <option value="Health" className="bg-[#0f0f18] text-white">Health</option>
              <option value="Career" className="bg-[#0f0f18] text-white">Career</option>
              <option value="Projects" className="bg-[#0f0f18] text-white">Projects</option>
            </select>
          </div>

          {/* Priority filter */}
          <div className="flex items-center space-x-1.5 bg-black/40 px-3 py-2 rounded-xl border border-white/10">
            <AlertOctagon className="w-3.5 h-3.5 text-red-400" />
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-transparent text-white focus:outline-none font-bold cursor-pointer font-display"
            >
              <option value="All" className="bg-[#0f0f18] text-white">All Priorities</option>
              <option value="Critical" className="bg-[#0f0f18] text-white">Critical</option>
              <option value="High" className="bg-[#0f0f18] text-white">High</option>
              <option value="Medium" className="bg-[#0f0f18] text-white">Medium</option>
              <option value="Low" className="bg-[#0f0f18] text-white">Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* DETAILED TASK LIST TIMELINE CARD CONTAINER */}
      <div className="space-y-4" id="filtered-task-listing">
        {filteredTasks.length === 0 ? (
          <div className="p-12 bg-neutral-900/10 rounded-2xl border border-neutral-900 text-center">
            <p className="text-sm font-semibold text-neutral-400">No matching tasks recorded in database folder.</p>
            <p className="text-xs text-neutral-500 mt-1">Please redefine filter metrics or create a new assignment above.</p>
          </div>
        ) : (
          filteredTasks.map(task => {
            const hasAIPriorities = task.urgencyScore !== undefined;

            return (
              <div 
                key={task.taskId}
                className={`p-6 rounded-2xl bg-neutral-900/30 border transition-all ${
                  task.status === "completed" 
                    ? "border-neutral-900 opacity-70 bg-neutral-900/10" 
                    : task.priority === "Critical" 
                      ? "border-red-950/80 hover:border-red-900/60" 
                      : "border-neutral-900 hover:border-indigo-900/40"
                }`}
              >
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-4 border-b border-neutral-900/80">
                  <div className="flex items-start space-x-4">
                    {/* Tick Checkbox */}
                    <button
                      id={`btn-complete-task-suite-${task.taskId}`}
                      onClick={() => onEditTask(task.taskId, { status: task.status === "completed" ? "pending" : "completed", completedAt: new Date().toISOString() })}
                      className={`w-6 h-6 rounded-full border flex items-center justify-center transition-colors cursor-pointer mt-1 ${
                        task.status === "completed"
                          ? "bg-emerald-600 border-emerald-500 text-white"
                          : "border-neutral-700 hover:border-emerald-500 text-transparent hover:text-emerald-500"
                      }`}
                    >
                      <CheckSquare className="w-4 h-4" />
                    </button>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2 py-0.5 bg-neutral-950 text-neutral-300 text-[10px] rounded border border-neutral-850 font-semibold font-mono uppercase">
                          {task.category}
                        </span>
                        
                        <span className={`px-2 py-0.5 text-[10px] rounded font-bold uppercase ${
                          task.priority === "Critical" ? "bg-red-950 text-red-400" :
                          task.priority === "High" ? "bg-orange-950 text-orange-400" :
                          task.priority === "Medium" ? "bg-indigo-950 text-indigo-400" : "bg-neutral-800 text-neutral-400"
                        }`}>
                          {task.priority}
                        </span>

                        {task.riskScore >= 60 && task.status === "pending" && (
                          <span className="px-1.5 py-0.5 bg-red-600 text-white text-[9px] rounded font-bold uppercase animate-pulse">
                            High Risk Match
                          </span>
                        )}
                      </div>

                      <h3 className={`text-base font-extrabold text-white mt-2.5 ${task.status === "completed" ? "line-through text-neutral-500" : ""}`}>
                        {task.title}
                      </h3>
                      <p className="text-xs text-neutral-400 mt-1 max-w-2xl leading-relaxed">{task.description || "No description provided."}</p>
                    </div>
                  </div>

                  {/* Right side operational tools */}
                  <div className="flex flex-wrap items-center gap-2.5 lg:justify-end text-xs font-semibold">
                    <div className="flex items-center space-x-1.5 text-neutral-500 font-mono text-[11px] bg-neutral-950/60 p-1.5 rounded-lg border border-neutral-850">
                      <Clock className="w-4 h-4 text-neutral-400" />
                      <span>{task.estimatedHours} Hrs Load</span>
                    </div>

                    <div className="text-[11px] font-mono font-bold text-neutral-400 bg-neutral-950/60 p-1.5 rounded-lg border border-neutral-850">
                      DUE: {task.deadline}
                    </div>

                    <button
                      id={`btn-edit-task-suite-${task.taskId}`}
                      onClick={() => {
                        setTitle(task.title);
                        setDescription(task.description);
                        setCategory(task.category);
                        setPriority(task.priority);
                        setDeadline(task.deadline);
                        setEstimatedHours(task.estimatedHours);
                        setEditingTaskId(task.taskId);
                        setIsFormOpen(true);
                      }}
                      className="p-2 bg-neutral-950/60 hover:bg-indigo-950/80 border border-neutral-850 hover:border-indigo-800/40 rounded-xl text-neutral-300 hover:text-white cursor-pointer"
                      title="Edit"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      id={`btn-duplicate-task-${task.taskId}`}
                      onClick={() => handleDuplicate(task)}
                      className="p-2 bg-neutral-950/60 hover:bg-indigo-950/80 border border-neutral-850 hover:border-indigo-800/40 rounded-xl text-neutral-300 hover:text-white cursor-pointer"
                      title="Duplicate"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>

                    <button
                      id={`btn-archive-task-${task.taskId}`}
                      onClick={() => onEditTask(task.taskId, { status: task.status === "archived" ? "pending" : "archived" })}
                      className="p-2 bg-neutral-950/60 hover:bg-amber-950/80 border border-neutral-850 hover:border-amber-800/40 rounded-xl text-neutral-300 hover:text-amber-400 cursor-pointer"
                      title={task.status === "archived" ? "Unarchive" : "Archive"}
                    >
                      <Archive className="w-3.5 h-3.5" />
                    </button>

                    <button
                      id={`btn-delete-task-suite-${task.taskId}`}
                      onClick={() => onDeleteTask(task.taskId)}
                      className="p-2 bg-neutral-950/60 hover:bg-red-950/80 border border-neutral-850 hover:border-red-800/40 rounded-xl text-neutral-300 hover:text-red-400 cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* AI ENGINE SCORE DATA EXPANSION BLOCK */}
                <div className="pt-4 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
                  <div className="flex-1">
                    {hasAIPriorities ? (
                      <div className="space-y-2.5">
                        <div className="flex items-center space-x-2 text-purple-400 font-bold">
                          <Sparkles className="w-4 h-4 animate-spin-slow" />
                          <span>Gemini Priority Diagnosis:</span>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          <div className="bg-neutral-950 p-2.5 rounded-xl border border-neutral-850 text-center">
                            <span className="text-[10px] text-neutral-500 uppercase tracking-wider font-bold">Urgency</span>
                            <div className="text-sm font-extrabold font-mono text-purple-300 mt-0.5">{task.urgencyScore}%</div>
                          </div>
                          <div className="bg-neutral-950 p-2.5 rounded-xl border border-neutral-850 text-center">
                            <span className="text-[10px] text-neutral-500 uppercase tracking-wider font-bold">Importance</span>
                            <div className="text-sm font-extrabold font-mono text-purple-300 mt-0.5">{task.importanceScore}%</div>
                          </div>
                          <div className="bg-neutral-950 p-2.5 rounded-xl border border-neutral-850 text-center">
                            <span className="text-[10px] text-neutral-500 uppercase tracking-wider font-bold">Difficulty</span>
                            <div className="text-sm font-extrabold font-mono text-purple-300 mt-0.5">{task.difficultyScore}%</div>
                          </div>
                          <div className="bg-neutral-950 p-2.5 rounded-xl border border-neutral-850 text-center">
                            <span className="text-[10px] text-neutral-500 uppercase tracking-wider font-bold">Risk Ratio</span>
                            <div className="text-sm font-extrabold font-mono text-red-400 mt-0.5">{task.riskScore}%</div>
                          </div>
                        </div>

                        {task.suggestedAction && (
                          <div className="mt-3 p-3 bg-indigo-950/20 border border-indigo-950/60 rounded-xl flex items-start space-x-2 text-neutral-300">
                            <Zap className="col-span-1 w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="text-[11px] text-indigo-300 uppercase font-black tracking-wide">Suggested Launch Blueprint:</p>
                              <p className="text-xs text-neutral-200 mt-0.5 font-medium leading-relaxed">{task.suggestedAction}</p>
                              {task.bestTimeToStart && (
                                <p className="text-[11px] text-neutral-400 mt-1">Best entry time: <strong className="text-emerald-400">{task.bestTimeToStart}</strong></p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2 text-neutral-400 italic">
                        <Info className="w-4 h-4" />
                        <span>Task has not been computed. Trigger first-pass diagnostic prioritization below.</span>
                      </div>
                    )}
                  </div>

                  <div className="flex-shrink-0 flex justify-end">
                    <button
                      id={`btn-prioritize-task-${task.taskId}`}
                      onClick={() => handlePrioritizeAI(task)}
                      disabled={prioritizingTaskId === task.taskId || task.status === "completed"}
                      className="px-4 py-2 bg-purple-950 hover:bg-purple-900 border border-purple-800/40 text-purple-300 hover:text-white rounded-xl text-xs font-bold transition-all flex items-center space-x-2 cursor-pointer disabled:bg-neutral-900 disabled:border-transparent disabled:text-neutral-600"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{prioritizingTaskId === task.taskId ? "Consulting Gemini..." : "Refresh Priority Scores"}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* DETAILED ADD/EDIT TASK BOTTOM MODAL */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-neutral-950/90 backdrop-blur-sm" onClick={resetForm} />
          
          <div className="w-full max-w-lg bg-neutral-900 border border-neutral-800 p-6 rounded-2xl shadow-xl relative z-10 text-left text-xs font-semibold text-neutral-400">
            <button 
              onClick={resetForm}
              className="absolute top-4 right-4 text-neutral-400 hover:text-white cursor-pointer"
            >
              <ChevronDown className="w-6 h-6" />
            </button>

            <h3 className="text-lg font-black text-white mb-4">
              {editingTaskId ? "Edit Task configurations" : "Launch New Task Module"}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase tracking-wider mb-1.5 text-neutral-500 font-bold">Workspace Title *</label>
                <input 
                  type="text" 
                  required
                  placeholder="Task title..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-850 rounded-xl p-2.5 text-white text-xs font-medium focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider mb-1.5 text-neutral-500 font-bold">Category</label>
                  <select 
                    value={category}
                    onChange={(e) => setCategory(e.target.value as Task["category"])}
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
                  <label className="block text-[10px] uppercase tracking-wider mb-1.5 text-neutral-500 font-bold">Initial Priority Level</label>
                  <select 
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as Task["priority"])}
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
                  <label className="block text-[10px] uppercase tracking-wider mb-1.5 text-neutral-500 font-bold">Deadline *</label>
                  <input 
                    type="date" 
                    required
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-850 rounded-xl p-2 text-white font-medium cursor-pointer focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-wider mb-1.5 text-neutral-500 font-bold">workload Hours Estimate</label>
                  <input 
                    type="number" 
                    min="1" 
                    max="12"
                    value={estimatedHours}
                    onChange={(e) => setEstimatedHours(Number(e.target.value))}
                    className="w-full bg-neutral-950 border border-neutral-850 rounded-xl p-2 text-white font-medium focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider mb-1.5 text-neutral-500 font-bold">Detailed Description</label>
                <textarea 
                  rows={4}
                  placeholder="Insert links, subtasks context, or grading metrics for Gemini analysis..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-850 rounded-xl p-2.5 text-white font-medium focus:outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-5 py-2.5 bg-neutral-800 hover:bg-neutral-750 text-neutral-300 font-bold text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl cursor-pointer"
                >
                  {editingTaskId ? "Save Modifications" : "Instantiate Task Item"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
