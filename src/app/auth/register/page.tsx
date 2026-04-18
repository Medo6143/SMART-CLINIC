"use client";

import { useAuth } from "@/providers/AuthProvider";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { useRouter } from "next/navigation";
import { useEffect } from "react";


export default function RegisterPage() {
  const { signUp, signInWithGoogle, isLoading, error, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      if (user.role === "doctor") {
        router.replace("/doctor/dashboard");
      } else {
        router.replace("/patient/dashboard");
      }
    }
  }, [user, router]);

  return (
    <RegisterForm
      onSubmit={(email, password, displayName, role) => signUp(email, password, displayName, role)}
      onGoogleSignIn={signInWithGoogle}
      isLoading={isLoading}
      error={error}
    />
  );
}
