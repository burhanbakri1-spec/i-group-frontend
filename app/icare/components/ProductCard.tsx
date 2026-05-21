import React, { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Language } from '../translations';
import { Product } from '../types';
import { isPurchasableStock } from '../lib/mappers';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useShop } from '../context/ShopContext';

interface ProductCardProps {
  product: Product;
  lang: Language;
  onSelect?: () => void;
}

const ProductCardBase: React.FC<ProductCardProps> = ({ product, lang, onSelect }) => {
  const [isHovered, setIsHovered] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const { addToCart } = useShop();
  const isPurchasable = isPurchasableStock(product.stockStatus, product.stock);

  const hoverImage = product.images && product.images.length > 1 ? product.images[1] : null;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect?.();
    }
  };

  const cardMotion = shouldReduceMotion
    ? {}
    : {
        initial: { opacity: 0, y: 12 },
        whileInView: { opacity: 1, y: 0 },
      };

  return (
    <motion.div
      className="group block w-full"
      {...cardMotion}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      <a
        onClick={onSelect}
        onKeyDown={handleKeyDown}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        tabIndex={0}
        role="link"
        className="relative block w-full bg-white rounded-[12px] overflow-hidden font-sans cursor-pointer p-[16px]"
      >
        {/* Primary content: image + text — visible at rest, with padding on all sides */}
        <div className="relative z-10 transition-opacity duration-500 ease-out group-hover:opacity-0">
          {/* Label — floating over image, categorization header */}
          {product.label && (
            <span className="absolute top-3 left-3 z-20 text-[16px] font-black uppercase tracking-[0.25em] text-[var(--rb-primary-text)]">
              {product.label}
            </span>
          )}

          {/* Main image */}
          <div className="aspect-square rounded-[var(--rb-radius-card)] overflow-hidden">
            <ImageWithFallback
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Badges */}
          {!isPurchasable && (
            <span className="absolute top-3 right-3 z-20 px-3 py-1 bg-black/70 text-white text-[10px] font-bold uppercase tracking-wider rounded-full">
              sold out
            </span>
          )}

          {/* Text */}
          <div className="pt-[10px] pb-[14px] flex flex-col gap-[12px]">
            <h3 className="font-bold text-sm text-[var(--rb-primary-text)] uppercase tracking-[0.28px] leading-[16.8px]">
              {product.name}
            </h3>
            <div className="flex items-center gap-2">
              <p className="text-sm font-normal text-[var(--rb-primary-text)] tracking-[0.313835px]">
                {product.price}
              </p>
              {product.originalPrice && (
                <span className="text-xs text-[var(--rb-gray-ACA9A5)] line-through">
                  {product.originalPrice}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Hover overlay: alternate image fills entire card body */}
        {hoverImage && (
          <motion.div
            className="absolute inset-0 z-20"
            initial={false}
            animate={{
              opacity: isHovered ? 1 : 0,
            }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <ImageWithFallback
              src={hoverImage}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </motion.div>
        )}

        {/* Quick Add button — visible on hover, stays on top of everything */}
        <motion.div
          className="absolute bottom-[14px] left-3 right-3 z-30"
          initial={false}
          animate={{
            y: isHovered ? 0 : 60,
            opacity: isHovered ? 1 : 0,
          }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              if (isPurchasable) {
                addToCart(product);
              }
            }}
            disabled={!isPurchasable}
            className="w-full py-2.5 bg-[var(--rb-primary-text)] text-white text-[13px] font-medium rounded-full hover:bg-[#525252] active:scale-[0.98] hover:shadow-lg transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isPurchasable
              ? (lang === 'en' ? 'Quick Add' : 'إضافة سريعة')
              : (lang === 'en' ? 'Sold Out' : 'نفد المخزون')}
          </button>
        </motion.div>
      </a>
    </motion.div>
  );
};

export const ProductCard = React.memo(ProductCardBase);
