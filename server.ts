import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Lazy initialize Gemini API Client safely
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("WARNING: GEMINI_API_KEY environment variable is not set. AI features might fail.");
    }
    aiClient = new GoogleGenAI({ apiKey: apiKey || "" });
  }
  return aiClient;
}

// Support JSON payloads
app.use(express.json());

// --------------------------------------------------
// AI API ROUTES
// --------------------------------------------------

// 1. Prioritize Tasks
app.post("/api/ai/prioritize", async (req, res) => {
  try {
    const { task } = req.body;
    if (!task) {
      return res.status(400).json({ error: "Missing task payload" });
    }

    const ai = getGeminiClient();
    const prompt = `
      You are the AI Priority Engine in Momentum AI.
      Analyze the following task and calculate four productivity scores from 0 to 100:
      - Urgency Score (Based on deadline proximity and estimated time required)
      - Importance Score (Significance of target project, profession, or direct consequence of failure)
      - Difficulty Score (Intellectual, physical, or creative efforts required)
      - Risk Score (The likelihood of failing or missing the deadline, considering current date is ${new Date().toISOString().split('T')[0]})

      Also generate:
      - priorityRanking: An overall computed ranking order from 1 to 4 (1 = Critical, 2 = High, 3 = Medium, 4 = Low).
      - suggestedAction: A one-sentence concrete advice on how to start this task right away.
      - bestTimeToStart: A human-readable suggestion like "Today morning", "In 2 hours", or "This weekend after prepping".

      Task details:
      - Title: ${task.title}
      - Description: ${task.description}
      - Category: ${task.category}
      - Priority Selected: ${task.priority}
      - Deadline: ${task.deadline}
      - Estimated Hours: ${task.estimatedHours}

      Return standard raw JSON only, matching this structure perfectly:
      {
        "urgencyScore": number,
        "importanceScore": number,
        "difficultyScore": number,
        "riskScore": number,
        "priorityRanking": number,
        "suggestedAction": "string",
        "bestTimeToStart": "string"
      }
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const resultText = response.text;
    res.json(JSON.parse(resultText || "{}"));
  } catch (error: any) {
    console.error("Error in AI Prioritize:", error);
    res.status(500).json({ error: error.message || "Failed to prioritize task with AI" });
  }
});

// 2. Deadline Rescue Mode
app.post("/api/ai/rescue", async (req, res) => {
  try {
    const { task, context } = req.body;
    if (!task) {
      return res.status(400).json({ error: "Missing task payload" });
    }

    const ai = getGeminiClient();
    const prompt = `
      You are the AI Crisis Rescue Agent in Momentum AI.
      This task is flagged as HIGH RISK of missing its deadline (${task.deadline}).
      Analyze the task and write an emergency action plan to rescue it and guarantee completion.

      Task Details:
      - Title: ${task.title}
      - Description: ${task.description}
      - Category: ${task.category}
      - Estimated Hours: ${task.estimatedHours}
      - Deadline: ${task.deadline}
      - Current Date: ${new Date().toISOString().split('T')[0]}

      Context:
      - Available user time: ${context?.availableHours || 4} hours per day
      - Energy level: ${context?.energyLevel || "Medium"}

      Return standard raw JSON only, matching this structure perfectly:
      {
        "riskExplanation": "A short, empathetic bulleted review of why this task is at risk (e.g. over-optimism, bottleneck resources, or tight schedule).",
        "recoveryPlan": ["Action step 1", "Action step 2", "Action step 3"],
        "taskBreakdown": [
          { "step": "Phase 1 / Subtask name", "estMinutes": 45 },
          { "step": "Phase 2 / Subtask name", "estMinutes": 90 }
        ],
        "emergencySchedule": "A compact hourly schedule to fit into their next 48 hours (e.g. '09:00 - 10:30 pre-draft, 14:00 review').",
        "completionProbability": 85
      }
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const resultText = response.text;
    res.json(JSON.parse(resultText || "{}"));
  } catch (error: any) {
    console.error("Error in AI Rescue:", error);
    res.status(500).json({ error: error.message || "Failed to generate AI rescue plan" });
  }
});

