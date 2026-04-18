"use client";

import { AuthGuard } from "@/guards/AuthGuard";
import { RoleGuard } from "@/guards/RoleGuard";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import {
  IoHomeOutline,
  IoCalendarOutline,
  IoDocumentTextOutline,
  IoMedkitOutline,
  IoChatbubblesOutline,
  IoPersonOutline,
  IoLogOutOutline,
  IoNotificationsOutline,
  IoClipboardOutline,
} from "react-icons/io5";
import type { IconType } from "react-icons";
import { useEffect, useState } from "react";
import { useNotifications } from "@/hooks/useNotifications";
import { NotificationDrawer } from "@/components/ui/NotificationDrawer";
import { FirebaseFollowUpRepository } from "@/data/repositories/FirebaseFollowUpRepository";

const followUpRepo = new FirebaseFollowUpRepository();

function Sidebar() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const { unreadCount } = useNotifications(user?.uid);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [pendingFollowUps, setPendingFollowUps] = useState(0);

  useEffect(() => {
    if (!user?.uid) return;
    followUpRepo.getByPatient(user.uid)
      .then(all => setPendingFollowUps(all.filter(f => f.status === "pending").length))
      .catch(() => {});
  }, [user?.uid]);

  const links: { href: string; label: string; icon: IconType; badge?: number }[] = [
    { href: "/patient/dashboard", label: "Dashboard", icon: IoHomeOutline },
    { href: "/patient/appointments", label: "Appointments", icon: IoCalendarOutline },
    { href: "/patient/followups", label: "متابعاتي", icon: IoClipboardOutline, badge: pendingFollowUps },
    { href: "/patient/history", label: "Medical History", icon: IoDocumentTextOutline },
    { href: "/patient/prescriptions", label: "التقرير الطبي", icon: IoMedkitOutline },
    { href: "/patient/chat", label: "Messages", icon: IoChatbubblesOutline },
    { href: "/patient/profile", label: "Profile", icon: IoPersonOutline },
  ];

  return (
    <aside className="w-60 bg-white border-r border-gray-100 flex flex-col h-full">
      <div className="h-14 flex items-center px-5 border-b border-gray-100">
        <span className="text-base font-bold text-gray-900 tracking-tight">
          Smart<span className="text-primary">Clinic</span>
        </span>
      </div>

      <div className="px-4 py-4 border-b border-gray-50 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
            {user?.displayName?.[0]?.toUpperCase() || "P"}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-sm text-gray-900 truncate">{user?.displayName || "Patient"}</p>
            <p className="text-[11px] text-gray-400 truncate">{user?.email}</p>
          </div>
        </div>
        <button 
          onClick={() => setIsNotifOpen(true)}
          className="relative p-2 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-full transition-all"
        >
          <IoNotificationsOutline className="text-xl" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
          )}
        </button>
      </div>

      <NotificationDrawer isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} />

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
                  ? "bg-primary/10 text-primary"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
              }`}
            >
              <Icon className={`text-lg ${isActive ? "text-primary" : "text-gray-400"}`} />
              <span className="flex-1">{l.label}</span>
              {l.badge ? (
                <span className="w-5 h-5 bg-amber-500 text-white text-[10px] font-black rounded-full flex items-center justify-center shrink-0">
                  {l.badge}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-3 border-t border-gray-100">
        <button
          onClick={signOut}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
        >
          <IoLogOutOutline className="text-lg" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}

export default function PatientLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <RoleGuard allowedRoles={["patient"]}>
        <div className="flex h-screen w-full bg-gray-50">
          <Sidebar />
          <main className="flex-1 overflow-y-auto p-6 md:p-8">
            {children}
          </main>
        </div>
      </RoleGuard>
    </AuthGuard>
  );
}
