import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { ChevronRight, Star, Plus } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Product } from '../types';
import { fetchProductShortcut } from '../lib/catalog-client';
import { SkeletonPulse } from './ui/skeletons';

interface ProductLineupProps {
  lang?: string;
  onProductSelect?: (product: Product) => void;
  products?: Product[] | null;
  useShortcutFallback?: boolean;
}

interface LineupItemProps {
  product?: Product;
  category: string;
  label?: string;
  name: string;
  description: string;
  price: string;
  originalPrice?: string;
  image: string;
  reviews: string;
  onSelect?: (product: Product) => void;
}

const CONTROL_FOCUS_CLASS = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7B7872] focus-visible:ring-offset-2 focus-visible:ring-offset-white';

const LineupCardBase: React.FC<LineupItemProps> = ({ product, category, label, name, description, price, originalPrice, image, reviews, onSelect }) => {
  const [isHovered, setIsHovered] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const selectProduct = () => product && onSelect?.(product);

  return (
    <motion.div 
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={selectProduct}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          selectProduct();
        }
      }}
      role="button"
      tabIndex={product ? 0 : -1}
      className={`w-[min(84vw,320px)] shrink-0 md:w-[420px] bg-white rounded-[12px] p-6 md:p-8 flex flex-col justify-between group cursor-pointer relative overflow-hidden h-[440px] md:h-[500px] ${CONTROL_FOCUS_CLASS}`}
    >
      {/* Top Section: Category and Badge */}
      <div className="flex justify-between items-start z-10">
        <h3 className="text-[28px] md:text-[38px] font-bold lowercase tracking-tight text-[#67645E] leading-none">
          {category}
        </h3>
        {label && (
          <div className="bg-[#67645E] px-4 py-1.5 rounded-full">
            <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.15em] text-white">
              {label}
            </span>
          </div>
        )}
      </div>

      {/* Center Section: Product Image with Quick Add Overlay */}
      <div className="flex-1 flex items-center justify-center relative py-4">
        <motion.div
          animate={{ 
            scale: !shouldReduceMotion && isHovered ? 1.02 : 1,
            y: !shouldReduceMotion && isHovered ? -4 : 0
          }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.25, ease: [0.32, 0.72, 0, 1] }}
          className="w-full h-full flex items-center justify-center"
        >
          <div className="relative w-full h-full flex items-center justify-center">
            <ImageWithFallback 
              src={image} 
              alt={name} 
              className="h-full max-h-[210px] md:max-h-[260px] w-full object-contain"
            />
            
            {/* Quick Add Button Overlay */}
            <AnimatePresence>
              {isHovered && (
                <motion.div
                  initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: shouldReduceMotion ? 0 : 6, scale: 0.98 }}
                  transition={{ duration: shouldReduceMotion ? 0 : 0.18 }}
                  className="absolute inset-0 flex items-center justify-center z-20"
                >
                  <button type="button" className={`bg-[#67645E] text-white px-8 py-3.5 rounded-full flex items-center gap-2 ${CONTROL_FOCUS_CLASS}`} onClick={(event) => { event.stopPropagation(); selectProduct(); }}>
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
          <span className="text-[10px] font-bold text-[#84827E]">({reviews})</span>
        </div>

        {/* Name and Price */}
        <div className="flex justify-between items-baseline gap-4">
          <h4 className="text-[12px] md:text-[14px] font-bold lowercase tracking-[0.05em] text-[#67645E] leading-tight flex-1">
            {name}
          </h4>
          <div className="flex items-center gap-2">
            {originalPrice && (
              <span className="text-[13px] md:text-[15px] font-black text-black/40 line-through">{originalPrice}</span>
            )}
            <span className="text-[13px] md:text-[15px] font-black text-[#67645E]">
              {price}
            </span>
          </div>
        </div>
        
        <p className="text-[11px] md:text-[12px] text-[#84827E] font-medium leading-relaxed">
          {description}
        </p>
      </div>
    </motion.div>
  );
};

const LineupCard = React.memo(LineupCardBase);

