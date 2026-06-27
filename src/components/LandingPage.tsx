import React, { useState } from "react";
import { 
  Sparkles, 
  ArrowRight, 
  Zap, 
  Brain, 
  Activity, 
  Target, 
  Flame, 
  CheckCircle,
  HelpCircle,
  TrendingUp,
  Award,
  Users,
  Shield,
  Clock,
  Lock,
  Mail,
  User,
  School,
  Briefcase
} from "lucide-react";
import LoginComponent from "./LoginComponent";
import SignupComponent from "./SignupComponent";
import { motion, AnimatePresence } from "motion/react";

interface LandingPageProps {
  onAuthSuccess: (uid: string, mockUser?: any) => void;
}

export default function LandingPage({ onAuthSuccess }: LandingPageProps) {
  const [authMode, setAuthMode] = useState<"none" | "login" | "signup">("none");

  return (
    <div id="landing-root" className="min-h-screen bg-neutral-950 text-white font-sans overflow-x-hidden selection:bg-purple-600 selection:text-white">
      
      {/* Background gradients */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-purple-900/20 via-blue-900/10 to-transparent pointer-events-none" />
      <div className="absolute top-[800px] right-0 w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[400px] left-0 w-[450px] h-[450px] bg-purple-600/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Navigation Header */}
      <nav id="nav-landing" className="sticky top-0 z-40 backdrop-blur-md bg-neutral-950/70 border-b border-neutral-900/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-gradient-to-tr from-purple-600 to-indigo-500 rounded-xl shadow-lg shadow-purple-500/20">
              <Sparkles className="w-5 h-5 text-white animate-pulse" />
            </div>
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-neutral-100 to-indigo-300 bg-clip-text text-transparent">
              MOMENTUM <span className="text-indigo-400 font-extrabold text-xs tracking-widest uppercase ml-1 px-1.5 py-0.5 bg-indigo-950/80 border border-indigo-800 rounded">AI</span>
            </span>
          </div>

          <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-neutral-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#ai-demo" className="hover:text-white transition-colors">AI Engine</a>
            <a href="#statistics" className="hover:text-white transition-colors">Analytics</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
          </div>

          <div className="flex items-center space-x-3">
            <button 
              id="btn-nav-login"
              onClick={() => setAuthMode("login")}
              className="px-4 py-2 text-sm font-medium text-neutral-300 hover:text-white hover:bg-white/5 rounded-lg transition-all"
            >
              Sign In
            </button>
            <button 
              id="btn-nav-signup"
              onClick={() => setAuthMode("signup")}
              className="px-4 py-2 text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 rounded-lg text-white transition-all shadow-md shadow-indigo-600/20 hover:scale-105 active:scale-95 cursor-pointer"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="hero-landing" className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-28 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto"
        >
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-purple-950/50 border border-purple-800/40 rounded-full mb-6">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-semibold text-purple-300 tracking-wide">Next-Generation AI Crisis Prevention 2.5</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight pb-3">
            <span className="bg-gradient-to-r from-white via-neutral-100 to-neutral-400 bg-clip-text text-transparent">Do Not Just List Habits.</span>
            <br />
            <span className="bg-gradient-to-r from-purple-400 via-indigo-400 to-blue-400 bg-clip-text text-transparent">AI Actively Rescues Them.</span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-neutral-400 max-w-2xl mx-auto leading-relaxed">
            Momentum AI is the first intelligent productivity companion. It predicts deadline failures, maps custom roadmaps, crafts schedules, and coaches you back into deep focus.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              id="btn-hero-cta"
              onClick={() => setAuthMode("signup")}
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 rounded-xl text-white font-semibold transition-all shadow-lg shadow-purple-600/30 flex items-center justify-center space-x-2 cursor-pointer group"
            >
              <span>Build My Dynamic Schedule</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <a
              href="#features"
              className="w-full sm:w-auto px-8 py-4 bg-white/5 hover:bg-white/10 active:bg-white/20 border border-neutral-800 rounded-xl text-neutral-300 hover:text-white font-medium transition-all text-center flex items-center justify-center space-x-2"
            >
              <span>Explore Rescue Mode</span>
            </a>
          </div>

          <div className="mt-10 flex items-center justify-center space-x-8 text-xs text-neutral-500">
            <div className="flex items-center space-x-1">
              <CheckCircle className="w-4 h-4 text-indigo-400" />
              <span>No CC Required</span>
            </div>
            <div className="flex items-center space-x-1">
              <CheckCircle className="w-4 h-4 text-indigo-400" />
              <span>Full Firebase Auth</span>
            </div>
            <div className="flex items-center space-x-1">
              <CheckCircle className="w-4 h-4 text-indigo-400" />
              <span>Gemini 2.5 Active</span>
            </div>
          </div>
        </motion.div>

        {/* Dashboard Mockup Display */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.2 }}
          className="mt-16 max-w-5xl mx-auto rounded-2xl border border-neutral-800 bg-neutral-900/30 p-2 sm:p-4 backdrop-blur-md shadow-2xl relative"
        >
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-neutral-900 rounded-full border border-neutral-800 text-[11px] font-mono tracking-widest text-indigo-400 uppercase flex items-center space-x-2">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
            <span>Active Momentum Hub Workspace</span>
          </div>

          {/* Simulated App Screenshot / UI Grid */}
          <div className="rounded-xl overflow-hidden bg-neutral-950 border border-neutral-900/80 p-4 sm:p-6 text-left relative">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-900">
              <div className="flex items-center space-x-4">
                <div className="flex space-x-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                </div>
                <div className="text-xs text-neutral-500 font-mono">dashboard_preview_v2.5.ts</div>
              </div>
              <div className="px-3 py-1 bg-purple-950 text-purple-400 border border-purple-800/30 text-[10px] font-mono rounded-full">
                Score: 84 / 100
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6">
              {/* Box 1: Rescue Alert */}
              <div className="col-span-1 p-4 rounded-xl bg-gradient-to-b from-red-950/40 to-neutral-950 border border-red-900/30">
                <div className="flex items-center justify-between text-red-400 pb-2 border-b border-red-900/20">
                  <span className="text-xs font-bold tracking-tight uppercase">Crisis Rescue Alert</span>
                  <Zap className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-semibold mt-3 text-white">Full-Stack Project Submission</h4>
                <div className="text-xs text-red-200/80 mt-1">AI Predicts: 64% Risk of Missed Deadline</div>
                <div className="mt-3 p-2 bg-neutral-950/60 rounded text-[11px] border border-red-950 text-neutral-400 italic">
                  "Auto-routing into Rescue Plan. Click to activate emergency time-blocking segments."
                </div>
              </div>

              {/* Box 2: Goal Roadmaps */}
              <div className="col-span-1 p-4 rounded-xl bg-slate-900/40 border border-slate-800">
                <div className="flex items-center justify-between text-indigo-400 pb-2 border-b border-slate-800/80">
                  <span className="text-xs font-bold tracking-tight uppercase">AI Career Coach</span>
                  <Brain className="w-4 h-4" />
                </div>
                <div className="text-xs text-neutral-300 mt-3 font-medium">How should I study for upcoming compiler exam?</div>
                <div className="mt-2 text-xs text-neutral-400 leading-relaxed bg-neutral-950 p-2.5 rounded border border-neutral-900/80">
                  "Prioritize phase-structured Mock questions. Break down parsers and AST representation. Study 4 hours split."
                </div>
              </div>

              {/* Box 3: Daily schedule */}
              <div className="col-span-1 p-4 rounded-xl bg-neutral-900/80 border border-neutral-800">
                <div className="flex items-center justify-between text-neutral-400 pb-2 border-b border-neutral-800/60">
                  <span className="text-xs font-bold tracking-tight uppercase">Today's Focus Map</span>
                  <Clock className="w-4 h-4" />
                </div>
                <div className="space-y-2 mt-3">
                  <div className="flex items-center text-xs space-x-2">
                    <span className="px-1.5 py-0.5 bg-purple-950 text-purple-400 text-[10px] rounded">09:00</span>
                    <span className="text-neutral-300 font-medium line-through decoration-neutral-600 text-neutral-500">Database setup</span>
                  </div>
                  <div className="flex items-center text-xs space-x-2">
                    <span className="px-1.5 py-0.5 bg-indigo-950 text-indigo-400 text-[10px] rounded">10:30</span>
                    <span className="text-neutral-300 font-medium">AI Agent Integration</span>
                  </div>
                  <div className="flex items-center text-xs space-x-2">
                    <span className="px-1.5 py-0.5 bg-neutral-800 text-neutral-400 text-[10px] rounded">12:30</span>
                    <span className="text-neutral-400">Rest & Hydration</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 bg-neutral-950 border-t border-neutral-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight bg-gradient-to-r from-white to-neutral-400 bg-clip-text text-transparent">
              Engineered To Maximize Human Momentum
            </h2>
            <p className="mt-4 text-neutral-400">
              Stop relying on static standard to-do triggers. Our intelligent algorithms actively help you achieve complete goals.
            </p>
          </div>

          <div id="features-grid" className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feat 1: AI Priorities */}
            <div className="p-8 rounded-2xl bg-neutral-900/30 border border-neutral-900 hover:border-purple-900/40 transition-all group hover:scale-[1.02]">
              <div className="w-12 h-12 bg-purple-950/80 border border-purple-800/40 rounded-xl flex items-center justify-center mb-6 text-purple-400">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white group-hover:text-purple-400 transition-colors">AI Priority Engine</h3>
              <p className="mt-3 text-neutral-400 text-sm leading-relaxed">
                Calculates task urgency, importance, difficulty, and risk automatically using Gemini. No manual prioritization required.
              </p>
            </div>

            {/* Feat 2: Crisis Rescue Mode */}
            <div className="p-8 rounded-2xl bg-neutral-900/30 border border-neutral-900 hover:border-red-900/40 transition-all group hover:scale-[1.02]">
              <div className="w-12 h-12 bg-red-950/80 border border-red-800/40 rounded-xl flex items-center justify-center mb-6 text-red-400">
                <Flame className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white group-hover:text-red-400 transition-colors">Crisis Rescue Mode</h3>
              <p className="mt-3 text-neutral-400 text-sm leading-relaxed">
                Flags schedule slips automatically. When an assignment crosses warning thresholds, Gemini initiates an emergency hourly recovery timeline.
              </p>
            </div>

            {/* Feat 3: Interactive Coach */}
            <div className="p-8 rounded-2xl bg-neutral-900/30 border border-neutral-900 hover:border-blue-900/40 transition-all group hover:scale-[1.02]">
              <div className="w-12 h-12 bg-blue-950/80 border border-blue-800/40 rounded-xl flex items-center justify-center mb-6 text-blue-400">
                <Brain className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">AI Productivity Coach</h3>
              <p className="mt-3 text-neutral-400 text-sm leading-relaxed">
                Your dedicated ChatGPT-style workspace partner. Ready to assist with study layout sheets, exam preparation schedules, and motivational support.
              </p>
            </div>

            {/* Feat 4: Intelligent Daily Planner */}
            <div className="p-8 rounded-2xl bg-neutral-900/30 border border-neutral-900 hover:border-emerald-900/40 transition-all group hover:scale-[1.02]">
              <div className="w-12 h-12 bg-emerald-950/80 border border-emerald-800/40 rounded-xl flex items-center justify-center mb-6 text-emerald-400">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white group-hover:text-emerald-400 transition-colors">AI Daily Planner</h3>
              <p className="mt-3 text-neutral-400 text-sm leading-relaxed">
                Accepts available project hours and your energy index parameter, then returns dynamic timeboxes and active breathing rest points.
              </p>
            </div>

            {/* Feat 5: Goal Milestones */}
            <div className="p-8 rounded-2xl bg-neutral-900/30 border border-neutral-900 hover:border-yellow-900/40 transition-all group hover:scale-[1.02]">
              <div className="w-12 h-12 bg-yellow-950/80 border border-yellow-800/40 rounded-xl flex items-center justify-center mb-6 text-yellow-400">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white group-hover:text-yellow-400 transition-colors">Goal Roadmaps</h3>
              <p className="mt-3 text-neutral-400 text-sm leading-relaxed">
                Formulate goals and immediately trigger Gemini to design a robust phase-by-phase pathway to master competencies and track completion.
              </p>
            </div>

            {/* Feat 6: Habit Streaks */}
            <div className="p-8 rounded-2xl bg-neutral-900/30 border border-neutral-900 hover:border-pink-900/40 transition-all group hover:scale-[1.02]">
              <div className="w-12 h-12 bg-pink-950/80 border border-pink-800/40 rounded-xl flex items-center justify-center mb-6 text-pink-400">
                <Activity className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white group-hover:text-pink-400 transition-colors">Habit Streaks Tracker</h3>
              <p className="mt-3 text-neutral-400 text-sm leading-relaxed">
                Log recurring wellness or academic goals. Maintain streaks, review compliance score percentages, and build long-term momentum.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Statistics Section */}
      <section id="statistics" className="py-20 bg-neutral-950/40 border-t border-neutral-900 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center text-neutral-100">
            <div>
              <div className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
                94%
              </div>
              <div className="text-xs text-neutral-400 mt-2 font-semibold tracking-wider uppercase">Deadline Rescue Success</div>
            </div>
            <div>
              <div className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
                3.8M+
              </div>
              <div className="text-xs text-neutral-400 mt-2 font-semibold tracking-wider uppercase">Focus Hours Logged</div>
            </div>
            <div>
              <div className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
                250k+
              </div>
              <div className="text-xs text-neutral-400 mt-2 font-semibold tracking-wider uppercase">AI Roadmaps Rendered</div>
            </div>
            <div>
              <div className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
                12,000+
              </div>
              <div className="text-xs text-neutral-400 mt-2 font-semibold tracking-wider uppercase">Active Premium Users</div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-24 bg-neutral-950 border-t border-neutral-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-white">Loved by High-Performers Worldwide</h2>
            <p className="mt-3 text-neutral-400 text-sm">
              Read how professionals and founders leverage our priority algorithms to avoid stress.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-14">
            <div className="p-6 rounded-xl bg-neutral-900/20 border border-neutral-900/60 leading-relaxed text-sm">
              <p className="text-neutral-300 italic">
                "The Deadline Rescue mode saved my compiler architecture thesis. It automatically scheduled my last week when it noticed I was lagging on the test matrix."
              </p>
              <div className="mt-4 flex items-center space-x-3">
                <div className="w-10 h-10 bg-indigo-900/80 rounded-full flex items-center justify-center text-xs font-bold text-indigo-300">
                  RK
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Rohan Kulkarni</h4>
                  <p className="text-[10px] text-neutral-500">CS Grad Student at VTU</p>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-xl bg-neutral-900/20 border border-neutral-900/60 leading-relaxed text-sm">
              <p className="text-neutral-300 italic">
                "As a solo entrepreneur, prioritizing is the hardest constraint. Let Gemini calculate urgency and difficulty. Setting priorities takes literally zero mental energy now."
              </p>
              <div className="mt-4 flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-900/80 rounded-full flex items-center justify-center text-xs font-bold text-purple-300">
                  SM
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Sarah McInroy</h4>
                  <p className="text-[10px] text-neutral-500">Co-founder, AppStellar</p>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-xl bg-neutral-900/20 border border-neutral-900/60 leading-relaxed text-sm">
              <p className="text-neutral-300 italic">
                "We set up goals, track milestones, and trigger weekly sprints. Simple, aesthetic, and incredibly performant design. Highly recommend Momentum AI."
              </p>
              <div className="mt-4 flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-900/80 rounded-full flex items-center justify-center text-xs font-bold text-blue-300">
                  AH
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Alex Huang</h4>
                  <p className="text-[10px] text-neutral-500">VP of Growth at Finch</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-neutral-950 border-t border-neutral-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-white">Transparent, Simple Pricing</h2>
            <p className="mt-3 text-neutral-400 text-sm">
              Choose the package that aligns with your execution framework. No sneaky contracts.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 max-w-3xl mx-auto gap-8 mt-14">
            {/* Standard Tier */}
            <div className="p-8 rounded-2xl bg-neutral-900/20 border border-neutral-900 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-neutral-300">Starter Core</h3>
                <p className="text-xs text-neutral-500 mt-1">Perfect for single task listing & standard logging</p>
                <div className="mt-6 flex items-baseline">
                  <span className="text-4xl font-extrabold text-white">$0</span>
                  <span className="text-sm text-neutral-500 ml-1">/ forever free</span>
                </div>
                <ul className="mt-6 space-y-3.5 text-xs text-neutral-400">
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-neutral-500" />
                    <span>Create Unlimited standard tasks</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-neutral-500" />
                    <span>Basic Habit Tracking lists</span>
                  </li>
                  <li className="flex items-center space-x-2 text-neutral-600 line-through">
                    <XIcon className="w-4 h-4 text-neutral-700" />
                    <span>Gemini priority calculations</span>
                  </li>
                  <li className="flex items-center space-x-2 text-neutral-600 line-through">
                    <XIcon className="w-4 h-4 text-neutral-700" />
                    <span>AI Crisis rescue schedules</span>
                  </li>
                </ul>
              </div>
              <button 
                onClick={() => setAuthMode("signup")}
                className="mt-8 w-full py-3 bg-white/5 hover:bg-white/10 active:bg-white/15 rounded-xl text-neutral-200 text-xs font-semibold tracking-wide transition-all uppercase"
              >
                Enroll Free
              </button>
            </div>

            {/* Pro Tier */}
            <div className="p-8 rounded-2xl bg-neutral-900/40 border-2 border-indigo-500/80 relative flex flex-col justify-between shadow-xl shadow-indigo-600/10">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 bg-indigo-500 text-white rounded-full text-[10px] font-bold tracking-widest uppercase">
                Best Choice
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Momentum Pro</h3>
                <p className="text-xs text-indigo-300 mt-1">Includes unlimited Gemini Priority & Crisis Rescue AI</p>
                <div className="mt-6 flex items-baseline">
                  <span className="text-4xl font-extrabold text-white">$9</span>
                  <span className="text-sm text-neutral-500 ml-1">/ month billed annually</span>
                </div>
                <ul className="mt-6 space-y-3.5 text-xs text-neutral-300">
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-indigo-400" />
                    <span>AI priority engine calculations (Gemini)</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-indigo-400" />
                    <span>Dynamic Crisis Rescue Recovery Sprints</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-indigo-400" />
                    <span>Interactive AI Coach & Exam Prep planners</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-indigo-400" />
                    <span>Goal Roadmapping & Weekly Burnout prediction</span>
                  </li>
                </ul>
              </div>
              <button 
                onClick={() => setAuthMode("signup")}
                className="mt-8 w-full py-3 bg-indigo-600 hover:bg-indigo-500 active:scale-95 rounded-xl text-white text-xs font-bold tracking-wide transition-all uppercase shadow-md shadow-indigo-600/30"
              >
                Go Pro Now
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 bg-neutral-950 border-t border-neutral-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-white">Frequently Asked Questions</h2>
            <p className="mt-3 text-neutral-400 text-sm">
              Answers to common queries about our AI task prioritization workflow.
            </p>
          </div>

          <div className="space-y-6">
            <div className="p-5 rounded-xl bg-neutral-900/20 border border-neutral-900/80">
              <h4 className="text-sm font-bold text-white flex items-center space-x-2">
                <HelpCircle className="w-4 h-4 text-purple-400 flex-shrink-0" />
                <span>How is Risk Score computed?</span>
              </h4>
              <p className="mt-2 text-neutral-400 text-xs leading-relaxed pl-6">
                Through our integration with Gemini, we benchmark current calendar dates, active tasks complexity, estimated required hours, and user available times to calculate a 0-100 hazard quotient.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-neutral-900/20 border border-neutral-900/80">
              <h4 className="text-sm font-bold text-white flex items-center space-x-2">
                <HelpCircle className="w-4 h-4 text-purple-400 flex-shrink-0" />
                <span>Can I sign up using Google?</span>
              </h4>
              <p className="mt-2 text-neutral-400 text-xs leading-relaxed pl-6">
                Absolutely. We support full OAuth-driven Firebase Google sign-in securely alongside classic email credentials.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-neutral-900/20 border border-neutral-900/80">
              <h4 className="text-sm font-bold text-white flex items-center space-x-2">
                <HelpCircle className="w-4 h-4 text-purple-400 flex-shrink-0" />
                <span>What is Crisis Rescue Mode?</span>
              </h4>
              <p className="mt-2 text-neutral-400 text-xs leading-relaxed pl-6">
                If the calculated risk parameter exceeds 60%, the dashboard automatically creates a Rescue flag, delivering bulleted mitigation tactics, breakdown checklists, and optimized hourly timers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="footer-landing" className="py-12 bg-neutral-950 border-t border-neutral-900 text-neutral-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-purple-500" />
            <span className="text-sm font-bold text-white tracking-wide">MOMENTUM AI</span>
          </div>
          <p className="text-xs font-mono">
            © 2026 Momentum AI Inc. All rights reserved. Powered by Google Cloud Run, Firebase Firestore, & Gemini API.
          </p>
          <div className="flex space-x-6 text-xs font-medium text-neutral-400">
            <a href="#features" className="hover:text-white transition-colors">Term of Service</a>
            <a href="#pricing" className="hover:text-white transition-colors">Privacy Policy</a>
          </div>
        </div>
      </footer>

      {/* GLASSMORPHIC AUTH OVERLAY MODAL */}
      <AnimatePresence>
        {authMode !== "none" && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setAuthMode("none")}
              className="absolute inset-0 bg-neutral-950/70 backdrop-blur-sm"
            />

            {/* Modal Body */}
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="w-full max-w-md relative z-10 text-left"
            >
              {/* Close Button */}
              <button 
                onClick={() => setAuthMode("none")}
                className="absolute top-4 right-4 z-50 text-neutral-400 hover:text-white hover:bg-neutral-800/60 p-1.5 rounded-lg transition-colors cursor-pointer"
              >
                <XIcon className="w-5 h-5" />
              </button>

              {authMode === "login" && (
                <LoginComponent 
                  onAuthSuccess={onAuthSuccess} 
                  onSwitchToSignup={() => setAuthMode("signup")} 
                />
              )}

              {authMode === "signup" && (
                <SignupComponent 
                  onAuthSuccess={onAuthSuccess} 
                  onSwitchToLogin={() => setAuthMode("login")} 
                />
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Compact helper icon
function XIcon(props: React.JSX.IntrinsicAttributes & React.SVGProps<SVGSVGElement>) {
  return (
    <svg 
      {...props}
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  );
}
