"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: Array<"patient" | "doctor" | "admin" | "superadmin">;
}

export function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const isAuthorized = user && allowedRoles.includes(user.role as "patient" | "doctor" | "admin" | "superadmin");

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        // Handled by AuthGuard, but safety catch
        router.replace("/auth/login");
        return;
      }

      const role = user.role as "patient" | "doctor" | "admin" | "superadmin";

      if (!allowedRoles.includes(role)) {
        // User authenticated but unauthorized role
        router.replace("/unauthorized"); // or redirect to their specific dashboard
      }
    }
  }, [user, isLoading, router, allowedRoles]);

  if (isLoading || !isAuthorized) {
    // Show spinner while deciding
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent" />
      </div>
    );
  }

  return <>{children}</>;
}
