import React from 'react';
import { motion } from 'framer-motion';
import { ImageWithFallback } from './figma/ImageWithFallback';

export const OurStory = () => {
  return (
    <div className="pt-24 min-h-screen bg-[#F2F0EA]">
      {/* Hero Section */}
      <section className="px-6 py-20 max-w-[1200px] mx-auto text-center">
        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-[12vw] md:text-[8vw] leading-none font-bold tracking-tighter text-[#67645E] lowercase mb-12"
        >
          the icare way
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
              alt="Skin texture" 
              className="w-full h-full object-cover"
            />
          </motion.div>
          <div className="text-left space-y-6">
            <h2 className="text-2xl font-bold tracking-tight uppercase">Intentional Essentials</h2>
            <p className="text-[16px] leading-relaxed text-[#84827E] font-medium">
              We believe in the power of simplicity. icare was born from the desire to create 
              a streamlined collection of high-performance products that nourish your skin 
              without the noise.
            </p>
            <p className="text-[16px] leading-relaxed text-[#84827E] font-medium">
              Every formula is developed with dermatologists and chemists to ensure 
              the perfect balance of efficacy and gentleness.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-white py-24 px-6">
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="space-y-4">
            <h3 className="font-black tracking-widest text-[12px] uppercase">Curated</h3>
            <p className="text-[14px] text-[#84827E] leading-relaxed">Only what is necessary. One of everything really good.</p>
          </div>
          <div className="space-y-4">
            <h3 className="font-black tracking-widest text-[12px] uppercase">Effective</h3>
            <p className="text-[14px] text-[#84827E] leading-relaxed">High-performance ingredients that deliver real results.</p>
          </div>
          <div className="space-y-4">
            <h3 className="font-black tracking-widest text-[12px] uppercase">Mindful</h3>
            <p className="text-[14px] text-[#84827E] leading-relaxed">Consciously formulated and packaged with the planet in mind.</p>
          </div>
        </div>
      </section>
    </div>
  );
};
