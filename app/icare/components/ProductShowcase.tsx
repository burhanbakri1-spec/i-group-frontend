import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Language, translations } from '../translations';
import { Product } from '../types';

interface ProductShowcaseProps {
  products: Product[];
  lang: Language;
  onProductSelect: (product: Product) => void;
}

export const ProductShowcase: React.FC<ProductShowcaseProps> = ({ products, lang, onProductSelect }) => {
  // products prop is required by interface but component uses internal showcaseProducts
  void products;
  const t = translations[lang];
  const [currentIndex, setCurrentIndex] = useState(0);

  const showcaseProducts = [
    {
      id: 1,
      title: lang === 'en' ? 'PINEAPPLE REFRESH' : 'منظف الأناناس المنعش',
      description: lang === 'en' ? 'PGA daily cleanser' : 'منظف يومي PGA',
      price: '$30.00',
      reviews: '1,932',
      productImage: 'https://images.unsplash.com/photo-1549127024-18ee7271c819?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
      lifestyleImage: 'https://images.unsplash.com/photo-1692318569136-f63bf5dfbedf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200'
    },
    {
      id: 2,
      title: t.products.barrierButter.title,
      description: t.products.barrierButter.subtitle,
      price: '$36.00',
      reviews: '2,213',
      productImage: 'https://images.unsplash.com/photo-1634055769490-dc0a9f22826a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
      lifestyleImage: 'https://images.unsplash.com/photo-1738684033377-eb02299c1d6c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200'
    },
    {
      id: 3,
      title: t.products.peptideLip.title,
      description: t.products.peptideLip.subtitle,
      price: '$16.00',
      reviews: '5,402',
      productImage: 'https://images.unsplash.com/photo-1761095870661-c4ae15cac605?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
      lifestyleImage: 'https://images.unsplash.com/photo-1600664534138-f8910b0adc63?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200'
    }
  ];

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % showcaseProducts.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + showcaseProducts.length) % showcaseProducts.length);
  };

  const current = showcaseProducts[currentIndex];

  return (
    <section className="px-2 md:px-8 py-2 md:py-8 bg-white">
      <div className="max-w-[1600px] mx-auto grid grid-cols-2 gap-2 md:gap-8">
        
        {/* Left Column: Lifestyle Image */}
        <div className="relative aspect-[3/4] md:aspect-auto h-[350px] sm:h-[500px] md:h-[700px] rounded-[12px] md:rounded-[16px] overflow-hidden bg-[#F2F2F0] group">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="w-full h-full"
            >
              <img 
                src={current.lifestyleImage} 
                alt={current.title} 
                className="w-full h-full object-cover"
              />
            </motion.div>
          </AnimatePresence>
          
          <div className="absolute bottom-4 md:bottom-8 left-1/2 -translate-x-1/2 flex gap-1.5 md:gap-2 z-10 bg-black/5 backdrop-blur-md px-2 md:px-4 py-1 md:py-2 rounded-full">
            {showcaseProducts.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={`w-1 md:w-1.5 h-1 md:h-1.5 rounded-full transition-all duration-500 ${i === currentIndex ? 'bg-white w-4 md:w-6' : 'bg-white/40'}`}
              />
            ))}
          </div>
        </div>

        {/* Right Column: Product Info Box */}
        <div className="bg-[#F2F2F0] rounded-[12px] md:rounded-[16px] p-4 sm:p-8 md:p-16 flex flex-col justify-between relative h-[350px] sm:h-[500px] md:h-[700px] overflow-hidden">
          
          <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 flex justify-between px-1 md:px-8 z-20 pointer-events-none">
            <motion.button 
              onClick={prevSlide}
              className="w-8 h-8 md:w-14 md:h-14 border border-black/5 bg-white/60 backdrop-blur-xl rounded-full flex items-center justify-center shadow-md md:shadow-lg pointer-events-auto"
              whileHover={{ 
                scale: 1.1, 
                backgroundColor: "rgba(255,255,255,1)",
                boxShadow: "0 10px 30px rgba(0,0,0,0.15)"
              }}
              whileTap={{ scale: 0.9 }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <motion.div
                whileHover={{ x: -2 }}
                transition={{ duration: 0.2 }}
              >
                <ArrowLeft size={14} strokeWidth={1.5} />
              </motion.div>
            </motion.button>
            <motion.button 
              onClick={nextSlide}
              className="w-8 h-8 md:w-14 md:h-14 border border-black/5 bg-white/60 backdrop-blur-xl rounded-full flex items-center justify-center shadow-md md:shadow-lg pointer-events-auto"
              whileHover={{ 
                scale: 1.1, 
                backgroundColor: "rgba(255,255,255,1)",
                boxShadow: "0 10px 30px rgba(0,0,0,0.15)"
              }}
              whileTap={{ scale: 0.9 }}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <motion.div
                whileHover={{ x: 2 }}
                transition={{ duration: 0.2 }}
              >
                <ArrowRight size={14} strokeWidth={1.5} />
              </motion.div>
            </motion.button>
          </div>

          <div className="flex-1 flex items-center justify-center py-2 md:py-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, scale: 0.8, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 1.1, y: -10 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="w-full max-w-[140px] sm:max-w-[260px] md:max-w-[380px]"
              >
                <ImageWithFallback 
                  src={current.productImage} 
                  alt={current.title}
                  className="w-full h-full object-contain mix-blend-multiply drop-shadow-lg md:drop-shadow-2xl"
                />
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex justify-between items-end w-full relative z-10">
            <AnimatePresence mode="wait">
              <motion.div 
                key={currentIndex}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.4 }}
                className="space-y-2 md:space-y-6 w-full"
              >
                <div className="flex items-center gap-1.5">
                  <div className="flex text-[#222]">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-2 md:w-3 h-2 md:h-3 fill-current" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-[8px] md:text-[11px] font-bold text-[#777] tracking-wider uppercase">({current.reviews})</span>
                </div>

                <div className="space-y-0.5 md:space-y-2">
                  <div className="flex items-center gap-2">
                    <img src="/icare-logo.png" alt="icare" className="h-3 md:h-5 w-auto object-contain hidden sm:block" />
                    <h3 className="text-[14px] sm:text-[20px] md:text-[28px] font-[900] tracking-tight text-[#222] uppercase leading-tight">
                      {current.title}
                    </h3>
                  </div>
                  <p className="text-[10px] sm:text-[14px] md:text-[16px] text-[#666] font-medium lowercase tracking-tight leading-none">
                    {current.description}
                  </p>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onProductSelect({
                    id: String(current.id),
                    name: current.title,
                    description: current.description,
                    price: current.price,
                    image: current.productImage,
                    reviews: current.reviews
                  })}
                  className="bg-black text-white rounded-full w-full py-2.5 md:py-4 text-[9px] md:text-[11px] font-black tracking-[0.1em] md:tracking-[0.2em] uppercase hover:bg-[#333] transition-all duration-300 shadow-lg"
                >
                  {lang === 'en' ? 'VIEW' : 'عرض'} — {current.price}
                </motion.button>
              </motion.div>
            </AnimatePresence>

            <div className="flex flex-col items-end hidden md:flex">
               <div className="text-[56px] md:text-[80px] font-[900] tracking-tighter text-[#222]/5 leading-none select-none">
                0{currentIndex + 1}
              </div>
              <div className="text-[12px] font-bold tracking-[0.3em] text-[#222] opacity-40">
                {currentIndex + 1} / {showcaseProducts.length}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