export const ProductLineup: React.FC<ProductLineupProps> = ({ onProductSelect, products, useShortcutFallback = true }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const [remoteProducts, setRemoteProducts] = useState<Product[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadProducts = useCallback(async () => {
    setError(null);
    if (products) {
      setRemoteProducts(products);
      return;
    }
    if (!useShortcutFallback) {
      setRemoteProducts([]);
      return;
    }
    try {
      const bestsellers = await fetchProductShortcut('bestsellers', 8);
      setRemoteProducts(bestsellers ?? []);
    } catch (err) {
      console.error('Failed to load product lineup', err);
      setError(err instanceof Error ? err.message : 'Failed to load products.');
      setRemoteProducts([]);
    }
  }, [products, useShortcutFallback]);

  useEffect(() => {
    void Promise.resolve().then(loadProducts);
  }, [loadProducts]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollAmount = clientWidth * 0.8;
      const scrollTo = direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: shouldReduceMotion ? 'auto' : 'smooth' });
    }
  };

  const items = remoteProducts ?? [];

  if (remoteProducts === null) {
    return (
      <section className="bg-[#F1F0ED] pt-12 pb-24 lg:pb-32 overflow-hidden">
        <div className="max-w-[1600px] mx-auto px-4 lg:px-12">
          <div className="rounded-[12px] bg-white p-12">
            <div className="flex gap-5 md:gap-8 overflow-hidden">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex-shrink-0 w-[280px] space-y-3">
                  <SkeletonPulse className="aspect-square w-full rounded-xl" />
                  <SkeletonPulse className="h-4 w-2/3 rounded" />
                  <SkeletonPulse className="h-4 w-1/3 rounded" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="bg-[#F1F0ED] pt-12 pb-24 lg:pb-32 overflow-hidden">
        <div className="max-w-[1600px] mx-auto px-4 lg:px-12">
          <div className="rounded-[12px] bg-white p-12 text-center space-y-4">
            <p className="text-[13px] text-red-600 font-medium">{error}</p>
            <button
              onClick={loadProducts}
              className={`px-6 py-2 bg-[#67645E] text-white rounded-full text-[11px] font-black uppercase tracking-[0.2em] hover:bg-[#67645E]/90 transition-colors ${CONTROL_FOCUS_CLASS}`}
            >
              Retry
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (items.length === 0) {
    return (
      <section className="bg-[#F1F0ED] pt-12 pb-24 lg:pb-32 overflow-hidden">
        <div className="max-w-[1600px] mx-auto px-4 lg:px-12">
          <div className="rounded-[12px] bg-white p-12 text-center text-[12px] font-bold uppercase tracking-[0.2em] text-[#84827E]">
            no related products are available yet
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-[#F1F0ED] pt-12 pb-24 lg:pb-32 overflow-hidden">
      <div className="max-w-[1600px] mx-auto px-4 lg:px-12 relative group">
        <div 
          ref={scrollRef}
          className="flex gap-5 md:gap-8 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-8 scroll-px-4"
        >
          {items.map((item) => (
            <div key={item.id} className="snap-start first:pl-1 last:pr-2">
               <LineupCard
                  product={item}
                  category={item.title ?? item.category ?? 'icare'}
                   label={item.label}
                  name={item.name}
                  description={item.description ?? item.category ?? 'iCare product'}
                  price={item.price}
                  originalPrice={item.originalPrice}
                  image={item.image}
                  reviews={item.reviews ?? '0'}
                  onSelect={onProductSelect}
                />
            </div>
          ))}
        </div>

        {/* Navigation Arrows */}
        <div className="hidden lg:block">
            <button 
            onClick={() => scroll('left')}
            className={`absolute top-[40%] left-0 -translate-y-1/2 w-14 h-14 bg-white rounded-full border border-[#DDDDDD] flex items-center justify-center z-30 hover:bg-[#67645E] hover:text-white transition-colors opacity-0 group-hover:opacity-100 ${CONTROL_FOCUS_CLASS}`}
            aria-label="Scroll related products left"
            >
            <ChevronRight size={24} className="rotate-180" />
            </button>
            <button 
            onClick={() => scroll('right')}
            className={`absolute top-[40%] right-0 -translate-y-1/2 w-14 h-14 bg-white rounded-full border border-[#DDDDDD] flex items-center justify-center z-30 hover:bg-[#67645E] hover:text-white transition-colors opacity-0 group-hover:opacity-100 ${CONTROL_FOCUS_CLASS}`}
            aria-label="Scroll related products right"
            >
            <ChevronRight size={24} />
            </button>
        </div>
      </div>
    </section>
  );
};
