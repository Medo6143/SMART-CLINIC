"use client";

import { PatientAppointmentList } from "@/components/appointments/PatientAppointmentList";
import { PendingFollowUps } from "@/components/followup/PendingFollowUps";
import { useAuth } from "@/providers/AuthProvider";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { useAppointments } from "@/hooks/useAppointments";
import {
  IoAddCircleOutline,
  IoTimeOutline,
  IoDocumentTextOutline,
  IoChatbubblesOutline,
  IoCalendarOutline,
  IoArrowForward,
} from "react-icons/io5";
import Link from "next/link";

export default function PatientDashboard() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const { appointments } = useAppointments(undefined, user?.uid);

  const nextAppt = appointments
    .filter(a => a.status === "confirmed" && a.date > new Date())
    .sort((a, b) => a.date.getTime() - b.date.getTime())[0];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {t("dashboard.hello")} <span className="text-primary">{user?.displayName?.split(" ")[0] || "Patient"}</span>
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">{t("dashboard.subtitle")}</p>
        </div>
        <Link
          href="/patient/book"
          className="bg-primary text-white px-5 py-2.5 rounded-xl font-semibold text-sm shadow-md shadow-primary/20 hover:shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2"
        >
          <IoAddCircleOutline className="text-lg" />
          {t("dashboard.bookNewAppointment")}
        </Link>
      </div>

      {/* Next Appointment Card */}
      <div className="mb-8">
        {nextAppt ? (
          <div className="bg-gray-900 rounded-2xl p-6 md:p-8 text-white relative overflow-hidden">
            <div className="relative z-10">
              <span className="inline-block px-3 py-1 bg-primary/20 text-primary rounded-lg text-xs font-semibold mb-4">
                {t("dashboard.nextAppointment")}
              </span>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <h2 className="text-xl font-bold mb-1">
                    {nextAppt.date.toLocaleDateString("en-GB", { weekday: 'long', day: 'numeric', month: 'long' })}
                  </h2>
                  <p className="text-gray-400 text-sm flex items-center gap-1.5">
                    <IoTimeOutline className="text-primary" />
                    {nextAppt.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <div className="bg-white/5 border border-white/10 px-5 py-3 rounded-xl">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-0.5">Type</p>
                  <p className="font-semibold">{nextAppt.type}</p>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-16 -right-16 w-48 h-48 bg-primary/10 rounded-full blur-3xl" />
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-8 border border-gray-100 flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mb-4">
              <IoCalendarOutline className="text-2xl text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">{t("dashboard.noUpcomingAppointments")}</h3>
            <p className="text-sm text-gray-500 mb-4 max-w-xs">{t("dashboard.scheduleConsultation")}</p>
            <Link href="/patient/book" className="text-primary text-sm font-semibold hover:underline">
              {t("dashboard.bookNow")}
            </Link>
          </div>
        )}
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <a href="/patient/history" className="bg-white rounded-xl p-5 border border-gray-100 hover:border-primary/20 hover:shadow-sm transition-all group flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white transition-all">
            <IoDocumentTextOutline className="text-xl" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 mb-1">{t("dashboard.medicalRecords")}</h3>
            <p className="text-xs text-gray-500 leading-relaxed mb-2">{t("dashboard.medicalRecordsDesc")}</p>
            <span className="text-xs font-semibold text-primary flex items-center gap-1 group-hover:gap-2 transition-all">
              {t("dashboard.viewAll")} <IoArrowForward className="text-xs" />
            </span>
          </div>
        </a>
        <a href="/patient/chat" className="bg-white rounded-xl p-5 border border-gray-100 hover:border-secondary/20 hover:shadow-sm transition-all group flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-secondary/10 text-secondary flex items-center justify-center shrink-0 group-hover:bg-secondary group-hover:text-white transition-all">
            <IoChatbubblesOutline className="text-xl" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 mb-1">{t("dashboard.patientChat")}</h3>
            <p className="text-xs text-gray-500 leading-relaxed mb-2">{t("dashboard.patientChatDesc")}</p>
            <span className="text-xs font-semibold text-secondary flex items-center gap-1 group-hover:gap-2 transition-all">
              {t("dashboard.openChat")} <IoArrowForward className="text-xs" />
            </span>
          </div>
        </a>
      </div>

      {/* Pending Follow-ups */}
      {user?.uid && <PendingFollowUps patientId={user.uid} />}

      {/* Appointments List */}
      <section>
        <h2 className="text-lg font-bold text-gray-900 mb-4">{t("dashboard.yourAppointments")}</h2>
        <PatientAppointmentList />
      </section>

      {/* View all appointments link */}
      <section className="mt-6">
        <Link
          href="/patient/appointments"
          className="block w-full bg-white rounded-xl p-4 border border-gray-100 hover:border-primary/20 hover:shadow-sm transition-all text-center"
        >
          <span className="text-primary font-semibold text-sm flex items-center justify-center gap-2">
            {t("dashboard.viewAllAppointments")}
            <IoArrowForward className="text-xs" />
          </span>
        </Link>
      </section>
    </div>
  );
}
