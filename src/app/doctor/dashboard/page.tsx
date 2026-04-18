"use client";

import { DoctorQueue } from "@/components/doctor/DoctorQueue";
import { useAuth } from "@/providers/AuthProvider";
import { useAppointments } from "@/hooks/useAppointments";

export default function DoctorDashboard() {
  const { user } = useAuth();
  const { appointments, isLoading } = useAppointments(user?.uid);

  const activeQueue = appointments.filter(a => a.status === "confirmed" || a.status === "in_progress").length;
  const completedToday = appointments.filter(a => a.status === "completed").length;

  return (
    <div className="max-w-5xl mx-auto py-8">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div className="animate-fade-in-up">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Clinic <span className="text-primary">Dashboard</span>
          </h1>
          <p className="text-gray-500 mt-1">Manage your active patient queue and sessions.</p>
        </div>
        
        <div className="flex gap-4 animate-fade-in-up">
          <div className="card px-6 py-3 bg-white border-amber-500/10 text-amber-700 flex items-center gap-3">
             <span className="text-xl">☀️</span>
             <div>
               <h1 className="text-lg font-black text-gray-900 tracking-tight">Welcome, Dr. {user?.displayName || "Doctor"}</h1>
               <p className="text-xs font-medium text-gray-500 mt-1">
                 {new Date().toLocaleDateString("en-GB", { weekday: 'long', day: 'numeric', month: 'short' })}
               </p>
             </div>
          </div>
        </div>
      </div>

      {/* Grid for doctor stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 animate-fade-in-up">
        <div className="card p-6 flex items-center justify-between hover:shadow-xl transition-shadow bg-white border border-gray-100">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">Active Queue</p>
            <p className="text-3xl font-extrabold text-gray-900">{isLoading ? "..." : activeQueue}</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-xl shadow-lg border border-white/20">
            👨‍👩‍👧‍👦
          </div>
        </div>

        <div className="card p-6 flex items-center justify-between hover:shadow-xl transition-shadow bg-white border border-gray-100">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">Avg. Wait Time</p>
            <p className="text-3xl font-extrabold text-gray-900">15 min</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center text-xl shadow-lg border border-white/20">
            🕒
          </div>
        </div>

        <div className="card p-6 flex items-center justify-between hover:shadow-xl transition-shadow bg-white border border-gray-100">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">Completed Today</p>
            <p className="text-3xl font-extrabold text-gray-900">{isLoading ? "..." : completedToday}</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-green-600 flex items-center justify-center text-xl shadow-lg border border-white/20">
            ✅
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: The Queue */}
        <div className="lg:col-span-2 space-y-6 animate-fade-in-up animate-delay-100">
          <div className="flex items-center justify-between border-b border-gray-200 pb-4">
            <h2 className="text-xl font-extrabold text-gray-900">Today&apos;s Appointment Queue</h2>
          </div>
          <DoctorQueue />
        </div>

        {/* Right Column: Mini Stats/Controls */}
        <div className="space-y-8 animate-fade-in-up animate-delay-200">
          <section className="card p-6 bg-white border-primary/5">
            <h3 className="font-extrabold text-gray-900 mb-4">Patient Management</h3>
            <div className="space-y-3">
              <button className="w-full text-left p-4 rounded-xl border border-gray-100 bg-gray-50 hover:bg-primary-light hover:border-primary/20 transition-all group">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Search Histories</p>
                <div className="flex items-center justify-between">
                   <span className="font-bold text-sm">Medical Records</span>
                   <span className="group-hover:translate-x-1 transition-transform">➡️</span>
                </div>
              </button>
              <button className="w-full text-left p-4 rounded-xl border border-gray-100 bg-gray-50 hover:bg-secondary/5 hover:border-secondary/20 transition-all group">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Quick Access</p>
                <div className="flex items-center justify-between">
                   <span className="font-bold text-sm">Prescriptions</span>
                   <span className="group-hover:translate-x-1 transition-transform">➡️</span>
                </div>
              </button>
            </div>
          </section>

          <section className="card p-6 bg-gray-900 text-white shadow-2xl">
            <h3 className="font-extrabold mb-4">Doctor&apos;s Note</h3>
            <p className="text-sm text-gray-400 italic">&quot;Ensure all patient sessions have a summary note and prescription updated immediately after completion for real-time patient syncing.&quot;</p>
          </section>
        </div>
      </div>
    </div>
  );
}
