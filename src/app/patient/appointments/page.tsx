"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { BookingWizard } from "@/components/appointments/BookingWizard";
import { IoCalendarOutline, IoCheckmarkCircle, IoCloseCircle } from "react-icons/io5";

function AppointmentsContent() {
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    const status = searchParams.get('status');
    if (status === 'success') {
      setMessage({ text: 'تمت عملية الدفع والحجز بنجاح!', type: 'success' });
    } else if (status === 'error') {
      setMessage({ text: 'فشلت عملية الدفع. يرجى المحاولة مرة أخرى.', type: 'error' });
    }
    
    if (status) {
      const timer = setTimeout(() => setMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  return (
    <div className="w-full h-full relative font-cairo">
      {/* Toast */}
      {message && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-xl font-semibold text-sm text-center shadow-lg flex items-center gap-2 ${
          message.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}>
          {message.type === 'success' ? <IoCheckmarkCircle className="text-lg" /> : <IoCloseCircle className="text-lg" />}
          {message.text}
        </div>
      )}

      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
          <IoCalendarOutline className="text-xl text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Book Appointment</h1>
          <p className="text-sm text-gray-500">Choose your clinic, doctor, and time slot.</p>
        </div>
      </div>
      
      <BookingWizard />
    </div>
  );
}

export default function PatientAppointmentsPage() {
  return (
    <Suspense fallback={<div className="p-16 text-center animate-pulse text-gray-400 font-semibold">Loading...</div>}>
      <AppointmentsContent />
    </Suspense>
  );
}
