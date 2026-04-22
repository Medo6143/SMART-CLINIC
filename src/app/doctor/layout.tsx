"use client";

import { AuthGuard } from "@/guards/AuthGuard";
import { RoleGuard } from "@/guards/RoleGuard";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import { LanguageProvider } from "@/providers/LanguageProvider";
import {
  IoGridOutline,
  IoCalendarOutline,
  IoPeopleOutline,
  IoMedkitOutline,
  IoChatbubblesOutline,
  IoPersonOutline,
  IoLogOutOutline,
} from "react-icons/io5";
import type { IconType } from "react-icons";

function DoctorSidebar() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  const links: { href: string; label: string; icon: IconType }[] = [
    { href: "/doctor/dashboard", label: "Dashboard", icon: IoGridOutline },
    { href: "/doctor/appointments", label: "Appointments", icon: IoCalendarOutline },
    { href: "/doctor/patients", label: "Patients", icon: IoPeopleOutline },
    { href: "/doctor/prescriptions", label: "Prescriptions", icon: IoMedkitOutline },
    { href: "/doctor/chat", label: "Messages", icon: IoChatbubblesOutline },
    { href: "/doctor/profile", label: "Profile", icon: IoPersonOutline },
  ];

  return (
    <aside className="w-60 bg-gray-900 text-white flex flex-col h-full">
      <div className="h-14 flex items-center px-5 border-b border-gray-800">
        <span className="text-base font-bold tracking-tight">
          Smart<span className="text-primary">Clinic</span>
        </span>
      </div>

      <div className="px-4 py-4 border-b border-gray-800 flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
          {user?.displayName?.[0]?.toUpperCase() || "D"}
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-sm truncate">{user?.displayName || "Doctor"}</p>
          <p className="text-[11px] text-gray-500 truncate">{user?.email}</p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-3 space-y-0.5">
        {links.map((l) => {
          const Icon = l.icon;
          const isActive = pathname === l.href;
          return (
            <Link
              key={l.href}
              href={l.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? "bg-primary text-white"
                  : "text-gray-400 hover:bg-gray-800 hover:text-gray-200"
              }`}
            >
              <Icon className={`text-lg ${isActive ? "text-white" : "text-gray-500"}`} />
              {l.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-3 border-t border-gray-800">
        <button
          onClick={signOut}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors"
        >
          <IoLogOutOutline className="text-lg" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}

export default function DoctorLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <RoleGuard allowedRoles={["doctor"]}>
        <LanguageProvider>
          <div className="flex h-screen w-full bg-gray-50">
            <DoctorSidebar />
            <main className="flex-1 overflow-y-auto p-6 md:p-8">
              {children}
            </main>
          </div>
        </LanguageProvider>
      </RoleGuard>
    </AuthGuard>
  );
}
