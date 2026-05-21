import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Language } from '../translations';
import { Product } from '../types';
import { fetchProductShortcut } from '../lib/catalog-client';
import { useSiteContent } from '../hooks/useSiteContent';
import { SkeletonPulse } from './ui/skeletons';

interface ProductShowcaseProps {
  products: Product[];
  lang: Language;
  onProductSelect: (product: Product) => void;
}

export const ProductShowcase: React.FC<ProductShowcaseProps> = ({ products, lang, onProductSelect }) => {
  void products;
  const shouldReduceMotion = useReducedMotion();
  const { productShowcaseLoading, productShowcaseEmpty } = useSiteContent();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [remoteProducts, setRemoteProducts] = useState<Product[] | null>(null);

  useEffect(() => {
    const loadShowcaseProducts = async () => {
      const featuredProducts = await fetchProductShortcut('featured', 4);
      setRemoteProducts(featuredProducts ?? []);
    };
    loadShowcaseProducts();
  }, []);

  const showcaseProducts = remoteProducts ?? [];

  if (remoteProducts === null) {
    return (
      <section className="px-4 md:px-8 py-6 md:py-8 bg-white">
        <div className="max-w-[1440px] mx-auto rounded-[12px] bg-[#EDECEB] p-8 md:p-12">
          <div className="flex gap-6 md:gap-8">
            <SkeletonPulse className="flex-1 aspect-[4/3] rounded-xl" />
            <div className="flex-1 flex flex-col justify-center space-y-4">
              <SkeletonPulse className="h-4 w-1/4 rounded" />
              <SkeletonPulse className="h-8 w-3/4 rounded" />
              <SkeletonPulse className="h-4 w-2/3 rounded" />
              <SkeletonPulse className="h-4 w-1/2 rounded" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (showcaseProducts.length === 0) {
    return (
      <section className="px-4 md:px-8 py-6 md:py-8 bg-white">
        <div className="max-w-[1440px] mx-auto rounded-[12px] bg-[#EDECEB] p-12 text-center text-[12px] font-bold uppercase tracking-[0.2em] text-[#84827E]">
          {productShowcaseEmpty}
        </div>
      </section>
    );
  }

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % showcaseProducts.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + showcaseProducts.length) % showcaseProducts.length);
  };

  const current = showcaseProducts[currentIndex];

  return (
    <section className="px-4 md:px-8 py-4 md:py-8 bg-white">
      <div className="max-w-[1440px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
        
        {/* Left Column: Lifestyle Image */}
        <div className="relative aspect-[4/5] md:aspect-auto h-auto sm:h-[500px] md:h-[680px] rounded-[12px] md:rounded-[12px] overflow-hidden bg-[#EDECEB] group">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, scale: 1.03 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="w-full h-full"
            >
              <ImageWithFallback 
                src={current.images?.[1] ?? current.images?.[0] ?? current.image}
                alt={current.title ?? current.name}
                className="w-full h-full object-cover"
              />
            </motion.div>
          </AnimatePresence>
          
          <div className="absolute bottom-4 md:bottom-8 left-1/2 -translate-x-1/2 flex gap-1.5 md:gap-2 z-10 bg-black/10 px-2 md:px-4 py-1 md:py-2 rounded-full">
            {showcaseProducts.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black/20 ${i === currentIndex ? 'bg-white w-5 md:w-6' : 'bg-white/55'}`}
                aria-label={`Show product ${i + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Right Column: Product Info Box */}
        <div className="bg-[#EDECEB] rounded-[12px] md:rounded-[12px] p-5 sm:p-8 md:p-14 flex flex-col justify-between relative min-h-[440px] sm:h-[500px] md:h-[680px] overflow-hidden">
          
          <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 flex justify-between px-1 md:px-8 z-20 pointer-events-none">
            <motion.button 
              onClick={prevSlide}
              className="w-9 h-9 md:w-14 md:h-14 border border-[#DDDDDD] bg-white rounded-full flex items-center justify-center pointer-events-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#EDECEB]"
              whileHover={{ backgroundColor: "rgba(103,100,94,0.06)" }}
              whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
              initial={shouldReduceMotion ? false : { opacity: 0, x: -10 }}
              animate={shouldReduceMotion ? undefined : { opacity: 1, x: 0 }}
              transition={{ duration: 0.25 }}
            >
              <ArrowLeft size={14} strokeWidth={1.5} />
            </motion.button>
            <motion.button 
              onClick={nextSlide}
              className="w-9 h-9 md:w-14 md:h-14 border border-[#DDDDDD] bg-white rounded-full flex items-center justify-center pointer-events-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#EDECEB]"
              whileHover={{ backgroundColor: "rgba(103,100,94,0.06)" }}
              whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
              initial={shouldReduceMotion ? false : { opacity: 0, x: 10 }}
              animate={shouldReduceMotion ? undefined : { opacity: 1, x: 0 }}
              transition={{ duration: 0.25 }}
            >
              <ArrowRight size={14} strokeWidth={1.5} />
            </motion.button>
          </div>

          <div className="flex-1 flex items-center justify-center py-2 md:py-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                className="w-full max-w-[140px] sm:max-w-[260px] md:max-w-[380px]"
              >
                <ImageWithFallback 
                  src={current.image}
                  alt={current.title ?? current.name}
                  className="w-full h-full object-contain mix-blend-multiply drop-shadow-sm"
                />
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex justify-between items-end w-full relative z-10">
            <AnimatePresence mode="wait">
              <motion.div 
                key={currentIndex}
                initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-2 md:space-y-6 w-full"
              >
                <div className="flex items-center gap-1.5">
                  <div className="flex text-[#67645E]">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-2 md:w-3 h-2 md:h-3 fill-current" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-[8px] md:text-[11px] font-bold text-[#84827E] tracking-wider uppercase">({current.reviews})</span>
                </div>

                <div className="space-y-0.5 md:space-y-2">
                  <div className="flex items-center gap-2">
                    <ImageWithFallback src="/icare-logo.png" alt="icare" className="h-3 md:h-5 w-auto object-contain hidden sm:block" />
                    <h3 className="text-[14px] sm:text-[20px] md:text-[28px] font-[900] tracking-tight text-[#67645E] lowercase leading-tight">
                      {current.title ?? current.name}
                    </h3>
                  </div>
                  <p className="text-[10px] sm:text-[14px] md:text-[16px] text-[#84827E] font-medium lowercase tracking-tight leading-snug">
                    {current.description}
                  </p>
                </div>

                <motion.button
                  whileTap={shouldReduceMotion ? undefined : { scale: 0.99 }}
                  onClick={() => onProductSelect(current)}
                  className="bg-[#67645E] text-white rounded-full w-full py-3 md:py-4 text-[10px] md:text-[11px] font-black tracking-[0.1em] md:tracking-[0.2em] uppercase hover:bg-[#555] transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#EDECEB]"
                >
                  {lang === 'en' ? 'VIEW' : 'عرض'} — {current.originalPrice && <><span className="line-through text-white/60 mr-1">{current.originalPrice}</span> </>}{current.price}
                </motion.button>
              </motion.div>
            </AnimatePresence>

            <div className="flex flex-col items-end hidden md:flex">
               <div className="text-[56px] md:text-[80px] font-[900] tracking-tighter text-[#67645E]/5 leading-none select-none">
                0{currentIndex + 1}
              </div>
              <div className="text-[12px] font-bold tracking-[0.3em] text-[#67645E] opacity-40">
                {currentIndex + 1} / {showcaseProducts.length}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
