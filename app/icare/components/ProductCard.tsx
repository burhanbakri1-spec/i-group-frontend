import React, { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Language, translations } from '../translations';
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

const getShowcaseDescription = (product: Product, fallback: string) => (
  product.description
  || product.sub
  || product.main
  || product.category
  || fallback
);

const getCategoryLabel = (product: Product) => {
  const raw = product.category?.trim() || product.brand?.trim() || '';
  return raw.toLowerCase();
};

const getTagline = (product: Product) => product.sub?.trim() || '';

const getCardLabel = (product: Product) => (
  product.label
  || product.brand
  || product.category
  || ''
);

const getBadgeLabel = (product: Product, isPurchasable: boolean, soldOutText: string) => {
  if (!isPurchasable) {
    return soldOutText;
  }

  const label = product.label?.trim();
  if (!label) {
    return null;
  }

  const category = getCategoryLabel(product);
  if (label.toLowerCase() === category) {
    return null;
  }

  return label;
};

const parseRating = (rating?: string) => {
  const value = Number.parseFloat(rating ?? '0');
  if (!Number.isFinite(value) || value <= 0) {
    return 0;
  }

  return Math.min(5, Math.max(0, value));
};

const ProductCardStar = ({ filled }: { filled: boolean }) => (
  <svg viewBox="0 0 20 20" aria-hidden="true" className={filled ? 'is-filled' : 'is-empty'}>
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

const ProductCardRating = ({ rating, reviewCount }: { rating: number; reviewCount: string }) => {
  const filledStars = Math.round(rating);

  return (
    <div className="icare-product-card__rating">
      <div className="icare-product-card__stars" aria-hidden="true">
        {[0, 1, 2, 3, 4].map((index) => (
          <ProductCardStar key={index} filled={index < filledStars} />
        ))}
      </div>
      <span className="icare-product-card__review-count">({reviewCount})</span>
    </div>
  );
};

const ProductCardBase: React.FC<ProductCardProps> = ({
  product,
  lang,
  onSelect,
  variant = 'standard',
  showQuickAdd = true,
}) => {
  const t = translations[lang];
  const [isHovered, setIsHovered] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const { addToCart } = useShop();
  const isPurchasable = isPurchasableStock(product.stockStatus, product.stock);
  const displayName = getDisplayName(product);
  const showcaseDescription = getShowcaseDescription(product, t.product.dailySkinEssential);
  const categoryLabel = getCategoryLabel(product);
  const tagline = getTagline(product);
  const badgeLabel = getBadgeLabel(product, isPurchasable, t.product.soldOutLower);
  const cardLabel = getCardLabel(product);
  const hoverImage = product.secondaryImage ?? null;
  const shouldShowQuickAdd = showQuickAdd && variant === 'standard';
  const reviewCount = product.reviews?.trim() || '0';
  const rating = parseRating(product.rating);

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
          aria-label={`${t.product.view} ${displayName}`}
        >
          {variant === 'standard' ? (
            <>
              <div className="icare-product-card__primary">
                <div className="icare-product-card__initial">
                  <span className="icare-product-card__media">
                    <ImageWithFallback
                      src={primaryImage}
                      alt={displayName}
                      className="icare-product-card__image"
                    />
                  </span>
                </div>
              </div>

              <div className="icare-product-card__overlay">
                <div className="icare-product-card__overlay-top">
                  {categoryLabel ? (
                    <h2 className="icare-product-card__category">{categoryLabel}</h2>
                  ) : (
                    <span />
                  )}
                  {badgeLabel ? (
                    <div className="icare-product-card__badges">
                      <span className="icare-product-card__badge">{badgeLabel}</span>
                    </div>
                  ) : null}
                </div>

                <div className="icare-product-card__overlay-bottom">
                  <div className="icare-product-card__details">
                    <ProductCardRating rating={rating} reviewCount={reviewCount} />
                    <div className="icare-product-card__title-row">
                      <p className="icare-product-card__name">{displayName}</p>
                      <p className="icare-product-card__price">{product.price}</p>
                    </div>
                    {tagline ? (
                      <p className="icare-product-card__tagline">{tagline}</p>
                    ) : null}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="icare-product-card__primary">
              <span className="icare-product-card__media">
                {cardLabel && (
                  <span className="icare-product-card__label">{cardLabel}</span>
                )}
                {!isPurchasable && (
                  <span className="icare-product-card__stock">
                    {t.product.soldOutLower}
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
                    <span className="icare-product-card__description">{showcaseDescription}</span>
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
          )}
        </div>

        {hoverImage && (
          <motion.div
            className="icare-product-card__hover-media"
            initial={false}
            animate={{
              opacity: isHovered ? 1 : 0,
            }}
            transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
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
                ? t.product.quickAdd
                : t.product.soldOut}
            </button>
          </motion.div>
        )}
      </div>
    </motion.article>
  );
};

export const ProductCard = React.memo(ProductCardBase);
