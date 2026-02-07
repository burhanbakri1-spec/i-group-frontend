import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

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

export const SocialGrid = () => {
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
          <h2 className="text-[28px] md:text-[36px] font-[900] tracking-tight text-[#222] lowercase">
            icare + you
          </h2>
          <button className="hidden md:block border border-[#222]/20 rounded-full px-8 py-2 text-[10px] font-bold tracking-[0.1em] uppercase text-[#222] hover:bg-[#222] hover:text-white transition-all duration-300">
            FIND US ON SOCIAL
          </button>
        </div>

        {/* Horizontal Scrollable Grid */}
        <div 
          ref={scrollRef}
          className="flex gap-4 md:gap-5 overflow-x-auto no-scrollbar pb-6 snap-x snap-mandatory"
        >
          {lifestyleImages.map((image) => (
            <motion.div 
              key={image.id}
              whileHover={{ y: -3 }}
              className="flex-none w-[70%] md:w-[240px] lg:w-[280px] aspect-square rounded-[16px] overflow-hidden snap-start"
            >
              <ImageWithFallback 
                src={image.src} 
                alt={image.alt}
                className="w-full h-full object-cover"
              />
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
            <button 
              onClick={() => scroll('left')}
              className="w-12 h-12 rounded-full border border-[#222]/10 flex items-center justify-center hover:bg-white transition-all text-[#222]"
            >
              <ArrowLeft size={20} strokeWidth={1.5} />
            </button>
            <button 
              onClick={() => scroll('right')}
              className="w-12 h-12 rounded-full border border-[#222]/10 flex items-center justify-center hover:bg-white transition-all text-[#222]"
            >
              <ArrowRight size={20} strokeWidth={1.5} />
            </button>
          </div>
        </div>

        {/* Mobile Social Button */}
        <button className="md:hidden w-full mt-8 border border-[#222]/20 rounded-full py-4 text-[10px] font-bold tracking-[0.1em] uppercase text-[#222]">
          FIND US ON SOCIAL
        </button>
      </div>
    </section>
  );
};
