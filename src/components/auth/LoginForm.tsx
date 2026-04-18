"use client";

import { useState } from "react";
import Link from "next/link";

// ── Presentational Only — no business logic ──────────

interface LoginFormProps {
  onSubmitEmail: (email: string, password: string) => void;
  onGoogleSignIn: () => void;
  isLoading: boolean;
  error: string | null;
}

export function LoginForm({ onSubmitEmail, onGoogleSignIn, isLoading, error }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitEmail(email, password);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-surface">
      {/* Left Column: Branding / Editorial Image */}
      <div className="hidden md:flex flex-1 relative bg-primary overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-primary-container opacity-90 mix-blend-multiply" />
        {/* Abstract blur shapes */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-white/10 blur-[100px] rounded-full" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-secondary/20 blur-[120px] rounded-full" />
        
        <div className="relative z-10 flex flex-col justify-center p-20 text-white w-full">
          <div className="mb-12">
            <span className="material-symbols-outlined text-6xl text-white/90">ecg_heart</span>
          </div>
          <h1 className="text-6xl font-black font-headline tracking-tight mb-6 leading-tight">
            Elevating<br/>
            Clinical<br/>
            Excellence.
          </h1>
          <p className="text-xl font-medium text-white/80 max-w-md leading-relaxed font-body">
            Experience a new standard of healthcare management with Smart Clinic.
          </p>
        </div>
      </div>

      {/* Right Column: Form */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-24 relative overflow-hidden">
        {/* subtle background blob for mobile */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[80px] rounded-full md:hidden" />
        
        <div className="w-full max-w-md relative z-10 bg-surface-container-lowest p-10 lg:p-12 rounded-[2rem] editorial-shadow border border-outline-variant/10 animate-fade-in-up">
          
          <div className="mb-10 text-center md:text-left">
            <h2 className="text-3xl font-black text-on-surface font-headline tracking-tight mb-2">Welcome Back</h2>
            <p className="font-medium text-on-surface-variant font-body">Sign in to your account</p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-8 p-4 rounded-2xl bg-error-container/50 border border-error/20 text-on-error-container text-sm font-bold flex items-center gap-3">
              <span className="material-symbols-outlined text-error">error</span>
              {error}
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

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="login-email" className="block text-xs font-black uppercase tracking-widest text-on-surface/60 mb-2">
                Email Address
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface/30">mail</span>
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-surface-container-lowest border-2 border-outline-variant/20 rounded-2xl text-sm font-bold text-on-surface focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                  placeholder="name@example.com"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label htmlFor="login-password" className="block text-xs font-black uppercase tracking-widest text-on-surface/60">
                  Password
                </label>
                <Link href="/auth/reset-password" className="text-[10px] font-bold text-primary hover:underline uppercase tracking-widest">
                  Forgot?
                </Link>
              </div>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface/30">lock</span>
                <input
                  id="login-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-surface-container-lowest border-2 border-outline-variant/20 rounded-2xl text-sm font-bold text-on-surface focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-4 bg-primary text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-primary-container hover:-translate-y-1 transition-all shadow-xl shadow-primary/20 hover:shadow-primary/40 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none mt-2"
            >
              {isLoading ? (
                <>
                  <span className="material-symbols-outlined animate-spin" style={{ fontVariationSettings: "'wght' 600" }}>progress_activity</span>
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'wght' 600" }}>arrow_forward</span>
                </>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-sm font-medium text-on-surface-variant">
            Don&apos;t have an account?{" "}
            <Link href="/auth/register" className="text-primary font-black hover:underline uppercase tracking-tight ml-1">
              Register Now
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
