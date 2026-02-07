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
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* Main Container - Taller for mobile like Rhode Skin */}
      <div 
        className="relative aspect-[2/3] md:aspect-[4/5] bg-[#F2F2F2] rounded-[8px] md:rounded-[20px] overflow-hidden p-2 md:p-8 flex flex-col justify-between border border-transparent hover:border-[#E5E5E5] transition-colors duration-300 cursor-pointer"
        onClick={onSelect}
      >
        
        {/* Top Section: Category Title and Badge */}
        <div className="flex justify-between items-start w-full relative z-10">
          <h3 className="text-[20px] md:text-[48px] font-black tracking-tighter text-[#4D4D4D] lowercase leading-[0.8] font-sans">
            {displayTitle}
          </h3>
          <div className="flex items-center gap-1 md:gap-2">
            {product.badge && (
              <span className="bg-[#666666] text-white px-1.5 md:px-3 py-0.5 md:py-1 rounded-full text-[7px] md:text-[10px] font-bold uppercase tracking-wider">
                {product.badge}
              </span>
            )}
            <button
              onClick={handleToggleWishlist}
              className="p-1.5 md:p-2 hover:bg-white/50 rounded-full transition-colors"
            >
              <Heart 
                size={16} 
                className={`md:w-5 md:h-5 transition-colors ${inWishlist ? 'fill-red-500 text-red-500' : 'text-[#666]'}`}
              />
            </button>
          </div>
        </div>

        {/* Center Section: Product Image */}
        <div className="absolute inset-0 flex items-center justify-center p-4 md:p-12 py-10 md:py-20">
          <ImageWithFallback 
            src={product.image} 
            alt={product.name} 
            className={`max-w-[85%] md:max-w-[85%] max-h-[60%] md:max-h-[65%] object-contain drop-shadow-2xl transition-transform duration-700 ease-out ${isHovered ? 'scale-110' : 'scale-100'}`}
          />
        </div>

        {/* Bottom Section: Info */}
        <div className="relative z-10 mt-auto space-y-2">
          {/* Stars and Count */}
          <div className="flex items-center gap-1 mb-1">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={9} className="md:w-[13px] md:h-[13px]" fill="#4D4D4D" stroke="#4D4D4D" />
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
          <button
            onClick={handleAddToCart}
            className="w-full py-2 md:py-2.5 border border-[#999] bg-transparent rounded-full text-[9px] md:text-[11px] font-black uppercase tracking-wider text-[#666] hover:bg-black hover:text-white hover:border-black transition-all duration-300"
          >
            {lang === 'en' ? 'Add to Cart' : 'أضف للسلة'}
          </button>
        </div>

        {/* Desktop Overlay - Hidden on Mobile */}
        <div className={`hidden md:flex absolute inset-0 bg-white/30 backdrop-blur-xs transition-opacity duration-300 items-center justify-center ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
          <button 
            onClick={handleAddToCart}
            className="bg-black text-white px-10 py-4 rounded-full text-[12px] font-black uppercase tracking-widest shadow-2xl transform transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-2"
          >
            <Plus size={18} strokeWidth={3} />
            {lang === 'en' ? 'Add to Cart' : 'أضف للسلة'}
          </button>
        </div>
      </div>
    </motion.div>
  );
};
