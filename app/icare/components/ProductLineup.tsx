import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ChevronRight, Star, Plus } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Product } from '../types';
import { fetchProductShortcut } from '../lib/catalog-client';

interface ProductLineupProps {
  lang?: string;
  onProductSelect?: (product: Product) => void;
  products?: Product[] | null;
  useShortcutFallback?: boolean;
}

interface LineupItemProps {
  product?: Product;
  category: string;
  badge?: string;
  name: string;
  description: string;
  price: string;
  image: string;
  reviews: string;
  onSelect?: (product: Product) => void;
}

const CONTROL_FOCUS_CLASS = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 focus-visible:ring-offset-white';

const LineupCardBase: React.FC<LineupItemProps> = ({ product, category, badge, name, description, price, image, reviews, onSelect }) => {
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
      className={`w-[min(84vw,320px)] shrink-0 md:w-[420px] bg-[#F6F6F6] rounded-[24px] md:rounded-[32px] p-6 md:p-8 flex flex-col justify-between group cursor-pointer relative overflow-hidden h-[440px] md:h-[500px] transition-shadow duration-300 hover:shadow-lg hover:shadow-black/5 ${CONTROL_FOCUS_CLASS}`}
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
              className="h-full max-h-[210px] md:max-h-[260px] w-full object-contain drop-shadow-[0_16px_32px_rgba(0,0,0,0.08)]"
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
                  <button type="button" className={`bg-black text-white px-8 py-3.5 rounded-full flex items-center gap-2 shadow-xl ${CONTROL_FOCUS_CLASS}`} onClick={(event) => { event.stopPropagation(); selectProduct(); }}>
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
          <span className="text-[10px] font-bold text-black/55">({reviews})</span>
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
        
        <p className="text-[11px] md:text-[12px] text-[#5f5f5f] font-medium leading-relaxed">
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
      <section className="bg-white pt-12 pb-24 lg:pb-32 overflow-hidden">
        <div className="max-w-[1600px] mx-auto px-4 lg:px-12">
          <div className="rounded-[24px] bg-[#F6F6F6] p-12 flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-black border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="bg-white pt-12 pb-24 lg:pb-32 overflow-hidden">
        <div className="max-w-[1600px] mx-auto px-4 lg:px-12">
          <div className="rounded-[24px] bg-[#F6F6F6] p-12 text-center space-y-4">
            <p className="text-[13px] text-red-600 font-medium">{error}</p>
            <button
              onClick={loadProducts}
              className={`px-6 py-2 bg-black text-white rounded-full text-[11px] font-black uppercase tracking-[0.2em] hover:bg-black/90 transition-colors ${CONTROL_FOCUS_CLASS}`}
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
      <section className="bg-white pt-12 pb-24 lg:pb-32 overflow-hidden">
        <div className="max-w-[1600px] mx-auto px-4 lg:px-12">
          <div className="rounded-[24px] bg-[#F6F6F6] p-12 text-center text-[12px] font-bold uppercase tracking-[0.2em] text-black/60">
            no related products are available yet
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-white pt-12 pb-24 lg:pb-32 overflow-hidden">
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
                 badge={item.badge}
                 name={item.name}
                 description={item.description ?? item.category ?? 'iCare product'}
                 price={item.price}
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
            className={`absolute top-[40%] left-0 -translate-y-1/2 w-14 h-14 bg-white rounded-full shadow-lg border border-black/10 flex items-center justify-center z-30 hover:bg-black hover:text-white transition-colors opacity-0 group-hover:opacity-100 ${CONTROL_FOCUS_CLASS}`}
            aria-label="Scroll related products left"
            >
            <ChevronRight size={24} className="rotate-180" />
            </button>
            <button 
            onClick={() => scroll('right')}
            className={`absolute top-[40%] right-0 -translate-y-1/2 w-14 h-14 bg-white rounded-full shadow-lg border border-black/10 flex items-center justify-center z-30 hover:bg-black hover:text-white transition-colors opacity-0 group-hover:opacity-100 ${CONTROL_FOCUS_CLASS}`}
            aria-label="Scroll related products right"
            >
            <ChevronRight size={24} />
            </button>
        </div>
      </div>
    </section>
  );
};
