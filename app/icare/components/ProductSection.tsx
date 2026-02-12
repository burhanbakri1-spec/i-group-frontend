import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ProductCard } from './ProductCard';
import { Language } from '../translations';
import { fetchWixProducts } from '../lib/wix-client';

interface ProductGridProps {
  lang: Language;
  onProductSelect: (product: any) => void;
}

export const ProductGrid: React.FC<ProductGridProps> = ({ lang, onProductSelect }) => {
  const [products, setProducts] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const data = await fetchWixProducts();
      if (data) {
        setProducts(data);
      }
      setLoading(false);
    };
    loadData();
  }, []);

  const mockProducts = [
    {
      id: '1',
      title: lang === 'en' ? 'skin sets' : 'مجموعات البشرة',
      name: lang === 'en' ? 'THE SCENTED PEPTIDE LIP TINT SET' : 'مجموعة مرطب الشفاه المعطر بالببتيد',
      price: '$72.00',
      description: lang === 'en' ? 'Limited edition boxed set' : 'إصدار محدود في صندوق هدايا',
      image: 'https://images.unsplash.com/photo-1549127024-18ee7271c819?q=80&w=800',
      rating: '5',
      reviews: '15,787',
      badge: lang === 'en' ? 'limited edition' : 'إصدار محدود'
    },
    {
      id: '2',
      title: lang === 'en' ? 'eye preps' : 'تجهيز العين',
      name: lang === 'en' ? 'THE PEPTIDE EYE PREP SET' : 'مجموعة تحضير العين بالببتيد',
      price: '$47.00',
      description: lang === 'en' ? 'Depuffing eye patches' : 'لصقات العين لتقليل الانتفاخ',
      image: 'https://images.unsplash.com/photo-1738684033377-eb02299c1d6c?q=80&w=800',
      rating: '5',
      reviews: '241',
      badge: lang === 'en' ? 'only at icare' : 'حصرياً في آي كير'
    },
    {
      id: '3',
      title: lang === 'en' ? 'tint' : 'تلوين',
      name: lang === 'en' ? 'PEPTIDE LIP TINT' : 'مرطب الشفاه الملون بالببتيد',
      price: '$20.00',
      description: lang === 'en' ? 'The tinted lip layer' : 'طبقة ملونة للشفاه',
      image: 'https://images.unsplash.com/photo-1600664534138-f8910b0adc63?q=80&w=800',
      rating: '5',
      reviews: '15,787'
    }
  ];

  const displayProducts = products || mockProducts;

  if (loading && !products) {
    return (
      <div className="w-full flex justify-center py-20">
        <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-[#FFFFFF]">
      {/* Mobile: Grid with minimal spacing and stagger animation */}
      <motion.div 
        className="grid grid-cols-2 gap-0 p-0 m-0 md:hidden"
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
        {displayProducts.map((product, index) => (
          <motion.div
            key={product.id}
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
        className="hidden md:flex overflow-x-auto md:grid md:grid-cols-3 gap-6 md:gap-10 pb-8 px-6 md:px-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] snap-x snap-mandatory"
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
        {displayProducts.map((product, index) => (
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
