import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Language } from '../translations';
import { ChevronDown } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useSiteContent } from '../hooks/useSiteContent';

interface ContactPageProps {
  lang: Language;
}

export const ContactPage: React.FC<ContactPageProps> = ({ lang }) => {
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
    contactFormNameLabel,
    contactFormEmailLabel,
    contactFormTopicLabel,
    contactFormTopicPlaceholder,
    contactFormOptionOrder,
    contactFormOptionProduct,
    contactFormOptionPress,
    contactFormMessageLabel,
    contactFormSubmit,
  } = useSiteContent();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    reason: '',
    topic: '',
    details: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
  };

  return (
    <div className="min-h-screen bg-white pb-32">
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
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-16 items-start">
          
          {/* Left Side: Info & Guidelines */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="md:col-span-5 space-y-8 md:space-y-16 pt-8 md:pt-24 order-2 md:order-1"
          >
            <div className="space-y-4 md:space-y-6 px-2 md:px-0">
              <h2 className="text-[28px] md:text-[42px] font-black lowercase tracking-tight text-[#222] leading-tight">
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

            {/* Social / Extra Info */}
            <div className="bg-[#F2F1ED] p-6 md:p-10 rounded-[24px] md:rounded-[40px] space-y-4 border border-black/[0.03]">
              <h3 className="text-[9px] md:text-[11px] font-black uppercase tracking-[0.2em]">{contactFaqTitle}</h3>
              <p className="text-[12px] md:text-[14px] text-[#5C5A56] leading-relaxed opacity-70">
                {isEn ? contactFaqText : "على الأرجح، تمت الإجابة على سؤالك بالفعل."}
              </p>
              <button className="text-[10px] md:text-[12px] font-black uppercase tracking-[0.2em] border-b-2 border-black pb-1 hover:opacity-50 transition-all inline-block">
                {isEn ? contactFaqCta : "زيارة الأسئلة الشائعة"}
              </button>
            </div>
          </motion.div>

          {/* Right Side: Professional Form */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:col-span-7 bg-white p-6 md:p-16 rounded-[32px] md:rounded-[48px] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.12)] border border-black/5 order-1 md:order-2"
          >
            <form onSubmit={handleSubmit} className="space-y-6 md:space-y-10">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-8">
                <div className="space-y-1.5 md:space-y-3">
                  <label className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-black/30 ml-4">{isEn ? contactFormNameLabel : "الاسم الكامل"}</label>
                  <input
                    type="text"
                    required
                    className="w-full bg-[#F8F7F4] rounded-full px-5 md:px-8 py-3.5 md:py-5 text-[13px] md:text-[15px] font-bold outline-none focus:bg-white focus:ring-2 ring-black/5 transition-all placeholder:opacity-30"
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div className="space-y-1.5 md:space-y-3">
                  <label className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-black/30 ml-4">{isEn ? contactFormEmailLabel : "البريد الإلكتروني"}</label>
                  <input
                    type="email"
                    required
                    className="w-full bg-[#F8F7F4] rounded-full px-5 md:px-8 py-3.5 md:py-5 text-[13px] md:text-[15px] font-bold outline-none focus:bg-white focus:ring-2 ring-black/5 transition-all"
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-1.5 md:space-y-3">
                <label className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-black/30 ml-4">{isEn ? contactFormTopicLabel : "بماذا تفكرين؟"}</label>
                <div className="relative">
                  <select
                    required
                    className="w-full bg-[#F8F7F4] rounded-full px-5 md:px-8 py-3.5 md:py-5 text-[13px] md:text-[15px] font-bold outline-none appearance-none cursor-pointer focus:bg-white transition-all text-black/60"
                    onChange={(e) => setFormData({...formData, reason: e.target.value})}
                  >
                    <option value="" disabled selected>{isEn ? contactFormTopicPlaceholder : "اختر موضوعاً"}</option>
                    <option value="order">{isEn ? contactFormOptionOrder : "حالة الطلب"}</option>
                    <option value="product">{isEn ? contactFormOptionProduct : "استفسار عن منتج"}</option>
                    <option value="press">{isEn ? contactFormOptionPress : "الصحافة والإعلام"}</option>
                  </select>
                  <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-black/20 pointer-events-none" size={16} />
                </div>
              </div>

              <div className="space-y-1.5 md:space-y-3">
                <label className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-black/30 ml-4">{isEn ? contactFormMessageLabel : "الرسالة"}</label>
                <textarea
                  required
                  rows={4}
                  className="w-full bg-[#F8F7F4] rounded-[24px] md:rounded-[32px] px-5 md:px-8 py-4 md:py-6 text-[13px] md:text-[15px] font-bold outline-none focus:bg-white focus:ring-2 ring-black/5 transition-all resize-none"
                  onChange={(e) => setFormData({...formData, details: e.target.value})}
                />
              </div>

              <div className="pt-2 md:pt-4">
                <button
                  type="submit"
                  className="w-full bg-black text-white rounded-full py-4 md:py-6 text-[10px] md:text-[12px] font-black uppercase tracking-[0.3em] hover:opacity-80 transition-all shadow-xl shadow-black/10 active:scale-[0.98]"
                >
                  {isEn ? contactFormSubmit : 'إرسال الاستفسار'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
