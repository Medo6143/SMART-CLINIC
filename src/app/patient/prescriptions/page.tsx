"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { Prescription } from "@/domain/entities/Prescription";
import { FirebasePrescriptionRepository } from "@/data/repositories/FirebasePrescriptionRepository";
import { PrescriptionCard } from "@/components/prescriptions/PrescriptionCard";
import { Pagination, usePagination } from "@/components/ui/Pagination";
import {
  IoMedkitOutline,
  IoSearchOutline,
  IoDocumentTextOutline,
  IoCalendarOutline,
} from "react-icons/io5";

const prescriptionRepo = new FirebasePrescriptionRepository();

export default function PatientPrescriptionsPage() {
  const { user } = useAuth();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!user?.uid) return;
    const fetchPrescriptions = async () => {
      try {
        const data = await prescriptionRepo.getByPatient(user.uid);
        setPrescriptions(data);
      } catch (error) {
        console.error("Error fetching prescriptions:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPrescriptions();
  }, [user]);

  const filtered = searchTerm
    ? prescriptions.filter((p) =>
        p.medications.some((m) =>
          m.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    : prescriptions;

  const {
    currentPage,
    pageSize,
    paginatedItems: pagedPrescriptions,
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
            <IoMedkitOutline className="text-xl text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">التقارير الطبية</h1>
            <p className="text-sm text-gray-500">سجلك الطبي الكامل — تشخيصات، أدوية، وخطط العلاج</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <IoSearchOutline className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
          <input
            type="text"
            placeholder="Search medication..."
            className="pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg w-full md:w-60 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary/30 outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Stats */}
      {!isLoading && prescriptions.length > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: "إجمالي التقارير", value: prescriptions.length, icon: IoDocumentTextOutline, color: "text-primary bg-primary/10" },
            { label: "هذا الشهر", value: prescriptions.filter(p => {
              const now = new Date();
              return p.createdAt.getMonth() === now.getMonth() && p.createdAt.getFullYear() === now.getFullYear();
            }).length, icon: IoCalendarOutline, color: "text-secondary bg-secondary/10" },
            { label: "الأدوية", value: prescriptions.reduce((acc, p) => acc + p.medications.length, 0), icon: IoMedkitOutline, color: "text-amber-600 bg-amber-50" },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="bg-white p-4 border border-gray-100 rounded-xl flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.color}`}>
                  <Icon className="text-lg" />
                </div>
                <div>
                  <p className="text-xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-[11px] font-medium text-gray-400">{stat.label}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map((n) => (
            <div key={n} className="h-48 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-200">
          <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4">
            <IoMedkitOutline className="text-2xl text-gray-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">
            {searchTerm ? "لا توجد نتائج" : "لا توجد تقارير بعد"}
          </h3>
          <p className="text-sm text-gray-500">
            {searchTerm
              ? `لا توجد نتائج تطابق "${searchTerm}"`
              : "ستظهر تقاريرك الطبية هنا بعد كل كشف."}
          </p>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="mt-4 text-primary text-sm font-semibold hover:underline"
            >
              Clear Search
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {pagedPrescriptions.map((p) => (
            <PrescriptionCard
              key={p.id}
              prescription={p}
              patientName={user?.displayName || undefined}
              doctorName={p.doctorName}
            />
          ))}

          {filtered.length > 10 && (
            <div className="bg-white p-4 rounded-xl border border-gray-100">
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
