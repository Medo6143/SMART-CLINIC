"use client";

import { useState } from "react";
import Link from "next/link";
import type { UserRole } from "@/domain/value-objects/UserRole";

// ── Presentational Only — no business logic ──────────

interface RegisterFormProps {
  onSubmit: (email: string, password: string, displayName: string, role: UserRole) => void;
  onGoogleSignIn: () => void;
  isLoading: boolean;
  error: string | null;
}

export function RegisterForm({ onSubmit, onGoogleSignIn, isLoading, error }: RegisterFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [role, setRole] = useState<UserRole>("patient");
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    if (password !== confirmPassword) {
      setLocalError("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      setLocalError("Password must be at least 6 characters");
      return;
    }
    onSubmit(email, password, displayName, role);
  };

  const displayError = localError || error;

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-surface">
      {/* Left Column: Branding / Editorial Image */}
      <div className="hidden md:flex flex-1 relative bg-secondary overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-secondary via-secondary to-on-secondary-fixed-variant opacity-90 mix-blend-multiply" />
        {/* Abstract blur shapes */}
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-white/10 blur-[100px] rounded-full" />
        <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-primary/20 blur-[120px] rounded-full" />
        
        <div className="relative z-10 flex flex-col justify-center p-20 text-white w-full h-full">
          <div className="mb-12">
            <span className="material-symbols-outlined text-6xl text-white/90">vital_signs</span>
          </div>
          <h1 className="text-6xl font-black font-headline tracking-tight mb-6 leading-tight">
            Join the<br/>
            Future of<br/>
            Healthcare.
          </h1>
          <p className="text-xl font-medium text-white/80 max-w-md leading-relaxed font-body">
            Create your Smart Clinic account to bridge the gap between patients and providers.
          </p>
        </div>
      </div>

      {/* Right Column: Form */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-16 relative overflow-y-auto">
        {/* subtle background blob for mobile */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/5 blur-[80px] rounded-full md:hidden" />
        
        <div className="w-full max-w-md relative z-10 bg-surface-container-lowest p-8 lg:p-12 rounded-[2rem] editorial-shadow border border-outline-variant/10 animate-fade-in-up my-auto">
          
          <div className="mb-8 text-center md:text-left">
            <h2 className="text-3xl font-black text-on-surface font-headline tracking-tight mb-2">Create Account</h2>
            <p className="font-medium text-on-surface-variant font-body">Join Smart Clinic today</p>
          </div>

          {/* Error */}
          {displayError && (
            <div className="mb-6 p-4 rounded-2xl bg-error-container/50 border border-error/20 text-on-error-container text-sm font-bold flex items-center gap-3">
              <span className="material-symbols-outlined text-error">error</span>
              {displayError}
            </div>
          )}

          {/* Google Sign In */}
          <button
            type="button"
            onClick={onGoogleSignIn}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 border-2 border-outline-variant/20 rounded-2xl hover:bg-surface-container-low transition-colors duration-300 mb-8 font-bold text-on-surface text-sm group"
          >
            <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          <div className="flex items-center gap-4 mb-8">
            <div className="flex-1 h-px bg-outline-variant/20" />
            <span className="text-[10px] text-on-surface/40 uppercase tracking-widest font-black">or email</span>
            <div className="flex-1 h-px bg-outline-variant/20" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="flex gap-2 p-1.5 bg-surface-container-high rounded-[1.25rem] mb-6 border border-outline-variant/10">
              <button
                type="button"
                onClick={() => setRole("patient")}
                className={`flex-1 py-3 px-4 text-xs font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 ${
                  role === "patient" ? "bg-white shadow-sm text-primary border border-primary/10" : "text-on-surface/50 hover:text-on-surface hover:bg-white/50"
                }`}
              >
                <span className="material-symbols-outlined text-base">person</span>
                Patient
              </button>
              <button
                type="button"
                onClick={() => setRole("doctor")}
                className={`flex-1 py-3 px-4 text-xs font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 ${
                  role === "doctor" ? "bg-white shadow-sm text-primary border border-primary/10" : "text-on-surface/50 hover:text-on-surface hover:bg-white/50"
                }`}
              >
                <span className="material-symbols-outlined text-base">stethoscope</span>
                Doctor
              </button>
            </div>

            <div>
              <label htmlFor="register-name" className="block text-xs font-black uppercase tracking-widest text-on-surface/60 mb-2">
                Full Name
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface/30">badge</span>
                <input
                  id="register-name"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-surface-container-lowest border-2 border-outline-variant/20 rounded-2xl text-sm font-bold text-on-surface focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                  placeholder="John Doe"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="register-email" className="block text-xs font-black uppercase tracking-widest text-on-surface/60 mb-2">
                Email Address
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface/30">mail</span>
                <input
                  id="register-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-surface-container-lowest border-2 border-outline-variant/20 rounded-2xl text-sm font-bold text-on-surface focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <label htmlFor="register-password" className="block text-xs font-black uppercase tracking-widest text-on-surface/60 mb-2">
                Password
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface/30">lock</span>
                <input
                  id="register-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-surface-container-lowest border-2 border-outline-variant/20 rounded-2xl text-sm font-bold text-on-surface focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                  placeholder="Min. 6 characters"
                  required
                  autoComplete="new-password"
                />
              </div>
            </div>

            <div>
              <label htmlFor="register-confirm" className="block text-xs font-black uppercase tracking-widest text-on-surface/60 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface/30">password</span>
                <input
                  id="register-confirm"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-surface-container-lowest border-2 border-outline-variant/20 rounded-2xl text-sm font-bold text-on-surface focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                  placeholder="••••••••"
                  required
                  autoComplete="new-password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-4 bg-primary text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-primary-container hover:-translate-y-1 transition-all shadow-xl shadow-primary/20 hover:shadow-primary/40 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none mt-4"
            >
              {isLoading ? (
                <>
                  <span className="material-symbols-outlined animate-spin" style={{ fontVariationSettings: "'wght' 600" }}>progress_activity</span>
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'wght' 600" }}>arrow_forward</span>
                </>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-sm font-medium text-on-surface-variant">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-primary font-black hover:underline uppercase tracking-tight ml-1">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
