import React, { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ProductCard } from './ProductCard';
import { Language } from '../translations';
import { fetchCatalogProducts } from '../lib/catalog-client';
import { ProductGridSkeleton } from './ui/skeletons';
import { Product } from '../types';

interface ProductGridProps {
  lang: Language;
  onProductSelect: (product: Product) => void;
}

export const ProductGrid: React.FC<ProductGridProps> = ({ lang, onProductSelect }) => {
  const shouldReduceMotion = useReducedMotion();
  const [products, setProducts] = useState<Product[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const data = await fetchCatalogProducts();
      setProducts(data ?? []);
      setLoading(false);
    };
    loadData();
  }, []);

  const displayProducts = products ?? [];

  if (loading && !products) {
    return (
      <div className="w-full py-20 px-4">
        <ProductGridSkeleton count={8} />
      </div>
    );
  }

  if (displayProducts.length === 0) {
    return (
      <div className="bg-[#F1F0ED] py-16 text-center">
        <p className="text-[14px] font-bold uppercase tracking-[0.2em] text-[#84827E]">
          {lang === 'en' ? 'No products available' : 'لا توجد منتجات متاحة'}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[#F1F0ED]">
      {/* Mobile: Horizontal scroll with snap */}
      <motion.div 
        className="md:hidden no-scrollbar mobile-trending-scroll"
        style={{
          display: 'flex',
          flexWrap: 'nowrap',
          gap: '12px',
          overflowX: 'auto',
          overflowY: 'hidden',
          padding: '0 16px 16px',
          scrollSnapType: 'x mandatory',
          WebkitOverflowScrolling: 'touch',
          touchAction: 'pan-x',
        }}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={{
          visible: {
            transition: {
              staggerChildren: shouldReduceMotion ? 0 : 0.04
            }
          }
        }}
      >
        {displayProducts.map((product) => (
          <motion.div
            key={product.id}
            className="snap-start mobile-trending-item"
            style={{
              flex: '0 0 78vw',
              width: '78vw',
              maxWidth: '360px',
            }}
            variants={{
              hidden: shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 12 },
              visible: { opacity: 1, y: 0 }
            }}
          >
            <ProductCard product={product} lang={lang} onSelect={() => onProductSelect(product)} />
          </motion.div>
        ))}
      </motion.div>
      
      {/* Desktop: Original layout with stagger */}
      <motion.div 
        className="hidden md:grid md:grid-cols-3 gap-6 md:gap-8 pb-10 px-6 md:px-8 max-w-[1440px] mx-auto"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={{
          visible: {
            transition: {
              staggerChildren: shouldReduceMotion ? 0 : 0.06
            }
          }
        }}
      >
        {displayProducts.map((product) => (
          <motion.div 
            key={product.id} 
            className="min-w-[85vw] md:min-w-0 snap-center"
            variants={{
              hidden: shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 16 },
              visible: { opacity: 1, y: 0, scale: 1 }
            }}
          >
            <ProductCard product={product} lang={lang} onSelect={() => onProductSelect(product)} />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};
