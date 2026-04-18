"use client";

import StitchLandingPage from "@/components/landing/StitchLandingPage";
import { ClinicCarousel } from "@/components/landing/ClinicCarousel";
import { useTranslation } from "@/lib/i18n/useTranslation";

export default function Home() {
  const { t, isRTL } = useTranslation();

  return (
    <main className="min-h-screen">
      <StitchLandingPage />
      
      {/* Integrating existing ClinicCarousel into the new design context */}
      <section id="locations" className="py-32 bg-surface-container-high/30 border-t border-outline-variant/10">
        <div className="max-w-7xl mx-auto px-8">
          <div className={`mb-20 flex flex-col md:flex-row md:items-end justify-between gap-8 ${isRTL ? 'text-right' : 'text-left lg:flex-row-reverse'}`}>
            <div className="max-w-2xl">
              <span className="text-primary font-black uppercase tracking-[0.4em] text-[10px] block mb-4">{isRTL ? 'مواقعنا' : 'Our Locations'}</span>
              <h2 className="text-5xl font-black text-on-background tracking-tighter uppercase">{t('landing.clinicsTitle')}</h2>
              <p className="text-on-surface-variant mt-6 text-lg font-medium leading-relaxed">
                {isRTL 
                  ? 'اختر العيادة الأقرب إليك لحجز موعد كشف مباشر أو استشارة أونلاين.' 
                  : 'Choose the nearest clinic to book an in-person visit or online consultation.'}
              </p>
            </div>
          </div>
          <ClinicCarousel />
        </div>
      </section>
    </main>
  );
}

