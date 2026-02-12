import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Language } from '../translations';

interface SocialGridProps {
  lang: Language;
}

const lifestyleImages = [
  {
    id: 1,
    src: "https://images.unsplash.com/photo-1679517354322-20fe85050b9d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
    alt: "icare lifestyle 1"
  },
  {
    id: 2,
    src: "https://images.unsplash.com/photo-1739980737820-b6bb1a9b8456?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
    alt: "icare lifestyle 2"
  },
  {
    id: 3,
    src: "https://images.unsplash.com/photo-1635631414456-6a9dc5051a3d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
    alt: "icare lifestyle 3"
  },
  {
    id: 4,
    src: "https://images.unsplash.com/photo-1627384113972-f4c0392fe5aa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
    alt: "icare lifestyle 4"
  }
];

export const SocialGrid: React.FC<SocialGridProps> = ({ lang }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth / 2 : scrollLeft + clientWidth / 2;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  return (
    <section className="px-4 md:px-6 py-2 md:py-4 bg-white">
      <div className="max-w-[1600px] mx-auto bg-[#F2F2F0] rounded-[16px] p-6 md:p-10 relative overflow-hidden">
        
        {/* Header Area */}
        <div className="flex justify-between items-center mb-6 md:mb-8">
          <motion.h2 
            className="text-[28px] md:text-[36px] font-[900] tracking-tight text-[#222] lowercase"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            icare + you
          </motion.h2>
          <motion.button 
            className="hidden md:block border border-[#222]/20 rounded-full px-8 py-2 text-[10px] font-bold tracking-[0.1em] uppercase text-[#222] hover:bg-[#222] hover:text-white transition-all duration-300 relative overflow-hidden group"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.span
              className="absolute inset-0 bg-[#222]"
              initial={{ x: "-100%" }}
              whileHover={{ x: 0 }}
              transition={{ duration: 0.3 }}
            />
            <span className="relative z-10">{lang === 'en' ? 'FIND US ON SOCIAL' : 'تابعنا على السوشيال'}</span>
          </motion.button>
        </div>

        {/* Horizontal Scrollable Grid */}
        <div 
          ref={scrollRef}
          className="flex gap-4 md:gap-5 overflow-x-auto no-scrollbar pb-6 snap-x snap-mandatory"
        >
          {lifestyleImages.map((image, index) => (
            <motion.div 
              key={image.id}
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ 
                delay: index * 0.1, 
                duration: 0.6,
                ease: [0.22, 1, 0.36, 1]
              }}
              whileHover={{ 
                y: -10, 
                scale: 1.05,
                boxShadow: "0 20px 40px rgba(0,0,0,0.15)"
              }}
              className="flex-none w-[70%] md:w-[240px] lg:w-[280px] aspect-square rounded-[16px] overflow-hidden snap-start group"
            >
              <motion.div
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.5 }}
                className="w-full h-full"
              >
                <ImageWithFallback 
                  src={image.src} 
                  alt={image.alt}
                  className="w-full h-full object-cover"
                />
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* Footer Navigation Area */}
        <div className="mt-2 pt-6 border-t border-[#222]/5 flex justify-between items-center">
          {/* Progress Line */}
          <div className="flex-1 h-[1px] bg-[#222]/10 relative mr-10">
            <motion.div 
              className="absolute left-0 top-0 h-full bg-[#222] w-1/4"
              initial={{ width: "25%" }}
            />
          </div>

          {/* Navigation Controls */}
          <div className="flex gap-3">
            <motion.button 
              onClick={() => scroll('left')}
              className="w-12 h-12 rounded-full border border-[#222]/10 flex items-center justify-center text-[#222]"
              whileHover={{ 
                scale: 1.1,
                backgroundColor: "rgba(255,255,255,1)",
                boxShadow: "0 5px 15px rgba(0,0,0,0.1)"
              }}
              whileTap={{ scale: 0.9 }}
            >
              <motion.div
                whileHover={{ x: -2 }}
                transition={{ duration: 0.2 }}
              >
                <ArrowLeft size={20} strokeWidth={1.5} />
              </motion.div>
            </motion.button>
            <motion.button 
              onClick={() => scroll('right')}
              className="w-12 h-12 rounded-full border border-[#222]/10 flex items-center justify-center text-[#222]"
              whileHover={{ 
                scale: 1.1,
                backgroundColor: "rgba(255,255,255,1)",
                boxShadow: "0 5px 15px rgba(0,0,0,0.1)"
              }}
              whileTap={{ scale: 0.9 }}
            >
              <motion.div
                whileHover={{ x: 2 }}
                transition={{ duration: 0.2 }}
              >
                <ArrowRight size={20} strokeWidth={1.5} />
              </motion.div>
            </motion.button>
          </div>
        </div>

        {/* Mobile Social Button */}
        <button className="md:hidden w-full mt-8 border border-[#222]/20 rounded-full py-4 text-[10px] font-bold tracking-[0.1em] uppercase text-[#222]">
          {lang === 'en' ? 'FIND US ON SOCIAL' : 'تابعنا على السوشيال'}
        </button>
      </div>
    </section>
  );
};
