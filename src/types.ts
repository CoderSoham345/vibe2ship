export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  photoURL?: string;
  college?: string;
  profession?: string;
  createdAt: string;
  productivityScore: number;
}

export interface Task {
  taskId: string;
  title: string;
  description: string;
  category: 'Study' | 'Work' | 'Personal' | 'Finance' | 'Health' | 'Career' | 'Projects';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  deadline: string; // ISO date string or YYYY-MM-DD
  estimatedHours: number;
  status: 'pending' | 'completed' | 'archived';
  riskScore: number; // 0-100
  createdAt: string;
  completedAt?: string;

  // AI priority engine output
  urgencyScore?: number;
  importanceScore?: number;
  difficultyScore?: number;
  priorityRanking?: number;
  suggestedAction?: string;
  bestTimeToStart?: string;

  // Rescue mode plan
  rescuePlan?: {
    riskExplanation: string;
    recoveryPlan: string[];
    taskBreakdown: { step: string; estMinutes: number }[];
    emergencySchedule: string;
    completionProbability: number;
  };
}

export interface Goal {
  goalId: string;
  goalName: string;
  description: string;
  targetDate: string;
  category: 'Academic' | 'Career' | 'Health' | 'Financial' | 'Personal';
  progress: number; // 0-100
  milestones: {
    id: string;
    name: string;
    completed: boolean;
  }[];
  roadmap?: string; // AI Generated Roadmap Markdown
}

export interface Habit {
  habitId: string;
  habitName: string;
  frequency: 'daily' | 'weekly';
  target: number; // times per week/day
  history: { [dateStr: string]: boolean }; // e.g. "2026-06-23": true
  currentStreak: number;
  longestStreak: number;
  consistencyScore: number;
}

export interface SmartNotification {
  id: string;
  title: string;
  message: string;
  type: 'deadline' | 'rescue' | 'habit' | 'goal' | 'suggestion';
  timestamp: string;
  read: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
}

export interface PlannerSchedule {
  dateStr: string; // YYYY-MM-DD
  availableHours: number;
  energyLevel: 'low' | 'medium' | 'high';
  scheduleBlocks: {
    time: string;
    taskTitle: string;
    duration: number; // in mins
    type: 'study' | 'work' | 'break';
  }[];
  breakSuggestions: string[];
  aiSummary?: string;
}
