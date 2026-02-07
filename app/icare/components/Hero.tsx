import React from 'react';
import { motion } from 'framer-motion';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Language, translations } from '../translations';

interface HeroProps {
  onNavigate: (page: string) => void;
  lang: Language;
}

export const Hero: React.FC<HeroProps> = ({ onNavigate, lang }) => {
  const t = translations[lang];
  return (
    <section className="px-4 md:px-8 pb-2 pt-2">
      <div className="relative h-[70vh] md:h-[80vh] w-full overflow-hidden rounded-[20px] md:rounded-[24px] shadow-sm bg-[#FFFFFF]">
        <ImageWithFallback 
          src="https://images.unsplash.com/photo-1593231945511-9e141a85b017?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiZWF1dGlmdWwlMjBjYXVjYXNpYW4lMjB3b21hbiUyMHNraW5jYXJlJTIwYWVzdGhldGljJTIwY3JlYW0lMjBiYWNrZ3JvdW5kJTIwbWluaW1hbHxlbnwxfHx8fDE3Njk3MDk2Njl8MA&ixlib=rb-4.1.0&q=80&w=1600" 
          alt="Beautiful woman skincare aesthetic" 
          className="w-full h-full object-cover object-center"
        />
        {/* Subtle overlay for text readability, keeping it minimal as per the aesthetic */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
        
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-16 md:pb-24 px-4 md:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <h1 className="text-[42px] md:text-[84px] font-brand leading-[0.85] text-white lowercase mb-8 md:mb-10 drop-shadow-sm">
              {lang === 'en' ? 'the barrier' : 'زبدة الحاجز'} <br /> {lang === 'en' ? 'butter.' : 'الواقي.'}
            </h1>
            
            <button 
              onClick={() => onNavigate('shop')}
              className="bg-white text-black px-10 md:px-12 py-4 md:py-5 rounded-full text-[11px] md:text-[12px] font-black uppercase tracking-[0.2em] hover:bg-[#F2F1ED] transition-all duration-300 shadow-xl"
            >
              {t.shopNow}
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
