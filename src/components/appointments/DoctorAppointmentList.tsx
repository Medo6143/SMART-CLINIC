"use client";

import { useEffect, useState } from "react";
import { Appointment } from "@/domain/entities/Appointment";
import { useAuth } from "@/providers/AuthProvider";
import { 
  createGetDoctorAppointmentsUseCase 
} from "@/use-cases/appointments/DoctorAppointmentsUseCase";
import { 
  FirebaseAppointmentRepository 
} from "@/data/repositories/FirebaseAppointmentRepository";

const appointmentRepo = new FirebaseAppointmentRepository();
const getDoctorAppointments = createGetDoctorAppointmentsUseCase(appointmentRepo);

export function DoctorAppointmentList() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user?.uid) {
      const fetchAppointments = async () => {
        try {
          const data = await getDoctorAppointments(user.uid);
          setAppointments(data);
        } catch (error) {
          console.error("Error fetching appointments:", error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchAppointments();
    }
  }, [user]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4].map((n) => (
          <div key={n} className="h-24 bg-gray-100 rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (appointments.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-[2rem] border border-dashed border-gray-200">
        <p className="text-gray-400 font-medium">No appointments found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {appointments.map((a) => (
        <div key={a.id} className="card p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-xl transition-all group">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-primary/5 flex flex-col items-center justify-center border border-primary/10 group-hover:bg-primary group-hover:text-white transition-all duration-500">
              <span className="text-[10px] font-black uppercase tracking-tighter opacity-60 group-hover:opacity-100">
                {a.date.toLocaleDateString("en-GB", { month: 'short' })}
              </span>
              <span className="text-lg font-black leading-none">{a.date.getDate()}</span>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-primary"></span>
                <p className="font-bold text-gray-900">Patient ID: {a.patientId.slice(0, 8)}</p>
              </div>
              <p className="text-sm text-gray-500 font-medium">{a.type} • {a.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
             <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${
               a.status === "completed" ? "bg-green-100 text-green-700" :
               a.status === "cancelled" ? "bg-red-100 text-red-700" :
               "bg-blue-100 text-blue-700"
             }`}>
               {a.status}
             </span>
             <button className="p-3 bg-gray-50 rounded-xl text-gray-400 hover:bg-primary-light hover:text-primary transition-all">
                <span className="material-symbols-outlined text-xl">open_in_new</span>
             </button>
          </div>
        </div>
      ))}
    </div>
  );
}
