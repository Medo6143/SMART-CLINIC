"use client";

import { AuthGuard } from "@/guards/AuthGuard";
import { RoleGuard } from "@/guards/RoleGuard";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import { LanguageProvider } from "@/providers/LanguageProvider";
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
  IoMenuOutline,
  IoCloseOutline,
} from "react-icons/io5";
import type { IconType } from "react-icons";
import { useEffect, useState } from "react";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { useNotifications } from "@/hooks/useNotifications";
import { NotificationDrawer } from "@/components/ui/NotificationDrawer";
import { FirebaseFollowUpRepository } from "@/data/repositories/FirebaseFollowUpRepository";

const followUpRepo = new FirebaseFollowUpRepository();

function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const { t } = useTranslation();
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
    { href: "/patient/dashboard", label: t("nav.dashboard"), icon: IoHomeOutline },
    { href: "/patient/appointments", label: t("nav.appointments"), icon: IoCalendarOutline },
    { href: "/patient/followups", label: t("nav.followups"), icon: IoClipboardOutline, badge: pendingFollowUps },
    { href: "/patient/history", label: t("nav.medicalHistory"), icon: IoDocumentTextOutline },
    { href: "/patient/prescriptions", label: t("nav.prescriptions"), icon: IoMedkitOutline },
    { href: "/patient/chat", label: t("nav.chat"), icon: IoChatbubblesOutline },
    { href: "/patient/profile", label: t("nav.profile"), icon: IoPersonOutline },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-50
        w-60 bg-white border-r border-gray-100 flex flex-col h-full
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="h-14 flex items-center justify-between px-5 border-b border-gray-100">
          <span className="text-base font-bold text-gray-900 tracking-tight">
            Smart<span className="text-primary">Clinic</span>
          </span>
          <button 
            onClick={onClose}
            className="md:hidden p-2 text-gray-400 hover:text-gray-600"
          >
            <IoCloseOutline className="text-xl" />
          </button>
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

        <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
          {links.map((l) => {
            const Icon = l.icon;
            const isActive = pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => onClose()}
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
            {t("auth.signOut")}
          </button>
        </div>
      </aside>
    </>
  );
}

export default function PatientLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { t } = useTranslation();

  return (
    <AuthGuard>
      <RoleGuard allowedRoles={["patient"]}>
        <LanguageProvider>
          <div className="flex h-screen w-full bg-gray-50">
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
            <main className="flex-1 overflow-y-auto p-6 md:p-8">
              {/* Mobile header with menu button */}
              <div className="md:hidden flex items-center justify-between mb-4">
                <button
                  onClick={() => setIsSidebarOpen(true)}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  <IoMenuOutline className="text-2xl" />
                </button>
                <span className="font-bold text-gray-900">{t("common.appName")}</span>
                <div className="w-10" />
              </div>
              {children}
            </main>
          </div>
        </LanguageProvider>
      </RoleGuard>
    </AuthGuard>
  );
}
