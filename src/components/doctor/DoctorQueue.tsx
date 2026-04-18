"use client";

import { useEffect, useState } from "react";
import { Appointment } from "@/domain/entities/Appointment";
import { useAuth } from "@/providers/AuthProvider";
import { 
  FirebaseAppointmentRepository 
} from "@/data/repositories/FirebaseAppointmentRepository";
import { AppointmentStatus } from "@/domain/value-objects/AppointmentStatus";

const appointmentRepo = new FirebaseAppointmentRepository();

export function DoctorQueue() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user?.uid) {
      const unsubscribe = appointmentRepo.subscribeToQueue(user.uid, (data) => {
        setAppointments(data);
        setIsLoading(false);
      });
      return unsubscribe;
    }
  }, [user]);

  const handleUpdateStatus = async (id: string, status: AppointmentStatus) => {
    try {
      await appointmentRepo.updateStatus(id, status);
    } catch (error) {
      console.error("Error updating appointment status:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((n) => (
          <div key={n} className="h-20 bg-gray-100 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (appointments.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200 shadow-sm">
        <div className="text-4xl mb-4 opacity-50">📋</div>
        <h3 className="text-lg font-bold text-gray-900">Queue is empty</h3>
        <p className="text-gray-500 max-w-xs mx-auto">You have no scheduled appointments for today.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {appointments.map((a) => (
        <div 
          key={a.id} 
          className={`card p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all border-l-4 ${
            a.status === "in_progress" ? "border-l-primary bg-primary/5" :
            a.status === "confirmed" ? "border-l-green-500" :
            "border-l-gray-200"
          }`}
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex flex-col items-center justify-center border border-gray-100">
              <span className="text-xs font-bold text-primary uppercase">{a.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <div>
              <p className="font-extrabold text-gray-900">Patient ID: {a.patientId.slice(0, 8)}...</p>
              <p className="text-sm text-gray-500 font-medium">Type: {a.type}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
              a.status === "in_progress" ? "bg-primary text-white" :
              a.status === "confirmed" ? "bg-green-100 text-green-700" :
              "bg-gray-100 text-gray-700"
            }`}>
              {a.status}
            </div>
            
            <div className="flex gap-2">
              {a.status === "confirmed" && (
                <button 
                  onClick={() => handleUpdateStatus(a.id, "in_progress")}
                  className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                >
                  Start Session
                </button>
              )}
              {a.status === "in_progress" && (
                <button 
                  onClick={() => handleUpdateStatus(a.id, "completed")}
                  className="px-4 py-2 bg-green-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-green-500/20 hover:scale-105 active:scale-95 transition-all"
                >
                  Mark Completed
                </button>
              )}
              <button className="px-4 py-2 bg-white text-gray-600 border border-gray-200 rounded-xl text-xs font-bold hover:bg-gray-50 transition-all">
                Details
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
