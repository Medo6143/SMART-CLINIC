"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { FirebaseFollowUpRepository } from "@/data/repositories/FirebaseFollowUpRepository";
import type { FollowUp, MedicationAdherence } from "@/domain/entities/FollowUp";

const followUpRepo = new FirebaseFollowUpRepository();

const COMMON_SIDE_EFFECTS = ["غثيان", "صداع", "دوخة", "إرهاق", "إسهال", "حساسية جلدية", "اضطراب نوم"];
const COMMON_NEW_SYMPTOMS = ["ألم جديد", "ارتفاع حرارة", "ضيق تنفس", "طفح جلدي", "تورم", "فقدان شهية"];

export default function FollowUpPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const [followUp, setFollowUp] = useState<FollowUp | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [improvement, setImprovement] = useState(50);
  const [symptomsBetter, setSymptomsBetter] = useState(false);
  const [symptomsWorse, setSymptomsWorse] = useState(false);
  const [selectedSideEffects, setSelectedSideEffects] = useState<string[]>([]);
  const [selectedNewSymptoms, setSelectedNewSymptoms] = useState<string[]>([]);
  const [adherence, setAdherence] = useState<MedicationAdherence>("full");
  const [freeText, setFreeText] = useState("");

  useEffect(() => {
    if (!id) return;
    followUpRepo.getById(id)
      .then((fu) => {
        if (!fu) { setNotFound(true); return; }
        setFollowUp(fu);
        if (fu.patientResponse) setSubmitted(true);
      })
      .catch(() => setNotFound(true))
      .finally(() => setIsLoading(false));
  }, [id]);

  const toggleItem = (list: string[], setList: (v: string[]) => void, item: string) => {
    setList(list.includes(item) ? list.filter((x) => x !== item) : [...list, item]);
  };

  const handleSubmit = async () => {
    if (!id || !followUp) return;
    setSubmitting(true);
    try {
      await followUpRepo.submitPatientResponse(id, {
        improvementPercent: improvement,
        symptomsBetter,
        symptomsWorse,
        newSymptoms: selectedNewSymptoms,
        sideEffects: selectedSideEffects,
        medicationAdherence: adherence,
        freeText,
        respondedAt: new Date(),
      });
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      alert("حدث خطأ أثناء الإرسال. حاول مرة أخرى.");
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
    </div>
  );

  if (notFound) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="text-center max-w-sm">
        <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
          <span className="material-symbols-outlined text-3xl text-red-500">error</span>
        </div>
        <h2 className="font-black text-xl text-gray-900 mb-2">الرابط غير صحيح</h2>
        <p className="text-sm text-gray-500">لم يتم العثور على هذا الاستبيان. تحقق من الرابط وحاول مرة أخرى.</p>
      </div>
    </div>
  );

  if (submitted) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="text-center max-w-sm">
        <div className="w-20 h-20 rounded-3xl bg-green-50 flex items-center justify-center mx-auto mb-6">
          <span className="material-symbols-outlined text-4xl text-green-600">check_circle</span>
        </div>
        <h2 className="font-black text-2xl text-gray-900 mb-2">شكراً لك!</h2>
        <p className="text-sm text-gray-500 mb-6">
          تم استلام تقييمك. سيقوم الذكاء الاصطناعي بتحليل حالتك وإرسال تقرير للدكتور {followUp?.doctorName}.
        </p>
        <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 text-sm text-blue-700 text-right">
          <p className="font-bold mb-1">ماذا يحدث الآن؟</p>
          <ul className="text-xs text-blue-600 space-y-1 list-disc list-inside">
            <li>يُحلل الذكاء الاصطناعي إجاباتك</li>
            <li>يصل الدكتور تقرير بحالتك</li>
            <li>قد يتواصل معك الدكتور إن لزم</li>
          </ul>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-16" dir="rtl">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">استبيان المتابعة</p>
          <h1 className="font-black text-lg text-gray-900">{followUp?.doctorName}</h1>
          <p className="text-xs text-gray-500">{followUp?.diagnosis}</p>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 pt-6 space-y-6">

        {/* Improvement Slider */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <p className="font-black text-sm text-gray-900 mb-1">كم تحسنت حالتك؟</p>
          <p className="text-xs text-gray-400 mb-5">قيّم مستوى تحسنك بشكل عام منذ الزيارة</p>
          <div className="text-center mb-4">
            <span className={`text-4xl font-black ${improvement >= 70 ? "text-green-600" : improvement >= 40 ? "text-amber-500" : "text-red-500"}`}>
              {improvement}%
            </span>
          </div>
          <input
            type="range"
            min={0} max={100} step={5}
            value={improvement}
            onChange={(e) => setImprovement(Number(e.target.value))}
            className="w-full accent-primary h-2"
          />
          <div className="flex justify-between text-[10px] text-gray-400 mt-1">
            <span>لم أتحسن</span>
            <span>تحسن كامل</span>
          </div>
        </div>

        {/* Symptoms better/worse */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <p className="font-black text-sm text-gray-900 mb-4">ما حال أعراضك الأصلية؟</p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { value: true, label: "تحسنت ✓", color: "green", setter: setSymptomsBetter, current: symptomsBetter },
              { value: true, label: "ازدادت سوءاً ✗", color: "red", setter: setSymptomsWorse, current: symptomsWorse },
            ].map((opt) => (
              <button
                key={opt.label}
                type="button"
                onClick={() => { opt.setter(!opt.current); }}
                className={`py-3 rounded-xl text-sm font-bold border-2 transition-all ${
                  opt.current
                    ? opt.color === "green" ? "border-green-500 bg-green-50 text-green-700" : "border-red-500 bg-red-50 text-red-700"
                    : "border-gray-100 text-gray-500 hover:border-gray-200"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Medication adherence */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <p className="font-black text-sm text-gray-900 mb-4">هل التزمت بأخذ الدواء؟</p>
          <div className="grid grid-cols-3 gap-2">
            {([
              { value: "full", label: "بالكامل ✓" },
              { value: "partial", label: "جزئياً" },
              { value: "stopped", label: "توقفت" },
            ] as { value: MedicationAdherence; label: string }[]).map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setAdherence(opt.value)}
                className={`py-2.5 rounded-xl text-xs font-bold border-2 transition-all ${
                  adherence === opt.value
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-gray-100 text-gray-500 hover:border-gray-200"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Side effects */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <p className="font-black text-sm text-gray-900 mb-1">أعراض جانبية من الدواء؟</p>
          <p className="text-xs text-gray-400 mb-4">اختر كل ما ينطبق</p>
          <div className="flex flex-wrap gap-2">
            {COMMON_SIDE_EFFECTS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => toggleItem(selectedSideEffects, setSelectedSideEffects, s)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                  selectedSideEffects.includes(s)
                    ? "border-amber-400 bg-amber-50 text-amber-700"
                    : "border-gray-200 text-gray-500 hover:border-gray-300"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* New symptoms */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <p className="font-black text-sm text-gray-900 mb-1">هل ظهرت أعراض جديدة؟</p>
          <p className="text-xs text-gray-400 mb-4">اختر كل ما ينطبق</p>
          <div className="flex flex-wrap gap-2">
            {COMMON_NEW_SYMPTOMS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => toggleItem(selectedNewSymptoms, setSelectedNewSymptoms, s)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                  selectedNewSymptoms.includes(s)
                    ? "border-red-400 bg-red-50 text-red-700"
                    : "border-gray-200 text-gray-500 hover:border-gray-300"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Free text */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <p className="font-black text-sm text-gray-900 mb-2">أي ملاحظات أخرى؟</p>
          <textarea
            value={freeText}
            onChange={(e) => setFreeText(e.target.value)}
            rows={3}
            placeholder="اكتب أي تفاصيل إضافية تريد مشاركتها مع الدكتور..."
            className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-primary/20 outline-none resize-none"
          />
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full py-4 bg-primary text-white rounded-2xl font-black text-sm uppercase tracking-widest disabled:opacity-50 hover:bg-primary/90 active:scale-[0.98] transition-all shadow-xl shadow-primary/20"
        >
          {submitting ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              جاري الإرسال...
            </span>
          ) : "إرسال التقييم"}
        </button>

        <p className="text-center text-[11px] text-gray-400 pb-4">
          معلوماتك تُحفظ بشكل آمن وتُرسل حصرياً لطاقمك الطبي
        </p>
      </div>
    </div>
  );
}
