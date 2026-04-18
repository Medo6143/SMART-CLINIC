"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FirebaseClinicRepository } from "@/data/repositories/FirebaseClinicRepository";
import { Clinic } from "@/domain/entities/Clinic";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { createGetAllClinicsUseCase } from "@/use-cases/clinics/index";

const clinicRepo = new FirebaseClinicRepository();
const getAllClinics = createGetAllClinicsUseCase(clinicRepo);

export default function ClinicsPage() {
  const { isRTL } = useTranslation();
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchClinics() {
      try {
        const data = await getAllClinics();
        setClinics(data.filter(c => c.isActive));
      } catch (error) {
        console.error("Error fetching clinics:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchClinics();
  }, []);

  return (
    <div className={`min-h-screen bg-bg-secondary font-body ${isRTL ? 'font-cairo' : 'font-inter'}`} dir={isRTL ? "rtl" : "ltr"}>
      {/* Top Nav Shell (Minimal for Directory) */}
      <header className="bg-white border-b border-gray-100 py-6 px-8 flex justify-between items-center max-w-7xl mx-auto rounded-b-[2rem] shadow-sm">
         <Link href="/" className="text-2xl font-black text-primary tracking-tighter uppercase">Smart Clinic</Link>
         <div className="flex gap-4">
            <Link href="/auth/login" className="text-xs font-black uppercase tracking-widest text-on-surface/40 hover:text-primary transition-all px-4 py-2">Sign In</Link>
            <Link href="/auth/register" className="bg-primary text-white px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all">Join Us</Link>
         </div>
      </header>

      <main className="max-w-7xl mx-auto px-8 py-20">
        <div className="text-center mb-16 animate-fade-in-up">
           <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/40 mb-4 block">{isRTL ? 'مراكزنا الطبية' : 'Our Medical Centers'}</span>
           <h1 className="text-5xl font-black text-on-background tracking-tighter uppercase">{isRTL ? 'دليل العيادات الذكية' : 'Clinics Directory'}</h1>
           <p className="max-w-xl mx-auto mt-6 text-on-surface-variant font-medium text-lg leading-relaxed">{isRTL ? 'تصفح جميع فروعنا المتاحة واختر الموقع الأنسب لك لبدء رحلتك الصحية.' : 'Browse all our available branches and choose the most convenient location to start your health journey.'}</p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {[1, 2, 3, 4, 5, 6].map(n => (
              <div key={n} className="h-80 bg-gray-100 rounded-[3rem] animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 animate-fade-in-up animate-delay-100">
             {clinics.map(clinic => (
               <div key={clinic.id} className="card bg-white p-6 rounded-[3rem] shadow-xl border border-gray-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group">
                  <div className="h-56 bg-surface-container-low rounded-[2.5rem] flex items-center justify-center text-7xl group-hover:scale-105 transition-transform duration-700">
                     🏥
                  </div>
                  <div className="p-8">
                     <h3 className="font-black text-2xl mb-2 uppercase tracking-tighter text-on-background">{clinic.name}</h3>
                     <p className="text-sm text-on-surface-variant font-medium line-clamp-2 leading-relaxed opacity-70 mb-8">{clinic.address}</p>
                     
                     <div className="pt-8 border-t border-gray-50 flex items-center justify-between">
                        <div className="flex flex-col">
                           <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Contact</span>
                           <span className="text-sm font-bold text-gray-900">{clinic.phone}</span>
                        </div>
                        <Link href={`/auth/register?clinicId=${clinic.id}`} className="px-6 py-3 bg-primary text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-primary/10 hover:scale-105 active:scale-95 transition-all">
                           {isRTL ? 'احجز الآن' : 'Book Now'}
                        </Link>
                     </div>
                  </div>
               </div>
             ))}
          </div>
        )}
      </main>

      <footer className="py-20 border-t border-gray-100 bg-white">
         <div className="max-w-7xl mx-auto px-8 text-center">
            <p className="text-xs font-black text-gray-400 uppercase tracking-[0.3em]">© 2024 Smart Clinic Network. All Excellence Reserved.</p>
         </div>
      </footer>
    </div>
  );
}
