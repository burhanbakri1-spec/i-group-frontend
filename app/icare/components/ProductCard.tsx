import React, { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Star, Plus, Heart } from 'lucide-react';
import { Language } from '../translations';
import { useShop } from '../context/ShopContext';
import { Product } from '../types';
import { isPurchasableStock } from '../lib/mappers';

interface ProductCardProps {
  product: Product;
  lang: Language;
  onSelect?: () => void;
}

const ProductCardBase: React.FC<ProductCardProps> = ({ product, lang, onSelect }) => {
  const [isHovered, setIsHovered] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const { addToCart, addToWishlist, isInWishlist, removeFromWishlist } = useShop();
  const inWishlist = isInWishlist(product.id);
  const isPurchasable = isPurchasableStock(product.stockStatus, product.stock);

  const displayTitle = (product.title || product.type || product.main || '').split(' ')[0];
  const reviewsCount = product.reviews || '0';

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPurchasable) {
      addToCart(product);
    }
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (inWishlist) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  const handleCardKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget || !onSelect || (e.key !== 'Enter' && e.key !== ' ')) {
      return;
    }

    e.preventDefault();
    onSelect();
  };

  const cardMotion = shouldReduceMotion
    ? {}
    : {
        initial: { opacity: 0, y: 14 },
        whileInView: { opacity: 1, y: 0 },
      };

  return (
    <motion.div 
      className="group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      {...cardMotion}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ 
        duration: 0.4,
        ease: [0.22, 1, 0.36, 1]
      }}
    >
      <motion.div 
        className="relative aspect-[4/5] bg-[#F2F2F2] rounded-[14px] md:rounded-[20px] overflow-hidden p-4 md:p-7 flex flex-col justify-between border border-black/5 hover:border-black/10 transition-[border-color,box-shadow] duration-300 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/70 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
        onClick={onSelect}
        onKeyDown={handleCardKeyDown}
        role={onSelect ? 'button' : undefined}
        tabIndex={onSelect ? 0 : undefined}
      >
        
        {/* Top Section: Category Title and Badge */}
        <div
          className="flex justify-between items-start w-full relative z-10"
        >
          <h3
            className="text-[24px] sm:text-[28px] md:text-[42px] font-black tracking-tighter text-[#3F3F3F] lowercase leading-[0.84] font-sans"
          >
            {displayTitle}
          </h3>
          <div className="flex items-center gap-1 md:gap-2">
            {product.badge && (
              <span
                className="bg-[#5A5A5A] text-white px-2 md:px-3 py-1 rounded-full text-[8px] md:text-[10px] font-bold uppercase tracking-wider"
              >
                {product.badge}
              </span>
            )}
            {!isPurchasable && (
              <span
                className="bg-black/70 text-white px-2 md:px-3 py-1 rounded-full text-[8px] md:text-[10px] font-bold uppercase tracking-wider"
              >
                sold out
              </span>
            )}
            <motion.button
              onClick={handleToggleWishlist}
              className="p-2 hover:bg-white/70 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#F2F2F2]"
              whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
              aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              <Heart
                size={16}
                className={`md:w-5 md:h-5 transition-colors ${inWishlist ? 'fill-red-500 text-red-500' : 'text-[#555]'}`}
              />
            </motion.button>
          </div>
        </div>

        {/* Center Section: Product Image */}
        <div className="absolute inset-0 flex items-center justify-center p-4 md:p-12 py-10 md:py-20">
          <div>
            <ImageWithFallback 
              src={product.image} 
              alt={product.name} 
              className="max-w-[86%] md:max-w-[84%] max-h-[62%] md:max-h-[64%] object-contain drop-shadow-xl"
            />
          </div>
        </div>

        {/* Bottom Section: Info */}
        <div
          className="relative z-10 mt-auto space-y-2.5"
        >
          {/* Stars and Count */}
          <div className="flex items-center gap-1 mb-1">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <span key={i}>
                  <Star size={9} className="md:w-[13px] md:h-[13px]" fill="#4D4D4D" stroke="#4D4D4D" />
                </span>
              ))}
            </div>
            <span className="text-[10px] md:text-[14px] text-[#444] font-semibold">
              ({reviewsCount})
            </span>
          </div>

          {/* Name and Price Row */}
          <div className="flex justify-between items-end gap-1 mb-2">
            <div className="flex flex-col min-w-0 flex-1">
                <h2 className="text-[13px] md:text-[19px] font-black uppercase tracking-tight text-[#3F3F3F] leading-tight truncate">
                  {product.category}
                </h2>
              <p className="text-[11px] md:text-[14px] text-[#555] font-medium leading-snug line-clamp-2 md:line-clamp-1">
                {product.description}
              </p>
            </div>
            <span className="text-[13px] md:text-[19px] font-bold text-[#3F3F3F] whitespace-nowrap">
              {product.price}
            </span>
          </div>

          {/* Add to Cart Button - Inside Card */}
          <motion.button
            onClick={handleAddToCart}
            disabled={!isPurchasable}
            className="w-full py-2.5 md:py-2.5 border border-[#777] bg-transparent rounded-full text-[10px] md:text-[11px] font-black uppercase tracking-wider text-[#4A4A4A] transition-all duration-200 ease-out hover:bg-black hover:text-white hover:border-black hover:scale-[1.02] hover:shadow-md active:scale-[0.97] motion-reduce:hover:scale-100 motion-reduce:active:scale-100 disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-[#4A4A4A] disabled:hover:scale-100 disabled:hover:shadow-none disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#F2F2F2]"
          >
            {isPurchasable ? (lang === 'en' ? 'Add to Cart' : 'أضف للسلة') : (lang === 'en' ? 'Sold Out' : 'نفد المخزون')}
          </motion.button>
        </div>

        {/* Desktop Overlay - Hidden on Mobile */}
        <motion.div 
          className="hidden md:flex absolute inset-0 bg-white/30 backdrop-blur-xs items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.button 
            onClick={handleAddToCart}
            disabled={!isPurchasable}
            className="bg-black text-white px-10 py-4 rounded-full text-[12px] font-black uppercase tracking-widest shadow-xl flex items-center gap-2 transition-all duration-200 ease-out hover:scale-[1.03] active:scale-[0.97] motion-reduce:hover:scale-100 motion-reduce:active:scale-100 disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/70 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
            initial={{ opacity: 0 }}
            animate={isHovered ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Plus size={18} strokeWidth={3} />
            {isPurchasable ? (lang === 'en' ? 'Add to Cart' : 'أضف للسلة') : (lang === 'en' ? 'Sold Out' : 'نفد المخزون')}
          </motion.button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export const ProductCard = React.memo(ProductCardBase);
