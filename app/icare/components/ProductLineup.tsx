import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { ChevronRight, Star, Plus } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Product } from '../types';
import { Language, translations } from '../translations';
import { fetchProductShortcut } from '../lib/catalog-client';
import { SkeletonPulse } from './ui/skeletons';

interface ProductLineupProps {
  lang: Language;
  onProductSelect?: (product: Product) => void;
  products?: Product[] | null;
  useShortcutFallback?: boolean;
}

interface LineupItemProps {
  product?: Product;
  category: string;
  label?: string;
  name: string;
  description: string;
  price: string;
  originalPrice?: string;
  image: string;
  reviews: string;
  quickAddText?: string;
  onSelect?: (product: Product) => void;
}

const CONTROL_FOCUS_CLASS = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7B7872] focus-visible:ring-offset-2 focus-visible:ring-offset-white';

const LineupCardBase: React.FC<LineupItemProps> = ({ product, category, label, name, description, price, originalPrice, image, reviews, quickAddText = 'Quick Add', onSelect }) => {
  const [isHovered, setIsHovered] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const selectProduct = () => product && onSelect?.(product);

  return (
    <motion.div 
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={selectProduct}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          selectProduct();
        }
      }}
      role="button"
      tabIndex={product ? 0 : -1}
      className={`icare-lineup__card group ${CONTROL_FOCUS_CLASS}`}
    >
      {/* Top Section: Category and Badge */}
      <div className="icare-lineup__card-head">
        <h3 className="icare-lineup__category">
          {category}
        </h3>
        {label && (
          <div className="icare-lineup__badge">
            <span>
              {label}
            </span>
          </div>
        )}
      </div>

      {/* Center Section: Product Image with Quick Add Overlay */}
      <div className="icare-lineup__media">
        <motion.div
          animate={{ 
            scale: !shouldReduceMotion && isHovered ? 1.02 : 1,
            y: !shouldReduceMotion && isHovered ? -4 : 0
          }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.25, ease: [0.32, 0.72, 0, 1] }}
          className="icare-lineup__media-motion"
        >
          <div className="icare-lineup__image-wrap">
            <ImageWithFallback 
              src={image} 
              alt={name} 
              className="icare-lineup__image"
            />
            
            {/* Quick Add Button Overlay */}
            <AnimatePresence>
              {isHovered && (
                <motion.div
                  initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: shouldReduceMotion ? 0 : 6, scale: 0.98 }}
                  transition={{ duration: shouldReduceMotion ? 0 : 0.18 }}
                  className="icare-lineup__quick-add-overlay"
                >
                  <button type="button" className={`icare-lineup__quick-add ${CONTROL_FOCUS_CLASS}`} onClick={(event) => { event.stopPropagation(); selectProduct(); }}>
                    <Plus size={16} strokeWidth={3} />
                     <span>{quickAddText}</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      {/* Bottom Section: Info */}
      <div className="icare-lineup__copy">
        {/* Reviews */}
        <div className="icare-lineup__rating">
          <div className="icare-lineup__stars">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={11} fill="black" className="text-black" />
            ))}
          </div>
          <span>({reviews})</span>
        </div>

        {/* Name and Price */}
        <div className="icare-lineup__name-row">
          <h4 className="icare-lineup__name">
            {name}
          </h4>
          <div className="icare-lineup__prices">
            {originalPrice && (
              <span className="icare-lineup__price icare-lineup__price--old">{originalPrice}</span>
            )}
            <span className="icare-lineup__price">
              {price}
            </span>
          </div>
        </div>
        
        <p className="icare-lineup__description">
          {description}
        </p>
      </div>
    </motion.div>
  );
};

const LineupCard = React.memo(LineupCardBase);

export const ProductLineup: React.FC<ProductLineupProps> = ({ lang, onProductSelect, products, useShortcutFallback = true }) => {
  const t = translations[lang];
  const scrollRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const [remoteProducts, setRemoteProducts] = useState<Product[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadProducts = useCallback(async () => {
    setError(null);
    if (products) {
      setRemoteProducts(products);
      return;
    }
    if (!useShortcutFallback) {
      setRemoteProducts([]);
      return;
    }
    try {
      const bestsellers = await fetchProductShortcut('bestsellers', lang, 8);
      setRemoteProducts(bestsellers ?? []);
    } catch (err) {
      console.error('Failed to load product lineup', err);
      setError(err instanceof Error ? err.message : 'Failed to load products.');
      setRemoteProducts([]);
    }
  }, [products, useShortcutFallback, lang]);

  useEffect(() => {
    void Promise.resolve().then(loadProducts);
  }, [loadProducts]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollAmount = clientWidth * 0.8;
      const scrollTo = direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: shouldReduceMotion ? 'auto' : 'smooth' });
    }
  };

  const items = remoteProducts ?? [];

  if (remoteProducts === null) {
    return (
      <section className="icare-index-section icare-lineup">
        <div className="icare-lineup__inner">
          <div className="icare-lineup__track is-loading">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="icare-lineup__skeleton">
                <SkeletonPulse className="aspect-square w-full rounded-[var(--rb-radius-card)]" />
                <SkeletonPulse className="h-4 w-2/3 rounded" />
                <SkeletonPulse className="h-4 w-1/3 rounded" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="icare-index-section icare-lineup">
        <div className="icare-lineup__state">
          <p className="text-[13px] text-red-600 font-medium">{error}</p>
          <button
            onClick={loadProducts}
            className={`inline-flex min-h-12 items-center justify-center whitespace-nowrap px-6 py-2 bg-[#67645E] text-white rounded-full text-[11px] font-black uppercase tracking-[0.2em] hover:bg-[#67645E]/90 transition-colors ${CONTROL_FOCUS_CLASS}`}
          >
            {t.product.retry || 'Retry'}
          </button>
        </div>
      </section>
    );
  }

  if (items.length === 0) {
    return (
      <section className="icare-index-section icare-lineup">
        <div className="icare-lineup__state">
          {t.product.noRelatedProducts || 'no related products are available yet'}
        </div>
      </section>
    );
  }

  return (
    <section className="icare-index-section icare-lineup">
      <div className="icare-lineup__inner group">
        <div 
          ref={scrollRef}
          className="icare-lineup__track no-scrollbar"
        >
          {items.map((item) => (
            <div key={item.id} className="icare-lineup__item">
                 <LineupCard
                   product={item}
                   category={item.title ?? item.category ?? 'icare'}
                    label={item.label}
                   name={item.name}
                   description={item.description ?? item.category ?? 'iCare product'}
                   price={item.price}
                   originalPrice={item.originalPrice}
                   image={item.primaryImage}
                   reviews={item.reviews ?? '0'}
                   quickAddText={t.product.quickAdd}
                   onSelect={onProductSelect}
                 />
            </div>
          ))}
        </div>

        {/* Navigation Arrows */}
        <div className="icare-lineup__nav-wrap">
            <button 
            onClick={() => scroll('left')}
            className={`icare-lineup__nav icare-lineup__nav--prev ${CONTROL_FOCUS_CLASS}`}
            aria-label="Scroll related products left"
            >
            <ChevronRight size={24} className="rotate-180" />
            </button>
            <button 
            onClick={() => scroll('right')}
            className={`icare-lineup__nav icare-lineup__nav--next ${CONTROL_FOCUS_CLASS}`}
            aria-label="Scroll related products right"
            >
            <ChevronRight size={24} />
            </button>
        </div>
      </div>
    </section>
  );
};
