"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/providers/AuthProvider";

export default function ResetPasswordPage() {
  const { resetPassword, isLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    
    try {
      if (resetPassword) {
        await resetPassword(email);
        setSuccessMessage("Password reset email sent. Please check your inbox.");
      } else {
        setErrorMessage("Password reset is not configured properly.");
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("Failed to send password reset email.");
      }
    }
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
            <span className="material-symbols-outlined text-6xl text-white/90">lock_reset</span>
          </div>
          <h1 className="text-6xl font-black font-headline tracking-tight mb-6 leading-tight">
            Regain<br/>
            Access.
          </h1>
          <p className="text-xl font-medium text-white/80 max-w-md leading-relaxed font-body">
            We will help you reset your password quickly and securely to get you back to your health dashboard.
          </p>
        </div>
      </div>

      {/* Right Column: Form */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-24 relative overflow-hidden">
        {/* subtle background blob for mobile */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[80px] rounded-full md:hidden" />
        
        <div className="w-full max-w-md relative z-10 bg-surface-container-lowest p-10 lg:p-12 rounded-[2rem] editorial-shadow border border-outline-variant/10 animate-fade-in-up">
          
          <div className="mb-10 text-center md:text-left">
            <h2 className="text-3xl font-black text-on-surface font-headline tracking-tight mb-2">Reset Password</h2>
            <p className="font-medium text-on-surface-variant font-body">Enter your email to receive instructions</p>
          </div>

          {/* Success / Error Messages */}
          {successMessage && (
            <div className="mb-8 p-4 rounded-2xl bg-secondary-container/50 border border-secondary/20 text-on-secondary-container text-sm font-bold flex items-center gap-3">
              <span className="material-symbols-outlined text-secondary">check_circle</span>
              {successMessage}
            </div>
          )}
          {errorMessage && (
            <div className="mb-8 p-4 rounded-2xl bg-error-container/50 border border-error/20 text-on-error-container text-sm font-bold flex items-center gap-3">
              <span className="material-symbols-outlined text-error">error</span>
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="reset-email" className="block text-xs font-black uppercase tracking-widest text-on-surface/60 mb-2">
                Email Address
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface/30">mail</span>
                <input
                  id="reset-email"
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

            <button
              type="submit"
              disabled={isLoading || !email}
              className="w-full flex items-center justify-center gap-2 py-4 bg-primary text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-primary-container hover:-translate-y-1 transition-all shadow-xl shadow-primary/20 hover:shadow-primary/40 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none mt-2"
            >
              {isLoading ? (
                <>
                  <span className="material-symbols-outlined animate-spin" style={{ fontVariationSettings: "'wght' 600" }}>progress_activity</span>
                  <span>Sending reset link...</span>
                </>
              ) : (
                <>
                  <span>Send Reset Link</span>
                  <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'wght' 600" }}>send</span>
                </>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-sm font-medium text-on-surface-variant">
            Remember your password?{" "}
            <Link href="/auth/login" className="text-primary font-black hover:underline uppercase tracking-tight ml-1">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
