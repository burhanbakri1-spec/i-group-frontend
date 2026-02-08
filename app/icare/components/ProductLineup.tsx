import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Star, Plus } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface ProductLineupProps {
  isRtl: boolean;
}

interface LineupItemProps {
  category: string;
  badge?: string;
  name: string;
  description: string;
  price: string;
  image: string;
  reviews: string;
}

const LineupCard: React.FC<LineupItemProps> = ({ category, badge, name, description, price, image, reviews }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div 
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="min-w-[320px] md:min-w-[420px] bg-[#F6F6F6] rounded-[24px] md:rounded-[32px] p-6 md:p-8 flex flex-col justify-between group cursor-pointer relative overflow-hidden h-[460px] md:h-[520px] transition-all duration-500 hover:shadow-xl hover:shadow-black/5"
    >
      {/* Top Section: Category and Badge */}
      <div className="flex justify-between items-start z-10">
        <h3 className="text-[28px] md:text-[38px] font-bold lowercase tracking-tight text-black leading-none">
          {category}
        </h3>
        {badge && (
          <div className="bg-[#66635F] px-4 py-1.5 rounded-full">
            <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.15em] text-white">
              {badge}
            </span>
          </div>
        )}
      </div>

      {/* Center Section: Product Image with Quick Add Overlay */}
      <div className="flex-1 flex items-center justify-center relative py-4">
        <motion.div
          animate={{ 
            scale: isHovered ? 1.05 : 1,
            y: isHovered ? -10 : 0
          }}
          transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
          className="w-full h-full flex items-center justify-center"
        >
          <div className="relative">
            <ImageWithFallback 
              src={image} 
              alt={name} 
              className="max-h-[220px] md:max-h-[280px] w-auto object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.08)]" 
            />
            
            {/* Quick Add Button Overlay */}
            <AnimatePresence>
              {isHovered && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute inset-0 flex items-center justify-center z-20"
                >
                  <button className="bg-black text-white px-8 py-3.5 rounded-full flex items-center gap-2 shadow-2xl">
                    <Plus size={16} strokeWidth={3} />
                    <span className="text-[11px] font-black uppercase tracking-[0.2em]">Quick Add</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      {/* Bottom Section: Info */}
      <div className="space-y-2.5 z-10">
        {/* Reviews */}
        <div className="flex items-center gap-1.5">
          <div className="flex gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={11} fill="black" className="text-black" />
            ))}
          </div>
          <span className="text-[10px] font-bold opacity-40">({reviews})</span>
        </div>

        {/* Name and Price */}
        <div className="flex justify-between items-baseline gap-4">
          <h4 className="text-[12px] md:text-[14px] font-black uppercase tracking-[0.05em] text-black leading-tight flex-1">
            {name}
          </h4>
          <span className="text-[13px] md:text-[15px] font-black text-black">
            {price}
          </span>
        </div>
        
        <p className="text-[11px] md:text-[12px] text-[#707070] font-medium leading-relaxed opacity-80">
          {description}
        </p>
      </div>
    </motion.div>
  );
};

export const ProductLineup: React.FC<ProductLineupProps> = ({ isRtl }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollAmount = clientWidth * 0.8;
      const scrollTo = direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  const items = [
    {
      category: "skin",
      badge: "LIMITED EDITION",
      name: "THE SCENTED PEPTIDE LIP KIT",
      description: "Limited edition boxed set",
      price: "$72.00",
      image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=800",
      reviews: "15,787"
    },
    {
      category: "eye",
      badge: "ONLY AT ICARE",
      name: "THE PEPTIDE EYE PREP SET",
      description: "Depuffing eye patches",
      price: "$47.00",
      image: "https://images.unsplash.com/photo-1599305090598-fe179d501227?q=80&w=800",
      reviews: "241"
    },
    {
      category: "tint",
      name: "PEPTIDE LIP TINT",
      description: "The tinted lip layer",
      price: "$20.00",
      image: "https://images.unsplash.com/photo-1601049541289-9b1b7abcfe19?q=80&w=800",
      reviews: "15,787"
    },
    {
        category: "prep",
        badge: "BEST SELLER",
        name: "GLAZING MILK",
        description: "Ceramide facial essence",
        price: "$32.00",
        image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=800",
        reviews: "10,240"
      }
  ];

  return (
    <section className="bg-white pt-12 pb-24 lg:pb-32 overflow-hidden">
      <div className="max-w-[1600px] mx-auto px-4 lg:px-12 relative group">
        <div 
          ref={scrollRef}
          className="flex gap-5 md:gap-8 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-8"
        >
          {items.map((item, idx) => (
            <div key={idx} className="snap-start first:pl-2 last:pr-2">
               <LineupCard {...item} />
            </div>
          ))}
        </div>

        {/* Navigation Arrows */}
        <div className="hidden lg:block">
            <button 
            onClick={() => scroll('left')}
            className="absolute top-[40%] -left-4 -translate-y-1/2 w-14 h-14 bg-white rounded-full shadow-xl border border-black/5 flex items-center justify-center z-30 hover:bg-black hover:text-white transition-all opacity-0 group-hover:opacity-100"
            >
            <ChevronRight size={24} className="rotate-180" />
            </button>
            <button 
            onClick={() => scroll('right')}
            className="absolute top-[40%] -right-4 -translate-y-1/2 w-14 h-14 bg-white rounded-full shadow-xl border border-black/5 flex items-center justify-center z-30 hover:bg-black hover:text-white transition-all opacity-0 group-hover:opacity-100"
            >
            <ChevronRight size={24} />
            </button>
        </div>
      </div>
    </section>
  );
};
