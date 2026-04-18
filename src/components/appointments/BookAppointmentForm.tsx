"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { Clinic } from "@/domain/entities/Clinic";
import { User } from "@/domain/entities/User";
import { createGetAllClinicsUseCase } from "@/use-cases/clinics/index";
import { FirebaseClinicRepository } from "@/data/repositories/FirebaseClinicRepository";
import { createBookAppointmentUseCase } from "@/use-cases/appointments/PatientAppointmentsUseCase";
import { FirebaseAppointmentRepository } from "@/data/repositories/FirebaseAppointmentRepository";
import { AppointmentTypes, AppointmentPriorities, ConsultationModes } from "@/domain/value-objects/AppointmentStatus";
import { generateSlots, getDefaultSchedule, getDefaultClinicHours, type TimeSlot } from "@/lib/slotGeneration";

const clinicRepo = new FirebaseClinicRepository();
const getAllClinics = createGetAllClinicsUseCase(clinicRepo);

const appointmentRepo = new FirebaseAppointmentRepository();
const bookAppointment = createBookAppointmentUseCase(appointmentRepo);

const PAYMENT_DEADLINE_SECS = 30 * 60; // 30 minutes

function useCountdown(deadlineIso: string | null) {
  const [secsLeft, setSecsLeft] = useState<number>(0);
  useEffect(() => {
    if (!deadlineIso) { setSecsLeft(0); return; }
    const tick = () => {
      const diff = Math.max(0, Math.floor((new Date(deadlineIso).getTime() - Date.now()) / 1000));
      setSecsLeft(diff);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [deadlineIso]);
  const mm = String(Math.floor(secsLeft / 60)).padStart(2, "0");
  const ss = String(secsLeft % 60).padStart(2, "0");
  return { secsLeft, label: `${mm}:${ss}` };
}

export function BookAppointmentForm({ onComplete }: { onComplete: () => void }) {
  const { user } = useAuth();

  // ── Data
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [doctors, setDoctors] = useState<User[]>([]);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [currentClinic, setCurrentClinic] = useState<Clinic | null>(null);

  // ── Selections
  const [consultationMode, setConsultationMode] = useState<"online" | "offline">("offline");
  const [selectedClinic, setSelectedClinic] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [hasPreviousVisit, setHasPreviousVisit] = useState(false);

  // ── UI state
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentToken, setPaymentToken] = useState<string | null>(null);
  const [paymentDeadline, setPaymentDeadline] = useState<string | null>(null);
  const [bookedAppointmentId, setBookedAppointmentId] = useState<string | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [clinicBookingDone, setClinicBookingDone] = useState(false);

  const { secsLeft, label: countdownLabel } = useCountdown(paymentDeadline);

  // Auto-cancel if timer expires — only when deadline is actually in the past
  useEffect(() => {
    if (paymentDeadline && secsLeft === 0 && bookedAppointmentId) {
      if (new Date(paymentDeadline).getTime() <= Date.now()) {
        appointmentRepo.updateStatus(bookedAppointmentId, "cancelled").catch(console.error);
        setPaymentToken(null);
        setPaymentDeadline(null);
      }
    }
  }, [secsLeft, paymentDeadline, bookedAppointmentId]);

  // ── Load clinics
  useEffect(() => {
    getAllClinics()
      .then((data) => setClinics(data.filter((c) => c.isActive)))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  // ── Load doctors when clinic changes
  useEffect(() => {
    if (!selectedClinic) return;
    setCurrentClinic(clinics.find((c) => c.id === selectedClinic) ?? null);
    setSelectedDoctor("");
    setSelectedDate("");
    setSelectedSlot("");
    clinicRepo.getDoctors(selectedClinic).then(setDoctors).catch(console.error);
  }, [selectedClinic, clinics]);

  // ── Generate slots when doctor + date change
  const refreshSlots = useCallback(() => {
    if (!selectedDoctor || !selectedDate) { setSlots([]); return; }
    const date = new Date(selectedDate);
    const schedule = getDefaultSchedule(selectedDoctor, selectedClinic);
    const hours = getDefaultClinicHours();
    appointmentRepo.getByDoctor(selectedDoctor, date).then((booked) => {
      const bookedTimes = booked
        .filter((a) => a.status !== "cancelled" && a.status !== "rejected")
        .map((a) => {
          const d = new Date(a.date);
          return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
        });
      setSlots(generateSlots(date, hours, schedule, bookedTimes));
    });
  }, [selectedDoctor, selectedDate, selectedClinic]);

  useEffect(() => { refreshSlots(); }, [refreshSlots]);

  // ── Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isOffline = consultationMode === "offline";
    if (!user || !selectedClinic || !selectedDoctor || !selectedDate) return;
    if (!isOffline && !selectedSlot) return;
    const doctor = doctors.find((d) => d.uid === selectedDoctor);
    if (!doctor) return;

    setIsSubmitting(true);
    try {
      const [yr, mo, dy] = selectedDate.split("-").map(Number);
      const date = new Date(yr, mo - 1, dy, 9, 0); // For clinic visits, default 9am
      const amount = (currentClinic as any)?.settings?.consultationFee || 500;

      if (isOffline) {
        // In-clinic: compute queue number and book without payment
        const dayStart = new Date(yr, mo - 1, dy, 0, 0, 0);
        const dayEnd = new Date(yr, mo - 1, dy, 23, 59, 59);
        const sameDay = await appointmentRepo.getByDoctor(selectedDoctor, date);
        const clinicBookings = sameDay.filter(a =>
          a.consultationMode !== "online" && a.type !== "online" &&
          a.status !== "cancelled" && a.status !== "rejected"
        );
        const queueNumber = clinicBookings.length + 1;
        void dayStart; void dayEnd;

        await bookAppointment({
          patientId: user.uid,
          patientName: user.displayName || "Unknown Patient",
          patientPhone: (user as any).phone || "",
          patientEmail: user.email || "",
          doctorId: selectedDoctor,
          doctorName: doctor.displayName || "Unknown Doctor",
          clinicId: selectedClinic,
          date,
          slotTime: undefined,
          type: AppointmentTypes.IN_PERSON,
          status: "confirmed",
          consultationMode: ConsultationModes.OFFLINE,
          priority: AppointmentPriorities.NORMAL,
          bookingOrigin: "online",
          meetLink: null,
          paymentId: null,
          paymentStatus: "unpaid",
          paymentMethod: "cash",
          amount,
          paymentDeadlineAt: null,
          symptoms: symptoms || null,
          hasPreviousVisit,
          notes: "",
          turnNumber: queueNumber,
        } as never);

        setClinicBookingDone(true);
        return;
      }

      // Online: time slot required + payment
      const [hr, min] = selectedSlot.split(":").map(Number);
      const onlineDate = new Date(yr, mo - 1, dy, hr, min);
      const deadline = new Date(Date.now() + PAYMENT_DEADLINE_SECS * 1000).toISOString();

      const appointmentId = await bookAppointment({
        patientId: user.uid,
        patientName: user.displayName || "Unknown Patient",
        patientPhone: (user as any).phone || "",
        patientEmail: user.email || "",
        doctorId: selectedDoctor,
        doctorName: doctor.displayName || "Unknown Doctor",
        clinicId: selectedClinic,
        date: onlineDate,
        slotTime: selectedSlot,
        type: AppointmentTypes.ONLINE,
        status: "pending",
        consultationMode: ConsultationModes.ONLINE,
        priority: AppointmentPriorities.NORMAL,
        bookingOrigin: "online",
        meetLink: null,
        paymentId: null,
        paymentStatus: "unpaid",
        paymentMethod: "card",
        amount,
        paymentDeadlineAt: deadline,
        symptoms: symptoms || null,
        hasPreviousVisit,
        notes: "",
      });

      setBookedAppointmentId(appointmentId);

      const payRes = await fetch("/api/payments/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appointmentId,
          amount,
          billingData: {
            first_name: user.displayName?.split(" ")[0] || "Patient",
            last_name: user.displayName?.split(" ").slice(1).join(" ") || "User",
            email: user.email || "patient@example.com",
            phone_number: (user as any).phone || "01000000000",
          },
        }),
      });

      const { paymentToken: token, error } = await payRes.json();
      if (error) throw new Error(error);
      setPaymentToken(token);
      setPaymentDeadline(deadline);
    } catch (err: unknown) {
      console.error("Booking error:", err);
      const msg = err instanceof Error ? err.message : "Failed to initiate payment";
      setPaymentError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return (
    <div className="p-12 text-center text-on-surface/40 font-bold uppercase tracking-widest animate-pulse">
      Loading...
    </div>
  );

  if (clinicBookingDone) return (
    <div className="py-16 flex flex-col items-center gap-6 text-center">
      <div className="w-20 h-20 rounded-3xl bg-green-50 flex items-center justify-center">
        <span className="material-symbols-outlined text-4xl text-green-600">check_circle</span>
      </div>
      <div>
        <h3 className="font-black text-xl text-on-surface mb-1">Clinic Visit Booked!</h3>
        <p className="text-sm text-on-surface/50">Your queue number has been assigned. Please arrive at the clinic on your selected date.</p>
      </div>
      <button
        onClick={onComplete}
        className="px-8 py-3 bg-primary text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-primary/90 transition-all"
      >
        View My Appointments
      </button>
    </div>
  );

  const isOffline = consultationMode === "offline";
  const canSubmit = selectedClinic && selectedDoctor && selectedDate && (isOffline || selectedSlot) && !isSubmitting;
  const minDate = new Date(); minDate.setDate(minDate.getDate() + 1);

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">

        {/* ── Consultation Mode */}
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-on-surface/40 mb-3">Consultation Mode</p>
          <div className="grid grid-cols-2 gap-3">
            {([
              { id: "offline", icon: "local_hospital", label: "In-Clinic Visit" },
              { id: "online",  icon: "videocam",       label: "Online Consultation" },
            ] as const).map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setConsultationMode(m.id)}
                className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all font-black text-xs uppercase tracking-widest ${
                  consultationMode === m.id
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-outline-variant/20 text-on-surface/50 hover:border-primary/40"
                }`}
              >
                <span className="material-symbols-outlined text-2xl">{m.icon}</span>
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Clinic */}
        <div>
          <label className="block text-xs font-black uppercase tracking-widest text-on-surface/40 mb-2">Clinic</label>
          <select
            value={selectedClinic}
            onChange={(e) => setSelectedClinic(e.target.value)}
            className="w-full px-4 py-3 bg-surface-container-low rounded-xl border border-outline-variant/20 text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none"
            required
          >
            <option value="">— Select a clinic —</option>
            {clinics.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        {/* ── Doctor (always visible) */}
        <div>
          <label className="block text-xs font-black uppercase tracking-widest text-on-surface/40 mb-2">Doctor</label>
          {!selectedClinic ? (
            <div className="p-4 rounded-xl border-2 border-dashed border-outline-variant/20 text-xs text-on-surface/30 text-center">
              Select a clinic first
            </div>
          ) : doctors.length === 0 ? (
            <p className="text-xs text-on-surface/30 italic px-1">No doctors available in this clinic</p>
          ) : (
            <div className="grid grid-cols-1 gap-2">
              {doctors.map((d) => (
                <button
                  key={d.uid}
                  type="button"
                  onClick={() => setSelectedDoctor(d.uid)}
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left ${
                    selectedDoctor === d.uid
                      ? "border-primary bg-primary/5"
                      : "border-outline-variant/20 hover:border-primary/30"
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center font-black text-primary shrink-0">
                    {d.displayName?.charAt(0) ?? "D"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-sm text-on-surface">{d.displayName}</p>
                    <p className="text-[10px] text-on-surface/40 uppercase tracking-wider">{(d as any).specialty ?? "General Practitioner"}</p>
                  </div>
                  {selectedDoctor === d.uid && (
                    <span className="material-symbols-outlined text-primary">check_circle</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Date (always visible) */}
        <div>
          <label className="block text-xs font-black uppercase tracking-widest text-on-surface/40 mb-2">Date</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => { setSelectedDate(e.target.value); setSelectedSlot(""); }}
            disabled={!selectedDoctor}
            className="w-full px-4 py-3 bg-surface-container-low rounded-xl border border-outline-variant/20 text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none disabled:opacity-40"
            min={minDate.toISOString().split("T")[0]}
            required
          />
          {!selectedDoctor && (
            <p className="text-[10px] text-on-surface/30 mt-1 px-1">Select a doctor first</p>
          )}
        </div>

        {/* ── Slots (only for online consultations) */}
        {consultationMode === "online" && (
          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-on-surface/40 mb-3">
              Available Slots{slots.length > 0 && <span className="text-secondary ml-2">({slots.filter(s => s.available).length} open)</span>}
            </label>
            {!selectedDate ? (
              <div className="p-4 rounded-xl border-2 border-dashed border-outline-variant/20 text-xs text-on-surface/30 text-center">
                Select a date to see available slots
              </div>
            ) : slots.length === 0 ? (
              <p className="text-sm text-on-surface/40 italic">No slots available on this date.</p>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                {slots.map((s) => (
                  <button
                    key={s.slotId}
                    type="button"
                    disabled={!s.available}
                    onClick={() => setSelectedSlot(s.time)}
                    className={`py-2.5 rounded-xl text-xs font-black border-2 transition-all ${
                      !s.available
                        ? "bg-surface-container text-on-surface/20 border-transparent cursor-not-allowed line-through"
                        : selectedSlot === s.time
                        ? "bg-primary text-white border-primary shadow-md"
                        : "bg-white border-outline-variant/20 text-on-surface hover:border-primary/50"
                    }`}
                  >
                    {s.time}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── In-Clinic Queue Info */}
        {consultationMode === "offline" && selectedDate && (
          <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100 flex items-center gap-3">
            <span className="material-symbols-outlined text-indigo-500 text-2xl">queue</span>
            <div>
              <p className="text-xs font-black text-indigo-700 uppercase tracking-wide">Walk-in Queue</p>
              <p className="text-xs text-indigo-600">You will receive a queue number upon confirmation. No specific time needed — just arrive at the clinic on your selected date.</p>
            </div>
          </div>
        )}

        {/* ── Symptoms (always visible) */}
        <div className="space-y-4 p-5 bg-surface-container-low/50 rounded-2xl border border-outline-variant/10">
          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-on-surface/40 mb-2">
              Symptoms / Reason for Visit
            </label>
            <textarea
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              rows={3}
              placeholder="Describe your main symptoms or reason for this appointment..."
              className="w-full px-4 py-3 bg-white rounded-xl border border-outline-variant/20 text-sm focus:ring-2 focus:ring-primary/20 outline-none resize-none"
            />
          </div>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={hasPreviousVisit}
              onChange={(e) => setHasPreviousVisit(e.target.checked)}
              className="w-4 h-4 accent-primary"
            />
            <span className="text-xs font-bold text-on-surface/70">I have visited this clinic before</span>
          </label>
        </div>

        {/* ── Payment Error */}
        {paymentError && (
          <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl text-sm text-red-700">
            <span className="material-symbols-outlined text-red-500 shrink-0 text-lg">error</span>
            <div>
              <p className="font-black">Payment failed</p>
              <p className="font-medium text-xs mt-0.5">{paymentError}</p>
              {!process.env.NEXT_PUBLIC_PAYMOB_IFRAME_URL && (
                <p className="text-xs mt-1 font-bold opacity-70">Hint: NEXT_PUBLIC_PAYMOB_IFRAME_URL is not set in your environment.</p>
              )}
            </div>
            <button type="button" onClick={() => setPaymentError(null)} className="ml-auto shrink-0">
              <span className="material-symbols-outlined text-sm text-red-400">close</span>
            </button>
          </div>
        )}

        {/* ── Submit */}
        <button
          type="submit"
          disabled={!canSubmit}
          onClick={() => setPaymentError(null)}
          className="w-full py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-sm disabled:opacity-40 hover:bg-primary/90 active:scale-[0.98] transition-all shadow-xl shadow-primary/20"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              Processing...
            </span>
          ) : (
            `Book & Pay${currentClinic ? ` — ${((currentClinic as any)?.settings?.consultationFee ?? 500).toLocaleString()} EGP` : ""}`
          )}
        </button>

        <p className="text-[11px] text-center text-on-surface/30">
          After payment you will receive a confirmation. The clinic reviews and confirms your appointment within 24 hours.
        </p>
      </form>

      {/* ── Paymob Payment Modal with Countdown */}
      {paymentToken && (
        <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center p-0 md:p-8">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md" />
          <div className="relative bg-white w-full max-w-4xl h-full md:h-[90vh] rounded-none md:rounded-3xl overflow-hidden shadow-2xl flex flex-col z-10">
            {/* Timer bar */}
            <div className="flex items-center justify-between px-6 py-4 bg-surface-container-low border-b border-outline-variant/10 shrink-0">
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-on-surface/40">Complete payment to reserve your slot</p>
                <p className="text-sm font-black text-on-surface mt-0.5">
                  Slot reserved for:&nbsp;
                  <span className={`tabular-nums ${secsLeft < 120 ? "text-red-600 animate-pulse" : "text-primary"}`}>
                    {countdownLabel}
                  </span>
                </p>
              </div>
              {/* Progress bar */}
              <div className="w-32 h-2 bg-outline-variant/20 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${secsLeft < 120 ? "bg-red-500" : "bg-primary"}`}
                  style={{ width: `${(secsLeft / PAYMENT_DEADLINE_SECS) * 100}%` }}
                />
              </div>
              <button
                onClick={() => { setPaymentToken(null); setPaymentDeadline(null); }}
                className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center hover:bg-red-50 hover:text-red-600 transition-colors font-black text-on-surface-variant"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>
            <iframe
              src={`${process.env.NEXT_PUBLIC_PAYMOB_IFRAME_URL}${paymentToken}`}
              className="w-full flex-1 border-none"
              title="Paymob Payment"
            />
          </div>
        </div>
      )}
    </>
  );
}
