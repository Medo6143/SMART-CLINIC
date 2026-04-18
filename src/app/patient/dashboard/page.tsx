"use client";

import { useState } from "react";
import { PatientAppointmentList } from "@/components/appointments/PatientAppointmentList";
import { PendingFollowUps } from "@/components/followup/PendingFollowUps";
import { BookAppointmentForm } from "@/components/appointments/BookAppointmentForm";
import { useAuth } from "@/providers/AuthProvider";
import { useAppointments } from "@/hooks/useAppointments";
import {
  IoAddCircleOutline,
  IoTimeOutline,
  IoDocumentTextOutline,
  IoChatbubblesOutline,
  IoCalendarOutline,
  IoArrowForward,
  IoCloseOutline,
} from "react-icons/io5";

export default function PatientDashboard() {
  const { user } = useAuth();
  const { appointments } = useAppointments(undefined, user?.uid);
  const [showBookingModal, setShowBookingModal] = useState(false);

  const nextAppt = appointments
    .filter(a => a.status === "confirmed" && a.date > new Date())
    .sort((a, b) => a.date.getTime() - b.date.getTime())[0];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Hello, <span className="text-primary">{user?.displayName?.split(" ")[0] || "Patient"}</span>
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">Your health journey at a glance.</p>
        </div>
        <button
          onClick={() => setShowBookingModal(true)}
          className="bg-primary text-white px-5 py-2.5 rounded-xl font-semibold text-sm shadow-md shadow-primary/20 hover:shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2"
        >
          <IoAddCircleOutline className="text-lg" />
          Book Appointment
        </button>
      </div>

      {/* Next Appointment Card */}
      <div className="mb-8">
        {nextAppt ? (
          <div className="bg-gray-900 rounded-2xl p-6 md:p-8 text-white relative overflow-hidden">
            <div className="relative z-10">
              <span className="inline-block px-3 py-1 bg-primary/20 text-primary rounded-lg text-xs font-semibold mb-4">
                Next Appointment
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
            <h3 className="text-lg font-bold text-gray-900 mb-1">No Upcoming Appointments</h3>
            <p className="text-sm text-gray-500 mb-4 max-w-xs">Stay on top of your health by scheduling a consultation.</p>
            <button onClick={() => setShowBookingModal(true)} className="text-primary text-sm font-semibold hover:underline">
              Schedule Now
            </button>
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
            <h3 className="font-semibold text-gray-900 mb-1">Medical Records</h3>
            <p className="text-xs text-gray-500 leading-relaxed mb-2">Access prescriptions, visit summaries, and lab results.</p>
            <span className="text-xs font-semibold text-primary flex items-center gap-1 group-hover:gap-2 transition-all">
              View All <IoArrowForward className="text-xs" />
            </span>
          </div>
        </a>
        <a href="/patient/chat" className="bg-white rounded-xl p-5 border border-gray-100 hover:border-secondary/20 hover:shadow-sm transition-all group flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-secondary/10 text-secondary flex items-center justify-center shrink-0 group-hover:bg-secondary group-hover:text-white transition-all">
            <IoChatbubblesOutline className="text-xl" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 mb-1">Patient Chat</h3>
            <p className="text-xs text-gray-500 leading-relaxed mb-2">Message your clinic coordinator regarding your care.</p>
            <span className="text-xs font-semibold text-secondary flex items-center gap-1 group-hover:gap-2 transition-all">
              Open Chat <IoArrowForward className="text-xs" />
            </span>
          </div>
        </a>
      </div>

      {/* Pending Follow-ups */}
      {user?.uid && <PendingFollowUps patientId={user.uid} />}

      {/* Appointments List */}
      <section>
        <h2 className="text-lg font-bold text-gray-900 mb-4">Your Appointments</h2>
        <PatientAppointmentList />
      </section>

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setShowBookingModal(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Book Appointment</h2>
              <button
                onClick={() => setShowBookingModal(false)}
                className="w-9 h-9 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
              >
                <IoCloseOutline className="text-xl" />
              </button>
            </div>
            <BookAppointmentForm
              onComplete={() => {
                setShowBookingModal(false);
                // The list component will refresh on re-render if it uses real-time state or re-fetches
                window.location.reload();
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
