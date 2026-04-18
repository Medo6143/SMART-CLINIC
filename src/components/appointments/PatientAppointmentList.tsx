"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { Appointment } from "@/domain/entities/Appointment";
import { useAuth } from "@/providers/AuthProvider";
import {
  createGetPatientAppointmentsUseCase
} from "@/use-cases/appointments/PatientAppointmentsUseCase";
import {
  FirebaseAppointmentRepository
} from "@/data/repositories/FirebaseAppointmentRepository";
import { IoCalendarOutline, IoVideocamOutline, IoTimeOutline, IoPeopleOutline, IoRefreshOutline, IoChevronBackOutline, IoChevronForwardOutline } from "react-icons/io5";

const appointmentRepo = new FirebaseAppointmentRepository();
const getPatientAppointments = createGetPatientAppointmentsUseCase(appointmentRepo);
const PAGE_SIZE = 10;

function getDateStr(dateVal: Date | string): string {
  if (typeof dateVal === "string") return dateVal.split("T")[0];
  return dateVal instanceof Date ? dateVal.toISOString().split("T")[0] : "";
}

function QueuePositionBadge({ appointment, allAppointments }: { appointment: Appointment; allAppointments: Appointment[] }) {
  const position = useMemo(() => {
    if (appointment.status !== "confirmed" && appointment.status !== "pending_approval") return null;
    if (appointment.consultationMode === "online" || appointment.type === "online") return null;
    const today = new Date().toISOString().split("T")[0];
    if (getDateStr(appointment.date) !== today) return null;
    const todayClinic = allAppointments
      .filter(a => getDateStr(a.date) === today && a.consultationMode !== "online" && a.type !== "online" &&
        (a.status === "confirmed" || a.status === "pending_approval" || a.status === "in_progress"))
      .sort((a, b) => (a.slotTime || "").localeCompare(b.slotTime || ""));
    const idx = todayClinic.findIndex(a => a.id === appointment.id);
    return idx >= 0 ? idx + 1 : null;
  }, [allAppointments, appointment]);

  if (position === null) return null;
  return (
    <span className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-indigo-50 text-indigo-700 flex items-center gap-1">
      <IoPeopleOutline className="text-sm" />
      Queue: #{position}
    </span>
  );
}

