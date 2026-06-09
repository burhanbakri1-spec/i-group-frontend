import React, { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Language } from '../translations';
import { Product } from '../types';
import { isPurchasableStock } from '../lib/mappers';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useShop } from '../context/ShopContext';

type ProductCardVariant = 'standard' | 'showcase';

interface ProductCardProps {
  product: Product;
  lang: Language;
  onSelect?: () => void;
  variant?: ProductCardVariant;
  showQuickAdd?: boolean;
}

const getDisplayName = (product: Product) => product.title ?? product.name;

const getDisplayDescription = (product: Product, lang: Language) => (
  product.description
  || product.sub
  || product.main
  || product.category
  || (lang === 'en' ? 'daily skin essential' : 'أساسي للعناية اليومية')
);

const getCardLabel = (product: Product) => (
  product.label
  || product.brand
  || product.category
  || ''
);

const ProductCardBase: React.FC<ProductCardProps> = ({
  product,
  lang,
  onSelect,
  variant = 'standard',
  showQuickAdd = true,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const { addToCart } = useShop();
  const isPurchasable = isPurchasableStock(product.stockStatus, product.stock);
  const displayName = getDisplayName(product);
  const description = getDisplayDescription(product, lang);
  const cardLabel = getCardLabel(product);
  const hoverImage = product.secondaryImage ?? null;
  const shouldShowQuickAdd = showQuickAdd && variant === 'standard';

  const primaryImage = product.primaryImage;

  const cardMotion = shouldReduceMotion
    ? {}
    : {
        initial: { opacity: 0, y: 12 },
        whileInView: { opacity: 1, y: 0 },
      };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onSelect?.();
    }
  };

  const handleQuickAdd = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    if (isPurchasable) {
      addToCart(product);
    }
  };

  return (
    <motion.article
      className={`icare-product-card icare-product-card--${variant}`}
      {...cardMotion}
      viewport={{ once: false, margin: '-50px' }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      <div
        className={`icare-product-card__surface ${isHovered ? 'is-hovered' : ''} ${hoverImage ? 'has-hover-media' : ''}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div
          className="icare-product-card__main-action"
          onClick={onSelect}
          onKeyDown={handleKeyDown}
          tabIndex={0}
          role="link"
          aria-label={`${lang === 'en' ? 'View' : 'عرض'} ${displayName}`}
        >
          <div className="icare-product-card__primary">
            <span className="icare-product-card__media">
              {cardLabel && (
                <span className="icare-product-card__label">{cardLabel}</span>
              )}
              {!isPurchasable && (
                <span className="icare-product-card__stock">
                  {lang === 'en' ? 'sold out' : 'نفد المخزون'}
                </span>
              )}
              <ImageWithFallback
                src={primaryImage}
                alt={displayName}
                className="icare-product-card__image"
              />
            </span>

            <span className="icare-product-card__body">
              <span className="icare-product-card__summary">
                <span className="icare-product-card__copy">
                  <span className="icare-product-card__name">{displayName}</span>
                  <span className="icare-product-card__description">{description}</span>
                </span>
                <span className="icare-product-card__price">
                  {product.originalPrice && (
                    <span className="icare-product-card__original-price">{product.originalPrice}</span>
                  )}
                  {product.price}
                </span>
              </span>
            </span>
          </div>
        </div>

        {hoverImage && (
          <motion.div
            className="icare-product-card__hover-media"
            initial={false}
            animate={{
              opacity: isHovered ? 1 : 0,
            }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            aria-hidden="true"
          >
            <ImageWithFallback
              src={hoverImage}
              alt=""
              className="icare-product-card__hover-image"
            />
          </motion.div>
        )}

        {shouldShowQuickAdd && (
          <motion.div
            className="icare-product-card__quick-add-wrap"
            initial={false}
            animate={{
              y: isHovered ? 0 : 60,
              opacity: isHovered ? 1 : 0,
            }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <button
              type="button"
              className="icare-product-card__quick-add min-h-[44px]"
              onClick={handleQuickAdd}
              disabled={!isPurchasable}
            >
              {isPurchasable
                ? (lang === 'en' ? 'Quick Add' : 'إضافة سريعة')
                : (lang === 'en' ? 'Sold Out' : 'نفد المخزون')}
            </button>
          </motion.div>
        )}
      </div>
    </motion.article>
  );
};

export const ProductCard = React.memo(ProductCardBase);
