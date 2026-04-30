import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ProductCard } from './ProductCard';
import { Language } from '../translations';
import { fetchCatalogProducts } from '../lib/catalog-client';
import { Product } from '../types';

interface ProductGridProps {
  lang: Language;
  onProductSelect: (product: Product) => void;
}

export const ProductGrid: React.FC<ProductGridProps> = ({ lang, onProductSelect }) => {
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
      <div className="w-full flex justify-center py-20">
        <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (displayProducts.length === 0) {
    return (
      <div className="bg-[#FFFFFF] py-16 text-center">
        <p className="text-[14px] font-bold uppercase tracking-[0.2em] text-black/40">
          {lang === 'en' ? 'No products available' : 'لا توجد منتجات متاحة'}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[#FFFFFF]">
      {/* Mobile: Horizontal scroll with snap */}
      <motion.div 
        className="md:hidden no-scrollbar mobile-trending-scroll"
        style={{
          display: 'flex',
          flexWrap: 'nowrap',
          gap: '8px',
          overflowX: 'auto',
          overflowY: 'hidden',
          padding: '0 8px 8px',
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
              staggerChildren: 0.08
            }
          }
        }}
      >
        {displayProducts.map((product) => (
          <motion.div
            key={product.id}
            className="snap-start mobile-trending-item"
            style={{
              flex: '0 0 76vw',
              width: '76vw',
              maxWidth: '76vw',
            }}
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 }
            }}
          >
            <ProductCard product={product} lang={lang} onSelect={() => onProductSelect(product)} />
          </motion.div>
        ))}
      </motion.div>
      
      {/* Desktop: Original layout with stagger */}
      <motion.div 
        className="hidden md:grid md:grid-cols-3 gap-6 md:gap-10 pb-8 px-6 md:px-0"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={{
          visible: {
            transition: {
              staggerChildren: 0.1
            }
          }
        }}
      >
        {displayProducts.map((product) => (
          <motion.div 
            key={product.id} 
            className="min-w-[85vw] md:min-w-0 snap-center"
            variants={{
              hidden: { opacity: 0, y: 30, scale: 0.9 },
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
