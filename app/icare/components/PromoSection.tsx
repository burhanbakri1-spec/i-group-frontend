import React from 'react';
import { motion } from 'framer-motion';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Language } from '../translations';

interface PromoSectionProps {
  lang: Language;
}

export const PromoSection: React.FC<PromoSectionProps> = ({ lang }) => {
  return (
    <section className="px-4 md:px-6 py-4 md:py-8 bg-white">
      {/* Outer Container with reduced rounding */}
      <div className="max-w-[1600px] mx-auto grid grid-cols-1 md:grid-cols-2 overflow-hidden rounded-[16px] md:rounded-[24px] bg-[#F2F2F0]">
        
        {/* Left Side: Content Section */}
        <div className="flex flex-col justify-center p-10 md:p-24 min-h-[450px] md:min-h-[750px]">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-md"
          >
            {/* Tagline or Category */}
            <motion.span 
              className="text-[10px] md:text-[12px] font-bold tracking-[0.3em] uppercase text-[#777] mb-6 block"
              initial={{ opacity: 0, y: -10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              {lang === 'en' ? 'New Arrival' : 'وصول جديد'}
            </motion.span>
            
            {/* Main Title - Lowercase and Bold */}
            <div className="overflow-hidden mb-8">
              <motion.h2 
                className="text-[42px] md:text-[64px] font-[900] leading-[0.95] tracking-[-0.04em] text-[#222] lowercase"
                initial={{ y: 100, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ 
                  delay: 0.1, 
                  duration: 0.8, 
                  ease: [0.22, 1, 0.36, 1] 
                }}
              >
                {lang === 'en' ? (
                  <>chilly little <br /> flush</>
                ) : (
                  <>احمرار <br /> صغير بارد</>
                )}
              </motion.h2>
            </div>
            
            {/* Description */}
            <motion.p 
              className="text-[15px] md:text-[18px] leading-relaxed text-[#555] font-medium mb-12 max-w-[90%]"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.25, duration: 0.6 }}
            >
              {lang === 'en' 
                ? 'Warm up your cheeks with Pocket Blush. A touch of creamy, long-wearing color that mimics the flush you get after stepping in from the cold.'
                : 'دفئي خديك مع Pocket Blush. لمسة من اللون الكريمي طويل الأمد الذي يحاكي الاحمرار الذي تحصلين عليه بعد الدخول من البرد.'
              }
            </motion.p>
            
            {/* Button Styling */}
            <div className="flex flex-wrap gap-4">
              <motion.button 
                className="border-2 border-[#222] rounded-full px-12 py-4 text-[11px] font-[900] tracking-[0.15em] uppercase text-[#222] hover:bg-[#222] hover:text-white transition-all duration-500 cursor-pointer relative overflow-hidden group"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4, duration: 0.6 }}
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: "0 10px 30px rgba(0,0,0,0.1)"
                }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.span
                  className="absolute inset-0 bg-[#222]"
                  initial={{ x: "-100%" }}
                  whileHover={{ x: 0 }}
                  transition={{ duration: 0.5 }}
                />
                <span className="relative z-10 group-hover:text-white">
                  {lang === 'en' ? 'POCKET BLUSH' : 'بوكيت بلاش'}
                </span>
              </motion.button>
            </div>
          </motion.div>
        </div>

        {/* Right Side: Visual Section */}
        <motion.div 
          className="relative aspect-square md:aspect-auto h-full overflow-hidden group"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            initial={{ scale: 1.15, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1] }}
            className="w-full h-full"
            whileHover={{ scale: 1.05 }}
          >
            <ImageWithFallback 
              src="https://images.unsplash.com/photo-1653784097013-786a8965ea3b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200" 
              alt="icare Pocket Blush" 
              className="w-full h-full object-cover"
            />
          </motion.div>
          
          {/* Subtle Overlay for Premium feel */}
          <motion.div 
            className="absolute inset-0 bg-black/5 mix-blend-multiply pointer-events-none"
            whileHover={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          />
        </motion.div>
      </div>
    </section>
  );
};