// 3. AI Daily Planner
app.post("/api/ai/planner", async (req, res) => {
  try {
    const { availableHours, energyLevel, tasks } = req.body;
    if (!tasks || !Array.isArray(tasks)) {
      return res.status(400).json({ error: "Missing tasks array" });
    }

    const ai = getGeminiClient();
    const taskSummary = tasks
      .map((t) => `- [${t.priority}] ${t.title} (${t.estimatedHours} hrs, Category: ${t.category}, Status: ${t.status})`)
      .join("\n");

    const prompt = `
      You are the AI Smart Scheduler in Momentum AI.
      Generate a customized, hyper-focused daily plan block for:
      - Available product hours: ${availableHours} hours
      - Today's User Energy level: ${energyLevel}
      - Today's Date: ${new Date().toISOString().split('T')[0]}

      The user has the following tasks:
      ${taskSummary}

      Allocate time blocks sensibly. Add regular breaks (5-15 mins) and specific work/study intervals.
      Make sure the total work duration in modules does not exceed available hours.

      Return standard raw JSON only, matching this structure perfectly:
      {
        "scheduleBlocks": [
          { "time": "09:00 - 10:15", "taskTitle": "Kickstart Workspace and setup dependencies", "duration": 75, "type": "work" },
          { "time": "10:15 - 10:30", "taskTitle": "Hydration and Deep Breathing Break", "duration": 15, "type": "break" }
        ],
        "breakSuggestions": [
          "Do a 5-minute leg stretch under sunlight",
          "Try a sensory rest exercise - close eyes and listen to ambient sounds"
        ],
        "aiSummary": "A motivational 2-sentence summary explaining why this plan optimizes their current ${energyLevel} energy level."
      }
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const resultText = response.text;
    res.json(JSON.parse(resultText || "{}"));
  } catch (error: any) {
    console.error("Error in AI Planner:", error);
    res.status(500).json({ error: error.message || "Failed to generate daily planner schedule" });
  }
});

// 4. AI Productivity Coach Chat
app.post("/api/ai/coach", async (req, res) => {
  try {
    const { messages, userProfile } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Missing messages array" });
    }

    const ai = getGeminiClient();

    // Prepare system instructions and profile context
    const profileContext = userProfile 
      ? `You are talking to ${userProfile.name}, a ${userProfile.profession || "learner"} attending/at ${userProfile.college || "college"}. Their current productivity score is ${userProfile.productivityScore || 70}/100.`
      : "You are talking to an ambitious user striving to avoid missed deadlines and optimize focus.";

    const systemInstruction = `
      You are human-centered AI Productivity Coach in Momentum AI.
      Your voice is professional, empathetic, practical, and action-oriented. You avoid platitudes and instead suggest concrete task breakdowns, timeboxing, or study strategies.
      Capabilities you possess: Study planning, Exam prep schedules, Interview preparation, Career/growth guidance, Time management, Burnout prevention, and Stress management.
      ${profileContext}
      Provide support with rich formatting (markdown) but keep responses concise, punchy, and organized with lists.
    `;

    // Map conversation array to Gemini content objects
    const formattedContents = messages.map(msg => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.text }]
    }));

    // Inject system instructions as the model setup instruction
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: formattedContents,
      config: {
        systemInstruction,
        temperature: 0.7,
      }
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error("Error in AI Coach:", error);
    res.status(500).json({ error: error.message || "Failed to communicate with AI Coach" });
  }
});

// 5. Goal Roadmap Generation
app.post("/api/ai/roadmap", async (req, res) => {
  try {
    const { goalName, description, targetDate, category } = req.body;
    if (!goalName) {
      return res.status(400).json({ error: "Missing goal name" });
    }

    const ai = getGeminiClient();
    const prompt = `
      You are the Master AI Strategist in Momentum AI.
      Create an exceptionally detailed, sprint-based, step-by-step roadmap to achieve the following goal by ${targetDate}.

      Goal Name: ${goalName}
      Description: ${description || "No description provided"}
      Category: ${category}
      Target Date: ${targetDate}

      Formulate a detailed, structured preparation plan with 4 key major sprints or phases. Format your response strictly in Markdown with headers, bold bullets, and actionable milestones.
      Keep it focused on time allocation, sub-skills to develop, resources needed, and check-in benchmarks.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    res.json({ roadmap: response.text });
  } catch (error: any) {
    console.error("Error in AI Roadmap:", error);
    res.status(500).json({ error: error.message || "Failed to generate goal roadmap" });
  }
});

// 6. Burnout and Weekly Review Feed
app.post("/api/ai/weekly-review", async (req, res) => {
  try {
    const { tasks, habits, goals, userProfile } = req.body;
    const ai = getGeminiClient();

    const taskSummary = (tasks || [])
      .map((t: any) => `- ${t.title}: Priority ${t.priority}, Status ${t.status}, Risk ${t.riskScore}%`)
      .join("\n");

    const habitSummary = (habits || [])
      .map((h: any) => `- ${h.habitName}: Streak ${h.currentStreak}, Consistency ${h.consistencyScore}%`)
      .join("\n");

    const prompt = `
      You are the Lead Burnout Predictor & Performance Evaluator in Momentum AI.
      Analyze the workload and consistency metrics of the user.

      User Context: ${userProfile ? `${userProfile.name}, ${userProfile.profession}` : "Proactively active member"}
      Productivity Score: ${userProfile?.productivityScore || 75}/100

      Recent Task Logs:
      ${taskSummary || "No active tasks recorded."}

      Habit Streaks:
      ${habitSummary || "No active habits recorded."}

      Evaluate:
      1. Overload / Burnout Risk (Low, Medium, or High with clear explanation)
      2. Productivity Velocity (How well they are executing tasks)
      3. Actionable recommendation to restore work-life balance or leverage energy.

      Return standard raw JSON only, matching this structure perfectly:
      {
        "burnoutLevel": "Low" | "Medium" | "High",
        "burnoutExplanation": "A concise paragraph explaining why they are in this state and what signals prompted this prediction.",
        "weeklySummary": "A summary of their achievements, strengths and consistency over tasks and habits this week.",
        "actionFeed": [
          "Action suggestion item 1",
          "Action suggestion item 2",
          "Action suggestion item 3"
        ],
        "suggestedProductivityScore": number
      }
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const resultText = response.text;
    res.json(JSON.parse(resultText || "{}"));
  } catch (error: any) {
    console.error("Error in AI Weekly Review:", error);
    res.status(500).json({ error: error.message || "Failed to generate weekly audit report" });
  }
});

// --------------------------------------------------
// VITE DEV SERVER OR STATIC SERVING MIDDLEWARE
// --------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    // Development Mode
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite development server middleware integrated.");
  } else {
    // Production Mode
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Production static file server configured.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Momentum AI Express Server running on port ${PORT}`);
  });
}

startServer();
