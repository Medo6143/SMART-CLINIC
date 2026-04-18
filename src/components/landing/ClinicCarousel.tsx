"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createGetAllClinicsUseCase } from "@/use-cases/clinics/index";
import { FirebaseClinicRepository } from "@/data/repositories/FirebaseClinicRepository";
import { Clinic } from "@/domain/entities/Clinic";
import { useTranslation } from "@/lib/i18n/useTranslation";

// Initialize repository and use case
const clinicRepository = new FirebaseClinicRepository();
const getAllClinics = createGetAllClinicsUseCase(clinicRepository);

interface ClinicPreview {
  id: string;
  name: string;
  address: string;
  phone: string;
  isActive: boolean;
}

export function ClinicCarousel() {
  const { t, isRTL } = useTranslation();
  const [clinics, setClinics] = useState<ClinicPreview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchClinics() {
      try {
        const data = await getAllClinics();
        setClinics(
          data
            .filter((c: Clinic) => c.isActive)
            .map((c: Clinic) => ({
              id: c.id,
              name: c.name,
              address: c.address,
              phone: c.phone,
              isActive: c.isActive,
            }))
        );
      } catch (error) {
        console.error("Error fetching clinics:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchClinics();
  }, []);

  if (loading) {
    return (
      <div className="flex gap-8 overflow-hidden">
        {[1, 2, 3].map((n) => (
          <div key={n} className="w-96 h-64 bg-surface-container-low rounded-[2rem] animate-pulse shrink-0" />
        ))}
      </div>
    );
  }

  if (clinics.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-outline-variant/20">
        <p className="text-on-surface-variant font-black uppercase tracking-widest text-xs">{t('common.noResults')}</p>
      </div>
    );
  }

  return (
    <div className={`flex gap-8 overflow-x-auto pb-12 snap-x no-scrollbar ${isRTL ? 'text-right' : 'text-left'}`}>
      {clinics.map((clinic) => (
        <div key={clinic.id} className="bg-white p-4 w-96 shrink-0 snap-start rounded-[3rem] shadow-xl border border-outline-variant/10 hover:-translate-y-2 transition-all duration-500 group">
          <div className="h-48 bg-surface-container-low rounded-[2.5rem] flex items-center justify-center text-6xl group-hover:scale-105 transition-transform duration-700">
            🏥
          </div>
          <div className="p-8">
            <h3 className="font-black text-2xl mb-2 uppercase tracking-tighter text-on-background">{clinic.name}</h3>
            <p className="text-sm text-on-surface-variant font-medium line-clamp-2 leading-relaxed opacity-70 mb-6">{clinic.address}</p>
            <div className="pt-6 border-t border-outline-variant/5 flex justify-between items-center">
              <span className="text-[10px] font-black uppercase tracking-widest text-secondary bg-secondary/5 px-4 py-2 rounded-xl">
                {isRTL ? 'مفتوح' : 'Open'}
              </span>
              <Link href={`/auth/register?clinicId=${clinic.id}`} className="text-sm font-black uppercase tracking-widest text-primary flex items-center gap-2 group-hover:gap-4 transition-all">
                {isRTL ? 'احجز' : 'Book'} {isRTL ? '←' : '→'}
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
