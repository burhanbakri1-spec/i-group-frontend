import React from 'react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { ScrollReveal, StaggerContainer } from './ui/ScrollReveal';

export const Story: React.FC<{ onNavigate: (page: string) => void }> = ({ onNavigate }) => {
  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">

        {/* Left: Image slides in from the left */}
        <ScrollReveal direction="left" viewportMargin="-80px">
          <div className="rounded-[32px] overflow-hidden aspect-[4/5]">
            <ImageWithFallback 
              src="https://images.unsplash.com/photo-1501876725168-00c445821c9e?q=80&w=1000" 
              alt="Our Story" 
              className="w-full h-full object-cover"
            />
          </div>
        </ScrollReveal>

        {/* Right: Text column with staggered reveals */}
        <StaggerContainer className="space-y-10" staggerDelay={0.08} viewportMargin="-80px">
          <ScrollReveal direction="bottom" delay={0}>
            <h2 className="text-[56px] font-black tracking-[-0.03em] leading-none text-[#5C5A56]">
              OUR <br /> PHILOSOPHY
            </h2>
          </ScrollReveal>

          <ScrollReveal direction="bottom" delay={0.08}>
            <p className="text-[20px] text-[#706E6A] leading-relaxed max-w-lg">
              icare is a range of skincare essentials. Based in skin science, we believe in great products that really work, and that everyone can use. 
            </p>
          </ScrollReveal>

          <ScrollReveal direction="bottom" delay={0.14}>
            <p className="text-[20px] text-[#706E6A] leading-relaxed max-w-lg">
              Our formulas are intentional, high-performance, and kind to the environment. We&apos;re here to help you achieve your best skin yet.
            </p>
          </ScrollReveal>

          <ScrollReveal direction="bottom" delay={0.20}>
            <button 
              onClick={() => onNavigate('shop')}
              className="text-[14px] font-black uppercase tracking-widest border-b-2 border-black pb-1 hover:opacity-50 transition-opacity"
            >
              EXPLORE THE RANGE
            </button>
          </ScrollReveal>
        </StaggerContainer>
      </div>
    </div>
  );
};
