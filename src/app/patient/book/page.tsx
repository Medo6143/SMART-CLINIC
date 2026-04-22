"use client";

import { Suspense } from "react";
import { BookingWizard } from "@/components/appointments/BookingWizard";
import { IoArrowForward, IoCalendarOutline } from "react-icons/io5";
import Link from "next/link";

function BookContent() {
  return (
    <div className="w-full h-full relative font-cairo" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
            <IoCalendarOutline className="text-xl text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">حجز موعد جديد</h1>
            <p className="text-sm text-gray-500">اختر العيادة والدكتور والموعد المناسب</p>
          </div>
        </div>
        <Link
          href="/patient/appointments"
          className="text-primary text-sm font-semibold hover:underline flex items-center gap-1"
        >
          <IoArrowForward className="text-xs" />
          رجوع لمواعيدي
        </Link>
      </div>
      
      <BookingWizard />
    </div>
  );
}

export default function BookAppointmentPage() {
  return (
    <Suspense fallback={<div className="p-16 text-center animate-pulse text-gray-400 font-semibold">Loading...</div>}>
      <BookContent />
    </Suspense>
  );
}
