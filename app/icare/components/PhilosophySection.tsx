import React from 'react';
import { motion } from 'framer-motion';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useSiteContent } from '../hooks/useSiteContent';

export const PhilosophySection = () => {
  const { philosophyHeadline, philosophyText, philosophyCta, philosophyImage } = useSiteContent();
  return (
    <section className="relative w-full min-h-[80vh] flex flex-col items-center justify-center overflow-hidden px-6 py-24">
      {/* Background Image - Clean texture without text */}
      <div className="absolute inset-0 z-0">
        <ImageWithFallback 
          src={philosophyImage} 
          alt="icare clean product texture" 
          className="w-full h-full object-cover object-center scale-110"
          priority
        />
        {/* Soft overlay for clarity */}
        <div className="absolute inset-0 bg-white/20 backdrop-blur-[2px]" />
      </div>

      {/* Content Overlay */}
      <div className="relative z-10 max-w-3xl w-full text-center flex flex-col items-center">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-[28px] md:text-[36px] font-bold tracking-tight text-[#222] lowercase mb-8"
        >
          {philosophyHeadline}
        </motion.h2>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-[16px] md:text-[18px] leading-[1.7] text-[#444] font-medium tracking-wide mb-12 max-w-2xl"
        >
          {philosophyText}
        </motion.p>

        <motion.button 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="border border-[#222] rounded-full px-12 py-4 text-[11px] font-[900] tracking-[0.2em] uppercase text-[#222] hover:bg-black hover:text-white transition-all duration-300"
        >
          {philosophyCta}
        </motion.button>
      </div>

      {/* Removed the hardcoded bottom text from image to keep it clean */}
    </section>
  );
};
