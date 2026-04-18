"use client";

import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from "react";
import type { User } from "@/domain/entities/User";
import type { UserRole } from "@/domain/value-objects/UserRole";
import type { AuthRepository } from "@/domain/repositories/AuthRepository";
import {
  createSignInWithEmailUseCase,
  createSignInWithGoogleUseCase,
  createSignOutUseCase,
  createRegisterUserUseCase,
} from "@/use-cases/auth";
import { FirebaseAuthRepository } from "@/data/repositories/FirebaseAuthRepository";

// ── Context shape ──────────────────────────────────────

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signUp: (email: string, password: string, displayName: string, role: UserRole) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  role: UserRole | null;
  clinicId: string | null;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// ── Provider (DI wiring point) ─────────────────────────

const authRepo: AuthRepository = new FirebaseAuthRepository();

const signInEmail = createSignInWithEmailUseCase(authRepo);
const signInGoogle = createSignInWithGoogleUseCase(authRepo);
const signOutUC = createSignOutUseCase(authRepo);
const registerUser = createRegisterUserUseCase(authRepo);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = authRepo.onAuthStateChanged((u) => {
      setUser(u);
      setIsLoading(false);
    });
    return unsubscribe;
  }, []);

  const handleSignInWithEmail = useCallback(async (email: string, password: string) => {
    setError(null);
    setIsLoading(true);
    try {
      const u = await signInEmail(email, password);
      setUser(u);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Sign in failed");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSignInWithGoogle = useCallback(async () => {
    setError(null);
    setIsLoading(true);
    try {
      const u = await signInGoogle();
      setUser(u);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Google sign in failed");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSignUp = useCallback(async (email: string, password: string, displayName: string, role: UserRole) => {
    setError(null);
    setIsLoading(true);
    try {
      const u = await registerUser({ email, password, displayName, role });
      setUser(u);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Registration failed");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSignOut = useCallback(async () => {
    await signOutUC();
    setUser(null);
  }, []);

  const handleResetPassword = useCallback(async (email: string) => {
    setError(null);
    setIsLoading(true);
    try {
      await authRepo.sendPasswordResetEmail(email);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Password reset failed");
      throw e; // rethrow so the page can show a specific message or handle it
    } finally {
      setIsLoading(false);
    }
  }, []);


  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      error,
      signInWithEmail: handleSignInWithEmail,
      signInWithGoogle: handleSignInWithGoogle,
      signUp: handleSignUp,
      signOut: handleSignOut,
      resetPassword: handleResetPassword,
      role: user?.role ?? null,
      clinicId: user?.clinicId ?? null,
    }),
    [user, isLoading, error, handleSignInWithEmail, handleSignInWithGoogle, handleSignUp, handleSignOut, handleResetPassword]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ── Hook ──────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
