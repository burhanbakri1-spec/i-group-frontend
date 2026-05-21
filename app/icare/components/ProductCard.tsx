import React, { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Language } from '../translations';
import { Product } from '../types';
import { isPurchasableStock } from '../lib/mappers';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface ProductCardProps {
  product: Product;
  lang: Language;
  onSelect?: () => void;
}

const ProductCardBase: React.FC<ProductCardProps> = ({ product, lang, onSelect }) => {
  const [isHovered, setIsHovered] = useState(false);
  const shouldReduceMotion = useReducedMotion();
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
        className="block w-full bg-white rounded-[12px] overflow-hidden font-sans cursor-pointer"
      >
        {/* Image: full-bleed, at top of card */}
        <div className="pt-[26px]">
          <div className="relative overflow-hidden">
            <div className="aspect-square bg-[var(--rb-bg-surface)] relative overflow-hidden">
              <motion.div
                className="absolute inset-0"
                animate={{ opacity: isHovered && hoverImage ? 0 : 1 }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              >
                <ImageWithFallback
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </motion.div>
              {hoverImage && (
                <motion.div
                  className="absolute inset-0"
                  animate={{ opacity: isHovered ? 1 : 0 }}
                  transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                >
                  <ImageWithFallback
                    src={hoverImage}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </motion.div>
              )}
            </div>

            {/* Badges */}
            {product.badge && (
              <span className="absolute top-3 left-3 px-3 py-1 bg-white text-[10px] font-bold uppercase tracking-wider rounded-full shadow-sm">
                {product.badge}
              </span>
            )}
            {!isPurchasable && (
              <span className="absolute top-3 left-3 px-3 py-1 bg-black/70 text-white text-[10px] font-bold uppercase tracking-wider rounded-full">
                sold out
              </span>
            )}
          </div>
        </div>

        {/* Content area: text + hover button, with horizontal padding */}
        <div className="relative px-[16px] pt-[10px] pb-[14px] min-h-[60px]">
          {/* Text content — visible at rest, hides on hover */}
          <div className="transition-all duration-300 ease-out group-hover:opacity-0 group-hover:-translate-y-2">
            <h3 className="font-bold text-sm text-[var(--rb-primary-text)] uppercase tracking-[0.28px] leading-[16.8px]">
              {product.name}
            </h3>
            <div className="flex items-center gap-2 mt-1">
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

          {/* Quick Add button — hidden at rest, shows from bottom on hover */}
          <div className="absolute inset-x-[16px] bottom-[14px] transition-all duration-300 ease-out opacity-0 translate-y-6 group-hover:opacity-100 group-hover:translate-y-0">
            <button
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                if (isPurchasable && onSelect) {
                  onSelect();
                }
              }}
              disabled={!isPurchasable}
              className="w-full py-2.5 bg-[var(--rb-primary-text)] text-white text-[13px] font-medium rounded-full hover:bg-[var(--rb-gray-525252)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isPurchasable
                ? (lang === 'en' ? 'Quick Add' : 'إضافة سريعة')
                : (lang === 'en' ? 'Sold Out' : 'نفد المخزون')}
            </button>
          </div>
        </div>
      </a>
    </motion.div>
  );
};

export const ProductCard = React.memo(ProductCardBase);
