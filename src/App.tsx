import React, { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { 
  auth, 
  db, 
  doc, 
  getDoc,
  setDoc,
  updateDoc, 
  collection, 
  addDoc,
  deleteDoc,
  onSnapshot,
  orderBy,
  query,
  where
} from "./firebase";
import { UserProfile, Task, Goal, Habit, ChatMessage, SmartNotification } from "./types";

// Inner views
import LandingPage from "./components/LandingPage";
import Sidebar from "./components/Sidebar";
import DashboardView from "./components/DashboardView";
import TasksView from "./components/TasksView";
import PlannerView from "./components/PlannerView";
import CoachView from "./components/CoachView";
import GoalsView from "./components/GoalsView";
import HabitsView from "./components/HabitsView";
import AnalyticsView from "./components/AnalyticsView";
import ProfileView from "./components/ProfileView";
import SettingsView from "./components/SettingsView";

import { Sparkles, Activity } from "lucide-react";

export default function App() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);

  // Active Workspace tab
  const [activeTab, setActiveTab] = useState("dashboard");

  // Collections States
  const [tasks, setTasks] = useState<Task[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [chats, setChats] = useState<ChatMessage[]>([]);

  // Monitor Authentication state changing
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (!user) {
        setUserProfile(null);
        setTasks([]);
        setGoals([]);
        setHabits([]);
        setChats([]);
        setAuthLoading(false);
      } else {
        // Authenticated! Trigger data streams
        setAuthLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // Monitor Profile + Workspace subcollections in real-time
  useEffect(() => {
    if (!currentUser) return;
    setDataLoading(true);

    const uid = currentUser.uid;

    // 1. User Profile Sync
    const profileRef = doc(db, "users", uid);
    const unProfile = onSnapshot(profileRef, (docSnap) => {
      if (docSnap.exists()) {
        setUserProfile(docSnap.data() as UserProfile);
      } else {
        // Profile not created yet
        const initialProfile: UserProfile = {
          uid,
          name: currentUser.displayName || "Momentum Strategist",
          email: currentUser.email || "",
          createdAt: new Date().toISOString(),
          productivityScore: 75
        };
        setDoc(profileRef, initialProfile);
      }
    });

    // 2. Tasks collection
    const tasksRef = collection(db, "users", uid, "tasks");
    const qTasks = query(tasksRef, orderBy("createdAt", "desc"));
    const unTasks = onSnapshot(qTasks, (snapshot) => {
      const items: Task[] = [];
      snapshot.forEach((d) => {
        items.push({ taskId: d.id, ...d.data() } as Task);
      });
      setTasks(items);
      setDataLoading(false);
    });

    // 3. Goals collection
    const goalsRef = collection(db, "users", uid, "goals");
    const unGoals = onSnapshot(goalsRef, (snapshot) => {
      const items: Goal[] = [];
      snapshot.forEach((d) => {
        items.push({ goalId: d.id, ...d.data() } as Goal);
      });
      setGoals(items);
    });

    // 4. Habits collection
    const habitsRef = collection(db, "users", uid, "habits");
    const unHabits = onSnapshot(habitsRef, (snapshot) => {
      const items: Habit[] = [];
      snapshot.forEach((d) => {
        items.push({ habitId: d.id, ...d.data() } as Habit);
      });
      setHabits(items);
    });

    // 5. Chats collection
    const chatsRef = collection(db, "users", uid, "chats");
    const qChats = query(chatsRef, orderBy("timestamp", "asc"));
    const unChats = onSnapshot(qChats, (snapshot) => {
      const items: ChatMessage[] = [];
      snapshot.forEach((d) => {
        items.push({ id: d.id, ...d.data() } as ChatMessage);
      });
      setChats(items);
    });

    return () => {
      unProfile();
      unTasks();
      unGoals();
      unHabits();
      unChats();
    };
  }, [currentUser]);

  // Handle Authentication Success inside LandingPage
  const handleAuthSuccess = (uid: string) => {
    // Explicitly set authenticated State quickly
    setAuthLoading(false);
  };

  // --------------------------------------------------
  // CRUD & ACTION ROUTINES
  // --------------------------------------------------

  // 1. Task Management
  const handleAddTask = async (taskData: Omit<Task, "taskId" | "createdAt" | "riskScore">) => {
    if (!currentUser) return;
    try {
      const colRef = collection(db, "users", currentUser.uid, "tasks");
      await addDoc(colRef, {
        ...taskData,
        createdAt: new Date().toISOString(),
        riskScore: 25 // Default starting risk coefficient
      });

      // Recalculate momentum scores
      await handleRecalculateMomentumScore();
    } catch (err) {
      console.error("Task allocation failed:", err);
    }
  };

  const handleEditTask = async (taskId: string, updatedFields: Partial<Task>) => {
    if (!currentUser) return;
    try {
      const docRef = doc(db, "users", currentUser.uid, "tasks", taskId);
      await updateDoc(docRef, updatedFields);
      await handleRecalculateMomentumScore();
    } catch (err) {
      console.error("Task editing error:", err);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!currentUser) return;
    try {
      const docRef = doc(db, "users", currentUser.uid, "tasks", taskId);
      await deleteDoc(docRef);
      await handleRecalculateMomentumScore();
    } catch (err) {
      console.error("Task elimination error:", err);
    }
  };

  // 2. Habit Tracker routines with strict streak mathematics
  const handleAddHabit = async (habitData: Omit<Habit, "habitId" | "currentStreak" | "longestStreak" | "consistencyScore" | "history">) => {
    if (!currentUser) return;
    try {
      const colRef = collection(db, "users", currentUser.uid, "habits");
      await addDoc(colRef, {
        ...habitData,
        currentStreak: 0,
        longestStreak: 0,
        consistencyScore: 0,
        history: {}
      });
    } catch (err) {
      console.error("Habit registration error:", err);
    }
  };

  const handleToggleHabit = async (habitId: string, dateStr: string) => {
    if (!currentUser) return;
    const habit = habits.find(h => h.habitId === habitId);
    if (!habit) return;

    try {
      const updatedHistory = { ...habit.history };
      if (updatedHistory[dateStr]) {
        delete updatedHistory[dateStr];
      } else {
        updatedHistory[dateStr] = true;
      }

      // Compute streak metrics precisely in memory
      const datesLogged = Object.keys(updatedHistory).sort();
      let currentStreak = 0;
      let longestStreak = habit.longestStreak || 0;

      // Calculate current consecutive days backwards from today
      const today = new Date();
      let checkDate = new Date();
      let continues = true;

      while (continues) {
        const checkStr = checkDate.toISOString().split("T")[0];
        if (updatedHistory[checkStr]) {
          currentStreak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          // If checkDate is today, but today is not logged, check yesterday first
          if (checkStr === today.toISOString().split("T")[0]) {
            checkDate.setDate(checkDate.getDate() - 1);
            const yesterdayStr = checkDate.toISOString().split("T")[0];
            if (updatedHistory[yesterdayStr]) {
              // Current streak lives on昨日!
              checkDate.setDate(checkDate.getDate() - 1);
            } else {
              continues = false;
            }
          } else {
            continues = false;
          }
        }
      }

      // Calculate historical longest consecutive runs in entire logs
      let currentRun = 0;
      let maxRun = 0;
      if (datesLogged.length > 0) {
        let prevDate: Date | null = null;
        for (const dateVal of datesLogged) {
          const currentDate = new Date(dateVal);
          if (prevDate === null) {
            currentRun = 1;
          } else {
            const diffTime = Math.abs(currentDate.getTime() - prevDate.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            if (diffDays === 1) {
              currentRun++;
            } else if (diffDays > 1) {
              if (currentRun > maxRun) maxRun = currentRun;
              currentRun = 1;
            }
          }
          prevDate = currentDate;
        }
        if (currentRun > maxRun) maxRun = currentRun;
        longestStreak = Math.max(longestStreak, maxRun);
      }

      // Compute 30-day consistency score percentage
      let checkCount = 0;
      for (let i = 0; i < 30; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dStr = d.toISOString().split("T")[0];
        if (updatedHistory[dStr]) checkCount++;
      }
      const consistencyScore = Math.round((checkCount / 30) * 100);

      const docRef = doc(db, "users", currentUser.uid, "habits", habitId);
      await updateDoc(docRef, {
        history: updatedHistory,
        currentStreak,
        longestStreak: Math.max(longestStreak, currentStreak),
        consistencyScore
      });

      await handleRecalculateMomentumScore();
    } catch (err) {
      console.error("Habit check toggler failed:", err);
    }
  };

  const handleDeleteHabit = async (habitId: string) => {
    if (!currentUser) return;
    try {
      const docRef = doc(db, "users", currentUser.uid, "habits", habitId);
      await deleteDoc(docRef);
    } catch (err) {
      console.error("Habit deletion error:", err);
    }
  };

  // 3. Goal Management routines
  const handleAddGoal = async (goalData: Omit<Goal, "goalId" | "progress">) => {
    if (!currentUser) return;
    try {
      const colRef = collection(db, "users", currentUser.uid, "goals");
      await addDoc(colRef, {
        ...goalData,
        progress: 0
      });
    } catch (err) {
      console.error("Goal creation error:", err);
    }
  };

  const handleEditGoal = async (goalId: string, updatedFields: Partial<Goal>) => {
    if (!currentUser) return;
    try {
      const docRef = doc(db, "users", currentUser.uid, "goals", goalId);
      await updateDoc(docRef, updatedFields);
    } catch (err) {
      console.error("Goal updates error:", err);
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    if (!currentUser) return;
    try {
      const docRef = doc(db, "users", currentUser.uid, "goals", goalId);
      await deleteDoc(docRef);
    } catch (err) {
      console.error("Goal deletion error:", err);
    }
  };

  // 4. Update core profile params (college, profession)
  const handleUpdateProfile = async (updatedFields: Partial<UserProfile>) => {
    if (!currentUser) return;
    try {
      const docRef = doc(db, "users", currentUser.uid);
      await updateDoc(docRef, updatedFields);
    } catch (err) {
      console.error("Profile update fail:", err);
    }
  };

  // --------------------------------------------------
  // SERVER SIDE AI ENGINE COMMUNICATORS
  // --------------------------------------------------

  const onTriggerPrioritize = async (task: Task) => {
    const res = await fetch("/api/ai/prioritize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ task })
    });
    if (!res.ok) throw new Error("AI prioritized scoring failure");
    return res.json();
  };

  const onTriggerRescue = async (task: Task) => {
    const res = await fetch("/api/ai/rescue", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        task, 
        context: { availableHours: 4, energyLevel: "medium" } 
      })
    });
    if (!res.ok) throw new Error("Crisis rescue blueprint fail");
    return res.json();
  };

  const onTriggerPlanner = async (availableHours: number, energyLevel: string) => {
    const res = await fetch("/api/ai/planner", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        availableHours, 
        energyLevel, 
        tasks: tasks.filter(t => t.status === "pending") 
      })
    });
    if (!res.ok) throw new Error("Daily scheduler formulation error");
    return res.json();
  };

  const onSendMessage = async (text: string) => {
    if (!currentUser) return;
    
    // 1. Log user message on firestore instantly
    const chatCol = collection(db, "users", currentUser.uid, "chats");
    await addDoc(chatCol, {
      role: "user",
      text,
      timestamp: new Date().toISOString()
    });

    // 2. Prepare payload of recent messages context for Gemini model
    // Load local chat list first
    const chatPayload = [...chats, { role: "user", text }].slice(-10);

    const res = await fetch("/api/ai/coach", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        messages: chatPayload,
        userProfile 
      })
    });

    if (!res.ok) throw new Error("Coaching backend dispatch error");
    const result = await res.json();

    // 3. Write response model on firestore
    await addDoc(chatCol, {
      role: "model",
      text: result.text || "I am here to help you strategize and avoid missed deadlines. Tell me more context.",
      timestamp: new Date().toISOString()
    });

    return result;
  };

  const onTriggerRoadmap = async (goal: Goal) => {
    const res = await fetch("/api/ai/roadmap", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        goalName: goal.goalName,
        description: goal.description,
        targetDate: goal.targetDate,
        category: goal.category 
      })
    });
    if (!res.ok) throw new Error("Strategic roadmap formulation error");
    return res.json();
  };

  const onTriggerWeeklyReview = async () => {
    const res = await fetch("/api/ai/weekly-review", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        tasks, 
        habits, 
        userProfile 
      })
    });
    if (!res.ok) throw new Error("Weekly review formulation failed");
    const result = await res.json();
    
    // If weekly review returns a suggestion score, write update to database
    if (result.suggestedProductivityScore && currentUser) {
      const docRef = doc(db, "users", currentUser.uid);
      await updateDoc(docRef, {
        productivityScore: Math.min(100, Math.max(0, result.suggestedProductivityScore))
      });
    }

    return result;
  };

  // Helper: Formulaic recalculation of momentum score based on real metrics
  const handleRecalculateMomentumScore = async () => {
    if (!currentUser || !userProfile) return;
    
    // Simple robust formula:
    // Base 60
    // + (completed tasks count * 5 pt, max 20)
    // + (average habits consistency percentage * 0.2 pt, max 20)
    // Min 40, Max 100
    let taskPt = Math.min(20, tasks.filter(t => t.status === "completed").length * 5);
    
    let habitPt = 0;
    if (habits.length > 0) {
      const totalCons = habits.reduce((sum, h) => sum + h.consistencyScore, 0);
      habitPt = Math.min(20, Math.round((totalCons / habits.length) * 0.2));
    }

    const nextScore = Math.min(100, Math.max(40, 60 + taskPt + habitPt));

    if (nextScore !== userProfile.productivityScore) {
      const docRef = doc(db, "users", currentUser.uid);
      await updateDoc(docRef, { productivityScore: nextScore });
    }
  };

  // --------------------------------------------------
  // MASTER RENDER INTERFACES
  // --------------------------------------------------

  if (authLoading) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white flex flex-col items-center justify-center space-y-4">
        <Sparkles className="w-8 h-8 text-indigo-500 animate-spin" />
        <p className="text-xs font-mono tracking-widest text-neutral-500 uppercase">Verifying Authentic session keys...</p>
      </div>
    );
  }

  // Guest view
  if (!currentUser) {
    return <LandingPage onAuthSuccess={handleAuthSuccess} />;
  }

  // Workroom loading skeleton
  if (dataLoading && tasks.length === 0 && habits.length === 0) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white flex flex-col items-center justify-center space-y-4">
        <Activity className="w-10 h-10 text-purple-500 animate-bounce" />
        <p className="text-xs font-mono tracking-widest text-neutral-500 uppercase">Synchronizing cloud documents...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#05050a] text-white select-none overflow-hidden font-sans relative">
      {/* Background ambient glowing blurs */}
      <div className="absolute top-[-200px] right-[-100px] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none z-0"></div>
      <div className="absolute bottom-[-100px] left-[-100px] w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none z-0"></div>
      
      {/* Structural Sidebar Panel */}
      <Sidebar 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        userProfile={userProfile}
        onLogout={() => setCurrentUser(null)}
      />

      {/* Main viewport block */}
      <main className="flex-1 overflow-y-auto bg-transparent relative z-10" id="main-app-viewport">
        {activeTab === "dashboard" && (
          <DashboardView 
            userProfile={userProfile}
            tasks={tasks}
            goals={goals}
            habits={habits}
            onAddTask={handleAddTask}
            onCompleteTask={(tid) => handleEditTask(tid, { status: "completed", completedAt: new Date().toISOString() })}
            onToggleHabit={(hid) => handleToggleHabit(hid, new Date().toISOString().split('T')[0])}
            onToggleMilestone={(gid, mid) => {
              const goal = goals.find(g => g.goalId === gid);
              if (goal) {
                const updated = goal.milestones.map(m => m.id === mid ? { ...m, completed: !m.completed } : m);
                const compl = updated.filter(m => m.completed).length;
                const progress = Math.round((compl / updated.length) * 100);
                return handleEditGoal(gid, { milestones: updated, progress });
              }
              return Promise.resolve();
            }}
            onTriggerRescue={onTriggerRescue}
            onTriggerPrioritize={onTriggerPrioritize}
            onTriggerWeeklyReview={onTriggerWeeklyReview}
          />
        )}

        {activeTab === "tasks" && (
          <TasksView 
            tasks={tasks}
            onAddTask={handleAddTask}
            onEditTask={handleEditTask}
            onDeleteTask={handleDeleteTask}
            onTriggerPrioritize={onTriggerPrioritize}
          />
        )}

        {activeTab === "planner" && (
          <PlannerView 
            tasks={tasks}
            onTriggerPlanner={onTriggerPlanner}
          />
        )}

        {activeTab === "coach" && (
          <CoachView 
            userProfile={userProfile}
            chatHistory={chats}
            onSendMessage={onSendMessage}
          />
        )}

        {activeTab === "goals" && (
          <GoalsView 
            goals={goals}
            onAddGoal={handleAddGoal}
            onEditGoal={handleEditGoal}
            onDeleteGoal={handleDeleteGoal}
            onTriggerRoadmap={onTriggerRoadmap}
          />
        )}

        {activeTab === "habits" && (
          <HabitsView 
            habits={habits}
            onAddHabit={handleAddHabit}
            onToggleHabit={handleToggleHabit}
            onDeleteHabit={handleDeleteHabit}
          />
        )}

        {activeTab === "analytics" && (
          <AnalyticsView 
            tasks={tasks}
            goals={goals}
            habits={habits}
            productivityScore={userProfile?.productivityScore || 75}
          />
        )}

        {activeTab === "profile" && (
          <ProfileView 
            userProfile={userProfile}
            tasks={tasks}
            goals={goals}
            habits={habits}
            onUpdateProfile={handleUpdateProfile}
          />
        )}

        {activeTab === "settings" && <SettingsView />}
      </main>
    </div>
  );
}
