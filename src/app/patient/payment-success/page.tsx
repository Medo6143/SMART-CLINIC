"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { IoCheckmarkCircle, IoReceipt, IoCalendar, IoArrowBack } from "react-icons/io5";

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const [countdown, setCountdown] = useState(5);
  
  const appointmentId = searchParams?.get("appointmentId") ?? "";
  const amount = searchParams?.get("amount") ?? "";
  const transactionId = searchParams?.get("transactionId") || "N/A";

  // Auto-redirect countdown
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4" dir="rtl">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        {/* Success Icon */}
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <IoCheckmarkCircle className="text-5xl text-green-600" />
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          تم الدفع بنجاح!
        </h1>
        <p className="text-gray-500 text-sm mb-6">
          تم تأكيد حجزك وسيتم مراجعته من قبل العيادة
        </p>

        {/* Transaction Details */}
        <div className="bg-gray-50 rounded-xl p-4 mb-6 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-gray-500 text-sm">رقم العملية</span>
            <span className="font-semibold text-gray-900">{transactionId}</span>
          </div>
          {appointmentId && (
            <div className="flex items-center justify-between">
              <span className="text-gray-500 text-sm">رقم الحجز</span>
              <span className="font-semibold text-gray-900">{appointmentId.slice(-6)}</span>
            </div>
          )}
          {amount && (
            <div className="flex items-center justify-between">
              <span className="text-gray-500 text-sm">المبلغ المدفوع</span>
              <span className="font-semibold text-green-600">{Number(amount).toLocaleString()} جنيه</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <Link
            href="/patient/appointments"
            className="flex items-center justify-center gap-2 w-full py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-colors"
          >
            <IoCalendar className="text-lg" />
            عرض مواعيدي
          </Link>

          <Link
            href="/patient/dashboard"
            className="flex items-center justify-center gap-2 w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
          >
            <IoArrowBack className="text-lg" />
            العودة للرئيسية
          </Link>
        </div>

        {/* Countdown message */}
        <p className="text-xs text-gray-400 mt-6">
          سيتم تحويلك تلقائياً خلال {countdown} ثواني...
        </p>

        {/* Note */}
        <div className="mt-4 p-3 bg-blue-50 rounded-lg text-xs text-blue-700">
          <p>سيتم إرسال رابط الاستشارة عبر الفيديو إلى بريدك الإلكتروني بعد تأكيد العيادة للموعد</p>
        </div>
      </div>
    </div>
  );
}
