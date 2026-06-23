import React, { useState, useEffect, useRef } from "react";
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
import OnboardingWizard from "./components/OnboardingWizard";
import RescueView from "./components/RescueView";
import NotificationsView from "./components/NotificationsView";

import { getDemoModelData } from "./utils/seedData";
import { 
  Sparkles, 
  Activity, 
  MessageCircle, 
  Send, 
  X, 
  Bot, 
  ChevronUp, 
  ChevronDown, 
  Minimize2, 
  Menu,
  Bell
} from "lucide-react";

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const isPermissionError = error instanceof Error && error.message.includes("permission-denied");
  const isUnauthenticated = !auth.currentUser;

  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };

  if (isPermissionError && isUnauthenticated) {
    console.warn("Firestore access denied due to missing/revoked authentication (expected on logout or loading). Details:", JSON.stringify(errInfo));
    return;
  }

  console.error("Firestore Error: ", JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export default function App() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);

  // Active Workspace tab
  const [activeTab, setActiveTab] = useState("dashboard");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Collections States
  const [tasks, setTasks] = useState<Task[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [chats, setChats] = useState<ChatMessage[]>([]);
  const [notifications, setNotifications] = useState<SmartNotification[]>([]);

  // Floating Chatbot States
  const [floatingChatOpen, setFloatingChatOpen] = useState(false);
  const [floatingMessages, setFloatingMessages] = useState<{ role: "user" | "model"; text: string; timestamp: string }[]>([
    {
      role: "model",
      text: "Hi there! I'm your Momentum AI Global Assistant. How can I assist you with your tasks, habits, or milestones today? Try typing a custom prompt or trigger a Quick Action below!",
      timestamp: new Date().toISOString()
    }
  ]);
  const [floatingInput, setFloatingInput] = useState("");
  const [floatingLoading, setFloatingLoading] = useState(false);

  const floatingScrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (floatingScrollRef.current) {
      floatingScrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [floatingMessages, floatingChatOpen]);

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
        setNotifications([]);
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
        setDoc(profileRef, initialProfile).catch((err) => {
          handleFirestoreError(err, OperationType.WRITE, `users/${uid}`);
        });
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `users/${uid}`);
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
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `users/${uid}/tasks`);
    });

    // 3. Goals collection
    const goalsRef = collection(db, "users", uid, "goals");
    const unGoals = onSnapshot(goalsRef, (snapshot) => {
      const items: Goal[] = [];
      snapshot.forEach((d) => {
        items.push({ goalId: d.id, ...d.data() } as Goal);
      });
      setGoals(items);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `users/${uid}/goals`);
    });

    // 4. Habits collection
    const habitsRef = collection(db, "users", uid, "habits");
    const unHabits = onSnapshot(habitsRef, (snapshot) => {
      const items: Habit[] = [];
      snapshot.forEach((d) => {
        items.push({ habitId: d.id, ...d.data() } as Habit);
      });
      setHabits(items);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `users/${uid}/habits`);
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
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `users/${uid}/chats`);
    });

    // 6. Notifications collection
    const notificationsRef = collection(db, "users", uid, "notifications");
    const qNotifications = query(notificationsRef, orderBy("createdAt", "desc"));
    const unNotifications = onSnapshot(qNotifications, (snapshot) => {
      const items: SmartNotification[] = [];
      snapshot.forEach((d) => {
        items.push({ id: d.id, notificationId: d.id, ...d.data() } as SmartNotification);
      });
      setNotifications(items);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `users/${uid}/notifications`);
    });

    return () => {
      unProfile();
      unTasks();
      unGoals();
      unHabits();
      unChats();
      unNotifications();
    };
  }, [currentUser]);

  // Handle Authentication Success inside LandingPage
  const handleAuthSuccess = (uid: string) => {
    setAuthLoading(false);
  };

  // --------------------------------------------------
  // ONBOARDING SEEDING TEMPLATES
  // --------------------------------------------------

  const seedCustomOnboardingData = async (uid: string, profession: string, availableHours: number) => {
    const tasksRef = collection(db, "users", uid, "tasks");
    const goalsRef = collection(db, "users", uid, "goals");
    const habitsRef = collection(db, "users", uid, "habits");
    const notificationsRef = collection(db, "users", uid, "notifications");
    const chatsRef = collection(db, "users", uid, "chats");

    // Push initial calibration notification
    await addDoc(notificationsRef, {
      category: "ai",
      title: "Tactical Calibration Successful",
      message: `${profession} configuration deployed. Available daily window formulated as ${availableHours} hours.`,
      read: false,
      createdAt: new Date().toISOString()
    });

    if (profession === "Developer") {
      await addDoc(goalsRef, {
        goalName: "Master Deep SDE Workflows",
        description: "Deploy scalable backend frameworks, audit code virtualizations, and refine system parameters.",
        targetDate: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().split("T")[0],
        category: "Career",
        progress: 33,
        milestones: [
          { id: "m1", name: "Configure centralized PostgreSQL indexing strategies", completed: true },
          { id: "m2", name: "Run stress benchmarks on concurrent socket queues", completed: false },
          { id: "m3", name: "Add robust fallback offline response engines", completed: false }
        ]
      });

      await addDoc(tasksRef, {
        title: "Build Centralized Relational Index Schema",
        description: "Construct modern structural entity loops, optimize key constraint triggers, and verify query timelines.",
        category: "Projects",
        priority: "Critical",
        deadline: new Date().toISOString().split("T")[0],
        estimatedHours: 4,
        status: "pending",
        riskScore: 78,
         urgencyScore: 88,
         importanceScore: 92,
         difficultyScore: 70,
         priorityRanking: 1,
         createdAt: new Date().toISOString()
      });

      await addDoc(tasksRef, {
        title: "Test render loops & memoize nesting components",
         description: "Analyze frame delay ratios. Introduce virtualization wrappers around heavy task grids to prevent loading stalls.",
         category: "Projects",
         priority: "High",
         deadline: new Date(Date.now() + 24 * 3600 * 1000).toISOString().split("T")[0],
         estimatedHours: 2,
         status: "pending",
         riskScore: 40,
         urgencyScore: 65,
         importanceScore: 75,
         difficultyScore: 45,
         priorityRanking: 2,
         createdAt: new Date().toISOString()
      });

      await addDoc(habitsRef, {
         habitName: "Commit Daily Code Sprint",
         frequency: "daily",
         target: 1,
         history: {},
         currentStreak: 0,
         longestStreak: 0,
         consistencyScore: 0
      });

      await addDoc(habitsRef, {
        habitName: "90-Min Focused Deep Work",
        frequency: "daily",
        target: 1,
        history: {},
        currentStreak: 0,
        longestStreak: 0,
        consistencyScore: 0
     });
    } else if (profession === "Student") {
       await addDoc(goalsRef, {
         goalName: "Lock in 9.0+ Semester GPA",
         description: "Audit Database indices, compute networking protocols simulation logs, and complete academic portfolios.",
         targetDate: new Date(Date.now() + 45 * 24 * 3600 * 1000).toISOString().split("T")[0],
         category: "Academic",
         progress: 25,
         milestones: [
           { id: "m1", name: "Complete relational normalizations proofs sheet", completed: true },
           { id: "m2", name: "Submit complete computer networking simulation journals", completed: false },
           { id: "m3", name: "Solve Operating Systems mutual exclusion quizzes", completed: false }
         ]
       });

       await addDoc(tasksRef, {
         title: "DBMS Assignment: Normalization Decompositions",
         description: "Prove BCNF and 3NF key equations and design functional dependency graphs for submission.",
         category: "Study",
         priority: "Critical",
         deadline: new Date().toISOString().split("T")[0],
         estimatedHours: 3,
         status: "pending",
         riskScore: 82,
         urgencyScore: 92,
         importanceScore: 85,
         difficultyScore: 60,
         priorityRanking: 1,
         createdAt: new Date().toISOString()
       });

       await addDoc(habitsRef, {
         habitName: "Review SDE Practice Notebook",
         frequency: "daily",
         target: 1,
         history: {},
         currentStreak: 0,
         longestStreak: 0,
         consistencyScore: 0
       });
    } else {
      await addDoc(goalsRef, {
         goalName: `Establish Strategic ${profession} Baseline`,
         description: "Define major operational phases, document execution progress, and track daily habit checkmarks.",
         targetDate: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().split("T")[0],
         category: "Personal",
         progress: 0,
         milestones: [
           { id: "m1", name: "Draft operational workflow requirements template", completed: false },
           { id: "m2", name: "Set up daily calendar block structure", completed: false }
         ]
       });

       await addDoc(tasksRef, {
         title: "Map operational backlog hierarchy",
         description: "Analyze workload components and decompose extensive milestones into 45-minute task buckets.",
         category: "Personal",
         priority: "High",
         deadline: new Date().toISOString().split("T")[0],
         estimatedHours: 2,
         status: "pending",
         riskScore: 50,
         urgencyScore: 70,
         importanceScore: 75,
         difficultyScore: 40,
         priorityRanking: 1,
         createdAt: new Date().toISOString()
       });

       await addDoc(habitsRef, {
         habitName: "Log Focus Blocks on Planner",
         frequency: "daily",
         target: 1,
         history: {},
         currentStreak: 0,
         longestStreak: 0,
         consistencyScore: 0
       });
    }
  };

  const onOnboardingComplete = async (answers: {
    profession: string;
    availableHours: number;
    challenge: string;
    seedingSelection: boolean;
  }) => {
    if (!currentUser) return;
    const uid = currentUser.uid;
    const profileRef = doc(db, "users", uid);

    const updatedProfile = {
      ...(userProfile || {}),
      profession: answers.profession,
      availableHours: answers.availableHours,
      challenge: answers.challenge,
      onboardingCompleted: true,
      productivityScore: 75,
      createdAt: userProfile?.createdAt || new Date().toISOString()
    };

    try {
      await setDoc(profileRef, updatedProfile, { merge: true });
      setUserProfile(updatedProfile as UserProfile);

      // Seed Starter Data custom tailored based on selection
      if (answers.seedingSelection) {
        await seedCustomOnboardingData(uid, answers.profession, answers.availableHours);
      }
    } catch (err) {
      console.error("Failed to complete onboarding triggers:", err);
    }
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

      // Insert dynamic notification trigger
      const notificationsRef = collection(db, "users", currentUser.uid, "notifications");
      await addDoc(notificationsRef, {
        category: "tasks",
        title: "Task Allocated Successfully",
        message: `Task "${taskData.title}" registered with urgency priority of ${taskData.priority}.`,
        read: false,
        createdAt: new Date().toISOString()
      });

      await handleRecalculateMomentumScore();
    } catch (err) {
      console.error("Task allocation failed:", err);
      handleFirestoreError(err, OperationType.WRITE, `users/${currentUser.uid}/tasks`);
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
      handleFirestoreError(err, OperationType.WRITE, `users/${currentUser.uid}/tasks/${taskId}`);
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
      handleFirestoreError(err, OperationType.DELETE, `users/${currentUser.uid}/tasks/${taskId}`);
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

      // Insert notification
      await addDoc(collection(db, "users", currentUser.uid, "notifications"), {
        category: "habits",
        title: "Habit Target Registered",
        message: `Habit "${habitData.habitName}" built into your daily tracking metrics.`,
        read: false,
        createdAt: new Date().toISOString()
      });
    } catch (err) {
      console.error("Habit registration error:", err);
      handleFirestoreError(err, OperationType.WRITE, `users/${currentUser.uid}/habits`);
    }
  };

  const handleToggleHabit = async (habitId: string, dateStr: string) => {
    if (!currentUser) return;
    const habit = habits.find(h => h.habitId === habitId);
    if (!habit) return;

    try {
      const updatedHistory = { ...habit.history };
      let justChecked = false;
      if (updatedHistory[dateStr]) {
        delete updatedHistory[dateStr];
      } else {
        updatedHistory[dateStr] = true;
        justChecked = true;
      }

      // Compute streak metrics precisely in memory
      const datesLogged = Object.keys(updatedHistory).sort();
      let currentStreak = 0;
      let longestStreak = habit.longestStreak || 0;

      const today = new Date();
      let checkDate = new Date();
      let continues = true;

      while (continues) {
        const checkStr = checkDate.toISOString().split("T")[0];
        if (updatedHistory[checkStr]) {
          currentStreak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          if (checkStr === today.toISOString().split("T")[0]) {
            checkDate.setDate(checkDate.getDate() - 1);
            const yesterdayStr = checkDate.toISOString().split("T")[0];
            if (updatedHistory[yesterdayStr]) {
              checkDate.setDate(checkDate.getDate() - 1);
            } else {
              continues = false;
            }
          } else {
            continues = false;
          }
        }
      }

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

      // Celebrate streak milestones via alert notification
      if (justChecked && currentStreak > 0 && currentStreak % 3 === 0) {
        await addDoc(collection(db, "users", currentUser.uid, "notifications"), {
          category: "habits",
          title: "🔥 Consistency Fire!",
          message: `Great focus! You've achieved a ${currentStreak}-day milestone on "${habit.habitName}". Keep pushing.`,
          read: false,
          createdAt: new Date().toISOString()
        });
      }

      await handleRecalculateMomentumScore();
    } catch (err) {
      console.error("Habit check toggler failed:", err);
      handleFirestoreError(err, OperationType.WRITE, `users/${currentUser.uid}/habits/${habitId}`);
    }
  };

  const handleDeleteHabit = async (habitId: string) => {
    if (!currentUser) return;
    try {
      const docRef = doc(db, "users", currentUser.uid, "habits", habitId);
      await deleteDoc(docRef);
    } catch (err) {
      console.error("Habit deletion error:", err);
      handleFirestoreError(err, OperationType.DELETE, `users/${currentUser.uid}/habits/${habitId}`);
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

      await addDoc(collection(db, "users", currentUser.uid, "notifications"), {
        category: "goals",
        title: "Strategic Milestone Established",
        message: `New Goal "${goalData.goalName}" logged. AI Sprint Roadmaps can now be synthesized.`,
        read: false,
        createdAt: new Date().toISOString()
      });
    } catch (err) {
      console.error("Goal creation error:", err);
      handleFirestoreError(err, OperationType.WRITE, `users/${currentUser.uid}/goals`);
    }
  };

  const handleEditGoal = async (goalId: string, updatedFields: Partial<Goal>) => {
    if (!currentUser) return;
    try {
      const docRef = doc(db, "users", currentUser.uid, "goals", goalId);
      await updateDoc(docRef, updatedFields);
    } catch (err) {
      console.error("Goal updates error:", err);
      handleFirestoreError(err, OperationType.WRITE, `users/${currentUser.uid}/goals/${goalId}`);
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    if (!currentUser) return;
    try {
      const docRef = doc(db, "users", currentUser.uid, "goals", goalId);
      await deleteDoc(docRef);
    } catch (err) {
      console.error("Goal deletion error:", err);
      handleFirestoreError(err, OperationType.DELETE, `users/${currentUser.uid}/goals/${goalId}`);
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
      handleFirestoreError(err, OperationType.WRITE, `users/${currentUser.uid}`);
    }
  };

  // 5. Seed Core Platform Demo Data (Purges existing mock states cleanly & seeds Momentum AI suite)
  const handleSeedDemoData = async () => {
    if (!currentUser) return;
    const uid = currentUser.uid;
    const email = currentUser.email || "";
    const seed = getDemoModelData(uid, email);

    try {
      const profileRef = doc(db, "users", uid);
      await setDoc(profileRef, seed.profile, { merge: true });

      // Clean existing
      for (const t of tasks) {
        await deleteDoc(doc(db, "users", uid, "tasks", t.taskId));
      }
      for (const g of goals) {
        await deleteDoc(doc(db, "users", uid, "goals", g.goalId));
      }
      for (const h of habits) {
        await deleteDoc(doc(db, "users", uid, "habits", h.habitId));
      }
      for (const c of chats) {
        await deleteDoc(doc(db, "users", uid, "chats", c.id));
      }
      for (const n of notifications) {
        await deleteDoc(doc(db, "users", uid, "notifications", n.notificationId || n.id || ""));
      }

      // Seed
      const tasksRef = collection(db, "users", uid, "tasks");
      for (const t of seed.tasks) {
        await addDoc(tasksRef, { ...t, createdAt: new Date().toISOString() });
      }

      const goalsRef = collection(db, "users", uid, "goals");
      for (const g of seed.goals) {
        await addDoc(goalsRef, g);
      }

      const habitsRef = collection(db, "users", uid, "habits");
      for (const h of seed.habits) {
        await addDoc(habitsRef, h);
      }

      const chatsRef = collection(db, "users", uid, "chats");
      for (const c of seed.chats) {
        await addDoc(chatsRef, c);
      }

      // Push initial seed success notification
      const notificationsRef = collection(db, "users", uid, "notifications");
      await addDoc(notificationsRef, {
        category: "ai",
        title: "Standard Demo System Configured",
        message: "Successfully seeded complete 25-task and 10-goal enterprise workflow profiles.",
        read: false,
        createdAt: new Date().toISOString()
      });
    } catch (err) {
      console.error("Seeding operation fatal failure:", err);
      handleFirestoreError(err, OperationType.WRITE, `users/${uid}/seed`);
      throw err;
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
    const data = await res.json();

    // Dynamically insert an alert notification when rescue details are successfully formulated
    if (currentUser) {
      try {
        await addDoc(collection(db, "users", currentUser.uid, "notifications"), {
          category: "rescue",
          title: "🚨 Rescue Protocol Activated",
          message: `AI generated a mitigation timetable to safeguard critical deadline on "${task.title}".`,
          read: false,
          createdAt: new Date().toISOString()
        });
      } catch (e) {
        console.error(e);
      }
    }

    return data;
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
    try {
      await addDoc(chatCol, {
        role: "user",
        text,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `users/${currentUser.uid}/chats`);
    }

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
    try {
      await addDoc(chatCol, {
        role: "model",
        text: result.text || "I am here to help you live in focus. Tell me more about your backlogs.",
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `users/${currentUser.uid}/chats`);
    }

    return result;
  };

  const handleSendFloatingMessage = async (text: string) => {
    if (!text.trim() || floatingLoading) return;
    const userMsg = { role: "user" as const, text, timestamp: new Date().toISOString() };
    const updatedMsgs = [...floatingMessages, userMsg];
    setFloatingMessages(updatedMsgs);
    setFloatingInput("");
    setFloatingLoading(true);

    try {
      const payloadContext = updatedMsgs.slice(-8); // Send recent messages for context
      const res = await fetch("/api/ai/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: payloadContext,
          userProfile
        })
      });

      if (!res.ok) throw new Error("Assistant response failure");
      const data = await res.json();
      setFloatingMessages(prev => [
        ...prev,
        {
          role: "model",
          text: data.text || "I apologize, I encountered an issue retrieving that suggestion. Feel free to type another question.",
          timestamp: new Date().toISOString()
        }
      ]);
    } catch (err) {
      console.error("Floating assistant communication error:", err);
      // Fallback advice in context of Gemini models unavailable status
      setFloatingMessages(prev => [
        ...prev,
        {
          role: "model",
          text: "Momentum Assistant is temporarily offline. Don't let your streak slip! Try timeboxing your biggest bottleneck task right now into an undivided 10-minute focus sprint. Just get started!",
          timestamp: new Date().toISOString()
        }
      ]);
    } finally {
      setFloatingLoading(false);
    }
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
    
    if (result.suggestedProductivityScore && currentUser) {
      const docRef = doc(db, "users", currentUser.uid);
      await updateDoc(docRef, {
        productivityScore: Math.min(100, Math.max(0, result.suggestedProductivityScore))
      });
    }

    return result;
  };

  // Formulaic recalculation of momentum score based on real metrics
  const handleRecalculateMomentumScore = async () => {
    if (!currentUser || !userProfile) return;
    
    let taskPt = Math.min(20, tasks.filter(t => t.status === "completed").length * 5);
    
    let habitPt = 0;
    if (habits.length > 0) {
      const totalCons = habits.reduce((sum, h) => sum + h.consistencyScore, 0);
      habitPt = Math.min(20, Math.round((totalCons / habits.length) * 0.2));
    }

    const nextScore = Math.min(100, Math.max(40, 60 + taskPt + habitPt));

    if (nextScore !== userProfile.productivityScore) {
      const docRef = doc(db, "users", currentUser.uid);
      try {
        await updateDoc(docRef, { productivityScore: nextScore });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `users/${currentUser.uid}`);
      }
    }
  };

  // Notification methods
  const handleMarkNotificationRead = async (id: string) => {
    if (!currentUser || !id) return;
    try {
      const docRef = doc(db, "users", currentUser.uid, "notifications", id);
      await updateDoc(docRef, { read: true });
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllNotificationsRead = async () => {
    if (!currentUser) return;
    try {
      const unreadList = notifications.filter(n => !n.read);
      for (const n of unreadList) {
        const id = n.notificationId || n.id;
        if (id) {
          const docRef = doc(db, "users", currentUser.uid, "notifications", id);
          await updateDoc(docRef, { read: true });
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleClearAllNotifications = async () => {
    if (!currentUser) return;
    try {
      for (const n of notifications) {
        const id = n.notificationId || n.id;
        if (id) {
          const docRef = doc(db, "users", currentUser.uid, "notifications", id);
          await deleteDoc(docRef);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  // --------------------------------------------------
  // RENDER SELECTION LOGIC
  // --------------------------------------------------

  if (authLoading) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white flex flex-col items-center justify-center space-y-4 font-sans uppercase">
        <Sparkles className="w-8 h-8 text-indigo-500 animate-spin" />
        <p className="text-[10px] font-mono tracking-widest text-[#7272a3]">Verifying workspace keys...</p>
      </div>
    );
  }

  // Guest landing page
  if (!currentUser) {
    return <LandingPage onAuthSuccess={handleAuthSuccess} />;
  }

  // Synchronizing Loader
  if (dataLoading && tasks.length === 0 && habits.length === 0) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white flex flex-col items-center justify-center space-y-4 font-sans uppercase">
        <Activity className="w-10 h-10 text-purple-500 animate-bounce" />
        <p className="text-[10px] font-mono tracking-widest text-[#7272a3]">Synchronizing cloud cache...</p>
      </div>
    );
  }

  // Onboarding Screen Override: blocks main view until strategic answers are calibrated
  const onboardingCompleted = userProfile?.onboardingCompleted === true;
  if (currentUser && userProfile && !onboardingCompleted) {
    return (
      <OnboardingWizard 
        userName={userProfile.name} 
        onComplete={onOnboardingComplete} 
      />
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-screen bg-[#030309] text-white select-none overflow-hidden font-sans relative">
      {/* Background ambient glowing blurs */}
      <div className="absolute top-[-200px] right-[-100px] w-[500px] h-[500px] bg-purple-600/5 rounded-full blur-[120px] pointer-events-none z-0"></div>
      <div className="absolute bottom-[-100px] left-[-100px] w-[400px] h-[400px] bg-blue-600/5 rounded-full blur-[120px] pointer-events-none z-0"></div>
      
      {/* Dynamic Left Sidebar Panel (fully responsive mobile slider included) */}
      <Sidebar 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        userProfile={userProfile}
        onLogout={() => setCurrentUser(null)}
        unreadNotificationsCount={notifications.filter(n => !n.read).length}
        mobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
      />

      {/* Main viewport block container */}
      <div className="flex-1 flex flex-col overflow-hidden relative z-10 w-full">
        
        {/* Mobile Header Toolbar */}
        <div className="md:hidden flex items-center justify-between p-4 bg-[#050510]/95 border-b border-indigo-950/40 sticky top-0 z-20 select-none">
          <button 
            onClick={() => setMobileSidebarOpen(true)}
            className="p-2 rounded-xl bg-indigo-950/40 border border-indigo-900/40 text-indigo-400 hover:text-white"
          >
            <Menu className="w-4.5 h-4.5" />
          </button>
          
          <div className="flex items-center space-x-1 px-2.5 py-1 rounded-xl bg-white/[0.02] border border-white/5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-[10px] font-black font-sans uppercase tracking-[0.15em] text-white">MOMENTUM AI</span>
          </div>

          <div className="relative">
            <button 
              onClick={() => setActiveTab("notifications")}
              className="p-2 rounded-xl text-neutral-400 hover:text-white"
            >
              <Bell className="w-4.5 h-4.5" />
              {notifications.filter(n => !n.read).length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
              )}
            </button>
          </div>
        </div>

        {/* View Routing Render Stage */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8" id="main-app-viewport">
          
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

          {activeTab === "rescue" && (
            <RescueView 
              tasks={tasks}
              onTriggerRescue={onTriggerRescue}
              onUpdateTask={async (t) => {
                const id = t.taskId;
                if (id) {
                  const { taskId, ...fields } = t;
                  await handleEditTask(taskId, fields);
                }
              }}
            />
          )}

          {activeTab === "notifications" && (
            <NotificationsView 
              notifications={notifications}
              onMarkRead={handleMarkNotificationRead}
              onMarkAllRead={handleMarkAllNotificationsRead}
              onClearAll={handleClearAllNotifications}
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

          {activeTab === "settings" && <SettingsView onSeedDemoData={handleSeedDemoData} />}
        </main>
      </div>

      {/* Dynamic Floating Chatbot Copilot */}
      <div className="absolute bottom-6 right-6 z-50 flex flex-col items-end">
        {floatingChatOpen ? (
          <div className="bg-[#0b0c16]/95 border border-indigo-500/30 shadow-2xl backdrop-blur-xl rounded-2xl w-80 sm:w-96 h-[520px] flex flex-col overflow-hidden mb-3 animate-in fade-in slide-in-from-bottom-5 duration-200">
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-indigo-950/60 to-purple-950/40 border-b border-indigo-500/20 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Bot className="w-5 h-5 text-indigo-400" />
                  <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-emerald-500 rounded-full ring-2 ring-neutral-900 animate-pulse"></span>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white tracking-wide">Momentum AI Copilot</h4>
                  <p className="text-[10px] text-emerald-400 font-medium">● ACTIVE PROTOCOL</p>
                </div>
              </div>
              <button 
                onClick={() => setFloatingChatOpen(false)}
                className="text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors"
                title="Minimize Copilot"
              >
                <Minimize2 className="w-4 h-4" />
              </button>
            </div>

            {/* Messages Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
              {floatingMessages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] rounded-xl px-3.5 py-2 text-xs leading-relaxed ${
                    msg.role === "user" 
                      ? "bg-indigo-600 text-white rounded-tr-none" 
                      : "bg-neutral-800/80 text-neutral-200 rounded-tl-none border border-neutral-700/40"
                  }`}>
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                    <span className="block text-[8px] text-neutral-400 mt-1 text-right select-none">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))}
              {floatingLoading && (
                <div className="flex justify-start">
                  <div className="bg-neutral-800/80 border border-neutral-700/40 rounded-xl rounded-tl-none px-3.5 py-2 text-xs text-neutral-400 flex items-center space-x-2">
                    <span className="flex space-x-1">
                      <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                      <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                      <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    </span>
                    <span>Formulating feedback...</span>
                  </div>
                </div>
              )}
              <div ref={floatingScrollRef} />
            </div>

            {/* Quick Actions Panel */}
            <div className="px-4 py-2 bg-neutral-900/60 border-t border-neutral-800/85 flex flex-wrap gap-1.5 justify-start">
              <button 
                onClick={() => handleSendFloatingMessage("Critique my tasks list context and priorities.")}
                disabled={floatingLoading}
                className="text-[10px] px-2 py-1 rounded bg-indigo-950/40 border border-indigo-500/20 text-indigo-300 hover:bg-indigo-500/20 hover:text-white transition-all duration-150 disabled:opacity-50"
              >
                ⚡ Critique tasks
              </button>
              <button 
                onClick={() => handleSendFloatingMessage("Generate an ultra-high energy productivity pep talk!")}
                disabled={floatingLoading}
                className="text-[10px] px-2 py-1 rounded bg-purple-950/40 border border-purple-500/20 text-purple-300 hover:bg-purple-500/20 hover:text-white transition-all duration-150 disabled:opacity-50"
              >
                🔥 Energy pep talk
              </button>
              <button 
                onClick={() => handleSendFloatingMessage("Give me a smart timeboxing recommendation for today.")}
                disabled={floatingLoading}
                className="text-[10px] px-2 py-1 rounded bg-blue-950/40 border border-blue-500/20 text-blue-300 hover:bg-blue-500/20 hover:text-white transition-all duration-150 disabled:opacity-50"
              >
                🕒 Timeboxing tip
              </button>
            </div>

            {/* Input Bar */}
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleSendFloatingMessage(floatingInput);
              }}
              className="p-3 bg-neutral-950/90 border-t border-neutral-800/80 flex items-center space-x-2"
            >
              <input 
                type="text"
                value={floatingInput}
                onChange={(e) => setFloatingInput(e.target.value)}
                placeholder="Ask me a question..."
                disabled={floatingLoading}
                className="flex-1 bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors disabled:opacity-60"
              />
              <button 
                type="submit"
                disabled={!floatingInput.trim() || floatingLoading}
                className="p-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-neutral-800 disabled:text-neutral-500 text-white rounded-xl transition-colors disabled:cursor-not-allowed"
                title="Send Message"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        ) : (
          <button 
            onClick={() => setFloatingChatOpen(true)}
            className="flex items-center space-x-2 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium text-xs rounded-full shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/40 transition-all duration-200 border border-indigo-400/25 active:scale-95 group"
          >
            <div className="relative">
              <MessageCircle className="w-4.5 h-4.5 group-hover:rotate-12 transition-transform duration-200" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-400 rounded-full animate-ping"></span>
            </div>
            <span>Momentum AI Copilot</span>
          </button>
        )}
      </div>
    </div>
  );
}
