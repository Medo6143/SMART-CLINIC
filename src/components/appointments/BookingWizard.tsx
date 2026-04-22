"use client";
import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { Clinic } from "@/domain/entities/Clinic";
import { User } from "@/domain/entities/User";
import { createGetAllClinicsUseCase } from "@/use-cases/clinics/index";
import { FirebaseClinicRepository } from "@/data/repositories/FirebaseClinicRepository";
import { createBookAppointmentUseCase } from "@/use-cases/appointments/PatientAppointmentsUseCase";
import { FirebaseAppointmentRepository } from "@/data/repositories/FirebaseAppointmentRepository";
import { FirebaseNotificationRepository } from "@/data/repositories/FirebaseNotificationRepository";
import { AppointmentTypes, AppointmentPriorities } from "@/domain/value-objects/AppointmentStatus";
import { useRouter } from "next/navigation";
import { generateSlots, getDefaultSchedule, getDefaultClinicHours, type TimeSlot } from "@/lib/slotGeneration";
import {
  IoVideocamOutline,
  IoCheckmarkCircle,
  IoCardOutline,
  IoReceiptOutline,
  IoPhonePortraitOutline,
  IoLockClosedOutline,
  IoCloseOutline,
  IoAlertCircleOutline,
  IoMedkitOutline,
  IoInformationCircleOutline,
} from "react-icons/io5";

const clinicRepo = new FirebaseClinicRepository();
const getAllClinics = createGetAllClinicsUseCase(clinicRepo);

const appointmentRepo = new FirebaseAppointmentRepository();
const bookAppointment = createBookAppointmentUseCase(appointmentRepo);
const notificationRepo = new FirebaseNotificationRepository();

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

