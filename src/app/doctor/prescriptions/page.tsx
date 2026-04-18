"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { FirebaseMedicalHistoryRepository } from "@/data/repositories/FirebaseMedicalHistoryRepository";
import { FirebaseAppointmentRepository } from "@/data/repositories/FirebaseAppointmentRepository";
import { Appointment } from "@/domain/entities/Appointment";

const historyRepo = new FirebaseMedicalHistoryRepository();
const appointmentRepo = new FirebaseAppointmentRepository();

export default function DoctorPrescriptionsPage() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedAppt, setSelectedAppt] = useState<string>("");
  const [condition, setCondition] = useState("");
  const [treatment, setTreatment] = useState("");
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user?.uid) {
      const fetchAppointments = async () => {
        // Fetch recent appointments that aren't completed yet or just completed
        const data = await appointmentRepo.getByDoctor(user.uid);
        setAppointments(data.filter(a => a.status !== "cancelled"));
      };
      fetchAppointments();
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppt || !condition || !treatment) return;
    setIsLoading(true);

    try {
      const appt = appointments.find(a => a.id === selectedAppt);
      if (!appt) return;

      // 1. Add to Medical History
      await historyRepo.add(appt.patientId, {
        patientId: appt.patientId,
        clinicId: appt.clinicId,
        condition,
        treatment,
        doctorId: appt.doctorId,
        diagnosisDate: new Date(),
        notes,
      });

      // 2. Mark appointment as completed
      /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
      await appointmentRepo.updateStatus(appt.id, "completed" as any);

      // 3. Reset form
      setSelectedAppt("");
      setCondition("");
      setTreatment("");
      setNotes("");
      alert("Prescription issued and session completed!");
    } catch (error) {
      console.error("Error issuing prescription:", error);
      alert("Error issuing prescription. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="mb-12 animate-fade-in-up">
        <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-2">Issue <span className="text-primary">Prescription</span></h1>
        <p className="text-gray-500 font-medium">Record visit details, conditions, and treatments for your patients.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-10 rounded-[3rem] shadow-xl border border-gray-100 animate-fade-in-up animate-delay-100">
        <div className="space-y-8">
          {/* Select Appointment */}
          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-3">Select Active Session</label>
            <select 
              className="w-full p-6 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-primary/20 outline-none transition-all font-bold text-gray-900"
              value={selectedAppt}
              onChange={(e) => setSelectedAppt(e.target.value)}
              required
            >
              <option value="">Choose an appointment...</option>
              {appointments.map(a => (
                <option key={a.id} value={a.id}>
                  {a.date.toLocaleDateString()} {a.date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - Patient {a.patientId.slice(0,8)}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-3">Diagnosis / Condition</label>
              <input 
                type="text" 
                placeholder="e.g. Acute Back Pain"
                className="w-full p-6 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-primary/20 outline-none transition-all font-bold"
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-3">Treatment / Medication</label>
              <input 
                type="text" 
                placeholder="e.g. Physical Therapy + Ibuprofen"
                className="w-full p-6 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-primary/20 outline-none transition-all font-bold"
                value={treatment}
                onChange={(e) => setTreatment(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
             <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-3">Additional Notes</label>
             <textarea 
               rows={4}
               placeholder="Enter any follow-up instructions..."
               className="w-full p-6 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-primary/20 outline-none transition-all font-bold"
               value={notes}
               onChange={(e) => setNotes(e.target.value)}
             />
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full py-6 bg-primary text-white rounded-2xl font-black uppercase tracking-widest shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-98 transition-all disabled:opacity-50"
          >
            {isLoading ? "Processing..." : "Complete Session & Issue"}
          </button>
        </div>
      </form>
    </div>
  );
}
