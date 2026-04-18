import Link from "next/link";
import Image from "next/image";
import { useTranslation } from "@/lib/i18n/useTranslation";

export default function StitchLandingPage() {
  const { t, language, isRTL, toggleLanguage } = useTranslation();

  return (
    <div className={`bg-surface text-on-surface font-body selection:bg-secondary-container selection:text-on-secondary-container ${isRTL ? 'font-cairo' : 'font-inter'}`} dir={isRTL ? "rtl" : "ltr"}>
      {/* Top Navigation Shell */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-[#091d2e]/80 backdrop-blur-xl border-b border-outline-variant/5 shadow-sm">
        <nav className="flex justify-between items-center w-full px-8 py-4 max-w-screen-2xl mx-auto">
          <div className={`flex items-center gap-12 ${isRTL ? 'flex-row' : 'flex-row-reverse'}`}>
            <span className="text-2xl font-black tracking-tighter bg-gradient-to-br from-primary to-primary-container bg-clip-text text-transparent uppercase">Smart Clinic</span>
            <div className={`hidden lg:flex items-center gap-8 font-headline font-bold text-xs uppercase tracking-widest`}>
              <Link className="text-primary border-b-2 border-primary pb-1" href="/">{t('nav.home')}</Link>
              <Link className="text-on-surface/50 hover:text-primary transition-colors" href="#about">{language === 'ar' ? 'عن الدكتور' : 'About'}</Link>
              <Link className="text-on-surface/50 hover:text-primary transition-colors" href="#services">{language === 'ar' ? 'الخدمات' : 'Services'}</Link>
              <Link className="text-on-surface/50 hover:text-primary transition-colors" href="#booking">{t('nav.bookAppointment')}</Link>
            </div>
          </div>
          <div className={`flex items-center gap-6 ${isRTL ? 'flex-row' : 'flex-row-reverse'}`}>
            <button 
              onClick={toggleLanguage}
              className="px-3 py-1.5 bg-surface-container-low rounded-lg text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary hover:text-white transition-all border border-primary/10"
            >
              {language === 'ar' ? 'English' : 'العربية'}
            </button>
            <Link href="/auth/login" className="hidden md:block px-4 py-2 text-xs font-black uppercase tracking-widest text-on-surface/60 hover:text-primary transition-all">{t('auth.login')}</Link>
            <Link href="/auth/register" className="bg-primary text-white px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all">
              {t('landing.ctaBook')}
            </Link>
          </div>
        </nav>
      </header>

      <main className="pt-20">
        {/* Hero Section */}
        <section className={`relative min-h-[85vh] flex items-center overflow-hidden bg-surface-container-low/30`}>
          <div className={`max-w-screen-2xl mx-auto px-8 w-full grid lg:grid-cols-2 gap-16 items-center py-24 ${isRTL ? '' : 'direction-ltr'}`}>
            <div className={`z-10 ${isRTL ? 'order-1 text-right' : 'order-1 text-left'}`}>
              <span className="inline-block px-4 py-1.5 bg-secondary/10 text-secondary rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-6">
                {isRTL ? 'رعاية طبية ذكية' : 'Smart Medical Care'}
              </span>
              <h1 className="font-headline text-5xl lg:text-7xl font-black text-on-background leading-[1.1] mb-8 uppercase tracking-tighter">
                {t('landing.heroTitle')}
              </h1>
              <p className="text-lg text-on-surface-variant/80 mb-12 max-w-xl leading-relaxed font-medium">
                {t('landing.heroSubtitle')}
              </p>
              <div className={`flex flex-col sm:flex-row gap-4 items-start ${isRTL ? '' : 'sm:flex-row-reverse sm:justify-end'}`}>
                <Link href="/auth/register" className="group relative px-10 py-5 bg-primary text-white font-black rounded-2xl shadow-2xl shadow-primary/30 transition-all hover:shadow-primary/40 hover:-translate-y-1 uppercase text-xs tracking-widest">
                  {t('landing.ctaBook')}
                  <span className={`absolute -top-1 ${isRTL ? '-right-1' : '-left-1'} w-3 h-3 bg-secondary rounded-full animate-ping`}></span>
                </Link>
                <button className="px-10 py-5 bg-white border border-outline-variant/10 text-on-surface/60 font-black rounded-2xl flex items-center gap-3 hover:bg-surface-container-low transition-all uppercase text-xs tracking-widest shadow-sm">
                  <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>play_circle</span>
                  {t('landing.ctaLearnMore')}
                </button>
              </div>
            </div>
            <div className="relative order-2">
              <div className="relative w-full aspect-[4/5] lg:h-[650px] rounded-[3rem] overflow-hidden shadow-2xl border-8 border-white">
                <Image 
                  alt="Professional doctor" 
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-1000" 
                  src="/images/stitch/landing-hero-doctor.png" 
                />
              </div>
              {/* Floating Stats Card */}
              <div className={`absolute -bottom-8 ${isRTL ? '-right-8' : '-left-8'} bg-white/90 backdrop-blur-xl p-8 rounded-[2rem] shadow-2xl border border-outline-variant/5 max-w-[240px]`}>
                <div className={`flex items-center gap-4 mb-4 ${isRTL ? 'flex-row' : 'flex-row-reverse'}`}>
                  <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-secondary text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
                  </div>
                  <span className="font-black text-3xl text-on-background tabular-nums">98%</span>
                </div>
                <p className="text-[10px] text-on-surface-variant font-black uppercase tracking-widest leading-relaxed">
                  {isRTL ? 'نسبة رضا المرضى عن خدماتنا الرقمية' : 'Patient satisfaction with digital services'}
                </p>
              </div>
            </div>
          </div>
          {/* Decorative Elements */}
          <div className={`absolute top-0 ${isRTL ? 'right-0' : 'left-0'} w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] -z-10`}></div>
          <div className={`absolute bottom-0 ${isRTL ? 'left-0' : 'right-0'} w-[400px] h-[400px] bg-secondary/5 rounded-full blur-[100px] -z-10`}></div>
        </section>

        {/* About Doctor Section */}
        <section className="py-32 bg-white" id="about">
          <div className={`max-w-screen-2xl mx-auto px-8 grid lg:grid-cols-12 gap-20 items-center ${isRTL ? '' : 'direction-ltr'}`}>
            <div className="lg:col-span-5 relative order-2 lg:order-1">
              <div className="rounded-[3rem] overflow-hidden aspect-[4/5] shadow-2xl bg-surface-container-high border-4 border-surface-container-low relative">
                <Image 
                  alt="Doctor Ahmad Ali" 
                  fill
                  className="object-cover transition-all duration-1000 scale-105 hover:scale-100" 
                  src="/images/stitch/dr-portrait.png" 
                />
              </div>
              <div className={`absolute -bottom-10 ${isRTL ? 'left-10' : 'right-10'} bg-on-surface text-white p-10 rounded-[2rem] shadow-2xl`}>
                <span className="block text-[10px] font-black uppercase tracking-[0.3em] opacity-60 mb-2">{t('landing.aboutDoctor.experience') || 'Experience'}</span>
                <span className="text-4xl font-black tabular-nums">+15 {isRTL ? 'سنة' : 'Yrs'}</span>
              </div>
            </div>
            <div className={`lg:col-span-7 order-1 lg:order-2 ${isRTL ? 'text-right' : 'text-left'}`}>
              <span className="inline-block px-4 py-2 bg-primary/5 text-primary rounded-xl text-[10px] font-black uppercase tracking-widest mb-6">
                {isRTL ? 'استشاري العظام' : 'Orthopedic Consultant'}
              </span>
              <h2 className="text-5xl font-black text-on-background mb-8 leading-[1.2] uppercase tracking-tight">
                {t('landing.aboutDoctor.title')}<br/>
                <span className="text-primary/40">{t('landing.aboutDoctor.specialty')}</span>
              </h2>
              <p className="text-xl text-on-surface-variant font-medium leading-relaxed mb-10 max-w-2xl">
                {t('landing.aboutDoctor.bio')}
              </p>
              <div className={`grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12`}>
                <div className={`p-6 bg-surface-container-low/50 rounded-2xl border border-outline-variant/10 ${isRTL ? 'text-right' : 'text-left'}`}>
                  <span className="material-symbols-outlined text-primary mb-4 text-3xl">school</span>
                  <p className="text-sm font-black text-on-background uppercase tracking-tight">{t('landing.aboutDoctor.education')}</p>
                </div>
                <div className={`p-6 bg-surface-container-low/50 rounded-2xl border border-outline-variant/10 ${isRTL ? 'text-right' : 'text-left'}`}>
                  <span className="material-symbols-outlined text-secondary mb-4 text-3xl">workspace_premium</span>
                  <p className="text-sm font-black text-on-background uppercase tracking-tight">{t('landing.aboutDoctor.award')}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Services Bento Grid */}
        <section className="py-32 bg-surface-container-low/20" id="services">
          <div className="max-w-screen-2xl mx-auto px-8">
            <div className="text-center mb-20">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/40 mb-4 block">{isRTL ? 'خبراتنا' : 'Expertise'}</span>
              <h2 className="text-5xl font-black text-on-background mb-6 uppercase tracking-tight">{t('landing.servicesTitle')}</h2>
              <p className="text-on-surface-variant font-medium max-w-2xl mx-auto text-lg leading-relaxed">{t('landing.servicesSubtitle')}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {Object.entries({
                online: { icon: 'videocam', color: 'primary' },
                followup: { icon: 'history', color: 'secondary' },
                prescription: { icon: 'prescriptions', color: 'tertiary' },
                instant: { icon: 'bolt', color: 'on-surface' }
              }).map(([key, config]) => (
                <div key={key} className={`group bg-white p-10 rounded-[3rem] shadow-xl border border-outline-variant/10 transition-all hover:-translate-y-3 hover:bg-on-surface hover:text-white cursor-pointer ${isRTL ? 'text-right' : 'text-left'}`}>
                  <div className={`w-16 h-16 rounded-2xl bg-surface-container-low group-hover:bg-white/20 flex items-center justify-center mb-8 transition-all duration-500`}>
                    <span className={`material-symbols-outlined text-${config.color} group-hover:text-white text-4xl`}>{config.icon}</span>
                  </div>
                  <h3 className="text-2xl font-black mb-4 uppercase tracking-tighter">{t(`landing.services.${key}.title`)}</h3>
                  <p className="text-sm opacity-60 leading-relaxed font-medium mb-8">{t(`landing.services.${key}.desc`)}</p>
                  <span className={`material-symbols-outlined text-2xl opacity-20 group-hover:opacity-100 transition-all ${isRTL ? '' : 'rotate-180'}`}>arrow_back</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Journey Center */}
        <section className="py-32 bg-white">
          <div className="max-w-screen-2xl mx-auto px-8">
            <div className={`flex flex-col md:flex-row justify-between items-end mb-24 gap-8 ${isRTL ? 'text-right' : 'text-left lg:flex-row-reverse'}`}>
              <div className="max-w-xl">
                <span className="text-secondary font-black tracking-[0.3em] text-[10px] uppercase mb-4 block">{isRTL ? 'الرحلة العلاجية' : 'The Experience'}</span>
                <h2 className="text-5xl font-black text-on-background uppercase tracking-tight leading-tight">{t('landing.journey.title')}</h2>
              </div>
              <p className="text-on-surface-variant font-medium max-w-sm text-lg leading-relaxed">{isRTL ? 'أربع خطوات بسيطة تفصلك عن الرعاية الطبية' : 'Four simple steps to premium care'}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 relative">
              {[1,2,3,4].map(step => (
                <div key={step} className={`group relative ${isRTL ? 'text-right' : 'text-left'}`}>
                  <div className="w-20 h-20 rounded-[2rem] bg-surface-container-low text-primary flex items-center justify-center text-4xl font-black mb-10 transition-all duration-500 group-hover:bg-primary group-hover:text-white group-hover:scale-110 shadow-sm">
                    {step}
                  </div>
                  <h4 className="text-2xl font-black mb-4 uppercase tracking-tighter">{t(`landing.journey.step${step}`)}</h4>
                </div>
              ))}
              <div className="absolute top-10 left-0 w-full h-[2px] bg-surface-container-low -z-10 hidden lg:block"></div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-32 px-8" id="booking">
          <div className="max-w-screen-xl mx-auto">
            <div className="bg-primary p-16 md:p-32 rounded-[4rem] text-center text-white relative overflow-hidden shadow-2xl shadow-primary/20">
              <div className="relative z-10">
                <h2 className="text-5xl md:text-7xl font-black mb-10 leading-tight tracking-tighter uppercase">{isRTL ? 'جاهز لبدء رحلتك الصحية؟' : 'Ready to Start Your Health Journey?'}</h2>
                <Link href="/auth/register" className="inline-block px-12 py-6 bg-white text-primary font-black text-xl rounded-2xl hover:scale-105 transition-all shadow-3xl uppercase tracking-widest">
                  {isRTL ? 'احجز أول موعد الآن' : 'Book Your First Visit'}
                </Link>
              </div>
              <div className="absolute -top-32 -right-32 w-96 h-96 bg-white/5 rounded-full blur-[100px]"></div>
              <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-secondary/10 rounded-full blur-[100px]"></div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full py-16 border-t border-outline-variant/10 bg-surface-bright">
        <div className={`flex flex-col md:flex-row justify-between items-center px-12 gap-10 max-w-screen-2xl mx-auto ${isRTL ? '' : 'direction-ltr'}`}>
          <div className={`flex flex-col gap-4 ${isRTL ? 'text-right' : 'text-left'}`}>
            <span className="text-3xl font-black text-primary tracking-tighter uppercase">Smart Clinic</span>
            <p className="text-xs font-black text-on-surface/40 uppercase tracking-widest">© 2024 Smart Clinic. All Rights Reserved.</p>
          </div>
          <div className="flex gap-12 text-[10px] font-black uppercase tracking-[0.2em] text-on-surface/50">
            <Link className="hover:text-primary transition-colors" href="#">Privacy Policy</Link>
            <Link className="hover:text-primary transition-colors" href="#">Terms</Link>
          </div>
          <div className="flex gap-6">
            <div className="w-12 h-12 rounded-xl bg-surface-container-low flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all cursor-pointer shadow-sm">
              <span className="material-symbols-outlined text-2xl">mail</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
