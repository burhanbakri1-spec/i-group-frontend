import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Language, translations } from '../translations';

interface HeroProps {
  onNavigate: (page: string) => void;
  lang: Language;
}

export const Hero: React.FC<HeroProps> = ({ onNavigate, lang }) => {
  const t = translations[lang];
  const { scrollY } = useScroll();
  
  // Parallax effects
  const imageY = useTransform(scrollY, [0, 500], [0, 150]);
  const imageScale = useTransform(scrollY, [0, 500], [1, 1.15]);
  const contentY = useTransform(scrollY, [0, 500], [0, -50]);
  const contentOpacity = useTransform(scrollY, [0, 300], [1, 0]);
  
  return (
    <section className="px-4 md:px-8 pb-2 pt-2">
      <motion.div 
        className="relative h-[70vh] md:h-[80vh] w-full overflow-hidden rounded-[20px] md:rounded-[24px] shadow-sm bg-[#FFFFFF]"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Parallax Image */}
        <motion.div
          style={{ y: imageY, scale: imageScale }}
          className="absolute inset-0"
        >
          <ImageWithFallback 
            src="https://images.unsplash.com/photo-1593231945511-9e141a85b017?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiZWF1dGlmdWwlMjBjYXVjYXNpYW4lMjB3b21hbiUyMHNraW5jYXJlJTIwYWVzdGhldGljJTIwY3JlYW0lMjBiYWNrZ3JvdW5kJTIwbWluaW1hbHxlbnwxfHx8fDE3Njk3MDk2Njl8MA&ixlib=rb-4.1.0&q=80&w=1600" 
            alt="Beautiful woman skincare aesthetic" 
            className="w-full h-full object-cover object-center"
          />
        </motion.div>
        
        {/* Subtle overlay with enhanced gradient */}
        <motion.div 
          className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        />
        
        {/* Content with parallax */}
        <motion.div 
          className="absolute inset-0 flex flex-col items-center justify-end pb-16 md:pb-24 px-4 md:px-6 text-center"
          style={{ y: contentY, opacity: contentOpacity }}
        >
          <motion.div>
            {/* Title with reveal animation */}
            <div className="overflow-hidden mb-8 md:mb-10">
              <motion.h1 
                className="text-[42px] md:text-[84px] font-brand leading-[0.85] text-white lowercase drop-shadow-sm"
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ 
                  delay: 0.5, 
                  duration: 1, 
                  ease: [0.22, 1, 0.36, 1] 
                }}
              >
                {lang === 'en' ? 'the barrier' : 'زبدة الحاجز'} <br /> {lang === 'en' ? 'butter.' : 'الواقي.'}
              </motion.h1>
            </div>
            
            {/* CTA Button with enhanced animation */}
            <motion.button 
              onClick={() => onNavigate('shop')}
              className="bg-white text-black px-10 md:px-12 py-4 md:py-5 rounded-full text-[11px] md:text-[12px] font-black uppercase tracking-[0.2em] shadow-xl relative overflow-hidden group"
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ 
                delay: 0.8, 
                duration: 0.6, 
                ease: [0.22, 1, 0.36, 1] 
              }}
              whileHover={{ 
                scale: 1.05,
                boxShadow: "0 10px 30px rgba(0,0,0,0.2)"
              }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.span 
                className="absolute inset-0 bg-[#F2F1ED]"
                initial={{ x: "-100%" }}
                whileHover={{ x: 0 }}
                transition={{ duration: 0.3 }}
              />
              <span className="relative z-10">{t.shopNow}</span>
            </motion.button>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
};
