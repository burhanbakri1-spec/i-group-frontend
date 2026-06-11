import React from 'react';
import { motion } from 'motion/react';
import { Language, translations } from '../translations';

interface PolicyPageProps {
  lang: Language;
}

export const PrivacyPolicy: React.FC<PolicyPageProps> = ({ lang }) => {
  const t = translations[lang];
  
  return (
    <div className="min-h-screen bg-[#F1F0ED] pt-32 pb-24 px-6 md:px-12 max-w-[800px] mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        <h1 className="text-[24px] md:text-[32px] font-black uppercase tracking-tight">
          {t.legal.privacyPolicy.title}
        </h1>
        
        <div className="prose prose-sm max-w-none text-[#5C5B57] space-y-6 leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-[14px] font-bold text-black uppercase tracking-wider">
              {t.legal.privacyPolicy.section1Title}
            </h2>
            <p className="text-[14px]">
              {t.legal.privacyPolicy.section1Body}
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-[14px] font-bold text-black uppercase tracking-wider">
              {t.legal.privacyPolicy.section2Title}
            </h2>
            <p className="text-[14px]">
              {t.legal.privacyPolicy.section2Body}
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-[14px] font-bold text-black uppercase tracking-wider">
              {t.legal.privacyPolicy.section3Title}
            </h2>
            <p className="text-[14px]">
              {t.legal.privacyPolicy.section3Body}
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-[14px] font-bold text-black uppercase tracking-wider">
              {t.legal.privacyPolicy.section4Title}
            </h2>
            <p className="text-[14px]">
              {t.legal.privacyPolicy.section4Body}
            </p>
          </section>
        </div>
      </motion.div>
    </div>
  );
};

export const TermsOfService: React.FC<PolicyPageProps> = ({ lang }) => {
  const t = translations[lang];
  
  return (
    <div className="min-h-screen bg-[#F1F0ED] pt-32 pb-24 px-6 md:px-12 max-w-[800px] mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        <h1 className="text-[24px] md:text-[32px] font-black uppercase tracking-tight">
          {t.legal.termsOfService.title}
        </h1>
        
        <div className="prose prose-sm max-w-none text-[#5C5B57] space-y-6 leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-[14px] font-bold text-black uppercase tracking-wider">
              {t.legal.termsOfService.section1Title}
            </h2>
            <p className="text-[14px]">
              {t.legal.termsOfService.section1Body}
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-[14px] font-bold text-black uppercase tracking-wider">
              {t.legal.termsOfService.section2Title}
            </h2>
            <p className="text-[14px]">
              {t.legal.termsOfService.section2Body}
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-[14px] font-bold text-black uppercase tracking-wider">
              {t.legal.termsOfService.section3Title}
            </h2>
            <p className="text-[14px]">
              {t.legal.termsOfService.section3Body}
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-[14px] font-bold text-black uppercase tracking-wider">
              {t.legal.termsOfService.section4Title}
            </h2>
            <p className="text-[14px]">
              {t.legal.termsOfService.section4Body}
            </p>
          </section>
        </div>
      </motion.div>
    </div>
  );
};

export const AccessibilityStatement: React.FC<PolicyPageProps> = ({ lang }) => {
  const t = translations[lang];
  
  return (
    <div className="min-h-screen bg-[#F1F0ED] pt-32 pb-24 px-6 md:px-12 max-w-[800px] mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        <h1 className="text-[24px] md:text-[32px] font-black uppercase tracking-tight">
          {t.legal.accessibility.title}
        </h1>
        
        <div className="prose prose-sm max-w-none text-[#5C5B57] space-y-6 leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-[14px] font-bold text-black uppercase tracking-wider">
              {t.legal.accessibility.commitmentTitle}
            </h2>
            <p className="text-[14px]">
              {t.legal.accessibility.commitmentBody}
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-[14px] font-bold text-black uppercase tracking-wider">
              {t.legal.accessibility.conformanceTitle}
            </h2>
            <p className="text-[14px]">
              {t.legal.accessibility.conformanceBody}
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-[14px] font-bold text-black uppercase tracking-wider">
              {t.legal.accessibility.feedbackTitle}
            </h2>
            <p className="text-[14px]">
              {t.legal.accessibility.feedbackBody}
            </p>
          </section>
        </div>
      </motion.div>
    </div>
  );
};
