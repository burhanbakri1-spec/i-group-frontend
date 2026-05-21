import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Language } from '../translations';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useSiteContent } from '../hooks/useSiteContent';

interface ContactPageProps {
  lang: Language;
}

export const ContactPage: React.FC<ContactPageProps> = ({ lang }) => {
  const router = useRouter();
  const isEn = lang === 'en';
  const {
    contactHeroHeading,
    contactHeroImage,
    contactInfoTitle,
    contactSupportInfo,
    contactEmail,
    contactEmailLabel,
    contactWholesaleEmail,
    contactWholesaleLabel,
    contactFaqTitle,
    contactFaqText,
    contactFaqCta,
  } = useSiteContent();

  return (
    <div className="min-h-screen bg-[#F1F0ED] pb-32">
      {/* Hero Banner - More minimal and cleaner */}
      <section className="relative w-full h-[35vh] md:h-[50vh] overflow-hidden bg-[#F8F7F4]">
        <ImageWithFallback 
          src={contactHeroImage || "https://images.unsplash.com/photo-1729952620303-4dc47fb5d93a?q=80&w=2000"} 
          alt="Contact Hero" 
          className="w-full h-full object-cover opacity-90"
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <h1 className="text-[48px] md:text-[84px] font-black lowercase tracking-tighter leading-none text-white drop-shadow-sm">
              {isEn ? contactHeroHeading : 'ابقي على تواصل'}
            </h1>
            <p className="text-[10px] md:text-[12px] font-black uppercase tracking-[0.4em] text-white/90">
              {isEn ? 'customer experience' : 'تجربة العملاء'}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Content Layout */}
      <div className="max-w-[1200px] mx-auto px-4 md:px-12 -mt-20 md:-mt-32 relative z-10 pb-20">
        <div className="max-w-[600px] mx-auto space-y-12">
          
          {/* Info & Guidelines */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8 md:space-y-16 pt-8 md:pt-24"
          >
            <div className="space-y-4 md:space-y-6 px-2 md:px-0">
              <h2 className="text-[28px] md:text-[42px] font-bold lowercase tracking-tight text-[#67645E] leading-tight">
                {isEn ? contactInfoTitle : "نحن هنا للمساعدة."}
              </h2>
              <div className="space-y-4 md:space-y-6 text-[13px] md:text-[16px] text-[#5C5A56] leading-relaxed font-medium">
                <p className="opacity-80">
                  {isEn 
                    ? contactSupportInfo
                    : "فريق تجربة العملاء متاح من الاثنين إلى الجمعة، من 9 صباحاً حتى 5 مساءً. نهدف للرد على جميع الاستفسارات خلال 24-48 ساعة عمل."}
                </p>
                <div className="pt-4 md:pt-6 border-t border-black/5 space-y-4 md:space-y-6">
                  <div>
                    <span className="block text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-black/40 mb-1">{contactEmailLabel}</span>
                    <a href={`mailto:${contactEmail}`} className="text-[14px] md:text-[18px] text-black font-black hover:opacity-50 transition-opacity lowercase">{contactEmail}</a>
                  </div>
                  <div>
                    <span className="block text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-black/40 mb-1">{contactWholesaleLabel}</span>
                    <a href={`mailto:${contactWholesaleEmail}`} className="text-[14px] md:text-[18px] text-black font-black hover:opacity-50 transition-opacity lowercase">{contactWholesaleEmail}</a>
                  </div>
                </div>
              </div>
            </div>

            {/* FAQ Link */}
            <div className="bg-[#F2F1ED] p-6 md:p-10 rounded-[24px] md:rounded-[40px] space-y-4 border border-black/[0.03]">
              <h3 className="text-[9px] md:text-[11px] font-black uppercase tracking-[0.2em]">{contactFaqTitle}</h3>
              <p className="text-[12px] md:text-[14px] text-[#5C5A56] leading-relaxed opacity-70">
                {isEn ? contactFaqText : "على الأرجح، تمت الإجابة على سؤالك بالفعل."}
              </p>
              <button
                onClick={() => router.push('/icare/faq')}
                className="text-[10px] md:text-[12px] font-black uppercase tracking-[0.2em] border-b-2 border-black pb-1 hover:opacity-50 transition-all inline-block"
              >
                {isEn ? contactFaqCta : "زيارة الأسئلة الشائعة"}
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
