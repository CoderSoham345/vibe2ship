import React, { useState, useEffect, useRef } from "react";
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
  Coffee,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Edit,
  Activity,
  Sliders,
  Check,
  Target
} from "lucide-react";
import { auth, db, collection, addDoc, updateDoc, deleteDoc, onSnapshot, doc } from "../firebase";
import { Task, PlannerSchedule, CalendarEvent } from "../types";

interface PlannerViewProps {
  tasks: Task[];
  onTriggerPlanner: (availableHours: number, energyLevel: PlannerSchedule["energyLevel"]) => Promise<any>;
}

export default function PlannerView({ tasks, onTriggerPlanner }: PlannerViewProps) {
  // Navigation & View State
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<"month" | "week" | "day">("month");
  
  // Events state
  const [dbEvents, setDbEvents] = useState<CalendarEvent[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);

  // Calibration Form State
  const [availableHours, setAvailableHours] = useState(6);
  const [energyLevel, setEnergyLevel] = useState<PlannerSchedule["energyLevel"]>("medium");
  const [loadingSchedule, setLoadingSchedule] = useState(false);
  const [aiSchedule, setAiSchedule] = useState<PlannerSchedule | null>(null);

  // Modal State for Create/Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [formError, setFormError] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "Medium" as "Low" | "Medium" | "High",
    type: "Work" as "Work" | "Meeting" | "Deep Work" | "Break" | "Personal",
    startTime: "",
    endTime: ""
  });

  // Track dragging event ID
  const [draggingEventId, setDraggingEventId] = useState<string | null>(null);

  // Generate dynamic, relative dummy data for the active week so it is always visible on today's dashboard
  const getDummyEvents = (): CalendarEvent[] => {
    const today = new Date();
    
    const formatDateStr = (offsetDays: number, hour: number, minute: number) => {
      const d = new Date(today);
      d.setDate(today.getDate() + offsetDays);
      d.setHours(hour, minute, 0, 0);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const h = String(d.getHours()).padStart(2, '0');
      const m = String(d.getMinutes()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd}T${h}:${m}`;
    };

    return [
      {
        id: "dummy-1",
        title: "Sprint Retrospective & Calibration",
        description: "Review last week's commits, audit queue index structures, and formulate milestones.",
        priority: "High",
        type: "Meeting",
        startTime: formatDateStr(0, 10, 0),
        endTime: formatDateStr(0, 11, 30),
      },
      {
        id: "dummy-2",
        title: "Deep Workspace Refactoring Sprint",
        description: "Optimize React render loops, stabilize context hooks, and debug performance bottlenecks.",
        priority: "High",
        type: "Deep Work",
        startTime: formatDateStr(0, 13, 0),
        endTime: formatDateStr(0, 15, 30),
      },
      {
        id: "dummy-3",
        title: "Sensorial Reset Break",
        description: "Cooldown buffer interval. Practice focused breathing, stretching, and physical dissociation.",
        priority: "Low",
        type: "Break",
        startTime: formatDateStr(0, 12, 0),
        endTime: formatDateStr(0, 13, 0),
      },
      {
        id: "dummy-4",
        title: "Backlog Operational Pipeline Review",
        description: "Check critical deadline constraints, categorize secondary tasks, and write progress reports.",
        priority: "Medium",
        type: "Work",
        startTime: formatDateStr(1, 14, 0),
        endTime: formatDateStr(1, 15, 30),
      },
      {
        id: "dummy-5",
        title: "Structured DBMS NormalizationProofs",
        description: "Review BCNF key dependencies and academic normalization proving trees.",
        priority: "Medium",
        type: "Personal",
        startTime: formatDateStr(-1, 16, 0),
        endTime: formatDateStr(-1, 17, 30),
      }
    ];
  };

  // Subscribe to real-time events in Firestore
  useEffect(() => {
    let unsubscribe = () => {};
    const uid = auth.currentUser?.uid;
    if (uid) {
      setEventsLoading(true);
      const colRef = collection(db, "users", uid, "events");
      unsubscribe = onSnapshot(colRef, (snapshot) => {
        const list: CalendarEvent[] = [];
        snapshot.forEach((docSnap) => {
          list.push({ id: docSnap.id, ...docSnap.data() } as CalendarEvent);
        });
        setDbEvents(list);
        setEventsLoading(false);
      }, (error) => {
        console.error("Firestore events subscription failed:", error);
        setEventsLoading(false);
      });
    } else {
      setEventsLoading(false);
    }
    return () => unsubscribe();
  }, []);

  // Compute active events (Firestore db events if populated, else falling back to relative dummy events)
  const activeEvents = dbEvents.length > 0 ? dbEvents : getDummyEvents();

  // Active Pending tasks context
  const activePendingTasks = tasks.filter(t => t.status === "pending");

  // Helper date utilities
  const formatDateISOString = (date: Date) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const startDayOfWeek = firstDay.getDay(); // 0 is Sun, 6 is Sat
    const lastDay = new Date(year, month + 1, 0);
    const totalDays = lastDay.getDate();
    
    const days: Date[] = [];
    
    // Previous month overlap days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      days.push(new Date(year, month - 1, prevMonthLastDay - i));
    }
    
    // Target month days
    for (let i = 1; i <= totalDays; i++) {
      days.push(new Date(year, month, i));
    }
    
    // Next month overlap days
    const remaining = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      days.push(new Date(year, month + 1, i));
    }

    while (days.length < 42) {
      const offset = days.length - (totalDays + startDayOfWeek) + 1;
      days.push(new Date(year, month + 1, offset));
    }

    return days;
  };

  const getDaysInWeek = (date: Date) => {
    const dayOfWeek = date.getDay();
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - dayOfWeek);
    
    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      days.push(d);
    }
    return days;
  };

  // Calculate statistics (Requirement 10)
  const statistics = React.useMemo(() => {
    let focusMinutes = 0;
    let meetings = 0;
    let deepWork = 0;

    activeEvents.forEach(evt => {
      const start = new Date(evt.startTime).getTime();
      const end = new Date(evt.endTime).getTime();
      const diffMins = Math.max(0, Math.round((end - start) / 60000));
      
      if (evt.type === "Work" || evt.type === "Deep Work") {
        focusMinutes += diffMins;
      }
      if (evt.type === "Meeting") {
        meetings++;
      }
      if (evt.type === "Deep Work") {
        deepWork++;
      }
    });

    const focusHours = Number((focusMinutes / 60).toFixed(1));
    // Dynamic formula for localized productivity score projection
    const calculatedScore = Math.min(100, Math.max(40, 60 + Math.round(focusHours * 6) + (deepWork * 8) - (meetings * 2)));

    return {
      focusHours,
      meetings,
      deepWorkBlocks: deepWork,
      productivityScore: calculatedScore
    };
  }, [activeEvents]);

  // Handle forward/backward date navigation
  const handleNavigate = (direction: "prev" | "next") => {
    const multiplier = direction === "prev" ? -1 : 1;
    const newDate = new Date(currentDate);

    if (viewMode === "month") {
      newDate.setMonth(currentDate.getMonth() + multiplier, 1);
    } else if (viewMode === "week") {
      newDate.setDate(currentDate.getDate() + (7 * multiplier));
    } else {
      newDate.setDate(currentDate.getDate() + multiplier);
    }
    setCurrentDate(newDate);
  };

  // Convert Date object to datetime-local friendly string (YYYY-MM-DDTHH:mm)
  const toLocalISOString = (d: Date) => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const h = String(d.getHours()).padStart(2, '0');
    const m = String(d.getMinutes()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}T${h}:${m}`;
  };

  // Open modal for Create/Edit
  const handleOpenAddEvent = (initialDate = new Date()) => {
    setSelectedEvent(null);
    setFormError("");
    
    // Set default standard start and end times
    const start = new Date(initialDate);
    start.setHours(9, 0, 0, 0);
    const end = new Date(initialDate);
    end.setHours(10, 30, 0, 0);

    setFormData({
      title: "",
      description: "",
      priority: "Medium",
      type: "Work",
      startTime: toLocalISOString(start),
      endTime: toLocalISOString(end)
    });
    setIsModalOpen(true);
  };

  const handleOpenEditEvent = (evt: CalendarEvent) => {
    setSelectedEvent(evt);
    setFormError("");
    setFormData({
      title: evt.title,
      description: evt.description,
      priority: evt.priority,
      type: evt.type,
      startTime: evt.startTime,
      endTime: evt.endTime
    });
    setIsModalOpen(true);
  };

  // Save Event creation or update
  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!formData.title.trim()) {
      setFormError("Title is required.");
      return;
    }

    const startMs = new Date(formData.startTime).getTime();
    const endMs = new Date(formData.endTime).getTime();

    if (isNaN(startMs) || isNaN(endMs)) {
      setFormError("Please select valid start & end timestamps.");
      return;
    }

    if (endMs <= startMs) {
      setFormError("End time must fall after the start time.");
      return;
    }

    const uid = auth.currentUser?.uid;
    if (!uid) {
      // In guest mode (or offline fallback), we let user simulate addition inside local view
      alert("Authentication required. To save permanently on Firestore, log in first from landing page.");
      setIsModalOpen(false);
      return;
    }

    try {
      if (selectedEvent) {
        // If it was a mock event we are updating, we save standard document to Firestore
        if (selectedEvent.id.startsWith("dummy-")) {
          const colRef = collection(db, "users", uid, "events");
          await addDoc(colRef, {
            title: formData.title,
            description: formData.description,
            priority: formData.priority,
            type: formData.type,
            startTime: formData.startTime,
            endTime: formData.endTime
          });
        } else {
          // Standard real Firestore document update
          const docRef = doc(db, "users", uid, "events", selectedEvent.id);
          await updateDoc(docRef, {
            title: formData.title,
            description: formData.description,
            priority: formData.priority,
            type: formData.type,
            startTime: formData.startTime,
            endTime: formData.endTime
          });
        }
      } else {
        // Create new document on Firestore
        const colRef = collection(db, "users", uid, "events");
        await addDoc(colRef, {
          title: formData.title,
          description: formData.description,
          priority: formData.priority,
          type: formData.type,
          startTime: formData.startTime,
          endTime: formData.endTime
        });
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error("Save action failure:", err);
      setFormError("Unable to write event backlogs onto the Cloud database.");
    }
  };

  // Delete event
  const handleDeleteEventClick = async () => {
    if (!selectedEvent) return;
    const uid = auth.currentUser?.uid;
    if (!uid) {
      alert("Authentic connection is required to delete.");
      setIsModalOpen(false);
      return;
    }

    try {
      if (!selectedEvent.id.startsWith("dummy-")) {
        const docRef = doc(db, "users", uid, "events", selectedEvent.id);
        await deleteDoc(docRef);
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error("Deletion action error:", err);
      setFormError("Could not wipe event block from Firestore logs.");
    }
  };

  // Drag-and-drop movement mechanism (Requirement 6)
  const handleDragStartEvent = (e: React.DragEvent, eventId: string) => {
    setDraggingEventId(eventId);
    e.dataTransfer.setData("text/plain", eventId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleUpdateEventTimeRange = async (eventId: string, newStartISO: string, newEndISO: string) => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    try {
      if (eventId.startsWith("dummy-")) {
        // Automatically save mock events as real Firestore documents when dragged or modified!
        const template = getDummyEvents().find(evt => evt.id === eventId);
        if (template) {
          const colRef = collection(db, "users", uid, "events");
          await addDoc(colRef, {
            title: template.title,
            description: template.description,
            priority: template.priority,
            type: template.type,
            startTime: newStartISO,
            endTime: newEndISO
          });
        }
      } else {
        const docRef = doc(db, "users", uid, "events", eventId);
        await updateDoc(docRef, {
          startTime: newStartISO,
          endTime: newEndISO
        });
      }
    } catch(err) {
      console.error("Draggable movement sync state failure:", err);
    }
  };

  // Drop onto a specific calendar day (Month view)
  const handleDropOnDayCell = async (e: React.DragEvent, targetDateStr: string) => {
    e.preventDefault();
    const eventId = e.dataTransfer.getData("text/plain") || draggingEventId;
    if (!eventId) return;

    const eventObj = activeEvents.find(evt => evt.id === eventId);
    if (!eventObj) return;

    // Split hours and minutes out from existing event times
    const startHourMin = eventObj.startTime.split("T")[1] || "09:00";
    const endHourMin = eventObj.endTime.split("T")[1] || "10:00";

    const updatedStart = `${targetDateStr}T${startHourMin}`;
    const updatedEnd = `${targetDateStr}T${endHourMin}`;

    await handleUpdateEventTimeRange(eventId, updatedStart, updatedEnd);
    setDraggingEventId(null);
  };

  // Drop onto a specific day/hour intersection (Week or Day views)
  const handleDropOnHourSlot = async (e: React.DragEvent, targetDateStr: string, hour24: number) => {
    e.preventDefault();
    const eventId = e.dataTransfer.getData("text/plain") || draggingEventId;
    if (!eventId) return;

    const eventObj = activeEvents.find(evt => evt.id === eventId);
    if (!eventObj) return;

    // Calculate duration in minutes to preserve it
    const originalStart = new Date(eventObj.startTime).getTime();
    const originalEnd = new Date(eventObj.endTime).getTime();
    const durationMins = isNaN(originalStart) || isNaN(originalEnd) 
      ? 60 
      : Math.round((originalEnd - originalStart) / 60000);

    const targetHStr = String(hour24).padStart(2, '0');
    const updatedStart = `${targetDateStr}T${targetHStr}:00`;

    const startDatObj = new Date(updatedStart);
    const endDatObj = new Date(startDatObj.getTime() + (durationMins * 60000));

    const yyyy = endDatObj.getFullYear();
    const mm = String(endDatObj.getMonth() + 1).padStart(2, '0');
    const dd = String(endDatObj.getDate()).padStart(2, '0');
    const h = String(endDatObj.getHours()).padStart(2, '0');
    const m = String(endDatObj.getMinutes()).padStart(2, '0');
    const updatedEnd = `${yyyy}-${mm}-${dd}T${h}:${m}`;

    await handleUpdateEventTimeRange(eventId, updatedStart, updatedEnd);
    setDraggingEventId(null);
  };

  // AI Tactical Time-Blocking dispatch (Requirement 7)
  const handleTriggerAITimeblocking = async () => {
    setLoadingSchedule(true);
    try {
      const result = await onTriggerPlanner(availableHours, energyLevel);
      
      setAiSchedule({
        dateStr: new Date().toISOString().split("T")[0],
        availableHours,
        energyLevel,
        scheduleBlocks: result.scheduleBlocks || [],
        breakSuggestions: result.breakSuggestions || [],
        aiSummary: result.aiSummary || ""
      });

      // Automatically convert & schedule resulting timeblocks into our Firestore DB events!
      const uid = auth.currentUser?.uid;
      if (uid && result.scheduleBlocks && result.scheduleBlocks.length > 0) {
        const colRef = collection(db, "users", uid, "events");
        const todayStr = formatDateISOString(new Date());

        for (const block of result.scheduleBlocks) {
          let hStart = "09:00";
          let hEnd = "10:30";

          if (block.time && block.time.includes("-")) {
            const parts = block.time.split("-");
            hStart = parts[0].trim();
            hEnd = parts[1].trim();
          } else if (block.time) {
            hStart = block.time.trim();
            const [hr, mn] = hStart.split(":").map(Number);
            const totalMin = mn + (block.duration || 60);
            hEnd = `${String((hr + Math.floor(totalMin / 60)) % 24).padStart(2, '0')}:${String(totalMin % 60).padStart(2, '0')}`;
          }

          await addDoc(colRef, {
            title: `Momentum AI: ${block.taskTitle}`,
            description: `AI scheduled block based on workspace calibration. Energy: ${energyLevel}. Type: ${block.type}.`,
            priority: block.type === "break" ? "Low" : "High",
            type: block.type === "break" ? "Break" : "Deep Work",
            startTime: `${todayStr}T${hStart}`,
            endTime: `${todayStr}T${hEnd}`
          });
        }

        // Push validation user alert notification
        const notificationsRef = collection(db, "users", uid, "notifications");
        await addDoc(notificationsRef, {
          category: "ai",
          title: "🔥 AI Calibration Dynamic Scheduling Complete",
          message: `The Gemini engine analyzed ${activePendingTasks.length} pending backlogs and registered ${result.scheduleBlocks.length} optimized time blocks inside your live calendar planner.`,
          read: false,
          createdAt: new Date().toISOString()
        });
      }
    } catch (err) {
      console.error("AI Timeblocking action failed:", err);
    } finally {
      setLoadingSchedule(false);
    }
  };

  // Match events to dates
  const getEventsForDate = (dateStr: string) => {
    return activeEvents.filter(evt => evt.startTime.startsWith(dateStr));
  };

  // Color mappings (Requirement 9)
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "bg-red-500/15 border-red-500 text-red-400";
      case "Medium":
        return "bg-amber-500/15 border-amber-500 text-amber-400";
      case "Low":
      default:
        return "bg-emerald-500/15 border-emerald-500 text-emerald-400";
    }
  };

  const getPriorityBadgeClass = (priority: string) => {
    switch (priority) {
      case "High":
        return "bg-red-500 text-black";
      case "Medium":
        return "bg-amber-500 text-black";
      case "Low":
      default:
        return "bg-emerald-500 text-black";
    }
  };

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case "Meeting":
        return <Activity className="w-3.5 h-3.5" />;
      case "Deep Work":
        return <Zap className="w-3.5 h-3.5" />;
      case "Break":
        return <Coffee className="w-3.5 h-3.5" />;
      case "Personal":
        return <Smile className="w-3.5 h-3.5" />;
      case "Work":
      default:
        return <Clock className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div id="planner-tab-content" className="p-4 md:p-8 bg-transparent text-white min-h-screen space-y-8 select-none">
      
      {/* Title banner */}
      <div>
        <h1 className="text-4xl sm:text-5xl font-display font-black tracking-tighter uppercase leading-none text-white">
          CALENDAR & AI <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-emerald-400">PLANNER</span>
        </h1>
        <p className="text-xs text-neutral-400 mt-1">
          Plan, drag, and schedule focus sprints. Calibrate available capacity and leverage AI model parameters to inject chronological focus blocks.
        </p>
      </div>

      {/* Calendar live Statistics Block (Requirement 10) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl flex flex-col justify-between">
          <span className="text-[10px] text-neutral-400 font-mono tracking-widest uppercase">FOCUS HOURS</span>
          <div className="flex items-baseline mt-2 space-x-1">
            <span className="text-2xl sm:text-3xl font-black text-emerald-400">{statistics.focusHours}</span>
            <span className="text-xs text-neutral-500 font-mono">Hrs Weekly</span>
          </div>
        </div>
        <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl flex flex-col justify-between">
          <span className="text-[10px] text-neutral-400 font-mono tracking-widest uppercase">MEETINGS</span>
          <div className="flex items-baseline mt-2 space-x-1">
            <span className="text-2xl sm:text-3xl font-black text-indigo-400">{statistics.meetings}</span>
            <span className="text-xs text-neutral-500 font-mono">Sessions</span>
          </div>
        </div>
        <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl flex flex-col justify-between">
          <span className="text-[10px] text-neutral-400 font-mono tracking-widest uppercase">DEEP WORK BLOCKS</span>
          <div className="flex items-baseline mt-2 space-x-1">
            <span className="text-2xl sm:text-3xl font-black text-purple-400">{statistics.deepWorkBlocks}</span>
            <span className="text-xs text-neutral-500 font-mono">Blocks</span>
          </div>
        </div>
        <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl flex flex-col justify-between">
          <span className="text-[10px] text-neutral-400 font-mono tracking-widest uppercase">PRODUCTIVITY RATING</span>
          <div className="flex items-baseline mt-2 space-x-1">
            <span className="text-2xl sm:text-3xl font-black text-emerald-400">{statistics.productivityScore}%</span>
            <span className="text-xs text-neutral-500 font-mono">Calculated</span>
          </div>
        </div>
      </div>

      {/* Main split viewport workspace */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        
        {/* Left column: AI Calibration, today timelines, deadlines */}
        <div className="xl:col-span-4 space-y-6">
          
          {/* AI Calibration (Requirement 7) */}
          <div className="p-6 rounded-3xl bg-neutral-950/65 border border-white/10 backdrop-blur-xl space-y-6">
            <h3 className="text-xs font-display font-black text-white pb-3 border-b border-white/10 flex items-center space-x-2 uppercase tracking-wider">
              <Sliders className="w-4 h-4 text-emerald-400 animate-pulse" />
              <span>AI Timeblocking Calibration</span>
            </h3>

            <div className="space-y-4">
              {/* Slider hours limit */}
              <div>
                <div className="flex justify-between items-center mb-1.5 font-mono">
                  <label className="text-[9px] uppercase tracking-wider font-semibold text-neutral-400">Available Work Window</label>
                  <span className="text-xs font-black text-emerald-400">{availableHours} Hrs Daily</span>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="12" 
                  value={availableHours}
                  onChange={(e) => setAvailableHours(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer bg-neutral-800 rounded-lg h-1.5"
                />
              </div>

              {/* Energy segment selections */}
              <div>
                <label className="block text-[9px] uppercase tracking-wider font-mono font-semibold mb-2 text-neutral-400">Biological Energy Level</label>
                <div className="grid grid-cols-3 gap-2">
                  {(["low", "medium", "high"] as const).map(level => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setEnergyLevel(level)}
                      className={`py-1.5 rounded-lg border font-mono font-bold text-[10px] uppercase transition-all duration-150 ${
                        energyLevel === level 
                          ? "bg-emerald-950/40 border-emerald-500/60 text-emerald-400" 
                          : "bg-black/40 border-white/[0.05] text-neutral-400 hover:text-white"
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={handleTriggerAITimeblocking}
              disabled={loadingSchedule || activePendingTasks.length === 0}
              className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 disabled:from-neutral-900 disabled:to-neutral-950 disabled:text-neutral-500 font-display font-black text-[10px] rounded-xl tracking-widest uppercase transition-all flex items-center justify-center space-x-2 cursor-pointer shadow-md shadow-emerald-500/5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{loadingSchedule ? "Calibrating grid..." : "Auto-Block Pending Tasks"}</span>
            </button>

            {activePendingTasks.length === 0 ? (
              <p className="text-[9px] text-red-400 italic text-center font-medium mt-1">To test AI Time blocking, register some pending Tasks first!</p>
            ) : (
              <p className="text-[9px] text-neutral-500 font-mono text-center">Gemini allocates {activePendingTasks.length} active tasks across focus grids.</p>
            )}
          </div>

          {/* Today's Schedule Widget (Requirement 8) */}
          <div className="p-5 bg-white/[0.01] border border-white/5 rounded-2xl space-y-4">
            <h4 className="text-[10px] text-neutral-400 uppercase tracking-widest font-mono font-extrabold flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-purple-400" />
              <span>Today's Grid Tasks</span>
            </h4>
            <div className="space-y-2.5 max-h-[190px] overflow-y-auto scrollbar-thin">
              {getEventsForDate(formatDateISOString(new Date())).length === 0 ? (
                <div className="p-4 bg-black/20 rounded-xl text-center border border-white/[0.02]">
                  <p className="text-[10px] text-neutral-400 font-mono italic">No events mapped onto today.</p>
                  <button 
                    onClick={() => handleOpenAddEvent()}
                    className="mt-2 text-[9px] font-bold text-indigo-400 underline hover:text-white flex items-center justify-center mx-auto space-x-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Create one now</span>
                  </button>
                </div>
              ) : (
                getEventsForDate(formatDateISOString(new Date()))
                  .sort((a,b) => a.startTime.localeCompare(b.startTime))
                  .map(evt => (
                    <div 
                      key={evt.id} 
                      onClick={() => handleOpenEditEvent(evt)}
                      className={`p-2.5 rounded-xl border border-white/[0.04] bg-neutral-900/60 flex items-center justify-between cursor-pointer hover:border-indigo-500/20 hover:bg-neutral-900 transition-all`}
                    >
                      <div className="flex items-center space-x-2.5">
                        <div className={`w-1.5 h-1.5 rounded-full ${
                          evt.priority === "High" ? "bg-red-500 shadow-md" : evt.priority === "Medium" ? "bg-amber-400" : "bg-emerald-400"
                        }`} />
                        <div>
                          <h5 className="text-xs font-semibold text-white line-clamp-1">{evt.title}</h5>
                          <span className="text-[8px] font-mono text-neutral-400">{evt.startTime.split("T")[1]} - {evt.endTime.split("T")[1]}</span>
                        </div>
                      </div>
                      <span className="text-[8px] font-mono uppercase bg-white/5 px-2 py-0.5 rounded text-neutral-400">{evt.type}</span>
                    </div>
                  ))
              )}
            </div>
          </div>

          {/* Upcoming Events Widget (Requirement 8) */}
          <div className="p-5 bg-white/[0.01] border border-white/5 rounded-2xl space-y-4">
            <h4 className="text-[10px] text-neutral-400 uppercase tracking-widest font-mono font-extrabold flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-emerald-400" />
              <span>Upcoming Milestones</span>
            </h4>
            <div className="space-y-2.5 max-h-[190px] overflow-y-auto scrollbar-thin">
              {activeEvents
                .filter(evt => new Date(evt.startTime) >= new Date())
                .sort((a,b) => a.startTime.localeCompare(b.startTime))
                .slice(0, 4)
                .map(evt => {
                  const dObj = new Date(evt.startTime);
                  const formattedDay = dObj.toLocaleDateString([], { month: "short", day: "numeric" });
                  const formattedTime = dObj.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

                  return (
                    <div 
                      key={evt.id} 
                      onClick={() => handleOpenEditEvent(evt)}
                      className="p-2.5 rounded-xl border border-white/[0.02] bg-neutral-950/40 flex items-center justify-between cursor-pointer hover:bg-neutral-900 transition-all"
                    >
                      <div>
                        <h5 className="text-xs font-semibold text-neutral-200 line-clamp-1">{evt.title}</h5>
                        <span className="text-[8px] font-mono text-neutral-400">{formattedDay} @ {formattedTime}</span>
                      </div>
                      <span className={`text-[8px] px-1.5 py-0.5 font-bold font-mono rounded ${getPriorityBadgeClass(evt.priority)}`}>
                        {evt.priority}
                      </span>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Deadline Timeline (Requirement 8) */}
          <div className="p-5 bg-white/[0.01] border border-white/5 rounded-2xl space-y-4">
            <h4 className="text-[10px] text-neutral-400 uppercase tracking-widest font-mono font-extrabold flex items-center space-x-2">
              <Target className="w-4 h-4 text-red-400 animate-pulse" />
              <span>Critical Task Deadlines</span>
            </h4>
            <div className="space-y-3 pl-2.5 border-l border-white/5 snap-y max-h-[180px] overflow-y-auto scrollbar-thin">
              {tasks.filter(t => t.status === "pending" && t.deadline).length === 0 ? (
                <p className="text-[10px] text-neutral-500 font-mono italic">No critical deadlines pending.</p>
              ) : (
                tasks
                  .filter(t => t.status === "pending" && t.deadline)
                  .sort((a,b) => a.deadline.localeCompare(b.deadline))
                  .slice(0, 3)
                  .map(t => {
                    const daysLeft = Math.ceil((new Date(t.deadline).getTime() - new Date().getTime()) / 86400000);
                    return (
                      <div key={t.taskId} className="relative py-1 space-y-1">
                        <span className={`absolute -left-[14px] top-2.5 w-1.5 h-1.5 rounded-full border border-black ${
                          t.priority === "Critical" || t.priority === "High" ? "bg-red-500" : "bg-amber-400"
                        }`} />
                        <h5 className="text-xs font-bold text-neutral-200 line-clamp-1">{t.title}</h5>
                        <div className="flex justify-between items-center text-[8px] font-mono text-neutral-400">
                          <span>Target: {t.deadline}</span>
                          <span className={`font-semibold uppercase ${daysLeft <= 1 ? "text-red-400 animate-pulse" : "text-emerald-400"}`}>
                            {daysLeft <= 0 ? "OVERDUE" : daysLeft === 1 ? "Tomorrow" : `${daysLeft} Days left`}
                          </span>
                        </div>
                      </div>
                    );
                  })
              )}
            </div>
          </div>

        </div>

        {/* Right column: Interactive view segmentations */}
        <div className="xl:col-span-8 space-y-6 bg-white/[0.01] border border-white/5 p-4 sm:p-6 rounded-3xl backdrop-blur-xl">
          
          {/* Calendar Toolbar with arrows and segment triggers */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-white/5">
            <div className="flex items-center space-x-3">
              <button 
                id="btn-nav-prev"
                onClick={() => handleNavigate("prev")}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                title="Previous"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <h2 className="text-sm sm:text-base font-black font-display uppercase tracking-wider text-neutral-100 min-w-[150px] text-center">
                {viewMode === "month" && currentDate.toLocaleDateString([], { month: "long", year: "numeric" })}
                {viewMode === "week" && `Week of ${currentDate.toLocaleDateString([], { month: "short", day: "numeric" })}`}
                {viewMode === "day" && currentDate.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" })}
              </h2>
              <button 
                id="btn-nav-next"
                onClick={() => handleNavigate("next")}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                title="Next"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setCurrentDate(new Date())}
                className="text-[9px] font-bold font-mono px-2 py-1 bg-white/5 rounded hover:bg-white/10 transition-colors uppercase cursor-pointer"
              >
                Today
              </button>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
              <div className="bg-white/5 p-1 rounded-lg flex space-x-1">
                {(["month", "week", "day"] as const).map(mode => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    className={`px-3 py-1 text-[10px] uppercase font-bold font-mono rounded transition-colors cursor-pointer ${
                      viewMode === mode 
                        ? "bg-indigo-600 text-white" 
                        : "text-neutral-400 hover:text-white"
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>

              <button 
                onClick={() => handleOpenAddEvent(currentDate)}
                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 font-display font-black text-[10px] tracking-widest uppercase rounded-lg flex items-center space-x-1 cursor-pointer transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Event</span>
              </button>
            </div>
          </div>

          {eventsLoading && dbEvents.length === 0 && (
            <div className="p-1 text-center font-mono text-[9px] text-[#7272a3] animate-pulse">Syncing events cache...</div>
          )}

          {/* Monthly view Grid */}
          {viewMode === "month" && (
            <div className="space-y-2">
              <div className="grid grid-cols-7 gap-1 text-center border-b border-white/5 pb-2 text-[9px] font-mono tracking-wider font-semibold text-neutral-400 uppercase">
                <span>Sun</span>
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span>Sat</span>
              </div>
              <div className="grid grid-cols-7 gap-1">
                {getDaysInMonth(currentDate).map((dayDate, idx) => {
                  const dateStr = formatDateISOString(dayDate);
                  const daysEvents = getEventsForDate(dateStr);
                  const isCurrentMonth = dayDate.getMonth() === currentDate.getMonth();
                  const isToday = formatDateISOString(new Date()) === dateStr;

                  return (
                    <div 
                      key={idx} 
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => handleDropOnDayCell(e, dateStr)}
                      className={`min-h-[85px] sm:min-h-[105px] border border-white/[0.02] p-1.5 rounded-xl transition-colors relative flex flex-col justify-between ${
                        isCurrentMonth ? "bg-black/25" : "bg-white/[0.01] opacity-35"
                      } ${isToday ? "border-indigo-500/40 ring-1 ring-indigo-500/20" : "hover:bg-white/[0.02]"}`}
                    >
                      <div className="flex justify-between items-center mb-1 select-none">
                        <span className={`text-[10px] font-mono ${
                          isToday 
                            ? "bg-indigo-600 text-white w-5 h-5 rounded-md flex items-center justify-center font-bold" 
                            : "text-neutral-400"
                        }`}>
                          {dayDate.getDate()}
                        </span>
                        {daysEvents.length > 0 && (
                          <span className="text-[8px] font-mono bg-white/5 px-1.5 rounded text-neutral-500">
                            {daysEvents.length}
                          </span>
                        )}
                      </div>

                      <div className="flex-1 space-y-1 overflow-y-auto max-h-[60px] sm:max-h-[80px] scrollbar-thin select-none">
                        {daysEvents.map(evt => (
                          <div
                            key={evt.id}
                            draggable
                            onDragStart={(e) => handleDragStartEvent(e, evt.id)}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenEditEvent(evt);
                            }}
                            className={`px-1.5 py-0.5 text-[8px] font-medium rounded border line-clamp-1 truncate cursor-move hover:scale-102 transition-transform select-none ${getPriorityColor(evt.priority)}`}
                            title={`${evt.title} (${evt.startTime.split("T")[1]} - ${evt.endTime.split("T")[1]})`}
                          >
                            {evt.title}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Weekly view hourly list layout */}
          {viewMode === "week" && (
            <div className="overflow-x-auto select-none">
              <div className="min-w-[650px] space-y-2">
                <div className="grid grid-cols-[60px_repeat(7,_1fr)] gap-1 text-center border-b border-white/5 pb-2">
                  <div className="text-[9px] font-mono text-neutral-500 self-center uppercase">Time</div>
                  {getDaysInWeek(currentDate).map((dayDate, idx) => {
                    const isToday = formatDateISOString(new Date()) === formatDateISOString(dayDate);
                    return (
                      <div key={idx} className="space-y-0.5">
                        <div className="text-[9px] font-mono text-neutral-400 font-bold uppercase">
                          {dayDate.toLocaleDateString([], { weekday: "short" })}
                        </div>
                        <div className={`text-[10px] font-mono font-black mx-auto w-5 h-5 flex items-center justify-center rounded-md ${
                          isToday ? "bg-indigo-600 text-white font-black" : "text-neutral-200"
                        }`}>
                          {dayDate.getDate()}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="space-y-1 max-h-[480px] overflow-y-auto scrollbar-thin pt-1">
                  {[8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20].map(hour => {
                    const formattedHour = `${String(hour).padStart(2, "0")}:00`;
                    return (
                      <div key={hour} className="grid grid-cols-[60px_repeat(7,_1fr)] gap-1 min-h-[50px] border-b border-white/[0.02]">
                        <div className="text-[9px] font-mono text-neutral-500 text-right pr-2 self-start pt-1.5">{formattedHour}</div>
                        {getDaysInWeek(currentDate).map((dayDate, idx) => {
                          const dateStr = formatDateISOString(dayDate);
                          const daysEvents = getEventsForDate(dateStr);
                          // Match events that start during this hour segment
                          const hourEvents = daysEvents.filter(evt => {
                            const [hStr] = (evt.startTime.split("T")[1] || "").split(":");
                            return Number(hStr) === hour;
                          });

                          return (
                            <div 
                              key={idx}
                              onDragOver={(e) => e.preventDefault()}
                              onDrop={(e) => handleDropOnHourSlot(e, dateStr, hour)}
                              className="bg-black/10 border border-white/[0.01] hover:bg-white/[0.02] p-1 rounded-lg transition-colors flex flex-col gap-1 min-h-[46px]"
                            >
                              {hourEvents.map(evt => (
                                <div
                                  key={evt.id}
                                  draggable
                                  onDragStart={(e) => handleDragStartEvent(e, evt.id)}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenEditEvent(evt);
                                  }}
                                  className={`px-1.5 py-1 text-[8px] rounded border leading-snug cursor-move select-none hover:scale-102 transition-transform ${getPriorityColor(evt.priority)}`}
                                >
                                  <div className="font-semibold line-clamp-1">{evt.title}</div>
                                  <div className="text-[7px] text-neutral-400 font-mono flex items-center space-x-1 mt-0.5">
                                    {getEventTypeIcon(evt.type)}
                                    <span>{evt.startTime.split("T")[1]}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Daily view timeline layout */}
          {viewMode === "day" && (
            <div className="space-y-4 select-none">
              <div className="p-4 rounded-2xl bg-black/35 border border-white/5 space-y-3">
                <div className="flex justify-between items-center text-[10px] font-mono uppercase tracking-widest text-neutral-400">
                  <span>Continuous Daily Timeline Chronology</span>
                  <span>{formatDateISOString(currentDate)}</span>
                </div>
                
                <div className="space-y-1.5 max-h-[480px] overflow-y-auto scrollbar-thin pt-2">
                  {[8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20].map(hour => {
                    const formattedHour = `${String(hour).padStart(2, "0")}:00`;
                    const dateStr = formatDateISOString(currentDate);
                    const daysEvents = getEventsForDate(dateStr);
                    const hourEvents = daysEvents.filter(evt => {
                      const [hStr] = (evt.startTime.split("T")[1] || "").split(":");
                      return Number(hStr) === hour;
                    });

                    return (
                      <div 
                        key={hour} 
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => handleDropOnHourSlot(e, dateStr, hour)}
                        className="grid grid-cols-[70px_1fr] items-start py-2.5 px-3 rounded-xl border border-white/[0.01] hover:bg-white/[0.01] hover:border-white/[0.03] transition-all"
                      >
                        <div className="text-[10px] font-mono text-neutral-400 self-center font-semibold">{formattedHour}</div>
                        <div className="space-y-1 min-h-[30px] flex flex-wrap gap-2">
                          {hourEvents.length === 0 ? (
                            <div className="text-[9px] text-neutral-600 font-mono italic self-center pl-1">Empty cell block slot</div>
                          ) : (
                            hourEvents.map(evt => (
                              <div
                                key={evt.id}
                                draggable
                                onDragStart={(e) => handleDragStartEvent(e, evt.id)}
                                onClick={() => handleOpenEditEvent(evt)}
                                className={`flex-1 min-w-[200px] p-2.5 rounded-xl border flex items-center justify-between cursor-move select-none transition-transform hover:scale-101 hover:border-white/10 ${getPriorityColor(evt.priority)}`}
                              >
                                <div>
                                  <div className="text-xs font-bold line-clamp-1">{evt.title}</div>
                                  {evt.description && <p className="text-[9px] text-neutral-400 italic line-clamp-1">{evt.description}</p>}
                                </div>
                                <div className="flex items-center space-x-3.5 text-[9px] font-mono">
                                  <span className="flex items-center space-x-1 bg-black/10 px-2 py-0.5 rounded text-neutral-300">
                                    {getEventTypeIcon(evt.type)}
                                    <span className="capitalize">{evt.type}</span>
                                  </span>
                                  <span className="text-neutral-400 font-semibold">{evt.startTime.split("T")[1]} - {evt.endTime.split("T")[1]}</span>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Adding/Editing Popup Dialogue Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div className="w-full max-w-md p-6 bg-[#0c0d1b] border border-white/10 rounded-2xl shadow-2xl space-y-4">
            
            <div className="flex justify-between items-center pb-2 border-b border-white/5">
              <h3 className="text-sm font-display font-black text-white uppercase tracking-wider">
                {selectedEvent ? "Edit Workspace Event" : "Create Calendar Event"}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-neutral-400 hover:text-white font-bold text-xs"
              >
                Close
              </button>
            </div>

            {formError && (
              <p className="text-[10px] text-red-400 font-mono bg-red-950/20 p-2.5 border border-red-500/20 rounded-xl leading-relaxed">
                {formError}
              </p>
            )}

            <form onSubmit={handleSaveEvent} className="space-y-4">
              
              {/* Event title */}
              <div>
                <label className="block text-[9px] font-semibold text-neutral-400 uppercase tracking-wider mb-1.5">Title *</label>
                <input 
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Review schema specifications..."
                  className="w-full px-3 py-2 text-xs bg-neutral-900 border border-white/10 rounded-xl text-white outline-none focus:border-indigo-500"
                />
              </div>

              {/* Event Descriptions */}
              <div>
                <label className="block text-[9px] font-semibold text-neutral-400 uppercase tracking-wider mb-1.5">Description</label>
                <textarea 
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Optionally define specific tasks constraints or action guidelines..."
                  rows={2}
                  className="w-full px-3 py-2 text-xs bg-neutral-900 border border-white/10 rounded-xl text-white outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              {/* Priority and Type Grid */}
              <div className="grid grid-cols-2 gap-4">
                
                {/* Event Type */}
                <div>
                  <label className="block text-[9px] font-semibold text-neutral-400 uppercase tracking-wider mb-1.5">Event Category</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
                    className="w-full px-3 py-2 text-xs bg-neutral-900 border border-white/10 rounded-xl text-white outline-none focus:border-indigo-500"
                  >
                    <option value="Work">Work</option>
                    <option value="Deep Work">Deep Work</option>
                    <option value="Meeting">Meeting</option>
                    <option value="Break">Break</option>
                    <option value="Personal">Personal</option>
                  </select>
                </div>

                {/* Priority Levels */}
                <div>
                  <label className="block text-[9px] font-semibold text-neutral-400 uppercase tracking-wider mb-1.5">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as any }))}
                    className="w-full px-3 py-2 text-xs bg-neutral-900 border border-white/10 rounded-xl text-white outline-none focus:border-indigo-500"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>

              </div>

              {/* Temporal timings constraints code */}
              <div className="grid grid-cols-2 gap-4">
                
                {/* Start Time */}
                <div>
                  <label className="block text-[9px] font-semibold text-neutral-400 uppercase tracking-wider mb-1.5">Start Time</label>
                  <input 
                    type="datetime-local"
                    value={formData.startTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                    className="w-full px-3 py-2 text-xs bg-neutral-900 border border-white/10 rounded-xl text-white outline-none focus:border-indigo-500"
                  />
                </div>

                {/* End Time */}
                <div>
                  <label className="block text-[9px] font-semibold text-neutral-400 uppercase tracking-wider mb-1.5">End Time</label>
                  <input 
                    type="datetime-local"
                    value={formData.endTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                    className="w-full px-3 py-2 text-xs bg-[#111222] border border-white/10 rounded-xl text-white outline-none focus:border-indigo-500"
                  />
                </div>

              </div>

              {/* Form buttons */}
              <div className="flex justify-between items-center pt-2 gap-2">
                {selectedEvent ? (
                  <button
                    type="button"
                    onClick={handleDeleteEventClick}
                    className="px-3.5 py-2 bg-red-950/45 text-red-400 hover:bg-red-900 hover:text-white text-xs font-semibold rounded-xl flex items-center space-x-1 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                ) : (
                  <div />
                )}

                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 border border-white/[0.08] hover:bg-white/5 text-neutral-400 hover:text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer shadow-lg shadow-indigo-600/10"
                  >
                    Save Changes
                  </button>
                </div>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
