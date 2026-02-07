import React from 'react';
import { motion } from 'framer-motion';
import { ImageWithFallback } from './figma/ImageWithFallback';

export const PromoSection = () => {
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
            <span className="text-[10px] md:text-[12px] font-bold tracking-[0.3em] uppercase text-[#777] mb-6 block">
              New Arrival
            </span>
            
            {/* Main Title - Lowercase and Bold */}
            <h2 className="text-[42px] md:text-[64px] font-[900] leading-[0.95] tracking-[-0.04em] text-[#222] lowercase mb-8">
              chilly little <br /> flush
            </h2>
            
            {/* Description */}
            <p className="text-[15px] md:text-[18px] leading-relaxed text-[#555] font-medium mb-12 max-w-[90%]">
              Warm up your cheeks with Pocket Blush. A touch of creamy, long-wearing color 
              that mimics the flush you get after stepping in from the cold.
            </p>
            
            {/* Button Styling */}
            <div className="flex flex-wrap gap-4">
              <button className="border-2 border-[#222] rounded-full px-12 py-4 text-[11px] font-[900] tracking-[0.15em] uppercase text-[#222] hover:bg-[#222] hover:text-white transition-all duration-500 cursor-pointer">
                POCKET BLUSH
              </button>
            </div>
          </motion.div>
        </div>

        {/* Right Side: Visual Section */}
        <div className="relative aspect-square md:aspect-auto h-full overflow-hidden">
          <motion.div
            initial={{ scale: 1.1 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1] }}
            className="w-full h-full"
          >
            <ImageWithFallback 
              src="https://images.unsplash.com/photo-1653784097013-786a8965ea3b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200" 
              alt="icare Pocket Blush" 
              className="w-full h-full object-cover"
            />
          </motion.div>
          
          {/* Subtle Overlay for Premium feel */}
          <div className="absolute inset-0 bg-black/5 mix-blend-multiply pointer-events-none" />
        </div>
      </div>
    </section>
  );
};
