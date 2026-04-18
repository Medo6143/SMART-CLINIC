"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { User } from "@/domain/entities/User";
import { MedicalHistory } from "@/domain/entities/MedicalHistory";
import { createGetDoctorPatientsUseCase } from "@/use-cases/patients/DoctorPatientsUseCase";
import { FirebaseAppointmentRepository } from "@/data/repositories/FirebaseAppointmentRepository";
import { FirebaseMedicalHistoryRepository } from "@/data/repositories/FirebaseMedicalHistoryRepository";

const appointmentRepo = new FirebaseAppointmentRepository();
const historyRepo = new FirebaseMedicalHistoryRepository();
const getDoctorPatients = createGetDoctorPatientsUseCase(appointmentRepo);

export default function DoctorPatientsPage() {
  const { user } = useAuth();
  const [patients, setPatients] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<User | null>(null);
  const [patientHistory, setPatientHistory] = useState<MedicalHistory[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    if (!user?.uid) return;
    const fetchPatients = async () => {
      try {
        const data = await getDoctorPatients(user.uid);
        setPatients(data);
      } catch (error) {
        console.error("Error fetching patients:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPatients();
  }, [user]);

  const handleSelectPatient = async (patient: User) => {
    setSelectedPatient(patient);
    setLoadingHistory(true);
    try {
      const history = await historyRepo.getByPatient(patient.uid);
      setPatientHistory(history.sort((a, b) => b.diagnosisDate.getTime() - a.diagnosisDate.getTime()));
    } catch (error) {
      console.error("Error fetching patient history:", error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const filteredPatients = patients.filter(
    (p) =>
      p.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.phone?.includes(searchTerm)
  );

  return (
    <div className="max-w-6xl mx-auto py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 animate-fade-in-up">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">
            Patient <span className="text-primary">Directory</span>
          </h1>
          <p className="text-gray-500 font-medium mt-1">
            {patients.length} patient{patients.length !== 1 ? "s" : ""} in your clinical history.
          </p>
        </div>

        <div className="relative group">
          <input
            type="text"
            placeholder="Search by name, email or phone..."
            className="pl-12 pr-6 py-4 bg-white border border-gray-100 rounded-2xl w-full md:w-80 shadow-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            search
          </span>
        </div>
      </div>

      <div className={`grid gap-8 ${selectedPatient ? "grid-cols-1 lg:grid-cols-5" : "grid-cols-1"}`}>
        {/* Patient Grid */}
        <div className={selectedPatient ? "lg:col-span-2" : "col-span-1"}>
          {isLoading ? (
            <div className="grid grid-cols-1 gap-4">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="h-24 bg-gray-100 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : filteredPatients.length === 0 ? (
            <div className="text-center py-32 bg-white rounded-[3rem] border border-dashed border-gray-100">
              <div className="text-5xl mb-6 opacity-30">👥</div>
              <h3 className="text-xl font-black text-gray-900 mb-2">No patients found</h3>
              <p className="text-gray-500 text-sm">
                {searchTerm
                  ? `No results for "${searchTerm}"`
                  : "You haven't had any recorded sessions yet."}
              </p>
            </div>
          ) : (
            <div className={`grid gap-4 ${selectedPatient ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"} animate-fade-in-up animate-delay-100`}>
              {filteredPatients.map((p) => (
                <button
                  key={p.uid}
                  onClick={() => handleSelectPatient(p)}
                  className={`card p-6 text-left hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group bg-white border rounded-[2rem] relative overflow-hidden ${
                    selectedPatient?.uid === p.uid
                      ? "border-primary shadow-lg shadow-primary/10"
                      : "border-gray-100"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-xl font-black text-white shadow-md border border-white/20 group-hover:scale-105 transition-transform shrink-0">
                      {p.displayName?.[0]?.toUpperCase() || "P"}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-black text-gray-900 group-hover:text-primary transition-colors truncate">
                        {p.displayName || "Patient"}
                      </h3>
                      <p className="text-xs text-gray-400 font-bold truncate">{p.email}</p>
                      {p.phone && (
                        <p className="text-xs text-gray-400 font-bold">{p.phone}</p>
                      )}
                    </div>
                    {selectedPatient?.uid === p.uid && (
                      <div className="ml-auto shrink-0">
                        <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                      </div>
                    )}
                  </div>
                  <div className="absolute -top-8 -right-8 w-20 h-20 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Patient Medical History Panel */}
        {selectedPatient && (
          <div className="lg:col-span-3 animate-fade-in-up">
            <div className="card bg-white border border-gray-100 rounded-[2.5rem] overflow-hidden shadow-xl sticky top-6">
              {/* Panel Header */}
              <div className="bg-gray-900 text-white p-8 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-xl font-black">
                    {selectedPatient.displayName?.[0]?.toUpperCase() || "P"}
                  </div>
                  <div>
                    <h3 className="text-xl font-black tracking-tight">
                      {selectedPatient.displayName || "Patient"}
                    </h3>
                    <p className="text-gray-400 text-sm">{selectedPatient.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => { setSelectedPatient(null); setPatientHistory([]); }}
                  className="w-10 h-10 rounded-full hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              {/* Medical History */}
              <div className="p-8 max-h-[60vh] overflow-y-auto">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-6">
                  Clinical History
                </p>

                {loadingHistory ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((n) => (
                      <div key={n} className="h-24 bg-gray-100 rounded-2xl animate-pulse" />
                    ))}
                  </div>
                ) : patientHistory.length === 0 ? (
                  <div className="text-center py-16 text-gray-400 bg-gray-50 rounded-2xl">
                    <div className="text-4xl mb-4 opacity-30">📋</div>
                    <p className="font-bold">No clinical records found</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {patientHistory.map((record, i) => (
                      <div
                        key={record.id}
                        className="p-6 bg-gray-50 rounded-2xl border border-transparent hover:border-primary/10 hover:bg-white transition-all"
                      >
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <h4 className="font-black text-gray-900 uppercase tracking-tighter">
                            {record.condition}
                          </h4>
                          <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/5 px-3 py-1.5 rounded-full shrink-0">
                            {record.diagnosisDate.toLocaleDateString("en-GB", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 font-medium">
                          <span className="text-gray-400 font-black uppercase text-[10px] tracking-widest block mb-1">
                            Treatment
                          </span>
                          {record.treatment}
                        </p>
                        {record.notes && (
                          <p className="text-xs text-gray-400 italic mt-3 bg-white p-3 rounded-xl">
                            &quot;{record.notes}&quot;
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
