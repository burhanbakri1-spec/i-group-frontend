import React from 'react';
import { motion } from 'framer-motion';

export const PhilosophySection = () => {
  return (
    <section className="relative w-full min-h-[80vh] flex flex-col items-center justify-center overflow-hidden px-6 py-24">
      {/* Background Image - Clean texture without text */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1638609927040-8a7e97cd9d6a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1920" 
          alt="icare clean product texture" 
          className="w-full h-full object-cover object-center scale-110"
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
          one of everything really good
        </motion.h2>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-[16px] md:text-[18px] leading-[1.7] text-[#444] font-medium tracking-wide mb-12 max-w-2xl"
        >
          At <span className="brand-font text-[1.1em] not-italic font-bold">icare</span>, our philosophy is to make one of everything really good. 
          To us, that means a collection of intentional, high-performance essentials 
          you reach for everyday. The ones you love, rely on, and always come back 
          to for ultimate barrier nourishment, tint, and glow.
        </motion.p>

        <motion.button 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="border border-[#222] rounded-full px-12 py-4 text-[11px] font-[900] tracking-[0.2em] uppercase text-[#222] hover:bg-black hover:text-white transition-all duration-300"
        >
          SHOP ICARE
        </motion.button>
      </div>

      {/* Removed the hardcoded bottom text from image to keep it clean */}
    </section>
  );
};
