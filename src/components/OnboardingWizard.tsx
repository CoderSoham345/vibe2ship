import React, { useState } from "react";
import { 
  Sparkles, 
  Target, 
  Clock, 
  ShieldAlert, 
  CheckCircle, 
  User, 
  ArrowRight, 
  ArrowLeft,
  Loader2,
  Check
} from "lucide-react";

interface OnboardingWizardProps {
  onComplete: (answers: {
    profession: string;
    availableHours: number;
    challenge: string;
    seedingSelection: boolean;
  }) => Promise<void>;
  userName?: string;
}

export default function OnboardingWizard({ onComplete, userName }: OnboardingWizardProps) {
  const [step, setStep] = useState(1);
  const [profession, setProfession] = useState("Developer");
  const [availableHours, setAvailableHours] = useState(6);
  const [challenge, setChallenge] = useState("Procrastination");
  const [seedData, setSeedData] = useState(true);
  const [loading, setLoading] = useState(false);

  const professions = [
    { name: "Student", desc: "Acing exams, projects & planning term reviews", color: "from-blue-600 to-cyan-500" },
    { name: "Developer", desc: "Shipping clean code, tracking sprint tasks & systems review", color: "from-purple-600 to-indigo-500" },
    { name: "Entrepreneur", desc: "Building ventures, tracking metrics & planning milestones", color: "from-amber-600 to-orange-500" },
    { name: "Job Seeker", desc: "Crafting prep plans, Leetcode practice & company tracking", color: "from-emerald-600 to-teal-500" }
  ];

  const challenges = [
    { label: "Procrastination", desc: "Difficulty getting started on focus sessions" },
    { label: "Overwhelmed with Sprints", desc: "Too much to handle in a single backlog list" },
    { label: "Inefficient Scheduling", desc: "Hard to plan hour-by-hour calendar blocks daily" },
    { label: "Missing Tight Deadlines", desc: "Deadlines slip past without panic rescue models" }
  ];

  const handleNext = () => {
    if (step < 5) {
      setStep(step + 1);
    } else {
      handleFinalize();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleFinalize = async () => {
    setLoading(true);
    try {
      await onComplete({
        profession,
        availableHours,
        challenge,
        seedingSelection: seedData
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/85 backdrop-blur-md p-4">
      <div className="w-full max-w-xl bg-gradient-to-b from-[#0b0c1b] to-[#04040a] border border-indigo-550/25 rounded-3xl shadow-2xl overflow-hidden shadow-indigo-500/10 flex flex-col relative max-h-[90vh]">
        
        {/* Subtle Background Glows */}
        <div className="absolute top-0 right-1/4 w-40 h-40 bg-purple-600/10 rounded-full filter blur-[80px] pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-40 h-40 bg-indigo-600/10 rounded-full filter blur-[80px] pointer-events-none" />

        {/* Step Indicator Top Bar */}
        <div className="p-6 border-b border-indigo-950/40 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4.5 h-4.5 text-indigo-400 animate-pulse" />
            <span className="text-[10px] uppercase font-mono font-black text-indigo-400 tracking-widest">
              Setup Calibration {step}/5
            </span>
          </div>
          <div className="flex space-x-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <div 
                key={s} 
                className={`h-1 rounded-full transition-all duration-300 ${
                  s <= step ? "w-6 bg-indigo-500" : "w-2 bg-neutral-800"
                }`} 
              />
            ))}
          </div>
        </div>

        {/* Wizard Main Content Container */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
          
          {/* STEP 1: WELCOME */}
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-3 duration-250">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600/25 border border-indigo-500/40 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-indigo-400 animate-spin-slow" />
              </div>
              <h2 className="text-xl md:text-2xl font-black text-white leading-tight font-display tracking-tight">
                Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-300">Momentum AI Workspace</span>
              </h2>
              <p className="text-xs text-neutral-400 leading-relaxed font-sans">
                Greetings {userName || "Strategist"}! Momentum is a premium, AI-augmented hub built to align your roadmap with concrete, prioritized day scheduling. 
                Experience a productivity ecosystem designed to safeguard tight deadlines in 5 vital loops:
              </p>
              
              <div className="grid grid-cols-1 gap-2 pt-2">
                {[
                  { title: "Target Strategic Goals", desc: "Construct 4-phase AI Roadmaps on beautiful boards.", icon: Target, textSeed: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
                  { title: "Align Daily Tasks", desc: "Prioritize by AI Urgency, Risk & effort weights.", icon: Clock, textSeed: "text-purple-400 bg-purple-500/10 border-purple-500/20" },
                  { title: "Generate Interactive Schedules", desc: "Hour-by-hour dynamic planner blocks fitted for energy levels.", icon: CheckCircle, textSeed: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
                  { title: "Trigger Boundary Rescue", desc: "Red alerts activate on overdue targets, supplying auto completion advice.", icon: ShieldAlert, textSeed: "text-red-400 bg-red-500/10 border-red-500/20" }
                ].map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <div key={i} className="flex items-start space-x-3 p-3 rounded-xl bg-white/[0.01] border border-white/5">
                      <div className={`p-1.5 rounded-lg flex-shrink-0 border ${item.textSeed}`}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-neutral-200">{item.title}</h4>
                        <p className="text-[10px] text-neutral-400 mt-0.5">{item.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2: PROFESSIONAL TARGET PROFILE */}
          {step === 2 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-3 duration-250">
              <div>
                <h3 className="text-lg font-black text-white font-display">What is your primary objective profile?</h3>
                <p className="text-xs text-neutral-400 mt-1">
                  We customize suggestions, roadmap phases, and seeding templates based on your profile context.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {professions.map((prof) => (
                  <button
                    key={prof.name}
                    onClick={() => setProfession(prof.name)}
                    className={`p-4 rounded-2xl text-left border transition-all flex flex-col justify-between h-30 cursor-pointer ${
                      profession === prof.name
                        ? "bg-indigo-600/10 border-indigo-500/80 ring-1 ring-indigo-500"
                        : "bg-neutral-900/40 border-neutral-800 hover:bg-neutral-900 hover:border-neutral-700"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-xs font-bold text-white uppercase tracking-wider">{prof.name}</span>
                      {profession === prof.name && (
                        <div className="w-4 h-4 bg-indigo-500 rounded-full flex items-center justify-center p-0.5">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>
                    <p className="text-[10px] text-neutral-400 leading-normal mt-2">
                      {prof.desc}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: AVAILABLE DAILY WORKLOAD */}
          {step === 3 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-3 duration-250">
              <div>
                <h3 className="text-lg font-black text-white font-display">How many focus workload hours do you have daily?</h3>
                <p className="text-xs text-neutral-400 mt-1">
                  Calibrates the AI block generator to prevent scheduling impossible backlogs.
                </p>
              </div>

              <div className="space-y-6 pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-neutral-400 font-medium">Daily Available Hours</span>
                  <span className="text-xl font-black font-mono text-indigo-400">{availableHours} Hrs</span>
                </div>
                
                <input 
                  type="range" 
                  min="2" 
                  max="14" 
                  value={availableHours}
                  onChange={(e) => setAvailableHours(parseInt(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer bg-neutral-850 h-1.5 rounded-full"
                />

                <div className="grid grid-cols-3 gap-2 text-center">
                  {[
                    { val: 4, label: "Part-time Focus" },
                    { val: 8, label: "Full Professional" },
                    { val: 12, label: "Hyper-drive Sprint" }
                  ].map((preset) => (
                    <button
                      key={preset.val}
                      onClick={() => setAvailableHours(preset.val)}
                      type="button"
                      className={`p-2.5 rounded-xl text-[10px] font-bold border transition-colors cursor-pointer ${
                        availableHours === preset.val 
                          ? "bg-indigo-600/20 border-indigo-500 text-indigo-300"
                          : "bg-neutral-900 border-neutral-800 text-neutral-400 hover:bg-neutral-800"
                      }`}
                    >
                      {preset.val}h ({preset.label})
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: GREATEST BOTTLENECK CHOKEPOINT */}
          {step === 4 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-3 duration-250">
              <div>
                <h3 className="text-lg font-black text-white font-display">What is your biggest productivity bottleneck?</h3>
                <p className="text-xs text-neutral-400 mt-1">
                  Calibrates the AI Smart Coach to optimize advice triggers specifically for you.
                </p>
              </div>

              <div className="space-y-2 pt-2">
                {challenges.map((chal) => (
                  <button
                    key={chal.label}
                    onClick={() => setChallenge(chal.label)}
                    className={`w-full p-4 rounded-xl text-left border transition-all flex items-center justify-between cursor-pointer ${
                      challenge === chal.label
                        ? "bg-indigo-600/10 border-indigo-500/80 ring-1 ring-indigo-500"
                        : "bg-neutral-900/40 border-neutral-800 hover:bg-neutral-900 hover:border-neutral-700"
                    }`}
                  >
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wide leading-none">{chal.label}</h4>
                      <p className="text-[10px] text-neutral-400 mt-1 font-medium">{chal.desc}</p>
                    </div>
                    {challenge === chal.label && (
                      <div className="w-4 h-4 bg-indigo-500 rounded-full flex items-center justify-center p-0.5">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 5: AI PROFILE INITIATION */}
          {step === 5 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-3 duration-250 text-center py-4">
              <div className="w-16 h-16 mx-auto rounded-3xl bg-indigo-600/10 border border-indigo-500/40 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-indigo-400 animate-spin-slow" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-black text-white font-display">Generate Your Custom Productivity Profile</h3>
                <p className="text-xs text-neutral-400 leading-relaxed max-w-sm mx-auto">
                  Momentum AI will configure your workspace parameters instantly. We can seed a curated set of starter tasks and goals customized for a <strong className="text-white font-sans">{profession}</strong> to help you learn the system in under 30 seconds.
                </p>
              </div>

              <div className="p-4 bg-[#0a0f26]/40 border border-indigo-950/60 rounded-2xl max-w-sm mx-auto text-left space-y-3">
                <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wide flex items-center gap-1.5 leading-none">
                  <User className="w-3.5 h-3.5 text-indigo-400" /> Summary Profile Configuration:
                </h4>
                <ul className="text-[10px] text-neutral-400 space-y-1 font-medium">
                  <li>🧑‍💻 Target Profession: <strong className="text-white">{profession}</strong></li>
                  <li>⏱ Available daily: <strong className="text-white">{availableHours} hours</strong></li>
                  <li>💥 Primary obstruction: <strong className="text-white">{challenge}</strong></li>
                </ul>

                <label className="flex items-center space-x-2.5 pt-2 border-t border-indigo-950/40 cursor-pointer select-none">
                  <input 
                    type="checkbox" 
                    checked={seedData} 
                    onChange={() => setSeedData(!seedData)}
                    className="rounded border-neutral-700 bg-neutral-900 text-indigo-500 focus:ring-0 w-4 h-4"
                  />
                  <span className="text-[10px] text-neutral-300 font-semibold leading-snug">
                    Instantly load starter tasks & goal roadmaps
                  </span>
                </label>
              </div>
            </div>
          )}

        </div>

        {/* Footer Navigation Buttons */}
        <div className="p-4 bg-neutral-950/40 border-t border-indigo-950/30 flex items-center justify-between">
          <button
            onClick={handleBack}
            disabled={step === 1 || loading}
            type="button"
            className="px-4 py-2 bg-transparent text-[11px] font-bold text-neutral-400 hover:text-white disabled:opacity-30 transition-all uppercase tracking-wider flex items-center space-x-1 hover:bg-neutral-900 rounded-xl disabled:cursor-not-allowed"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>

          <button
            onClick={handleNext}
            disabled={loading}
            type="button"
            className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black text-[11px] rounded-xl shadow-lg shadow-indigo-500/10 active:scale-97 transition-all flex items-center space-x-1 uppercase tracking-wider cursor-pointer font-sans"
          >
            {loading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Calibrating AI...</span>
              </>
            ) : (
              <>
                <span>{step === 5 ? "Launch Workspace" : "Continue"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
