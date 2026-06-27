import React, { useState } from "react";
import { Mail, Lock, Sparkles, AlertCircle, ArrowRight } from "lucide-react";
import { loginWithEmail, loginWithGoogle, loginAnonymously, resetPassword } from "../auth";

interface LoginComponentProps {
  onAuthSuccess: (uid: string, mockUser?: any) => void;
  onSwitchToSignup: () => void;
}

export default function LoginComponent({ onAuthSuccess, onSwitchToSignup }: LoginComponentProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg("Please fill out all required fields.");
      return;
    }
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");
    try {
      const uid = await loginWithEmail(email, password);
      setSuccessMsg("Logged in successfully!");
      setTimeout(() => {
        onAuthSuccess(uid);
      }, 1000);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to sign in.");
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
      setSuccessMsg("Signed in with Google!");
      setTimeout(() => {
        onAuthSuccess(uid);
      }, 1000);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to authenticate with Google.");
    } finally {
      setLoading(false);
    }
  };

  const handleGuestSignIn = async () => {
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");
    try {
      const uid = await loginAnonymously();
      setSuccessMsg("Signed in as Guest!");
      setTimeout(() => {
        onAuthSuccess(uid);
      }, 1000);
    } catch (err: any) {
      // Offline/disabled fallback
      console.warn("Firebase anonymous authentication is disabled. Activating local offline workspace simulation.", err);
      setSuccessMsg("Launching local sandbox session...");
      setTimeout(() => {
        onAuthSuccess("guest-local-session", {
          uid: "guest-local-session",
          displayName: "Guest Strategist",
          email: "guest@momentum.ai"
        });
      }, 1200);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setErrorMsg("Please enter your registered email address first.");
      return;
    }
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");
    try {
      await resetPassword(email);
      setSuccessMsg("Password reset email sent! Please check your inbox.");
      setShowForgot(false);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to send reset email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="login-container" className="w-full bg-neutral-900/60 border border-neutral-800/80 rounded-2xl p-6 sm:p-8 backdrop-blur-md">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold tracking-tight text-white">
          {showForgot ? "Recover Account" : "Access Workspace"}
        </h2>
        <p className="text-xs text-neutral-400 mt-1.5 leading-relaxed">
          {showForgot 
            ? "Enter your email to receive a secure password recovery link" 
            : "Sign in with your email or connect via a supported single sign-on provider"}
        </p>
      </div>

      {errorMsg && (
        <div id="login-error-alert" className="mb-5 p-3.5 bg-red-950/40 border border-red-900/30 rounded-xl flex items-start space-x-2.5 text-xs text-red-200">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-semibold block mb-0.5">Authentication Issue</span>
            {errorMsg}
          </div>
        </div>
      )}

      {successMsg && (
        <div id="login-success-alert" className="mb-5 p-3.5 bg-emerald-950/40 border border-emerald-900/30 rounded-xl flex items-center space-x-2.5 text-xs text-emerald-200">
          <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {showForgot ? (
        <form onSubmit={handleForgotPassword} className="space-y-4">
          <div>
            <label className="block text-neutral-400 text-xs font-semibold mb-2 uppercase tracking-wider">Registered Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-4 h-4 text-neutral-500" />
              <input 
                type="email" 
                required
                placeholder="you@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl py-2.5 pl-10 pr-4 text-xs font-medium text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-neutral-800 rounded-xl text-white font-bold text-xs tracking-wider transition-all uppercase cursor-pointer"
          >
            {loading ? "Sending..." : "Send Reset Email"}
          </button>

          <button 
            type="button"
            onClick={() => { setShowForgot(false); setErrorMsg(""); setSuccessMsg(""); }}
            className="w-full text-center text-xs text-neutral-400 hover:text-white font-semibold transition-colors mt-2"
          >
            Back to Sign In
          </button>
        </form>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-neutral-400 text-xs font-semibold mb-2 uppercase tracking-wider">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-4 h-4 text-neutral-500" />
              <input 
                type="email" 
                required
                placeholder="you@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl py-2.5 pl-10 pr-4 text-xs font-medium text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-neutral-400 text-xs font-semibold mb-2 uppercase tracking-wider">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-4 h-4 text-neutral-500" />
              <input 
                type="password" 
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl py-2.5 pl-10 pr-4 text-xs font-medium text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] font-semibold text-neutral-400 pt-1">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input 
                type="checkbox" 
                defaultChecked
                className="rounded border-neutral-800 text-indigo-600 focus:ring-0 bg-neutral-950 focus:outline-none"
              />
              <span>Remember me</span>
            </label>
            <button 
              type="button"
              onClick={() => { setShowForgot(true); setErrorMsg(""); setSuccessMsg(""); }}
              className="text-indigo-400 hover:text-indigo-300 hover:underline"
            >
              Forgot password?
            </button>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-neutral-800 rounded-xl text-white font-bold text-xs tracking-wider transition-all uppercase cursor-pointer"
          >
            {loading ? "Authenticating..." : "Sign In"}
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

          <button 
            type="button"
            onClick={handleGuestSignIn}
            disabled={loading}
            className="w-full py-2.5 bg-indigo-950/80 hover:bg-indigo-900/80 border border-indigo-800/40 rounded-xl text-indigo-200 font-bold text-xs flex items-center justify-center space-x-2 tracking-wide transition-all cursor-pointer hover:scale-[1.01]"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
            <span>Instant Guest / Demo Access</span>
          </button>

          <div className="pt-4 text-center text-xs font-semibold text-neutral-400">
            Don't have an active roadmap?{" "}
            <button 
              type="button"
              onClick={onSwitchToSignup}
              className="text-indigo-400 hover:text-indigo-300 hover:underline"
            >
              Register Now
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
