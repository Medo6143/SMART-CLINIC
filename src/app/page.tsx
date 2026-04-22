"use client";

import Link from "next/link";
import { ClinicCarousel } from "@/components/landing/ClinicCarousel";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { LanguageProvider } from "@/providers/LanguageProvider";

function HomeContent() {
  const { t, language, isRTL, toggleLanguage } = useTranslation();

  const features = [
    { icon: "videocam", title: isRTL ? "مكالمة فيديو عالية الجودة" : "HD Video Calls", desc: isRTL ? "تواصل مع طبيبك بجودة صوت وصورة عالية" : "Connect with your doctor in crystal clear quality" },
    { icon: "chat", title: isRTL ? "دردشة فورية" : "Instant Chat", desc: isRTL ? "راسل طبيبك بشكل مباشر" : "Message your doctor directly" },
    { icon: "upload_file", title: isRTL ? "مشاركة الملفات" : "File Sharing", desc: isRTL ? "أرسل التحاليل والأشعة بسهولة" : "Share lab results and scans easily" },
    { icon: "encrypted", title: isRTL ? "خصوصية تامة" : "Full Privacy", desc: isRTL ? "بيانات مشفرة وبأعلى معايير الأمان" : "Encrypted with highest security" },
  ];

  const steps = [
    { icon: "person_add", title: isRTL ? "أنشئ حسابك" : "Create Account" },
    { icon: "event_available", title: isRTL ? "اختر الموعد" : "Pick a Time" },
    { icon: "payments", title: isRTL ? "ادفع بأمان" : "Pay Securely" },
    { icon: "video_call", title: isRTL ? "ابدأ الكشف" : "Start Consultation" },
  ];

  return (
    <main className="min-h-screen bg-surface">
      {/* Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-outline-variant/5 shadow-sm">
        <nav className="flex justify-between items-center w-full px-6 lg:px-12 py-4 max-w-screen-2xl mx-auto">
          <div className={`flex items-center gap-8 ${isRTL ? '' : 'flex-row-reverse'}`}>
            <span className="text-2xl font-black tracking-tighter bg-gradient-to-br from-primary to-primary-container bg-clip-text text-transparent">Smart Clinic</span>
            <div className="hidden lg:flex items-center gap-6 font-headline font-semibold text-sm">
              <Link href="/" className="text-primary border-b-2 border-primary pb-1">{isRTL ? "الرئيسية" : "Home"}</Link>
              <Link href="#features" className="text-on-surface/60 hover:text-primary transition-colors">{isRTL ? "المميزات" : "Features"}</Link>
              <Link href="#steps" className="text-on-surface/60 hover:text-primary transition-colors">{isRTL ? "كيف يعمل" : "How It Works"}</Link>
            </div>
          </div>
          <div className={`flex items-center gap-4 ${isRTL ? '' : 'flex-row-reverse'}`}>
            <button onClick={toggleLanguage} className="px-3 py-1.5 bg-surface-container-low rounded-lg text-xs font-bold uppercase tracking-wider text-primary hover:bg-primary hover:text-white transition-all">
              {language === "ar" ? "English" : "العربية"}
            </button>
            <Link href="/auth/login" className="hidden md:block text-sm font-semibold text-on-surface/60 hover:text-primary transition-colors">{t("auth.login")}</Link>
            <Link href="/auth/register" className="bg-primary text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-primary-container transition-all shadow-lg shadow-primary/20">
              {isRTL ? "احجز استشارة" : "Book Consultation"}
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden bg-gradient-to-br from-surface-container-low to-surface">
        <div className="max-w-screen-2xl mx-auto px-6 lg:px-12">
          <div className={`grid lg:grid-cols-2 gap-12 lg:gap-20 items-center ${isRTL ? '' : 'direction-ltr'}`}>
            <div className={`${isRTL ? 'text-right' : 'text-left'} order-2 lg:order-1`}>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary-container/30 rounded-full mb-6">
                <span className="w-2 h-2 bg-secondary rounded-full animate-pulse" />
                <span className="text-sm font-semibold text-secondary">{isRTL ? "استشارات طبية أونلاين" : "Online Medical Consultations"}</span>
              </div>
              <h1 className="font-headline text-4xl lg:text-6xl font-black text-on-background leading-tight mb-6">
                {isRTL ? "احصل على استشارة طبية من منزلك" : "Get Medical Consultation From Home"}
              </h1>
              <p className="text-lg text-on-surface-variant mb-8 max-w-xl leading-relaxed">
                {isRTL ? "تواصل مع أفضل الأطباء عبر مكالمة فيديو آمنة. احجز موعدك الآن واستشير طبيبك المفضل في دقائق." : "Connect with top doctors via secure video call. Book now and consult your favorite doctor in minutes."}
              </p>
              <div className={`flex flex-wrap gap-4 ${isRTL ? '' : 'flex-row-reverse justify-end'}`}>
                <Link href="/auth/register" className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-white font-bold rounded-xl hover:bg-primary-container transition-all shadow-xl shadow-primary/20">
                  <span className="material-symbols-outlined">video_call</span>
                  {isRTL ? "احجز استشارة أونلاين" : "Book Online Consultation"}
                </Link>
              </div>
            </div>
            <div className="relative order-1 lg:order-2">
              <div className="relative aspect-square lg:aspect-[4/5] rounded-[3rem] overflow-hidden shadow-2xl editorial-shadow bg-primary/10">
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[200px] text-primary/20">video_call</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 lg:py-32 bg-white">
        <div className="max-w-screen-2xl mx-auto px-6 lg:px-12">
          <div className={`text-center mb-16 ${isRTL ? '' : 'direction-ltr'}`}>
            <h2 className="text-3xl lg:text-5xl font-black text-on-background mb-4">{isRTL ? "مميزات الاستشارة الأونلاين" : "Online Consultation Features"}</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <div key={i} className="p-8 bg-surface-container-low/50 rounded-[2rem] hover:bg-primary hover:text-white transition-all duration-300 cursor-pointer group">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 group-hover:bg-white/20 flex items-center justify-center mb-6 transition-colors">
                  <span className="material-symbols-outlined text-primary group-hover:text-white text-3xl">{f.icon}</span>
                </div>
                <h3 className="text-xl font-bold mb-3">{f.title}</h3>
                <p className="text-sm text-on-surface-variant group-hover:text-white/80 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Steps */}
      <section id="steps" className="py-20 lg:py-32 bg-surface-container-low/30">
        <div className="max-w-screen-2xl mx-auto px-6 lg:px-12">
          <div className={`text-center mb-16 ${isRTL ? '' : 'direction-ltr'}`}>
            <h2 className="text-3xl lg:text-5xl font-black text-on-background">{isRTL ? "كيف تحجز استشارتك؟" : "How to Book Your Consultation?"}</h2>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            {steps.map((s, i) => (
              <div key={i} className={`text-center ${isRTL ? '' : 'direction-ltr'}`}>
                <div className="w-16 h-16 rounded-2xl bg-primary text-white flex items-center justify-center mx-auto mb-6 text-2xl font-black shadow-xl">{i + 1}</div>
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <span className="material-symbols-outlined text-primary text-xl">{s.icon}</span>
                </div>
                <h3 className="text-xl font-bold">{s.title}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Clinics */}
      <section className="py-20 lg:py-32 bg-white">
        <div className="max-w-screen-2xl mx-auto px-6 lg:px-12">
          <div className={`mb-12 ${isRTL ? 'text-right' : 'text-left'}`}>
            <h2 className="text-3xl lg:text-5xl font-black text-on-background mb-4">{isRTL ? "اختر عيادتك" : "Choose Your Clinic"}</h2>
          </div>
          <ClinicCarousel />
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 lg:py-32 px-6 lg:px-12">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-primary to-primary-container p-12 lg:p-20 rounded-[3rem] text-center text-white shadow-2xl">
            <h2 className="text-3xl lg:text-5xl font-black mb-6">{isRTL ? "جاهز لاستشارتك الأولى؟" : "Ready for Your First Consultation?"}</h2>
            <Link href="/auth/register" className="inline-flex items-center gap-2 px-10 py-5 bg-white text-primary font-bold text-lg rounded-2xl hover:scale-105 transition-transform shadow-xl">
              <span className="material-symbols-outlined">video_call</span>
              {isRTL ? "احجز استشارتك الآن" : "Book Your Consultation Now"}
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-outline-variant/10 bg-white">
        <div className="max-w-screen-2xl mx-auto px-6 lg:px-12">
          <div className={`flex flex-col md:flex-row justify-between items-center gap-8 ${isRTL ? '' : 'direction-ltr'}`}>
            <div className={isRTL ? 'text-right' : 'text-left'}>
              <span className="text-2xl font-black text-primary tracking-tighter">Smart Clinic</span>
              <p className="text-sm text-on-surface-variant mt-2">{isRTL ? "© 2024 سمارت كلينيك" : "© 2024 Smart Clinic"}</p>
            </div>
            <div className="flex gap-4">
              {["mail", "phone"].map((icon) => (
                <div key={icon} className="w-10 h-10 rounded-xl bg-surface-container-low flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-colors cursor-pointer">
                  <span className="material-symbols-outlined">{icon}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}

export default function Home() {
  return (
    <LanguageProvider>
      <HomeContent />
    </LanguageProvider>
  );
}

