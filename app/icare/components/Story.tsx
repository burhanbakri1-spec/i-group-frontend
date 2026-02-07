import React from 'react';
import { motion } from 'framer-motion';
import { ImageWithFallback } from './figma/ImageWithFallback';

export const Story: React.FC<{ onNavigate: (page: string) => void }> = ({ onNavigate }) => {
  return (
    <div className="max-w-[1440px] mx-auto px-10 py-20">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
        <div className="rounded-[32px] overflow-hidden aspect-[4/5]">
          <ImageWithFallback 
            src="https://images.unsplash.com/photo-1501876725168-00c445821c9e?q=80&w=1000" 
            alt="Our Story" 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="space-y-10">
          <h2 className="text-[56px] font-black tracking-[-0.03em] leading-none text-[#5C5A56]">
            OUR <br /> PHILOSOPHY
          </h2>
          <p className="text-[20px] text-[#706E6A] leading-relaxed max-w-lg">
            icare is a range of skincare essentials. Based in skin science, we believe in great products that really work, and that everyone can use. 
          </p>
          <p className="text-[20px] text-[#706E6A] leading-relaxed max-w-lg">
            Our formulas are intentional, high-performance, and kind to the environment. We're here to help you achieve your best skin yet.
          </p>
          <button 
            onClick={() => onNavigate('shop')}
            className="text-[14px] font-black uppercase tracking-widest border-b-2 border-black pb-1 hover:opacity-50 transition-opacity"
          >
            EXPLORE THE RANGE
          </button>
        </div>
      </div>
    </div>
  );
};
