"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { FirebaseFollowUpRepository } from "@/data/repositories/FirebaseFollowUpRepository";
import type { FollowUp } from "@/domain/entities/FollowUp";
type MedicationAdherence = "full" | "partial" | "stopped";

const repo = new FirebaseFollowUpRepository();

const COMMON_SIDE_EFFECTS = ["غثيان", "صداع", "دوخة", "إرهاق", "إسهال", "حساسية جلدية", "اضطراب نوم"];
const COMMON_NEW_SYMPTOMS = ["ألم جديد", "ارتفاع حرارة", "ضيق تنفس", "طفح جلدي", "تورم", "فقدان شهية"];

function FollowUpForm({ followUp, onDone }: { followUp: FollowUp; onDone: () => void }) {
  const [improvement, setImprovement] = useState(50);
  const [sideEffects, setSideEffects] = useState<string[]>([]);
  const [newSymptoms, setNewSymptoms] = useState<string[]>([]);
  const [adherence, setAdherence] = useState<MedicationAdherence>("full");
  const [freeText, setFreeText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const toggleItem = (list: string[], setList: (v: string[]) => void, val: string) =>
    setList(list.includes(val) ? list.filter(x => x !== val) : [...list, val]);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await repo.submitPatientResponse(followUp.id, {
        improvementPercent: improvement,
        symptomsBetter: improvement >= 50,
        symptomsWorse: improvement < 30 || newSymptoms.length > 0,
        sideEffects,
        newSymptoms,
        medicationAdherence: adherence,
        freeText,
        respondedAt: new Date(),
      });
      setDone(true);
      setTimeout(onDone, 1500);
    } catch {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="text-center py-10">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="text-lg font-bold text-gray-900">تم إرسال إجاباتك!</p>
        <p className="text-sm text-gray-500 mt-1">سيراجعها الدكتور قريباً</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-right" dir="rtl">
      {/* Improvement slider */}
      <div className="bg-white rounded-xl p-5 border border-gray-100">
        <label className="block font-bold text-gray-800 mb-3">
          كيف تشعر مقارنة بزيارتك الأخيرة؟
        </label>
        <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
          <span>لا تحسن</span>
          <span className="text-indigo-600 font-bold text-lg">{improvement}%</span>
          <span>تحسن كامل</span>
        </div>
        <input
          type="range" min={0} max={100} value={improvement}
          onChange={e => setImprovement(+e.target.value)}
          className="w-full accent-indigo-600"
        />
        <div className="flex justify-between mt-2">
          {["😫", "😕", "😐", "🙂", "😊"].map((e, i) => (
            <span key={i} className={`text-xl transition-all ${improvement >= i * 25 ? "opacity-100" : "opacity-30"}`}>{e}</span>
          ))}
        </div>
      </div>

      {/* Medication adherence */}
      <div className="bg-white rounded-xl p-5 border border-gray-100">
        <label className="block font-bold text-gray-800 mb-3">هل التزمت بالأدوية الموصوفة؟</label>
        <div className="grid grid-cols-3 gap-2">
          {([["full", "نعم بالكامل ✅"], ["partial", "جزئياً ⚠️"], ["stopped", "توقفت ❌"]] as [MedicationAdherence, string][]).map(([val, label]) => (
            <button key={val} type="button" onClick={() => setAdherence(val)}
              className={`py-2.5 rounded-xl text-sm font-semibold border-2 transition-all ${adherence === val ? "border-indigo-500 bg-indigo-50 text-indigo-700" : "border-gray-200 text-gray-600 hover:border-gray-300"}`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Side effects */}
      <div className="bg-white rounded-xl p-5 border border-gray-100">
        <label className="block font-bold text-gray-800 mb-3">هل لاحظت أي آثار جانبية؟</label>
        <div className="flex flex-wrap gap-2">
          {COMMON_SIDE_EFFECTS.map(s => (
            <button key={s} type="button" onClick={() => toggleItem(sideEffects, setSideEffects, s)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${sideEffects.includes(s) ? "bg-orange-100 border-orange-400 text-orange-700" : "bg-gray-50 border-gray-200 text-gray-600"}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* New symptoms */}
      <div className="bg-white rounded-xl p-5 border border-gray-100">
        <label className="block font-bold text-gray-800 mb-3">هل ظهرت أعراض جديدة؟</label>
        <div className="flex flex-wrap gap-2">
          {COMMON_NEW_SYMPTOMS.map(s => (
            <button key={s} type="button" onClick={() => toggleItem(newSymptoms, setNewSymptoms, s)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${newSymptoms.includes(s) ? "bg-red-100 border-red-400 text-red-700" : "bg-gray-50 border-gray-200 text-gray-600"}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div className="bg-white rounded-xl p-5 border border-gray-100">
        <label className="block font-bold text-gray-800 mb-2">ملاحظات إضافية (اختياري)</label>
        <textarea rows={3} value={freeText} onChange={e => setFreeText(e.target.value)}
          placeholder="اكتب أي شيء تريد إخبار الدكتور به..."
          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-indigo-200 outline-none resize-none" />
      </div>

      <button onClick={handleSubmit} disabled={submitting}
        className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold text-base hover:bg-indigo-700 active:scale-[0.98] transition-all disabled:opacity-50 shadow-lg shadow-indigo-500/20">
        {submitting ? "جاري الإرسال..." : "إرسال الاستجابة للدكتور"}
      </button>
    </div>
  );
}

export default function PatientFollowUpsPage() {
  const { user } = useAuth();
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<FollowUp | null>(null);

  const load = () => {
    if (!user?.uid) return;
    repo.getByPatient(user.uid)
      .then(data => setFollowUps(data.sort((a, b) => b.sentAt.getTime() - a.sentAt.getTime())))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [user?.uid]);

  const pending = followUps.filter(f => f.status === "pending");
  const responded = followUps.filter(f => f.status !== "pending");

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (selected) {
    return (
      <div className="max-w-lg mx-auto" dir="rtl">
        <button onClick={() => setSelected(null)}
          className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-gray-800 mb-6 transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          رجوع
        </button>

        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-5 mb-6">
          <p className="font-bold text-gray-900 text-lg">متابعة د. {selected.doctorName}</p>
          <p className="text-sm text-gray-500 mt-1">{selected.diagnosis || "تقييم الحالة الصحية"}</p>
          <p className="text-xs text-indigo-500 mt-2 font-semibold">
            {selected.sentAt.toLocaleDateString("ar-EG", { weekday: "long", day: "numeric", month: "long" })}
          </p>
        </div>

        <FollowUpForm followUp={selected} onDone={() => { setSelected(null); load(); }} />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto" dir="rtl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">متابعاتي الطبية</h1>
        <p className="text-sm text-gray-500 mt-1">طلبات المتابعة الواردة من أطبائك</p>
      </div>

      {followUps.length === 0 && (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <p className="font-semibold text-gray-400">لا توجد متابعات بعد</p>
        </div>
      )}

      {/* Pending */}
      {pending.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">
            في انتظار ردك ({pending.length})
          </h2>
          <div className="space-y-3">
            {pending.map(fu => (
              <button key={fu.id} onClick={() => setSelected(fu)}
                className="w-full text-right bg-white border-2 border-indigo-200 rounded-2xl p-5 hover:border-indigo-400 hover:shadow-md transition-all group">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center shrink-0">
                      <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-gray-900 truncate">د. {fu.doctorName}</p>
                      <p className="text-xs text-gray-500 truncate mt-0.5">{fu.diagnosis || "تقييم الحالة الصحية"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="px-2.5 py-1 bg-amber-100 text-amber-700 rounded-lg text-[11px] font-bold">
                      ينتظر ردك
                    </span>
                    <svg className="w-4 h-4 text-gray-300 group-hover:text-indigo-500 transition-colors rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </div>
                </div>
                <p className="text-[11px] text-indigo-400 font-semibold mt-3">
                  {fu.sentAt.toLocaleDateString("ar-EG", { weekday: "long", day: "numeric", month: "long" })}
                </p>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Responded */}
      {responded.length > 0 && (
        <section>
          <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">
            مكتملة ({responded.length})
          </h2>
          <div className="space-y-3">
            {responded.map(fu => (
              <div key={fu.id} className="bg-white border border-gray-100 rounded-2xl p-5">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center shrink-0">
                      <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-gray-900 truncate">د. {fu.doctorName}</p>
                      <p className="text-xs text-gray-500 truncate mt-0.5">{fu.diagnosis || "تقييم الحالة الصحية"}</p>
                    </div>
                  </div>
                  <span className="shrink-0 px-2.5 py-1 bg-green-100 text-green-700 rounded-lg text-[11px] font-bold">
                    تم الرد ✓
                  </span>
                </div>
                {fu.patientResponse && (
                  <div className="mt-3 pt-3 border-t border-gray-50 flex items-center gap-4 text-xs text-gray-500">
                    <span>التحسن: <strong className="text-gray-800">{fu.patientResponse.improvementPercent}%</strong></span>
                    <span>الدواء: <strong className="text-gray-800">{fu.patientResponse.medicationAdherence === "fully" ? "ملتزم" : fu.patientResponse.medicationAdherence === "partially" ? "جزئياً" : "غير ملتزم"}</strong></span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
