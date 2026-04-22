"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { MedicalHistory } from "@/domain/entities/MedicalHistory";
import { FirebaseMedicalHistoryRepository } from "@/data/repositories/FirebaseMedicalHistoryRepository";
import { Pagination, usePagination } from "@/components/ui/Pagination";
import {
  IoDocumentTextOutline,
  IoCalendarOutline,
  IoMedkitOutline,
  IoInformationCircleOutline,
  IoPulseOutline,
} from "react-icons/io5";

const historyRepo = new FirebaseMedicalHistoryRepository();

const NODE_COLORS = [
  "bg-primary/10 text-primary",
  "bg-secondary/10 text-secondary",
  "bg-amber-50 text-amber-600",
  "bg-green-50 text-green-600",
  "bg-purple-50 text-purple-600",
];

export default function PatientHistoryPage() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [history, setHistory] = useState<MedicalHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "recent">("all");

  useEffect(() => {
    if (!user?.uid) return;
    const fetchHistory = async () => {
      try {
        const data = await historyRepo.getByPatient(user.uid);
        setHistory(data.sort((a, b) => b.diagnosisDate.getTime() - a.diagnosisDate.getTime()));
      } catch (error) {
        console.error("Error fetching medical history:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchHistory();
  }, [user]);

  const filtered =
    filter === "recent"
      ? history.filter((r) => {
          const threeMonthsAgo = new Date();
          threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
          return r.diagnosisDate >= threeMonthsAgo;
        })
      : history;

  const {
    currentPage,
    pageSize,
    paginatedItems: pagedRecords,
    totalItems,
    onPageChange,
    onPageSizeChange,
  } = usePagination(filtered, 10);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
            <IoDocumentTextOutline className="text-xl text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{t("medicalHistory.title")}</h1>
            <p className="text-sm text-gray-500">{t("medicalHistory.subtitle")}</p>
          </div>
        </div>

        {/* Filter */}
        <div className="flex items-center bg-gray-100 p-1 rounded-lg gap-0.5">
          {(["all", "recent"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-md text-xs font-semibold transition-all ${
                filter === f
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {f === "all" ? t("medicalHistory.allRecords") : t("medicalHistory.last3Months")}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      {!isLoading && history.length > 0 && (
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-white p-4 border border-gray-100 rounded-xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <IoDocumentTextOutline className="text-lg" />
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900">{history.length}</p>
              <p className="text-[11px] font-medium text-gray-400">{t("medicalHistory.totalRecords")}</p>
            </div>
          </div>
          <div className="bg-white p-4 border border-gray-100 rounded-xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-secondary/10 text-secondary flex items-center justify-center">
              <IoCalendarOutline className="text-lg" />
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900">
                {history.length > 0
                  ? history[history.length - 1].diagnosisDate.toLocaleDateString("en-GB", {
                      month: "short",
                      year: "numeric",
                    })
                  : "—"}
              </p>
              <p className="text-[11px] font-medium text-gray-400">{t("medicalHistory.firstVisit")}</p>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-32 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-200">
          <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4">
            <IoDocumentTextOutline className="text-2xl text-gray-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">
            {filter === "recent" ? t("medicalHistory.noRecentRecords") : t("medicalHistory.noRecordsFound")}
          </h3>
          <p className="text-sm text-gray-500">
            {filter === "recent"
              ? t("medicalHistory.noRecentRecordsDesc")
              : t("medicalHistory.noRecordsFoundDesc")}
          </p>
          {filter === "recent" && (
            <button
              onClick={() => setFilter("all")}
              className="mt-4 text-primary text-sm font-semibold hover:underline"
            >
              {t("medicalHistory.viewAllRecords")}
            </button>
          )}
        </div>
      ) : (
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-[19px] top-2 bottom-0 w-px bg-gradient-to-b from-primary/20 via-gray-200 to-transparent" />

          <div className="space-y-4">
            {pagedRecords.map((record, index) => (
              <div key={record.id} className="relative flex gap-5">
                {/* Timeline node */}
                <div className="shrink-0 z-10">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      NODE_COLORS[index % NODE_COLORS.length]
                    }`}
                  >
                    <IoPulseOutline className="text-lg" />
                  </div>
                </div>

                {/* Record Card */}
                <div className="flex-1 pb-2">
                  <div className="bg-white p-5 border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all rounded-xl">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-3 mb-4">
                      <div>
                        <span className="inline-block px-2.5 py-1 bg-primary/5 text-primary rounded-md text-[11px] font-semibold mb-2">
                          {record.diagnosisDate.toLocaleDateString("en-GB", {
                            weekday: "long",
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </span>
                        <h3 className="text-lg font-bold text-gray-900">
                          {record.condition}
                        </h3>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-[11px] text-gray-400 font-medium mb-0.5">{t("medicalHistory.clinician")}</p>
                        <p className="font-semibold text-gray-900 text-sm">
                          Dr. {record.doctorId.slice(0, 8)}
                        </p>
                      </div>
                    </div>

                    {/* Treatment */}
                    <div className="bg-gray-50 p-4 rounded-lg mb-3">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <IoMedkitOutline className="text-primary text-sm" />
                        <p className="text-[11px] font-semibold text-gray-400">{t("medicalHistory.treatmentPlan")}</p>
                      </div>
                      <p className="text-sm text-gray-900 font-medium">{record.treatment}</p>
                    </div>

                    {/* Notes */}
                    {record.notes && (
                      <div className="flex items-start gap-2.5 text-sm text-gray-600 bg-amber-50 p-3 rounded-lg border border-amber-100">
                        <IoInformationCircleOutline className="text-amber-500 text-base shrink-0 mt-0.5" />
                        <span className="italic">&quot;{record.notes}&quot;</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filtered.length > 10 && (
            <div className="bg-white p-4 rounded-xl border border-gray-100 mt-6">
              <Pagination
                currentPage={currentPage}
                totalItems={totalItems}
                pageSize={pageSize}
                onPageChange={onPageChange}
                onPageSizeChange={onPageSizeChange}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
