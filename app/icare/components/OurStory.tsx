import React from 'react';
import { motion } from 'motion/react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { ScrollReveal, StaggerContainer } from './ui/ScrollReveal';
import { Language, translations } from '../translations';

interface OurStoryProps {
  lang: Language;
}

export const OurStory: React.FC<OurStoryProps> = ({ lang }) => {
  const t = translations[lang];
  return (
    <div className="pt-24 min-h-screen bg-[#F2F0EA]">
      {/* Hero Section */}
      <section className="px-6 py-20 max-w-[1200px] mx-auto text-center">
        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-[12vw] md:text-[8vw] leading-none font-bold tracking-tighter text-[#67645E] lowercase mb-12"
        >
          {t.ourStoryTitle}
        </motion.h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <motion.div 
             initial={{ opacity: 0, scale: 0.9 }}
             animate={{ opacity: 1, scale: 1 }}
             transition={{ delay: 0.2 }}
             className="aspect-[4/5] rounded-[32px] overflow-hidden shadow-xl"
          >
            <ImageWithFallback 
              src="https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=800" 
              alt={t.aboutAltTexture}
              className="w-full h-full object-cover"
            />
          </motion.div>
          <div className="text-left space-y-6">
            <h2 className="text-2xl font-bold tracking-tight uppercase">{t.ourStoryIntentionalTitle}</h2>
            <p className="text-[16px] leading-relaxed text-[#84827E] font-medium">
              {t.ourStoryP1}
            </p>
            <p className="text-[16px] leading-relaxed text-[#84827E] font-medium">
              {t.ourStoryP2}
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-white py-24 px-6">
        <StaggerContainer className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-12" staggerDelay={0.1} viewportMargin="-60px">
          <ScrollReveal direction="bottom" delay={0}>
            <div className="space-y-4">
              <h3 className="font-black tracking-widest text-[12px] uppercase">{t.ourStoryCuratedTitle}</h3>
              <p className="text-[14px] text-[#84827E] leading-relaxed">{t.ourStoryCuratedText}</p>
            </div>
          </ScrollReveal>
          <ScrollReveal direction="bottom" delay={0.1}>
            <div className="space-y-4">
              <h3 className="font-black tracking-widest text-[12px] uppercase">{t.ourStoryEffectiveTitle}</h3>
              <p className="text-[14px] text-[#84827E] leading-relaxed">{t.ourStoryEffectiveText}</p>
            </div>
          </ScrollReveal>
          <ScrollReveal direction="bottom" delay={0.2}>
            <div className="space-y-4">
              <h3 className="font-black tracking-widest text-[12px] uppercase">{t.ourStoryMindfulTitle}</h3>
              <p className="text-[14px] text-[#84827E] leading-relaxed">{t.ourStoryMindfulText}</p>
            </div>
          </ScrollReveal>
        </StaggerContainer>
      </section>
    </div>
  );
};
