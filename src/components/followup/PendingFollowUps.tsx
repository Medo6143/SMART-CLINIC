"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FirebaseFollowUpRepository } from "@/data/repositories/FirebaseFollowUpRepository";
import type { FollowUp } from "@/domain/entities/FollowUp";

const repo = new FirebaseFollowUpRepository();

export function PendingFollowUps({ patientId }: { patientId: string }) {
  const router = useRouter();
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!patientId) return;
    repo
      .getByPatient(patientId)
      .then((all) => setFollowUps(all.filter((f) => f.status === "pending")))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [patientId]);

  if (loading || followUps.length === 0) return null;

  return (
    <div className="mb-6 space-y-3">
      {followUps.map((fu) => (
        <div
          key={fu.id}
          className="bg-gradient-to-l from-indigo-50 to-purple-50 border border-indigo-200 rounded-2xl p-5 flex items-center justify-between gap-4"
        >
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-11 h-11 rounded-xl bg-indigo-100 flex items-center justify-center shrink-0">
              <svg className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div className="min-w-0">
              <p className="font-bold text-gray-900 text-sm">طلب متابعة من د. {fu.doctorName}</p>
              <p className="text-xs text-gray-500 mt-0.5 truncate">
                {fu.diagnosis || "يرجى تقييم حالتك الصحية بعد الزيارة"}
              </p>
              <p className="text-[10px] text-indigo-500 font-semibold mt-1">
                {fu.sentAt instanceof Date
                  ? fu.sentAt.toLocaleDateString("ar-EG", { day: "numeric", month: "long" })
                  : ""}
              </p>
            </div>
          </div>

          <button
            onClick={() => router.push(`/follow-up/${fu.id}`)}
            className="shrink-0 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 active:scale-95 transition-all shadow-md shadow-indigo-500/20 whitespace-nowrap"
          >
            ملء الاستبيان
          </button>
        </div>
      ))}
    </div>
  );
}
