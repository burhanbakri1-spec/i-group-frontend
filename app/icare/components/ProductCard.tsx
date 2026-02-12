import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Star, Plus, Heart } from 'lucide-react';
import { Language, translations } from '../translations';
import { useShop } from '../context/ShopContext';

interface Product {
  id: string;
  title?: string;
  name: string;
  category?: string;
  price: string;
  image: string;
  description?: string;
  rating: string;
  reviews?: string;
  badge?: string;
  main?: string;
  sub?: string;
  type?: string;
  brand?: string;
}

interface ProductCardProps {
  product: Product;
  lang: Language;
  onSelect?: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, lang, onSelect }) => {
  const t = translations[lang];
  const [isHovered, setIsHovered] = useState(false);
  const { addToCart, addToWishlist, isInWishlist, removeFromWishlist } = useShop();
  const inWishlist = isInWishlist(product.id);

  const displayTitle = (product.title || product.type || product.main || '').split(' ')[0];
  const reviewsCount = product.reviews || '0';

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product);
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (inWishlist) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  return (
    <motion.div 
      className="group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ 
        duration: 0.6, 
        ease: [0.22, 1, 0.36, 1]
      }}
    >
      {/* Main Container - Taller for mobile like Rhode Skin */}
      <motion.div 
        className="relative aspect-[2/3] md:aspect-[4/5] bg-[#F2F2F2] rounded-[8px] md:rounded-[20px] overflow-hidden p-2 md:p-8 flex flex-col justify-between border border-transparent hover:border-[#E5E5E5] transition-all duration-500 cursor-pointer"
        onClick={onSelect}
        whileHover={{ 
          y: -8, 
          boxShadow: "0 20px 40px rgba(0,0,0,0.08)",
          scale: 1.02,
          transition: { duration: 0.3 }
        }}
        whileTap={{ scale: 0.98 }}
      >
        
        {/* Top Section: Category Title and Badge */}
        <motion.div 
          className="flex justify-between items-start w-full relative z-10"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
        >
          <motion.h3 
            className="text-[20px] md:text-[48px] font-black tracking-tighter text-[#4D4D4D] lowercase leading-[0.8] font-sans"
            whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
          >
            {displayTitle}
          </motion.h3>
          <div className="flex items-center gap-1 md:gap-2">
            {product.badge && (
              <motion.span 
                className="bg-[#666666] text-white px-1.5 md:px-3 py-0.5 md:py-1 rounded-full text-[7px] md:text-[10px] font-bold uppercase tracking-wider"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, type: "spring", bounce: 0.5 }}
              >
                {product.badge}
              </motion.span>
            )}
            <motion.button
              onClick={handleToggleWishlist}
              className="p-1.5 md:p-2 hover:bg-white/50 rounded-full transition-colors"
              whileHover={{ scale: 1.2, rotate: inWishlist ? 0 : 10 }}
              whileTap={{ scale: 0.9 }}
            >
              <motion.div
                animate={inWishlist ? { scale: [1, 1.3, 1] } : {}}
                transition={{ duration: 0.3 }}
              >
                <Heart 
                  size={16} 
                  className={`md:w-5 md:h-5 transition-colors ${inWishlist ? 'fill-red-500 text-red-500' : 'text-[#666]'}`}
                />
              </motion.div>
            </motion.button>
          </div>
        </motion.div>

        {/* Center Section: Product Image */}
        <div className="absolute inset-0 flex items-center justify-center p-4 md:p-12 py-10 md:py-20">
          <motion.div
            animate={isHovered ? { 
              scale: 1.12, 
              rotateY: 5,
              rotateX: -5,
            } : { 
              scale: 1, 
              rotateY: 0,
              rotateX: 0
            }}
            transition={{ 
              duration: 0.6, 
              ease: [0.33, 1, 0.68, 1]
            }}
            style={{ transformStyle: "preserve-3d" }}
          >
            <ImageWithFallback 
              src={product.image} 
              alt={product.name} 
              className="max-w-[85%] md:max-w-[85%] max-h-[60%] md:max-h-[65%] object-contain drop-shadow-2xl"
            />
          </motion.div>
        </div>

        {/* Bottom Section: Info */}
        <motion.div 
          className="relative z-10 mt-auto space-y-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4 }}
        >
          {/* Stars and Count */}
          <div className="flex items-center gap-1 mb-1">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 + i * 0.05 }}
                >
                  <Star size={9} className="md:w-[13px] md:h-[13px]" fill="#4D4D4D" stroke="#4D4D4D" />
                </motion.div>
              ))}
            </div>
            <span className="text-[9px] md:text-[15px] text-[#4D4D4D] font-medium">
              ({reviewsCount})
            </span>
          </div>

          {/* Name and Price Row */}
          <div className="flex justify-between items-end gap-1 mb-2">
            <div className="flex flex-col min-w-0 flex-1">
              <h2 className="text-[11px] md:text-[20px] font-black uppercase tracking-tight text-[#4D4D4D] leading-tight truncate">
                {product.name}
              </h2>
              <p className="text-[9px] md:text-[15px] text-[#666] font-medium leading-tight line-clamp-1">
                {product.description}
              </p>
            </div>
            <span className="text-[12px] md:text-[20px] font-bold text-[#4D4D4D] whitespace-nowrap">
              {product.price}
            </span>
          </div>

          {/* Add to Cart Button - Inside Card */}
          <motion.button
            onClick={handleAddToCart}
            className="w-full py-2 md:py-2.5 border border-[#999] bg-transparent rounded-full text-[9px] md:text-[11px] font-black uppercase tracking-wider text-[#666] hover:bg-black hover:text-white hover:border-black transition-all duration-300"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.4 }}
          >
            {lang === 'en' ? 'Add to Cart' : 'أضف للسلة'}
          </motion.button>
        </motion.div>

        {/* Desktop Overlay - Hidden on Mobile */}
        <motion.div 
          className="hidden md:flex absolute inset-0 bg-white/30 backdrop-blur-xs items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.button 
            onClick={handleAddToCart}
            className="bg-black text-white px-10 py-4 rounded-full text-[12px] font-black uppercase tracking-widest shadow-2xl flex items-center gap-2"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={isHovered ? { scale: 1, opacity: 1 } : { scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.3, type: "spring", bounce: 0.4 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              animate={{ rotate: isHovered ? 180 : 0 }}
              transition={{ duration: 0.5 }}
            >
              <Plus size={18} strokeWidth={3} />
            </motion.div>
            {lang === 'en' ? 'Add to Cart' : 'أضف للسلة'}
          </motion.button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};