export function BookingWizard() {
  const { user } = useAuth();
  const router = useRouter();

  // Data
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [doctors, setDoctors] = useState<User[]>([]);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [currentClinic, setCurrentClinic] = useState<Clinic | null>(null);

  // Selections
  const [selectedClinic, setSelectedClinic] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");
  const [patientName, setPatientName] = useState("");
  const [phone, setPhone] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [paymentMethodUI, setPaymentMethodUI] = useState<"card" | "wallet" | "fawry">("card");
  
  const [age, setAge] = useState<string>("");

  // Derived values - online only
  const selectedDoctorInfo = doctors.find(d => d.uid === selectedDoctor);
  const amount = selectedDoctorInfo?.onlineConsultationFee ?? 400;
  const serviceFee = 20;
  const totalAmount = amount + serviceFee;
  
  const minDate = new Date(); minDate.setDate(minDate.getDate() + 1);

  // UI state
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentToken, setPaymentToken] = useState<string | null>(null);
  const [paymentDeadline, setPaymentDeadline] = useState<string | null>(null);
  const [bookedAppointmentId, setBookedAppointmentId] = useState<string | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const { secsLeft, label: countdownLabel } = useCountdown(paymentDeadline);

  const canSubmit = selectedClinic && selectedDoctor && selectedDate && !!selectedSlot && !!paymentMethodUI && !isSubmitting;

  useEffect(() => {
    if (user) {
      setPatientName(user.displayName ?? "");
      setPhone((user as any).phone ?? "");
      if ((user as any).age) setAge(String((user as any).age));
    }
  }, [user]);

  // Auto-cancel if timer expires — only when deadline is actually in the past
  useEffect(() => {
    if (paymentDeadline && secsLeft === 0 && bookedAppointmentId && !paymentSuccess) {
      if (new Date(paymentDeadline).getTime() <= Date.now()) {
        appointmentRepo.updateStatus(bookedAppointmentId, "cancelled").catch(console.error);
        setPaymentToken(null);
        setPaymentDeadline(null);
      }
    }
  }, [secsLeft, paymentDeadline, bookedAppointmentId, paymentSuccess]);

  // Poll appointment status to detect payment success from Paymob callback
  useEffect(() => {
    if (!bookedAppointmentId || !paymentToken || paymentSuccess) return;
    const interval = setInterval(async () => {
      try {
        const apt = await appointmentRepo.getById(bookedAppointmentId);
        if (apt && apt.paymentStatus === "paid") {
          setPaymentSuccess(true);
          setPaymentToken(null);
          setPaymentDeadline(null);
          // Redirect to success page
          router.push(`/patient/payment-success?appointmentId=${bookedAppointmentId}&amount=${apt.amount}&transactionId=${apt.paymobTransactionId || 'N/A'}`);
        } else if (apt && apt.paymentStatus === "failed") {
          setPaymentError("عملية الدفع فشلت، الرجاء المحاولة مرة أخرى.");
          setPaymentToken(null);
          setPaymentDeadline(null);
        }
      } catch (e) { /* ignore polling errors */ }
    }, 5000);
    return () => clearInterval(interval);
  }, [bookedAppointmentId, paymentToken, paymentSuccess, router]);

  // Listen for iframe postMessage from Paymob callback (GET)
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "PAYMOB_PAYMENT_COMPLETE") {
        if (event.data.success && bookedAppointmentId) {
          // Redirect to success page
          router.push(`/patient/payment-success?appointmentId=${bookedAppointmentId}&transactionId=${event.data.transactionId || 'N/A'}`);
        } else {
          setPaymentError("عملية الدفع فشلت، الرجاء المحاولة مرة أخرى.");
        }
        setPaymentToken(null);
        setPaymentDeadline(null);
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [bookedAppointmentId, router]);

  // Load clinics on start
  useEffect(() => {
    getAllClinics()
      .then((data) => {
        setClinics(data);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedClinic) return;
    setCurrentClinic(clinics.find((c) => c.id === selectedClinic) ?? null);
    setSelectedDoctor("");
    setSelectedDate("");
    setSelectedSlot("");
    clinicRepo.getDoctors(selectedClinic).then(setDoctors).catch(console.error);
  }, [selectedClinic, clinics]);

  const refreshSlots = useCallback(() => {
    if (!selectedDoctor || !selectedDate) { setSlots([]); return; }
    const date = new Date(selectedDate);
    const schedule = getDefaultSchedule(selectedDoctor, selectedClinic);
    const hours = getDefaultClinicHours();
    appointmentRepo.getByDoctor(selectedDoctor, date).then((booked) => {
      const activeBookings = booked.filter((a) => a.status !== "cancelled" && a.status !== "rejected");
      
      const bookedTimes = activeBookings.map((a) => {
          const d = new Date(a.date);
          return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
        });
      setSlots(generateSlots(date, hours, schedule, bookedTimes));
    });
  }, [selectedDoctor, selectedDate, selectedClinic]);

  useEffect(() => { refreshSlots(); }, [refreshSlots]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedClinic || !selectedDoctor || !selectedDate || !selectedSlot) return;
    const doctor = doctors.find((d) => d.uid === selectedDoctor);
    if (!doctor) return;

    setIsSubmitting(true);
    try {
      const [yr, mo, dy] = selectedDate.split("-").map(Number);
      const [hr, min] = selectedSlot.split(":").map(Number);
      const date = new Date(yr, mo - 1, dy, hr, min);
      
      const baseAmount = doctor.onlineConsultationFee ?? 400;
      const totalAmountVal = baseAmount + 20; // + service fee

      const appointmentData = {
        patientId: user.uid,
        patientName: patientName || user.displayName || "Unknown Patient",
        patientPhone: phone || (user as any).phone || "",
        patientEmail: user.email || "",
        doctorId: selectedDoctor,
        doctorName: doctor.displayName || "Unknown Doctor",
        clinicId: selectedClinic,
        patientAge: age ? parseInt(age) : undefined,
        date,
        slotTime: selectedSlot,
        type: AppointmentTypes.ONLINE,
        consultationMode: "online" as const,
        status: "pending" as const,
        priority: AppointmentPriorities.NORMAL,
        bookingOrigin: "online" as const,
        meetLink: null,
        paymentId: null,
        paymentStatus: "unpaid" as const,
        paymentMethod: (paymentMethodUI === "fawry" ? "wallet" : paymentMethodUI) as "card" | "wallet",
        amount: totalAmountVal,
        paymentDeadlineAt: new Date(Date.now() + PAYMENT_DEADLINE_SECS * 1000).toISOString(),
        symptoms: symptoms || null,
        hasPreviousVisit: false,
        notes: symptoms || "",
      };

      const appointmentId = await bookAppointment(appointmentData);
      setBookedAppointmentId(appointmentId);

      // Trigger Notification for the Doctor/Clinic
      await notificationRepo.create({
        userId: selectedDoctor,
        title: "حجز جديد",
        message: `تم حجز موعد جديد من قبل ${patientName} الساعة ${selectedSlot}`,
        type: "appointment",
        link: `/clinic-admin/appointments`,
        read: false,
      });

      // Online booking — initiate payment
      const deadline = new Date(Date.now() + PAYMENT_DEADLINE_SECS * 1000).toISOString();
      const payRes = await fetch("/api/payments/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appointmentId,
          amount: totalAmountVal,
          billingData: {
            first_name: patientName.split(" ")[0] || "Patient",
            last_name: patientName.split(" ").slice(1).join(" ") || "User",
            email: user.email || "patient@example.com",
            phone_number: phone || "01000000000",
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
    <div className="p-12 text-center text-gray-400 font-medium animate-pulse">
      Loading...
    </div>
  );


  return (
    <div className="w-full font-cairo bg-gray-50 flex flex-col items-center pb-16" dir="rtl">
      
      {/* Stepper */}
      <div className="w-full max-w-4xl px-4 py-6 mb-2">
        <div className="flex items-center justify-between text-xs font-medium text-center relative">
          <div className="absolute top-3.5 left-0 right-0 h-px bg-gray-200 -z-10" />
          {[
            { step: 1, label: "نوع الكشف", active: true },
            { step: 2, label: "التاريخ والوقت", active: !!selectedDate },
            { step: 3, label: "معلوماتك", active: !!patientName },
            { step: 4, label: "الدفع", active: paymentMethodUI !== null },
            { step: 5, label: "تأكيد", active: false }
          ].map((s) => (
            <div key={s.step} className="flex flex-col items-center gap-1.5">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                s.active ? "bg-primary text-white shadow-sm" : "bg-gray-100 text-gray-400"
              }`}>
                {s.step}
              </div>
              <span className={`text-[11px] whitespace-nowrap ${s.active ? "text-gray-900 font-semibold" : "text-gray-400"}`}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="w-full max-w-5xl px-4 flex flex-col md:flex-row gap-6 items-start">
        
        {/* Main Content Area */}
        <div className="flex-1 w-full space-y-6">
          
          {paymentError && (
            <div className="p-3.5 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm font-medium mb-4 flex items-start gap-2">
              <IoAlertCircleOutline className="text-base mt-0.5 shrink-0" />
              <p className="flex-1 text-right">{paymentError}</p>
            </div>
          )}
          
          <form id="booking-form" onSubmit={handleSubmit} className="space-y-6 block">
            
            {/* Clinic Selector */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-5 bg-primary rounded-full" />
                <h2 className="text-base font-bold text-gray-900">اختر العيادة</h2>
              </div>
              {clinics.length === 0 ? (
                <div className="p-5 text-center text-gray-400 text-sm border border-dashed border-gray-200 rounded-xl">لا توجد عيادات متاحة حالياً</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {clinics.map((c) => (
                    <div
                      key={c.id}
                      onClick={() => setSelectedClinic(c.id)}
                      className={`relative p-4 rounded-xl border transition-all cursor-pointer ${
                        selectedClinic === c.id
                          ? "border-primary bg-primary/5"
                          : "border-gray-200 bg-white hover:border-primary/40"
                      }`}
                    >
                      <div className="absolute top-3.5 left-3.5">
                        <div className="w-5 h-5 rounded-full border-2 border-primary flex items-center justify-center">
                          {selectedClinic === c.id && <div className="w-2 h-2 bg-primary rounded-full" />}
                        </div>
                      </div>
                      <div className="flex items-start gap-3 pr-1">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                          <IoMedkitOutline className="text-lg" />
                        </div>
                        <div className="text-right flex-1">
                          <p className="font-semibold text-sm text-gray-900">{c.nameAr || c.name}</p>
                          {(c as any).addressAr || (c as any).address ? (
                            <p className="text-xs text-gray-500 mt-0.5">{(c as any).addressAr || (c as any).address}</p>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Doctor Selector */}
            {selectedClinic && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1 h-5 bg-primary rounded-full" />
                  <h2 className="text-base font-bold text-gray-900">اختر الطبيب</h2>
                </div>
                {doctors.length === 0 ? (
                  <div className="p-5 text-center text-gray-400 text-sm border border-dashed border-gray-200 rounded-xl">لا يوجد أطباء متاحون في هذه العيادة</div>
                ) : (
                  <div className="grid grid-cols-1 gap-2.5">
                    {doctors.map((d) => (
                      <div
                        key={d.uid}
                        onClick={() => setSelectedDoctor(d.uid)}
                        className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all cursor-pointer ${
                          selectedDoctor === d.uid
                            ? "border-primary bg-primary/5"
                            : "border-gray-200 bg-white hover:border-primary/40"
                        }`}
                      >
                        <div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-sm shrink-0">
                          {d.displayName?.charAt(0) ?? "د"}
                        </div>
                        <div className="flex-1 text-right">
                          <p className="font-semibold text-sm text-gray-900">{d.displayName}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{(d as any).specialty ?? "طبيب عام"}</p>
                        </div>
                        {selectedDoctor === d.uid && (
                          <IoCheckmarkCircle className="text-primary text-xl" />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Date and Time Section */}
            {/* Doctor Info Card */}
            {selectedDoctorInfo && (
              <div className="bg-white rounded-xl p-6 border border-gray-200 overflow-hidden relative group">
                <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 rounded-2xl bg-primary/5 flex items-center justify-center text-primary font-black text-2xl">
                    {selectedDoctorInfo.displayName?.charAt(0)}
                  </div>
                  <div className="flex-1 text-right">
                    <h2 className="text-xl font-black text-gray-900 mb-1">{selectedDoctorInfo.displayName}</h2>
                    <p className="text-sm font-bold text-primary opacity-80">{(selectedDoctorInfo as any).specialty || "تخصص طبي"}</p>
                    <div className="flex items-center justify-end gap-2 mt-2 opacity-60">
                      <span className="text-[10px] font-black uppercase tracking-wider">ساعات العمل: 09:00 ص - 05:00 م</span>
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h2 className="text-base font-bold text-gray-900 mb-5 text-center md:text-right">
                اختر التاريخ والوقت
              </h2>
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1 shrink-0">
                  <p className="text-sm font-medium text-gray-700 mb-3 block">
                    المواعيد المتاحة ليوم {selectedDate || "..."}
                  </p>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => { setSelectedDate(e.target.value); setSelectedSlot(""); }}
                    disabled={!selectedDoctor}
                    className="w-full px-3.5 py-2.5 bg-gray-50 rounded-lg border border-gray-200 text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none disabled:opacity-40 text-left"
                    min={minDate.toISOString().split("T")[0]}
                    required
                  />
                  {!selectedDoctor && <p className="text-xs text-red-500 mt-2">يرجى اختيار الطبيب أولاً.</p>}
                </div>

                {/* Slot picker */}
                <div className="flex-1 place-content-center">
                  {slots.length === 0 ? (
                    <div className="text-center p-4 border border-dashed border-gray-200 rounded-lg text-gray-400 text-sm">
                      الرجاء اختيار التاريخ لعرض المواعيد المتاحة.
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2.5">
                      {slots.map(s => (
                        <button
                          key={s.slotId}
                          type="button"
                          disabled={!s.available}
                          onClick={() => setSelectedSlot(s.time)}
                          className={`py-2.5 rounded-lg text-sm font-semibold border transition-all ${
                            !s.available ? "bg-gray-50 text-gray-400 border-transparent cursor-not-allowed line-through"
                            : selectedSlot === s.time ? "bg-primary/5 border-primary text-primary"
                            : "bg-white border-gray-200 text-gray-700 hover:border-primary/50"
                          }`}
                        >
                          {s.time} {Number(s.time.split(":")[0]) >= 12 ? 'م' : 'ص'}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Patient Information Section */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-5 bg-gray-300 rounded-full" />
                <h2 className="text-base font-bold text-gray-900">معلومات المريض</h2>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                        <input type="text" value={patientName} onChange={e => setPatientName(e.target.value)} required placeholder="الاسم بالكامل" className="w-full px-3.5 py-2.5 bg-gray-50 rounded-lg border border-gray-200 text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none text-right placeholder-gray-400" />
                    </div>
                    <div>
                        <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} required placeholder="رقم الهاتف" className="w-full px-3.5 py-2.5 bg-gray-50 rounded-lg border border-gray-200 text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none text-right placeholder-gray-400" />
                    </div>
                    <div>
                        <input type="number" value={age} onChange={e => setAge(e.target.value)} required placeholder="عمر المريض" className="w-full px-3.5 py-2.5 bg-gray-50 rounded-lg border border-gray-200 text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none text-right placeholder-gray-400" />
                    </div>
                 </div>
                 <div>
                     <textarea value={symptoms} onChange={e => setSymptoms(e.target.value)} rows={3} placeholder="هل تعاني من أعراض معينة؟" className="w-full px-3.5 py-2.5 bg-gray-50 rounded-lg border border-gray-200 text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none resize-none text-right placeholder-gray-400" />
                 </div>
              </div>
            </div>

            {/* Payment Method */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-5 bg-gray-300 rounded-full" />
                <h2 className="text-base font-bold text-gray-900">طريقة الدفع</h2>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  
                  {/* Card Selection */}
                  <label className={`flex items-center p-3.5 cursor-pointer border-b border-gray-100 transition-colors ${paymentMethodUI === 'card' ? 'bg-primary/5' : 'hover:bg-gray-50'}`}>
                      <input type="radio" name="payment" checked={paymentMethodUI === 'card'} onChange={() => setPaymentMethodUI('card')} className="w-4 h-4 accent-primary ml-3" />
                      <span className="flex-1 font-medium text-sm text-gray-800">بطاقة ائتمان (فيزا / ماستركارد)</span>
                      <IoCardOutline className="text-primary text-lg" />
                  </label>
                  
                  {/* Fawry Selection */}
                  <label className={`flex items-center p-3.5 cursor-pointer border-b border-gray-100 transition-colors ${paymentMethodUI === 'fawry' ? 'bg-primary/5' : 'hover:bg-gray-50'}`}>
                      <input type="radio" name="payment" checked={paymentMethodUI === 'fawry'} onChange={() => setPaymentMethodUI('fawry')} className="w-4 h-4 accent-primary ml-3" />
                      <span className="flex-1 font-medium text-sm text-gray-800">فوري (Fawry)</span>
                      <IoReceiptOutline className="text-amber-600 text-lg" />
                  </label>
                  
                  {/* Wallet Selection */}
                  <label className={`flex items-center p-3.5 cursor-pointer transition-colors ${paymentMethodUI === 'wallet' ? 'bg-primary/5' : 'hover:bg-gray-50'}`}>
                      <input type="radio" name="payment" checked={paymentMethodUI === 'wallet'} onChange={() => setPaymentMethodUI('wallet')} className="w-4 h-4 accent-primary ml-3" />
                      <span className="flex-1 font-medium text-sm text-gray-800">فودافون كاش</span>
                      <IoPhonePortraitOutline className="text-red-500 text-lg" />
                  </label>

              </div>
            </div>

            {/* Error & Submit */}
            {paymentError && (
              <div className="p-3 bg-red-50 text-red-700 text-sm font-medium rounded-lg">{paymentError}</div>
            )}
            <div className="flex items-center gap-3 pt-2">
              <button 
                disabled={!canSubmit} 
                type="submit" 
                className="flex-1 py-3 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>جاري التجهيز...</span>
                  </>
                ) : (
                  "تأكيد الحجز والدفع"
                )}
              </button>
              <button type="button" className="px-6 py-3 bg-transparent text-gray-500 font-medium text-sm hover:text-gray-700 transition-colors">إلغاء</button>
            </div>

          </form>
        </div>

        {/* Sidebar Summary */}
        <div className="w-full md:w-72 shrink-0 md:sticky md:top-8 bg-white rounded-xl p-5 border border-gray-200">
           <h3 className="text-base font-bold text-gray-900 mb-5 text-center">ملخص الحجز</h3>
           
           <div className="flex items-center justify-end gap-3 mb-6">
               <div className="text-right">
                   <p className="font-semibold text-sm text-gray-900">{selectedDoctorInfo ? selectedDoctorInfo.displayName : "د. أحمد علي"}</p>
                   <p className="text-[11px] text-gray-500 mt-0.5">{(selectedDoctorInfo as any)?.specialty ?? "استشاري جراحة القلب"}</p>
               </div>
               <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700 font-bold text-base shrink-0">
                   {selectedDoctorInfo ? selectedDoctorInfo.displayName?.charAt(0) : "أ"}
               </div>
           </div>

           <div className="space-y-3 mb-6">
               <div className="flex justify-between items-center text-sm">
                   <span className="font-medium text-gray-900">{selectedDate || '—'}</span>
                   <span className="text-gray-500 text-xs">التاريخ</span>
               </div>
               <div className="flex justify-between items-center text-sm">
                 <span className="font-medium text-gray-900">{selectedSlot || '—'} {selectedSlot && (Number(selectedSlot.split(":")[0]) >= 12 ? 'مساءً' : 'صباحاً')}</span>
                 <span className="text-gray-500 text-xs">الوقت</span>
               </div>
           </div>
           
           <div className="h-px w-full bg-gray-100 my-4" />

           <div className="space-y-2.5 mb-5">
               <div className="flex justify-between items-center text-sm">
                   <span className="font-medium text-gray-900">{amount.toFixed(2)} ج.م</span>
                   <span className="text-gray-500 text-xs">سعر الكشف</span>
               </div>
               <div className="flex justify-between items-center text-sm">
                   <span className="font-medium text-gray-900">{serviceFee.toFixed(2)} ج.م</span>
                   <span className="text-gray-500 text-xs">رسوم الخدمة</span>
               </div>
           </div>

           <div className="flex justify-between items-center text-base mb-5">
                <span className="font-bold text-primary">{totalAmount.toFixed(2)} ج.م</span>
                <span className="font-bold text-gray-900">الإجمالي</span>
           </div>
           
           <div className="p-3 bg-blue-50 rounded-lg flex items-start gap-2 text-[11px] text-gray-600 border border-blue-100">
               <IoInformationCircleOutline className="text-blue-500 text-sm shrink-0 mt-0.5" />
               <p className="leading-relaxed text-right">يمكنك إلغاء أو تعديل الموعد قبل 24 ساعة من موعد الحجز دون أي رسوم إضافية.</p>
           </div>
           
           <div className="flex items-center justify-center gap-1.5 mt-4 text-gray-400 text-[11px]">
               <span>نظام حجز مشفر وموثوق</span>
               <IoLockClosedOutline className="text-xs" />
           </div>

        </div>

      </div>

      {paymentSuccess && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md animate-in fade-in duration-300" />
          <div className="relative bg-white rounded-[2.5rem] shadow-2xl max-w-sm w-full p-10 text-center z-10 animate-in zoom-in-95 duration-500">
             <div className="w-24 h-24 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                 <IoCheckmarkCircle className="text-6xl" />
             </div>
             <h3 className="text-3xl font-black text-gray-900 mb-3">تم الدفع بنجاح!</h3>
             <p className="text-gray-500 font-medium leading-relaxed mb-8 px-4">تم استلام الدفع وسيتم مراجعة حجزك والموافقة عليه قريباً.</p>
             
             <button 
                 onClick={() => window.location.href = "/patient/appointments"}
                 className="w-full py-5 bg-primary text-white rounded-2xl font-black text-sm shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-1 transition-all active:scale-95"
             >
                 عرض مواعيدي
             </button>
          </div>
        </div>
      )}

      {paymentToken && (
        <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center p-0 md:p-6">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative bg-white w-full max-w-4xl h-full md:h-[90vh] rounded-none md:rounded-2xl overflow-hidden shadow-2xl flex flex-col z-10">
            <div className="flex items-center justify-between px-5 py-3.5 bg-gray-50 border-b border-gray-200 shrink-0">
              <div className="text-right flex-1">
                <p className="text-[11px] font-semibold text-gray-500">Complete payment to reserve your slot</p>
                <p className="text-sm font-semibold text-gray-900 mt-0.5">
                  <span className={`tabular-nums mr-2 ${secsLeft < 120 ? "text-red-600 animate-pulse" : "text-primary"}`}>
                    {countdownLabel}
                  </span>
                  الوقت المتبقي لإتمام الدفع
                </p>
              </div>
              <button
                onClick={() => { setPaymentToken(null); setPaymentDeadline(null); }}
                className="w-9 h-9 rounded-lg bg-gray-200 flex items-center justify-center hover:bg-red-50 hover:text-red-600 transition-colors mr-3 text-gray-600"
              >
                <IoCloseOutline className="text-xl" />
              </button>
            </div>
            <iframe
              src={`${process.env.NEXT_PUBLIC_PAYMOB_IFRAME_URL}${paymentToken}`}
              className="w-full flex-1 border-none bg-white"
              title="Paymob Payment"
            />
          </div>
        </div>
      )}

    </div>
  );
}
