"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { PatientAppointmentList } from "@/components/appointments/PatientAppointmentList";
import { IoCalendarOutline, IoCheckmarkCircle, IoCloseCircle, IoAddCircleOutline } from "react-icons/io5";
import Link from "next/link";

function AppointmentsContent() {
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    const status = searchParams?.get('status');
    if (status === 'success') {
      setMessage({ text: 'تمت عملية الدفع والحجز بنجاح!', type: 'success' });
    } else if (status === 'error') {
      setMessage({ text: 'فشلت عملية الدفع. يرجى المحاولة مرة أخرى.', type: 'error' });
    } else if (status === 'failed') {
      setMessage({ text: 'فشلت عملية الدفع. يرجى المحاولة مرة أخرى.', type: 'error' });
    }

    if (status) {
      const timer = setTimeout(() => setMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  return (
    <div className="w-full h-full relative font-cairo" dir="rtl">
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
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
            <IoCalendarOutline className="text-xl text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">مواعيدي</h1>
            <p className="text-sm text-gray-500">عرض وإدارة جميع مواعيدك الطبية</p>
          </div>
        </div>
        <Link
          href="/patient/book"
          className="bg-primary text-white px-5 py-2.5 rounded-xl font-semibold text-sm shadow-md shadow-primary/20 hover:shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2"
        >
          <IoAddCircleOutline className="text-lg" />
          حجز موعد جديد
        </Link>
      </div>

      <PatientAppointmentList />
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
