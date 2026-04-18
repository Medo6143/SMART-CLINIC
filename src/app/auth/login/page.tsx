"use client";

import { useAuth } from "@/providers/AuthProvider";
import { LoginForm } from "@/components/auth/LoginForm";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LoginPage() {
  const { signInWithEmail, signInWithGoogle, isLoading, error, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      // Redirect based on role
      if (user.role === "doctor") {
        router.replace("/doctor/dashboard");
      } else {
        router.replace("/patient/dashboard");
      }
    }
  }, [user, router]);

  return (
    <LoginForm
      onSubmitEmail={signInWithEmail}
      onGoogleSignIn={signInWithGoogle}
      isLoading={isLoading}
      error={error}
    />
  );
}