export function PatientAppointmentList() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [continuingId, setContinuingId] = useState<string | null>(null);

  const fetchAppointments = useCallback(async () => {
    if (!user?.uid) return;
    setIsLoading(true);
    try {
      const data = await getPatientAppointments(user.uid);
      // Sort by date descending (latest first)
      data.sort((a, b) => {
        const da = a.date instanceof Date ? a.date.getTime() : new Date(a.date).getTime();
        const db2 = b.date instanceof Date ? b.date.getTime() : new Date(b.date).getTime();
        return db2 - da;
      });
      setAppointments(data);
    } catch (error) {
      console.error("Error fetching appointments:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.uid]);

  useEffect(() => { fetchAppointments(); }, [fetchAppointments]);

  const totalPages = Math.ceil(appointments.length / PAGE_SIZE);
  const paginated = useMemo(() => appointments.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), [appointments, page]);

  const handleContinueBooking = async (appointment: Appointment) => {
    if (!appointment.paymobOrderId) return;
    setContinuingId(appointment.id);
    try {
      const res = await fetch("/api/payments/resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appointmentId: appointment.id, paymobOrderId: appointment.paymobOrderId }),
      });
      const data = await res.json();
      if (data.iframeUrl) {
        window.open(data.iframeUrl, "_blank");
      } else {
        alert("This time slot may no longer be available.");
      }
    } catch {
      alert("Failed to resume payment. Please try again.");
    } finally {
      setContinuingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((n) => (
          <div key={n} className="h-20 bg-gray-100 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (appointments.length === 0) {
    return (
      <div className="text-center py-10 bg-white rounded-xl border border-dashed border-gray-200">
        <p className="text-sm text-gray-500">You have no appointments yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {paginated.map((appointment) => (
        <div key={appointment.id} className="bg-white p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-gray-100 hover:border-gray-200 transition-all rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <IoCalendarOutline className="text-lg" />
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-sm text-gray-900">{appointment.doctorName || "Consultation"}</p>
              <p className="text-xs text-gray-400 truncate">
                {(appointment.date instanceof Date ? appointment.date : new Date(appointment.date)).toLocaleDateString("en-GB", {
                  weekday: "short", day: "numeric", month: "short", year: "numeric"
                })}
                {appointment.slotTime ? ` · ${appointment.slotTime}` : ""}
              </p>
              {appointment.createdAt && (
                <p className="text-[10px] text-gray-300 mt-0.5">
                  Booked: {(appointment.createdAt instanceof Date ? appointment.createdAt : new Date(appointment.createdAt)).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Status badge */}
            <span className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold ${
              appointment.status === "confirmed"        ? "bg-green-50 text-green-700" :
              appointment.status === "in_progress"      ? "bg-primary/10 text-primary" :
              appointment.status === "completed"        ? "bg-gray-100 text-gray-500" :
              appointment.status === "pending_approval" ? "bg-blue-50 text-blue-600" :
              (appointment.status === "pending" || appointment.status === "pending_payment") ? "bg-amber-50 text-amber-700" :
              appointment.status === "rejected"         ? "bg-red-50 text-red-600" :
              appointment.status === "cancelled"        ? "bg-gray-100 text-gray-400" :
              "bg-gray-100 text-gray-600"
            }`}>
              {appointment.status.replace(/_/g, " ")}
            </span>

            {/* Queue position for clinic visits */}
            <QueuePositionBadge appointment={appointment} allAppointments={appointments} />

            {/* Payment deadline countdown */}
            {(appointment.status === "pending" || appointment.status === "pending_payment") && appointment.paymentDeadlineAt && (() => {
              const secsLeft = Math.max(0, Math.floor((new Date(appointment.paymentDeadlineAt).getTime() - Date.now()) / 1000));
              const mm = String(Math.floor(secsLeft / 60)).padStart(2, "0");
              const ss = String(secsLeft % 60).padStart(2, "0");
              return secsLeft > 0 ? (
                <span className="text-[11px] font-semibold text-amber-600 flex items-center gap-1">
                  <IoTimeOutline className="text-sm" />
                  {mm}:{ss}
                </span>
              ) : (
                <span className="text-[11px] font-semibold text-red-500">Expired</span>
              );
            })()}

            {/* Payment badge */}
            {appointment.paymentStatus && appointment.paymentStatus !== "unpaid" && (
              <span className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold ${
                appointment.paymentStatus === "paid"     ? "bg-primary/10 text-primary" :
                appointment.paymentStatus === "refunded" ? "bg-blue-50 text-blue-600" :
                "bg-gray-100 text-gray-500"
              }`}>
                {appointment.paymentStatus}
              </span>
            )}

            {/* Rejection reason */}
            {appointment.status === "rejected" && appointment.rejectionReason && (
              <p className="text-[11px] text-red-500 italic">{appointment.rejectionReason}</p>
            )}

            {/* Continue Booking button for unpaid online appointments */}
            {appointment.paymentStatus === "unpaid" &&
              appointment.type === "online" &&
              (appointment.status === "pending" || appointment.status === "pending_payment") &&
              appointment.paymobOrderId && (
              <button
                onClick={() => handleContinueBooking(appointment)}
                disabled={continuingId === appointment.id}
                className="bg-amber-500 text-white px-4 py-2 rounded-lg text-xs font-semibold shadow-sm hover:shadow-md hover:scale-[1.02] transition-all flex items-center gap-1.5 disabled:opacity-60"
              >
                <IoRefreshOutline className="text-sm" />
                {continuingId === appointment.id ? "Checking..." : "Continue Booking"}
              </button>
            )}

            {/* Meet link */}
            {appointment.status === "confirmed" && appointment.meetLink && (
              <a
                href={appointment.meetLink}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-primary text-white px-4 py-2 rounded-lg text-xs font-semibold shadow-sm hover:shadow-md hover:scale-[1.02] transition-all flex items-center gap-1.5"
              >
                <IoVideocamOutline className="text-sm" />
                Join
              </a>
            )}
          </div>
        </div>
      ))}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-gray-400">
            Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, appointments.length)} of {appointments.length}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 disabled:opacity-30 transition-all"
            >
              <IoChevronBackOutline />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all ${
                  p === page ? "bg-primary text-white" : "text-gray-500 hover:bg-gray-100"
                }`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 disabled:opacity-30 transition-all"
            >
              <IoChevronForwardOutline />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
