import { Task, Goal, Habit, ChatMessage, UserProfile, PlannerSchedule } from "../types";

export interface DemoBatchData {
  profile: Partial<UserProfile>;
  tasks: Omit<Task, "taskId" | "createdAt">[];
  goals: Omit<Goal, "goalId">[];
  habits: Omit<Habit, "habitId">[];
  chats: Omit<ChatMessage, "id">[];
  schedules: PlannerSchedule[];
}

export function getDemoModelData(uid: string, userEmail: string): DemoBatchData {
  const today = new Date();
  const getRelativeDateStr = (offsetDays: number): string => {
    const target = new Date(today);
    target.setDate(today.getDate() + offsetDays);
    return target.toISOString().split("T")[0];
  };

  const getRelativeDateTimeStr = (offsetDays: number, timeStr: string): string => {
    const datePart = getRelativeDateStr(offsetDays);
    return `${datePart}T${timeStr}:00Z`;
  };

  // 1. Profile information
  const profile: Partial<UserProfile> = {
    name: "Soham Gonbhare",
    email: userEmail || "sohamgonbhare13@gmail.com",
    college: "Indian Institute of Technology, Mumbai",
    profession: "Engineering Student",
    productivityScore: 88,
    createdAt: getRelativeDateTimeStr(-45, "09:00"),
  };

  // 2. Tasks (25 comprehensive records)
  const tasks: Omit<Task, "taskId" | "createdAt">[] = [
    {
      title: "DBMS Assignment 3: Normalization",
      description: "Perform 1NF, 2NF, 3NF, and BCNF decompositions on typical university department databases with functional dependency proofs.",
      category: "Study",
      priority: "High",
      deadline: getRelativeDateStr(0), // Today
      estimatedHours: 4,
      status: "pending",
      riskScore: 75,
      urgencyScore: 88,
      importanceScore: 82,
      difficultyScore: 70,
      priorityRanking: 2,
      suggestedAction: "Dedicate an uninterrupted 3-hour deep block tonight before midnight portal locks.",
      bestTimeToStart: "19:00",
      rescuePlan: {
        riskExplanation: "Due in less than 12 hours. Normalization proofs require active cognitive focusing and can't be easily speedrun last minute.",
        recoveryPlan: [
          "Eliminate screen interruptions for 90 minutes.",
          "Solve Schema 1 (University) and Schema 2 (Library) step-by-step.",
          "Review third-normal-form violations, write final proofs on LaTeX report."
        ],
        taskBreakdown: [
          { step: "Analyze Functional Dependencies (FDs)", estMinutes: 60 },
          { step: "Perform BCNF and 3NF key decomposition tree", estMinutes: 90 },
          { step: "Write SQL statements and check constraint triggers", estMinutes: 45 },
          { step: "Assemble final PDF upload bundle", estMinutes: 15 }
        ],
        emergencySchedule: "20:00 - 21:00: FD Analysis\n21:05 - 22:35: Decomposition Proofs\n22:40 - 23:25: SQL Checking\n23:30 - Midnight: Compilation & Portal Upload",
        completionProbability: 85
      }
    },
    {
      title: "Techfest Annual Proposal Draft",
      description: "Draft comprehensive operations budget and sponsor deck outlines for the annual technical robotics combat league grid arena.",
      category: "Projects",
      priority: "Medium",
      deadline: getRelativeDateStr(1), // Tomorrow
      estimatedHours: 3,
      status: "pending",
      riskScore: 40,
      urgencyScore: 70,
      importanceScore: 65,
      difficultyScore: 50,
      priorityRanking: 6,
      suggestedAction: "Coordinate online with team lead to partition sponsor slides and logistics sheets.",
      bestTimeToStart: "16:00"
    },
    {
      title: "Advanced Portfolio React App",
      description: "Perform performance optimization audit on client app. Implement virtualization for 10k item feed, customize cache pipelines, and optimize Lighthouse scoring.",
      category: "Projects",
      priority: "Critical",
      deadline: getRelativeDateStr(0), // Today
      estimatedHours: 8,
      status: "pending",
      riskScore: 92,
      urgencyScore: 98,
      importanceScore: 95,
      difficultyScore: 85,
      priorityRanking: 1,
      suggestedAction: "ACTIVATE CRISIS EMERGENCY RESCUE SPRINT. Core modular views are currently stalling on re-renders, causing severe frame drops.",
      bestTimeToStart: "10:00",
      rescuePlan: {
        riskExplanation: "High architectural complexity combined with critical today deadline. The app suffers from cascading context updates causing 1.2s delay in preview responsiveness.",
        recoveryPlan: [
          "Refactor root context provider using memoized local state splits.",
          "Introduce react-window or custom virtualization on the master grid container.",
          "Measure layout speed in production build using standard performance profiles."
        ],
        taskBreakdown: [
          { step: "Audit renders using React Developer Profiler", estMinutes: 45 },
          { step: "Isolate cascading context renders & implement state splitters", estMinutes: 120 },
          { step: "Integrate virtualized item layout components", estMinutes: 180 },
          { step: "Verify garbage collection behavior on search filters", estMinutes: 60 }
        ],
        emergencySchedule: "11:00 - 11:45: Identify render bottlenecks\n12:00 - 14:00: Split state context fields\n14:30 - 17:30: Code virtual list scaffolding\n18:00 - 19:00: Measure memory allocation & deploy",
        completionProbability: 72
      }
    },
    {
      title: "Internship Application Pipeline",
      description: "Apply for Summer Software Engineering Intern roles at high-scale tech firms. Detail previous Mumbai Hackathon wins and personal project achievements.",
      category: "Career",
      priority: "High",
      deadline: getRelativeDateStr(3),
      estimatedHours: 2,
      status: "pending",
      riskScore: 50,
      urgencyScore: 65,
      importanceScore: 80,
      difficultyScore: 40,
      priorityRanking: 5,
      suggestedAction: "Select 4 top positions on LinkedIn and submit fully customized cover correspondence.",
      bestTimeToStart: "14:00"
    },
    {
      title: "Interview Prep - Graph Algorithms (BFS, DFS, Dijkstra)",
      description: "Analyze topological sorting, Kruskal's MST, and shortest-path formulas. Implement 12 Medium difficulty LeetCode Graph challenges on local IDE.",
      category: "Career",
      priority: "Critical",
      deadline: getRelativeDateStr(1), // Tomorrow
      estimatedHours: 5,
      status: "pending",
      riskScore: 84,
      urgencyScore: 90,
      importanceScore: 88,
      difficultyScore: 75,
      priorityRanking: 3,
      suggestedAction: "Review cycle properties, edge relaxation properties, and implement dynamic adjacency matrices.",
      bestTimeToStart: "15:00",
      rescuePlan: {
        riskExplanation: "Graph interview puzzles are notorious for complex corner bounds (e.g., negative weights, cyclic connections). Underpreparedness will trigger blockages during tomorrow morning mock panels.",
        recoveryPlan: [
          "Draft standard code templates for multi-source BFS.",
          "Analyze topological sort patterns using indegree queues.",
          "Review Dijkstra edge cases (non-negative cycles, priority queue density)."
        ],
        taskBreakdown: [
          { step: "Practice standard Topological Sort puzzles", estMinutes: 90 },
          { step: "Solve shortest-path challenges using PriorityQueue bounds", estMinutes: 120 },
          { step: "Code cycle-detection routines in directed graph datasets", estMinutes: 60 },
          { step: "Analyze space complexity metrics", estMinutes: 30 }
        ],
        emergencySchedule: "15:00 - 16:30: Indegree Queuing\n16:45 - 18:45: Shortest-Path queue logic\n19:00 - 20:00: Cycle check validations\n20:15 - 20:45: Space audits",
        completionProbability: 78
      }
    },
    {
      title: "NPTEL Cloud Computing Certification Exam Prep",
      description: "Synthesize cloud economics schemas, AWS IAM policies, Hypervisor virtualization architectures, and SaaS SLA metrics.",
      category: "Study",
      priority: "High",
      deadline: getRelativeDateStr(2),
      estimatedHours: 6,
      status: "pending",
      riskScore: 66,
      urgencyScore: 78,
      importanceScore: 80,
      difficultyScore: 60,
      priorityRanking: 4,
      suggestedAction: "Complete past 3-year certification mock exams, review virtualization bottlenecks chapters.",
      bestTimeToStart: "11:00",
      rescuePlan: {
        riskExplanation: "NPTEL examinations are highly rigid on factual definitions and AWS cloud specific architectural nuances. Cramming the night before leads to severe mental fatigue.",
        recoveryPlan: [
          "Download official lecture slide PDFs and review week 6 to 12.",
          "Synthesize Docker virtualization boundaries vs Hypervisor VMs.",
          "Examine standard SLAs (availability percentages, service credits)."
        ],
        taskBreakdown: [
          { step: "Review virtualization constraints and Docker stacks", estMinutes: 90 },
          { step: "Solve previous MCQ questionnaires from 2024 and 2025", estMinutes: 150 },
          { step: "Map AWS ECS, EC2, Lambda and IAM security bounds", estMinutes: 90 },
          { step: "Memorize cost optimization models and storage tier ratios", estMinutes: 30 }
        ],
        emergencySchedule: "11:00 - 12:30: Virtualization Layers\n13:30 - 16:00: MCQs Analysis\n16:30 - 18:00: AWS Core Services\n18:30 - 19:00: Cost Matrix Review",
        completionProbability: 80
      }
    },
    {
      title: "DBMS Assignment 4: Query Execution & Indexing",
      description: "Write recursive SQL CTEs, query plan audits, and analyze B+ Tree height vs hash table indexing latency metrics.",
      category: "Study",
      priority: "Medium",
      deadline: getRelativeDateStr(2),
      estimatedHours: 3,
      status: "pending",
      riskScore: 25,
      urgencyScore: 60,
      importanceScore: 70,
      difficultyScore: 55,
      priorityRanking: 7,
      suggestedAction: "Test indexing operations inside a local dockerized PostgreSQL instance to audit plan performance.",
      bestTimeToStart: "20:00"
    },
    {
      title: "Interview Mock Prep: DSA Tree Algorithms",
      description: "Verify LCA formulas, binary tree diameter solvers, and serializing/deserializing algorithms for hierarchical structures.",
      category: "Career",
      priority: "Medium",
      deadline: getRelativeDateStr(-2),
      estimatedHours: 4,
      status: "completed",
      completedAt: getRelativeDateTimeStr(-2, "18:00"),
      riskScore: 15,
    },
    {
      title: "Placement Resume Revision v4.5",
      description: "Include major 2026 Mumbai Smart City Hackathon winners badges, system architecture maps, and high scale Node.js backends details.",
      category: "Career",
      priority: "High",
      deadline: getRelativeDateStr(4),
      estimatedHours: 3,
      status: "pending",
      riskScore: 35,
      urgencyScore: 55,
      importanceScore: 85,
      difficultyScore: 45,
      priorityRanking: 8,
      suggestedAction: "Analyze resume parameters using LaTeX ATS scanners to ensure parsing compliance.",
      bestTimeToStart: "10:00"
    },
    {
      title: "Operating Systems Lecture quiz: Processes",
      description: "Solve race conditions issues, mutual exclusion limits using Peterson's algorithm, and spinlock performance variables.",
      category: "Study",
      priority: "Medium",
      deadline: getRelativeDateStr(-1),
      estimatedHours: 2,
      status: "completed",
      completedAt: getRelativeDateTimeStr(-1, "16:00"),
      riskScore: 10,
    },
    {
      title: "System Design Practice - Scaling URL Shortener",
      description: "Create highly testable design for modern high-performance shortener. Formulate database capacity rules, write Redis caches pipelines, and partition ZooKeeper clusters.",
      category: "Career",
      priority: "Low",
      deadline: getRelativeDateStr(10),
      estimatedHours: 4,
      status: "pending",
      riskScore: 20,
      urgencyScore: 30,
      importanceScore: 75,
      difficultyScore: 65,
      priorityRanking: 14,
      suggestedAction: "Document write-heavy partitioning schemas and analyze Base62 hashing boundaries.",
      bestTimeToStart: "14:00"
    },
    {
      title: "Computer Networks Lab: Routing Protocols",
      description: "Simulate OSPF, RIP, and BGP routing algorithms inside Cisco Simulator. Verify split-horizon metrics and route poisoning dynamics.",
      category: "Study",
      priority: "High",
      deadline: getRelativeDateStr(5),
      estimatedHours: 4,
      status: "pending",
      riskScore: 45,
      urgencyScore: 50,
      importanceScore: 68,
      difficultyScore: 55,
      priorityRanking: 9,
      suggestedAction: "Configure loopback interfaces and verify failover behaviors across packet nodes.",
      bestTimeToStart: "15:00"
    },
    {
      title: "Hackathon MVP Rails Setup",
      description: "Set up basic Postgres instances, write database connections scripts, customize Tailwind configurations, and build basic authentication routes.",
      category: "Projects",
      priority: "Medium",
      deadline: getRelativeDateStr(-3),
      estimatedHours: 5,
      status: "completed",
      completedAt: getRelativeDateTimeStr(-3, "21:00"),
      riskScore: 5,
    },
    {
      title: "Minor Project Academic Review Slides",
      description: "Present clean UML class maps, service endpoint models, and database schema maps for the final supervisor compliance presentation.",
      category: "Projects",
      priority: "Critical",
      deadline: getRelativeDateStr(1), // Tomorrow
      estimatedHours: 6,
      status: "pending",
      riskScore: 80,
      urgencyScore: 92,
      importanceScore: 85,
      difficultyScore: 60,
      priorityRanking: 5,
      suggestedAction: "Run dry slides rehearsal, ensure demo server endpoints are responsive on deployment.",
      bestTimeToStart: "14:00",
      rescuePlan: {
        riskExplanation: "The review panel assigns 25% of total coursework marks. A clunky demo or non-functional database connection instantly degrades grading.",
        recoveryPlan: [
          "Construct standalone visual fallback architecture recordings.",
          "Draft bullet lists detailing exactly how the Express server handles API requests.",
          "Keep local system variables structured inside .env for instant local backup run."
        ],
        taskBreakdown: [
          { step: "Design presentation slide template and project title card", estMinutes: 90 },
          { step: "Create sequence diagram displaying API server authentication flow", estMinutes: 120 },
          { step: "Record fallback high-resolution screen session of active applet", estMinutes: 90 },
          { step: "Rehearse speech and outline core architectural answers", estMinutes: 60 }
        ],
        emergencySchedule: "14:00 - 15:30: Presentation Layouts\n15:45 - 17:45: Sequence Diagrams mapping\n18:00 - 19:30: Screen Recording captures\n19:45 - 20:45: Rehearsal drills",
        completionProbability: 82
      }
    },
    {
      title: "Aptitude Screening Mock Challenge",
      description: "Complete 40 quantitative aptitude challenges focusing on permutations, graph probability matrices, and compound interest formulas.",
      category: "Career",
      priority: "Medium",
      deadline: getRelativeDateStr(6),
      estimatedHours: 3,
      status: "pending",
      riskScore: 30,
      urgencyScore: 40,
      importanceScore: 65,
      difficultyScore: 50,
      priorityRanking: 10,
      suggestedAction: "Set structured 45 seconds caps for each challenge to simulate real examination pressure.",
      bestTimeToStart: "16:00"
    },
    {
      title: "Discrete Mathematics: Algebraic Structures",
      description: "Deduce cyclic group generators, Lagrange theorem proofs, and review coset equivalence relations.",
      category: "Study",
      priority: "Low",
      deadline: getRelativeDateStr(7),
      estimatedHours: 5,
      status: "pending",
      riskScore: 25,
      urgencyScore: 35,
      importanceScore: 60,
      difficultyScore: 70,
      priorityRanking: 11,
      suggestedAction: "Map out homomorphism properties of typical mathematical rings on a whiteboard.",
      bestTimeToStart: "10:00"
    },
    {
      title: "Github Repository Branding and Indexing",
      description: "Review top repositories on GitHub. Write professional descriptions, assemble clean setup manuals, and deploy live demos where possible.",
      category: "Career",
      priority: "Low",
      deadline: getRelativeDateStr(12),
      estimatedHours: 2,
      status: "pending",
      riskScore: 15,
      urgencyScore: 20,
      importanceScore: 60,
      difficultyScore: 30,
      priorityRanking: 16,
      suggestedAction: "Generate elegant high-quality visual banner images using clean vector schemas.",
      bestTimeToStart: "11:00"
    },
    {
      title: "Finances: Budget Tracking",
      description: "Organize campus research earnings, pocket allowances, and catalog server cloud cost tiers.",
      category: "Finance",
      priority: "Low",
      deadline: getRelativeDateStr(-4),
      estimatedHours: 2,
      status: "completed",
      completedAt: getRelativeDateTimeStr(-4, "15:00"),
      riskScore: 5,
    },
    {
      title: "Cardio Run and Flexibility Training",
      description: "Perform 5K steady trail cardio running session near Marine Drive. Monitor resting heart rate statistics.",
      category: "Health",
      priority: "Medium",
      deadline: getRelativeDateStr(0), // Today
      estimatedHours: 1,
      status: "completed",
      completedAt: getRelativeDateTimeStr(0, "08:00"),
      riskScore: 5,
    },
    {
      title: "Web Security: XSS and Injection Lab",
      description: "Perform penetration testing on vulnerable sandbox containers. Craft secure CSP headers, configure sanitization hooks, and check SQL injections.",
      category: "Study",
      priority: "Medium",
      deadline: getRelativeDateStr(8),
      estimatedHours: 3,
      status: "pending",
      riskScore: 20,
      urgencyScore: 30,
      importanceScore: 65,
      difficultyScore: 50,
      priorityRanking: 12,
      suggestedAction: "Verify parameter query binding inside Node PG frameworks to prevent command injection entirely.",
      bestTimeToStart: "13:00"
    },
    {
      title: "HR Behavioral Interview Mock Preparation",
      description: "Synthesize behavioral questions focusing on challenging project loops, leader behaviors, and resolving team friction using STAR metrics.",
      category: "Career",
      priority: "Medium",
      deadline: getRelativeDateStr(9),
      estimatedHours: 2,
      status: "pending",
      riskScore: 15,
      urgencyScore: 25,
      importanceScore: 60,
      difficultyScore: 35,
      priorityRanking: 13,
      suggestedAction: "Draft concise STAR outline summaries detailing previous team technical challenges.",
      bestTimeToStart: "17:00"
    },
    {
      title: "Machine Learning: Implement Gradient Descent",
      description: "Implement custom linear regression models in python from scratch using pandas and numpy. Audit cost functions over 1000 iteration epochs.",
      category: "Study",
      priority: "High",
      deadline: getRelativeDateStr(-5),
      estimatedHours: 5,
      status: "completed",
      completedAt: getRelativeDateTimeStr(-5, "17:00"),
      riskScore: 10,
    },
    {
      title: "Campus canteen cashflow audit",
      description: "Organize food expenses ledger and coordinate student fee shares on travel splits.",
      category: "Finance",
      priority: "Low",
      deadline: getRelativeDateStr(1), // Tomorrow
      estimatedHours: 1,
      status: "pending",
      riskScore: 10,
      urgencyScore: 40,
      importanceScore: 30,
      difficultyScore: 20,
      priorityRanking: 15,
      suggestedAction: "Import expense split ledgers inside a localized spreadsheet file.",
      bestTimeToStart: "22:00"
    },
    {
      title: "Marine Drive Cardio Flex Routine",
      description: "Outdoor sprint series and flexibility runs to improve respiratory efficiency metrics.",
      category: "Health",
      priority: "Low",
      deadline: getRelativeDateStr(-1),
      estimatedHours: 1,
      status: "completed",
      completedAt: getRelativeDateTimeStr(-1, "07:30"),
      riskScore: 5,
    },
    {
      title: "Data Intensive Applications: Read Chapter 3",
      description: "Analyze details of SS-Tables, log-structured merge trees (LSM), and standard B-Trees write amplification variables.",
      category: "Personal",
      priority: "Low",
      deadline: getRelativeDateStr(14),
      estimatedHours: 3,
      status: "pending",
      riskScore: 15,
      urgencyScore: 15,
      importanceScore: 50,
      difficultyScore: 60,
      priorityRanking: 17,
      suggestedAction: "Formulate comparison tables listing append-only engines against search-tree algorithms.",
      bestTimeToStart: "21:00"
    }
  ];

  // 3. Goals (10 records)
  const goals: Omit<Goal, "goalId">[] = [
    {
      goalName: "Secure FAANG/Top Tier SDE Summer Internship",
      description: "Successfully secure a high-quality summer research or soft-company internship position before Sem 7 starts.",
      targetDate: getRelativeDateStr(45),
      category: "Career",
      progress: 75,
      milestones: [
        { id: "g1-m1", name: "Construct custom Resume LaTeX compliance resume v4.5", completed: true },
        { id: "g1-m2", name: "Perform 150 LeetCode Medium challenges covering Trees and Graphs", completed: true },
        { id: "g1-m3", name: "Complete 5 mock interviews panels on Pramp website", completed: false },
        { id: "g1-m4", name: "Submit application documents to 20 top target tech companies", completed: false }
      ],
      roadmap: `# Dynamic Placement Roadmap\n\n## Core Chronology\n1. **Weeks 1-2 (Done)**: Solidify resume profiles, LaTeX styling, and outline primary project summaries.\n2. **Weeks 3-4 (Current)**: Solve 120 graph theory challenges, BFS/DFS traversal bounds, topological queuing.\n3. **Weeks 5-6 (Pending)**: Rehearse STAR interview questions and system capacity models.\n4. **Weeks 7-8 (Pending)**: Complete recruiter call loops and secure final selection contracts.`
    },
    {
      goalName: "Complete Striver SDE Coding Sheet",
      description: "Build robust understanding of foundational data architectures, solving 150 structured algorithmic problems.",
      targetDate: getRelativeDateStr(30),
      category: "Career",
      progress: 60,
      milestones: [
        { id: "g2-m1", name: "Solve Arrays & Strings segment structures", completed: true },
        { id: "g2-m2", name: "Solve LinkedLists & Recursion patterns", completed: true },
        { id: "g2-m3", name: "Master Stack, Queue, Hash indices", completed: true },
        { id: "g2-m4", name: "Implement Shortest Path Graph formulas", completed: false },
        { id: "g2-m5", name: "Pass Dynamic Programming complexity challenges", completed: false }
      ],
      roadmap: `# Striver Coding Roadmap\n- Solve 2 Graph and Tree puzzles each morning.\n- Summarize memory constraints on index layouts.\n- Implement DFS cycle-finding systems without recurrence limits.`
    },
    {
      goalName: "Build 5 Production Grade Full-Stack Projects",
      description: "Demonstrate engineering capability by releasing fully functional, responsive, and secure web solutions.",
      targetDate: getRelativeDateStr(60),
      category: "Academic",
      progress: 80,
      milestones: [
        { id: "g3-m1", name: "Deploy virtualized real-time chat dashboard applet", completed: true },
        { id: "g3-m2", name: "Develop peer-to-peer file sharing nodes system", completed: true },
        { id: "g3-m3", name: "Deploy safe encryption keys manager", completed: true },
        { id: "g3-m4", name: "Build Momentum AI Workspace productivity engine", completed: true },
        { id: "g3-m5", name: "Design centralized PostgreSQL multi-tenant backend with Auth0", completed: false }
      ],
      roadmap: `# High Scale Projects roadmap\n- Configure multi-tenant SQL database models.\n- Introduce Redis caching layers on product catalog queries.\n- Connect secure Firebase Auth handlers behind proxy middleware.`
    },
    {
      goalName: "Master React Advanced Component Internals",
      description: "Deep dive into virtual DOM rendering trees, fibers reconciliation, custom hooks structures, and memory profiles.",
      targetDate: getRelativeDateStr(15),
      category: "Career",
      progress: 90,
      milestones: [
        { id: "g4-m1", name: "Review custom hooks abstract patterns", completed: true },
        { id: "g4-m2", name: "Isolate cascading states using selector patterns", completed: true },
        { id: "g4-m3", name: "Optimize lists using windowed virtual arrays", completed: true },
        { id: "g4-m4", name: "Analyze memory leak patterns inside async hooks", completed: false }
      ],
      roadmap: `# React Masterclass\n- Analyze garbage leaks during rapid routing renders.\n- Build generic lightweight state manager inside React Context.\n- Apply useTransition hooks to defer expensive visual grids updating.`
    },
    {
      goalName: "Publish Research Paper on Deep Learning Optimization",
      description: "Write academic paper summarizing neural network weight pruning algorithms to present in national engineering forums.",
      targetDate: getRelativeDateStr(90),
      category: "Academic",
      progress: 40,
      milestones: [
        { id: "g5-m1", name: "Read 15 research papers covering model pruning parameters", completed: true },
        { id: "g5-m2", name: "Formulate sandbox training container logs", completed: true },
        { id: "g5-m3", name: "Compile mathematical proofs for pruning limits", completed: false },
        { id: "g5-m4", name: "Draft IEEE conference style LaTeX documentation", completed: false }
      ],
      roadmap: `# Academic Publishing Pipeline\n1. Isolate model weights using custom pruning thresholds.\n2. Chart training accuracy losses on CIFAR dataset nodes.\n3. Assembly LaTeX draft, submit to university review panel.`
    },
    {
      goalName: "Maintain 9.0+ Semester CGPA",
      description: "Maintain academic excellence across Database, Networks, and Operating Systems courses.",
      targetDate: getRelativeDateStr(35),
      category: "Academic",
      progress: 85,
      milestones: [
        { id: "g6-m1", name: "Complete DBMS Lab assignments 1 to 5", completed: true },
        { id: "g6-m2", name: "Submit complete computer networking simulation journals", completed: true },
        { id: "g6-m3", name: "Pass Operating Systems mock screening quizzes", completed: true },
        { id: "g6-m4", name: "Acheive full marks on active presentations", completed: false }
      ]
    },
    {
      goalName: "Train and Run Mumbai Half Marathon",
      description: "Build stamina and scale cardio mileage safely to finish the Mumbai Half Marathon (21.1K).",
      targetDate: getRelativeDateStr(120),
      category: "Health",
      progress: 50,
      milestones: [
        { id: "g7-m1", name: "Maintain 5K cardio running habits for 6 weeks", completed: true },
        { id: "g7-m2", name: "Accomplish first 10K continuous trail run series", completed: true },
        { id: "g7-m3", name: "Complete intermediate 15K run training checks", completed: false },
        { id: "g7-m4", name: "Build leg endurance via progressive squat series", completed: false }
      ]
    },
    {
      goalName: "Launch Active Technology Blog Space",
      description: "Sponsor personal technical insights, writing detailed articles covering Node systems performance and SQL indexes.",
      targetDate: getRelativeDateStr(40),
      category: "Personal",
      progress: 30,
      milestones: [
        { id: "g8-m1", name: "Create basic blog layout using Next.js or Astro engine", completed: true },
        { id: "g8-m2", name: "Draft first blog article detailing React virtualization", completed: false },
        { id: "g8-m3", name: "Draft second article covering relational normalizations", completed: false }
      ]
    },
    {
      goalName: "AWS Certified Cloud Practitioner",
      description: "Secure official AWS Cloud Practitioner credentials to validate system administrator understanding.",
      targetDate: getRelativeDateStr(-10),
      category: "Career",
      progress: 100,
      milestones: [
        { id: "g9-m1", name: "Pass all core learning lectures in AWS Training portal", completed: true },
        { id: "g9-m2", name: "Complete AWS IAM, EC2, RDS, and costing drills", completed: true },
        { id: "g9-m3", name: "Achieve 85%+ score on master mock exam simulator", completed: true },
        { id: "g9-m4", name: "Sit and pass formal certification board examination", completed: true }
      ]
    },
    {
      goalName: "Save Rs. 10,000 for High-Performance Developer Monitor",
      description: "Optimize cash splits and budget college allocations to obtain specialized, high-resolution display gear.",
      targetDate: getRelativeDateStr(25),
      category: "Financial",
      progress: 70,
      milestones: [
        { id: "g10-m1", name: "Set aside freelance development earnings from initial milestone", completed: true },
        { id: "g10-m2", name: "Limit restaurant dining expenses for 4 continuous weeks", completed: true },
        { id: "g10-m3", name: "Complete second contract coding run for college project setup", completed: false }
      ]
    }
  ];

  // 4. Habits (15 records)
  const habits: Omit<Habit, "habitId">[] = [
    {
      habitName: "LeetCode Daily Challenge",
      frequency: "daily",
      target: 1,
      history: {
        [getRelativeDateStr(0)]: true,
        [getRelativeDateStr(-1)]: true,
        [getRelativeDateStr(-2)]: true,
        [getRelativeDateStr(-3)]: true,
        [getRelativeDateStr(-4)]: true,
        [getRelativeDateStr(-5)]: true,
        [getRelativeDateStr(-6)]: true,
        [getRelativeDateStr(-7)]: true,
        [getRelativeDateStr(-8)]: true,
        [getRelativeDateStr(-9)]: true,
        [getRelativeDateStr(-10)]: true,
        [getRelativeDateStr(-11)]: true,
      },
      currentStreak: 12,
      longestStreak: 25,
      consistencyScore: 92
    },
    {
      habitName: "Code 2 Hours",
      frequency: "daily",
      target: 1,
      history: {
        [getRelativeDateStr(0)]: true,
        [getRelativeDateStr(-1)]: true,
        [getRelativeDateStr(-2)]: true,
        [getRelativeDateStr(-3)]: false,
        [getRelativeDateStr(-4)]: true,
        [getRelativeDateStr(-5)]: true,
        [getRelativeDateStr(-6)]: true,
        [getRelativeDateStr(-7)]: true,
      },
      currentStreak: 3,
      longestStreak: 15,
      consistencyScore: 85
    },
    {
      habitName: "Exercise 30 Mins",
      frequency: "daily",
      target: 1,
      history: {
        [getRelativeDateStr(0)]: true,
        [getRelativeDateStr(-1)]: true,
        [getRelativeDateStr(-2)]: true,
        [getRelativeDateStr(-3)]: true,
        [getRelativeDateStr(-4)]: true,
        [getRelativeDateStr(-5)]: false,
        [getRelativeDateStr(-6)]: true,
      },
      currentStreak: 5,
      longestStreak: 10,
      consistencyScore: 78
    },
    {
      habitName: "Read Technical Articles / Tech Blogs",
      frequency: "daily",
      target: 1,
      history: {
        [getRelativeDateStr(0)]: true,
        [getRelativeDateStr(-1)]: true,
        [getRelativeDateStr(-2)]: true,
        [getRelativeDateStr(-3)]: true,
        [getRelativeDateStr(-4)]: false,
        [getRelativeDateStr(-5)]: true,
      },
      currentStreak: 4,
      longestStreak: 8,
      consistencyScore: 80
    },
    {
      habitName: "10-Minute Mindfulness Meditation",
      frequency: "daily",
      target: 1,
      history: {
        [getRelativeDateStr(0)]: true,
        [getRelativeDateStr(-1)]: true,
        [getRelativeDateStr(-2)]: true,
        [getRelativeDateStr(-3)]: true,
        [getRelativeDateStr(-4)]: true,
        [getRelativeDateStr(-5)]: true,
        [getRelativeDateStr(-6)]: false,
      },
      currentStreak: 6,
      longestStreak: 14,
      consistencyScore: 85
    },
    {
      habitName: "Update Food & Calorie logs",
      frequency: "daily",
      target: 1,
      history: {
        [getRelativeDateStr(0)]: true,
        [getRelativeDateStr(-1)]: true,
        [getRelativeDateStr(-2)]: true,
        [getRelativeDateStr(-3)]: false,
        [getRelativeDateStr(-4)]: true,
      },
      currentStreak: 3,
      longestStreak: 7,
      consistencyScore: 70
    },
    {
      habitName: "Solve 1 System Design Problem",
      frequency: "daily",
      target: 1,
      history: {
        [getRelativeDateStr(0)]: true,
        [getRelativeDateStr(-1)]: true,
        [getRelativeDateStr(-2)]: false,
        [getRelativeDateStr(-3)]: true,
      },
      currentStreak: 2,
      longestStreak: 5,
      consistencyScore: 60
    },
    {
      habitName: "Hydrate: Drink 3L Water",
      frequency: "daily",
      target: 1,
      history: {
        [getRelativeDateStr(0)]: true,
        [getRelativeDateStr(-1)]: true,
        [getRelativeDateStr(-2)]: true,
        [getRelativeDateStr(-3)]: true,
        [getRelativeDateStr(-4)]: true,
        [getRelativeDateStr(-5)]: true,
        [getRelativeDateStr(-6)]: true,
        [getRelativeDateStr(-7)]: true,
        [getRelativeDateStr(-8)]: true,
        [getRelativeDateStr(-9)]: true,
        [getRelativeDateStr(-10)]: true,
        [getRelativeDateStr(-11)]: true,
        [getRelativeDateStr(-12)]: true,
        [getRelativeDateStr(-13)]: true,
        [getRelativeDateStr(-14)]: true,
      },
      currentStreak: 15,
      longestStreak: 35,
      consistencyScore: 95
    },
    {
      habitName: "LinkedIn Tech Engagement / Posting",
      frequency: "weekly",
      target: 3,
      history: {
        [getRelativeDateStr(0)]: false,
        [getRelativeDateStr(-3)]: true,
        [getRelativeDateStr(-6)]: false,
      },
      currentStreak: 0,
      longestStreak: 3,
      consistencyScore: 40
    },
    {
      habitName: "Write Daily Reflective Journal",
      frequency: "daily",
      target: 1,
      history: {
        [getRelativeDateStr(0)]: true,
        [getRelativeDateStr(-1)]: true,
        [getRelativeDateStr(-2)]: true,
        [getRelativeDateStr(-3)]: false,
        [getRelativeDateStr(-4)]: true,
      },
      currentStreak: 3,
      longestStreak: 9,
      consistencyScore: 65
    },
    {
      habitName: "Review Database & SQL Flashcards",
      frequency: "daily",
      target: 1,
      history: {
        [getRelativeDateStr(0)]: true,
        [getRelativeDateStr(-1)]: true,
        [getRelativeDateStr(-2)]: true,
        [getRelativeDateStr(-3)]: true,
        [getRelativeDateStr(-4)]: true,
        [getRelativeDateStr(-5)]: false,
      },
      currentStreak: 5,
      longestStreak: 12,
      consistencyScore: 75
    },
    {
      habitName: "Avoid Deep Fried junk Food",
      frequency: "daily",
      target: 1,
      history: {
        [getRelativeDateStr(0)]: true,
        [getRelativeDateStr(-1)]: true,
        [getRelativeDateStr(-2)]: true,
        [getRelativeDateStr(-3)]: true,
        [getRelativeDateStr(-4)]: true,
        [getRelativeDateStr(-5)]: true,
        [getRelativeDateStr(-6)]: true,
        [getRelativeDateStr(-7)]: false,
      },
      currentStreak: 7,
      longestStreak: 18,
      consistencyScore: 88
    },
    {
      habitName: "Spend 30 Mins on Project MVP",
      frequency: "daily",
      target: 1,
      history: {
        [getRelativeDateStr(0)]: true,
        [getRelativeDateStr(-1)]: true,
        [getRelativeDateStr(-2)]: true,
        [getRelativeDateStr(-3)]: true,
        [getRelativeDateStr(-4)]: false,
        [getRelativeDateStr(-5)]: true,
      },
      currentStreak: 4,
      longestStreak: 11,
      consistencyScore: 82
    },
    {
      habitName: "Perform 90-Min Deep Work Block",
      frequency: "daily",
      target: 1,
      history: {
        [getRelativeDateStr(0)]: true,
        [getRelativeDateStr(-1)]: true,
        [getRelativeDateStr(-2)]: true,
        [getRelativeDateStr(-3)]: true,
        [getRelativeDateStr(-4)]: true,
        [getRelativeDateStr(-5)]: true,
        [getRelativeDateStr(-6)]: false,
      },
      currentStreak: 6,
      longestStreak: 15,
      consistencyScore: 80
    },
    {
      habitName: "Ensure 7h Healthy Sleep Cycle",
      frequency: "daily",
      target: 1,
      history: {
        [getRelativeDateStr(0)]: true,
        [getRelativeDateStr(-1)]: true,
        [getRelativeDateStr(-2)]: true,
        [getRelativeDateStr(-3)]: true,
        [getRelativeDateStr(-4)]: true,
        [getRelativeDateStr(-5)]: false,
      },
      currentStreak: 5,
      longestStreak: 10,
      consistencyScore: 75
    }
  ];

  // 5. AI Coach Chat History (30 conversational messages, very realistic)
  const chats: Omit<ChatMessage, "id">[] = [
    {
      role: "user",
      text: "Hi AI Coach, my placements and final year academic labs are starting, and I'm feeling overwhelmed. I am an engineering student in Mumbai under lots of stress. Can you introduce yourself and help me build focus tracks?",
      timestamp: getRelativeDateTimeStr(-7, "09:00"),
    },
    {
      role: "model",
      text: "Welcome, Soham, to your Momentum AI Workspace! I am your custom-trained AI Productivity Coach, specifically configured to help you negotiate heavy software engineering course loads, mock coding panels, and placement drives.\n\nLooking at your parameters: your IIT Mumbai courses, placement preparation goals, and projects setup represents a high cognitive overhead structure. First, do not worry; our core system uses strict prioritization formulas and an emergency 'Crisis Rescue' mode to prevent deadlines slipping. Let's start with a foundational checklist: what is your most critical priority today?",
      timestamp: getRelativeDateTimeStr(-7, "09:02"),
    },
    {
      role: "user",
      text: "Today my principal blockage is Graph interiew practice. Shortest path BFS and topological sorting are confusing because of indexing conditions.",
      timestamp: getRelativeDateTimeStr(-6, "10:15"),
    },
    {
      role: "model",
      text: "Graph algorithms can indeed feel dense. Let's split BFS short-path into logical steps:\n\n1. BFS is layer-by-layer traversal (uses a Queue). It guarantees the shortest path in unweighted graphs.\n2. Topological Sorting applies strictly to Directed Acyclic Graphs (DAGs). We use indegree queues (Kahn’s Algorithm) or DFS post-order backtracking with helper stack logs.\n\nLet's configure a focused 90-minute Deep Work routine. Disable your phone messaging lists, open your local IDE, and code just Kahn's algorithm loops. Do you want me to draft a quick code blueprint for you?",
      timestamp: getRelativeDateTimeStr(-6, "10:17"),
    },
    {
      role: "user",
      text: "Yes, that would be helpful. Please write the basic Kahn's Algorithm indegree traversal code template in TypeScript.",
      timestamp: getRelativeDateTimeStr(-6, "10:18"),
    },
    {
      role: "model",
      text: "Here is the standard, clean TypeScript code skeleton for Kahn's Algorithm. Note how the indegree table maintains incoming edge counts:\n\n```typescript\nfunction topologicalSortKahn(vertices: number, adjList: Map<number, number[]>): number[] {\n  const indegree = new Array(vertices).fill(0);\n  \n  // 1. Calculate incoming degrees\n  adjList.forEach((neighbors) => {\n    neighbors.forEach((val) => indegree[val]++);\n  });\n\n  // 2. Put zero-indegree points into queue\n  const queue: number[] = [];\n  for (let i = 0; i < vertices; i++) {\n    if (indegree[i] === 0) queue.push(i);\n  }\n\n  const order: number[] = [];\n  while (queue.length > 0) {\n    const node = queue.shift()!;\n    order.push(node);\n\n    // Decrement neighbor degrees\n    const neighbors = adjList.get(node) || [];\n    neighbors.forEach((neighbor) => {\n      indegree[neighbor]--;\n      if (indegree[neighbor] === 0) queue.push(neighbor);\n    });\n  }\n\n  if (order.length !== vertices) {\n    throw new Error(\"Graph contains cycles! Topological sorting impossible.\");\n  }\n  return order;\n}\n```\nTry coding this from memory now. Mark Kahn checks off your active checklist!",
      timestamp: getRelativeDateTimeStr(-6, "10:20"),
    },
    {
      role: "user",
      text: "Awesome, I coded it and checked it against 3 test graph arrays, and it runs green! I feel more confident about graphs index limits now.",
      timestamp: getRelativeDateTimeStr(-6, "14:10"),
    },
    {
      role: "model",
      text: "Incredible speed, Soham! This is how you establish high-velocity cognitive momentum. You took a complex problem, isolated it under a structured focus session, and implemented the solution.\n\nI have updated your momentum analytics progress profile. Your current streak is scaling up. Let’s keep this traction for database indexing proofs tonight.",
      timestamp: getRelativeDateTimeStr(-6, "14:12"),
    },
    {
      role: "user",
      text: "Regarding DBMS assignment: B+ Trees vs Hash Indexing is making my brain spin. Why are B+ Trees preferred in production databases over standard Hashes?",
      timestamp: getRelativeDateTimeStr(-5, "11:00"),
    },
    {
      role: "model",
      text: "This is a quintessential system design and database fundamentals query! Here are the core reasons B+ trees win flat hashes in production storage engines:\n\n1. **Range Queries Support**: Hash indexes require O(1) matching, but fail on range checks (e.g. `WHERE age > 21`), as data is unsorted. B+ trees store keys sequentially in leaf nodes linked next-to-next, enabling extremely fast O(log N) starts followed by simple sequential leaf traversal.\n2. **Disk I/O Block Optimization**: Memory block scans require limited disk reads. B+ trees have high branching factor (fan-out), typically > 100, which keeps depth thin (height 3-4 for millions of records). Hashes face storage bucket collisions and overhead spikes when datasets expand beyond RAM dimensions.\n\nKeep these two pillars in mind for your DBMS assignment proofs!",
      timestamp: getRelativeDateTimeStr(-5, "11:03"),
    },
    {
      role: "user",
      text: "Very clear index hierarchy! What about LSM Trees? I saw them mentioned in Designing Data-Intensive Applications.",
      timestamp: getRelativeDateTimeStr(-5, "20:30"),
    },
    {
      role: "model",
      text: "Log-Structured Merge (LSM) Trees are optimized for **write-heavy workloads**.\n\nUnlike B-Trees, which perform in-place random updates (prone to disk page splits), LSM Trees append modifications sequentially to a MemTable (in-memory red-black tree). When full, the MemTable is flushed to disk as contiguous sequential Sorted String Tables (SSTables).\n\nBackground consolidation routines ('Compaction') merge duplicated key entries under a tiered structure. This bypasses random write costs, which is why engines like RocksDB or Cassandra utilize LSM Trees!",
      timestamp: getRelativeDateTimeStr(-5, "20:33"),
    },
    {
      role: "user",
      text: "Today I have 3 assignment submissions and a mock presentation tomorrow. I'm starting to panic. My cognitive focus is completely frozen. What should I do?",
      timestamp: getRelativeDateTimeStr(-4, "09:12"),
    },
    {
      role: "model",
      text: "Breathe, Soham. This status is called 'Cognitive Freeze', triggered by perceived task volume spikes. Let's perform a fast System Reset:\n\n1. **Box Breathing**: Inhale for 4 seconds, hold for 4, exhale for 4, hold for 4. Repeat 3 times to stabilize heart rates.\n2. **Lock Out Non-Essentials**: Ignore placement group chats and social feeds. Your ONLY target for the next 2 hours is drafting the UML schemas for your minor project slides.\n3. **Run Crisis Rescue**: I have marked your project presentation risk score at 80% (Critical). Let's launch your Crisis Sprints now.",
      timestamp: getRelativeDateTimeStr(-4, "09:15"),
    },
    {
      role: "user",
      text: "Thanks, the breathing exercise really calmed my nerves. I've activated the Crisis Rescue mode for Minor Project Review slides. Let's break it down.",
      timestamp: getRelativeDateTimeStr(-4, "09:20"),
    },
    {
      role: "model",
      text: "Outstanding recovery, Soham! Your Crisis Sprint has formulated this sequence:\n\n- **Sprint 1 (90 Mins)**: Design slide sequence models. UML schema map showing Express API controller boundaries.\n- **Sprint 2 (60 Mins)**: Capture short layout interaction recording. This protects you in case of demo network failures.\n- **Sprint 3 (30 Mins)**: Slide review dry rehearse.\n\nLet's start Sprint 1. Ready? Go!",
      timestamp: getRelativeDateTimeStr(-4, "09:23"),
    },
    {
      role: "user",
      text: "UML schema diagrams and sequence charts are compiled. The fallback demo recording is encoded perfectly too. Ready for rehearsals.",
      timestamp: getRelativeDateTimeStr(-4, "15:00"),
    },
    {
      role: "model",
      text: "Exceptional discipline! You are executing at a premier senior engineer level under intense friction. Having a high-quality video backup completely mitigates presenting anxieties.\n\nFor the rehearsal, keep your value descriptions humble, and outline exactly how your models normalize data tables. Go crush this review panels tomorrow!",
      timestamp: getRelativeDateTimeStr(-4, "15:02"),
    },
    {
      role: "user",
      text: "Update: The presentation slides review panel was extremely happy with my database normalization explanation and the fallback video backup! They scored me 10 out of 10! Thanks for the emergency coaching support!",
      timestamp: getRelativeDateTimeStr(-3, "17:30"),
    },
    {
      role: "model",
      text: "YES! 10/10! Congratulations, Soham! This is an incredible victory for your academic performance. Moving with structured foresight is exactly how we prevent burnout whilst maintaining top-tier outcomes.\n\nYour momentum trajectory score has scaled to 85. Take a deserved 1-hour coffee break, and let's lock down placement resumes next.",
      timestamp: getRelativeDateTimeStr(-3, "17:33"),
    },
    {
      role: "user",
      text: "How should I structure my previous Mumbai Hackathon win on my placement CV so that recruitment screeners notice it immediately?",
      timestamp: getRelativeDateTimeStr(-2, "11:00"),
    },
    {
      role: "model",
      text: "To capture technical recruiters' attention instantly, use the **X-Y-Z formula** developed by Google: 'Accomplished [X] as measured by [Y], by doing [Z]'.\n\n- **Bad style**: 'Coded a real-time tracking interface on React.'\n- **Elite style (XYZ)**: 'Secured 1st rank out of 150 teams at 2026 Mumbai Smart City Hackathon by engineering a virtualized React dashboard that handled 10,000 traffic sensor items with rendering latencies optimized by 40% using custom React Context wrappers.'\n\nThis format outlines your metric impact, tech stack depth, and leadership outcomes. Let's write this layout in your LaTeX CV draft!",
      timestamp: getRelativeDateTimeStr(-2, "11:03"),
    },
    {
      role: "user",
      text: "The resume is revised with the XYZ formatting. Applying for 3 SDE roles now.",
      timestamp: getRelativeDateTimeStr(-2, "16:15"),
    },
    {
      role: "model",
      text: "Excellent! The applications are tracked under your master career pipelines. Remember to monitor interview calls, and keep solving 2 trees problems every morning to maintain high algorithmic readiness.",
      timestamp: getRelativeDateTimeStr(-2, "16:17"),
    },
    {
      role: "user",
      text: "I finished reviewing standard array and linked-list questions, and I am solving BST traversal traps today.",
      timestamp: getRelativeDateTimeStr(-1, "08:30"),
    },
    {
      role: "model",
      text: "Spectacular daily habit consistency! BST patterns commonly involve pointer manipulation traps during balance rotations or node deletes. Ensure you dry-run edge cases where a parent node has only one child.",
      timestamp: getRelativeDateTimeStr(-1, "08:32"),
    },
    {
      role: "user",
      text: "What about Computer Networks? RIP vs OSPF routing metrics are a bit fuzzy. Can you explain key boundaries?",
      timestamp: getRelativeDateTimeStr(-1, "14:12"),
    },
    {
      role: "model",
      text: "Here is the layout dividing Routing Information Protocol (RIP) and Open Shortest Path First (OSPF):\n\n- **RIP**: A **Distance-Vector** model. It measures shortest path simply by 'Hop Count' (max 15 hops limit, anything larger is unreachable). It broadcasts routing details every 30 seconds, causing high network traffic and slow failover recovery.\n- **OSPF**: A **Link-State** formula. It builds a complete topology map of graph points, uses Dijkstra's shortest-path formula, and evaluates paths using link speed (Cost) rather than simple hop counts. It converges almost instantly, making it optimal for larger, enterprise layout configurations.\n\nYou can configure RIP and OSPF loopback structures inside Cisco Packet Tracer to observe this directly!",
      timestamp: getRelativeDateTimeStr(-1, "14:15"),
    },
    {
      role: "user",
      text: "Today I have NPTEL Cloud certification papers in 2 days and I haven't reviewed AWS ECS/ECS IAM security matrices. I need an AI Study Sprint designed.",
      timestamp: getRelativeDateTimeStr(0, "08:50"),
    },
    {
      role: "model",
      text: "Got you covered, Soham! I have formulated your Cloud Certification preparation pipeline. We will break down AWS IAM security rules and ECS virtualization over 3 distinct deep work sprints today. Let's start with hypervisor boundaries. Let's lock in focus, and ace this cloud curriculum!",
      timestamp: getRelativeDateTimeStr(0, "08:52"),
    },
  ];

  // 6. Calendar & Planner blocks for next 30 days
  const schedules: PlannerSchedule[] = [];
  const energyLevels: ('low' | 'medium' | 'high')[] = ['high', 'medium', 'high', 'low', 'high', 'medium'];
  
  for (let i = 0; i < 30; i++) {
    const dStr = getRelativeDateStr(i);
    const dayIndex = (today.getDay() + i) % 7;
    const isWeekend = dayIndex === 0 || dayIndex === 6;

    schedules.push({
      dateStr: dStr,
      availableHours: isWeekend ? 8 : 4,
      energyLevel: energyLevels[i % energyLevels.length],
      scheduleBlocks: [
        { time: "08:30", taskTitle: "Aesthetic LeetCode Daily algorithmic challenge - BFS", duration: 45, type: "study" },
        { time: "10:00", taskTitle: isWeekend ? "Full-stack React MVP project compilation" : "IIT Bombay Lecture - Operating Systems", duration: 120, type: "study" },
        { time: "14:00", taskTitle: isWeekend ? "System capacity design: TinyURL scaling" : "Placement pipeline application audits", duration: 90, type: "work" },
        { time: "16:30", taskTitle: "Mindful rest / physical marine cardio drills", duration: 45, type: "break" },
        { time: "19:00", taskTitle: "DBMS normalizations & SQL plan checks assignment", duration: 120, type: "study" },
      ],
      breakSuggestions: [
        "Perform deep sensory grounding box breathing.",
        "Take a discrete 15-minute screen-free walks series to release retinal fatigue.",
        "Hydrate with electrolyte tea or water fluids."
      ],
      aiSummary: `Optimally configured workspace profile for ${dStr}. Balancing critical academic courses load with placements candidate ready exercises.`
    });
  }

  return {
    profile,
    tasks,
    goals,
    habits,
    chats,
    schedules
  };
}
