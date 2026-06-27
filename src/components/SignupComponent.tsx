import React, { useState } from "react";
import { User, Mail, Lock, School, Briefcase, AlertCircle, Sparkles } from "lucide-react";
import { registerWithEmail, loginWithGoogle } from "../auth";

interface SignupComponentProps {
  onAuthSuccess: (uid: string, mockUser?: any) => void;
  onSwitchToLogin: () => void;
}

export default function SignupComponent({ onAuthSuccess, onSwitchToLogin }: SignupComponentProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [college, setCollege] = useState("");
  const [profession, setProfession] = useState("Student");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setErrorMsg("Please fill out all required fields marked with an asterisk (*).");
      return;
    }
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");
    try {
      const uid = await registerWithEmail(email, password, name, college, profession);
      setSuccessMsg("Registration successful! Building your productivity dashboard...");
      setTimeout(() => {
        onAuthSuccess(uid);
      }, 1000);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to create account.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");
    try {
      const uid = await loginWithGoogle();
      setSuccessMsg("Signed in with Google successfully!");
      setTimeout(() => {
        onAuthSuccess(uid);
      }, 1000);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to authenticate with Google.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="signup-container" className="w-full bg-neutral-900/60 border border-neutral-800/80 rounded-2xl p-6 sm:p-8 backdrop-blur-md">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold tracking-tight text-white">Create Strategy Account</h2>
        <p className="text-xs text-neutral-400 mt-1.5 leading-relaxed">
          Unlock your custom AI daily planner, habits engine, and emergency deadline rescue system
        </p>
      </div>

      {errorMsg && (
        <div id="signup-error-alert" className="mb-5 p-3.5 bg-red-950/40 border border-red-900/30 rounded-xl flex items-start space-x-2.5 text-xs text-red-200">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-semibold block mb-0.5">Registration Issue</span>
            {errorMsg}
          </div>
        </div>
      )}

      {successMsg && (
        <div id="signup-success-alert" className="mb-5 p-3.5 bg-emerald-950/40 border border-emerald-900/30 rounded-xl flex items-center space-x-2.5 text-xs text-emerald-200">
          <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-neutral-400 text-xs font-semibold mb-1.5 uppercase tracking-wider">Display Name *</label>
          <div className="relative">
            <User className="absolute left-3 top-2.5 w-4 h-4 text-neutral-500" />
            <input 
              type="text" 
              required
              placeholder="Jane Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl py-2 pl-10 pr-4 text-xs font-medium text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-neutral-400 text-xs font-semibold mb-1.5 uppercase tracking-wider">Email Address *</label>
          <div className="relative">
            <Mail className="absolute left-3 top-2.5 w-4 h-4 text-neutral-500" />
            <input 
              type="email" 
              required
              placeholder="you@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl py-2 pl-10 pr-4 text-xs font-medium text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-neutral-400 text-xs font-semibold mb-1.5 uppercase tracking-wider">Password *</label>
          <div className="relative">
            <Lock className="absolute left-3 top-2.5 w-4 h-4 text-neutral-500" />
            <input 
              type="password" 
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl py-2 pl-10 pr-4 text-xs font-medium text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-neutral-400 text-[10px] font-semibold mb-1 uppercase tracking-wider">College/Company</label>
            <div className="relative">
              <School className="absolute left-3 top-2.5 w-3.5 h-3.5 text-neutral-500" />
              <input 
                type="text" 
                placeholder="Stanford"
                value={college}
                onChange={(e) => setCollege(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl py-2 pl-8 pr-3 text-xs font-medium text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-neutral-400 text-[10px] font-semibold mb-1 uppercase tracking-wider">Profession</label>
            <div className="relative">
              <Briefcase className="absolute left-3 top-2.5 w-3.5 h-3.5 text-neutral-500" />
              <select 
                value={profession}
                onChange={(e) => setProfession(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl py-2 pl-8 pr-3 text-[11px] font-medium text-white appearance-none focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="Student">Student</option>
                <option value="Researcher">Researcher</option>
                <option value="Entrepreneur">Entrepreneur</option>
                <option value="Engineer">Engineer</option>
                <option value="Manager">Manager</option>
                <option value="Freelancer">Freelancer</option>
              </select>
            </div>
          </div>
        </div>

        <button 
          type="submit"
          disabled={loading}
          className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-neutral-800 rounded-xl text-white font-bold text-xs tracking-wider transition-all uppercase cursor-pointer mt-2"
        >
          {loading ? "Creating strategy profile..." : "Generate Account"}
        </button>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-neutral-800" /></div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-neutral-900 border border-neutral-800/80 px-3 py-0.5 rounded-full text-[10px] text-neutral-400 font-bold tracking-widest">Or</span>
          </div>
        </div>

        <button 
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full py-2.5 bg-white border border-neutral-300 hover:bg-neutral-100 rounded-xl text-neutral-950 font-bold text-xs flex items-center justify-center space-x-2.5 tracking-wide transition-all cursor-pointer hover:scale-[1.01]"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#EA4335" d="M12.24 10.285V14.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.859-3.578-7.859-8s3.53-8 7.859-8c2.46 0 4.105 1.025 5.047 1.926l3.253-3.133C18.33 1.258 15.542 0 12.24 0c-6.63 0-12 5.37-12 12s5.37 12 12 12c6.918 0 11.52-4.863 11.52-11.727 0-.788-.085-1.39-.188-1.988H12.24z"/>
          </svg>
          <span>Authorize Google Sync</span>
        </button>

        <div className="pt-4 text-center text-xs font-semibold text-neutral-400">
          Already have a plan?{" "}
          <button 
            type="button"
            onClick={onSwitchToLogin}
            className="text-indigo-400 hover:text-indigo-300 hover:underline"
          >
            Sign In
          </button>
        </div>
      </form>
    </div>
  );
}
