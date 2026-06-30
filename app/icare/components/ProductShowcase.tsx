import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Language, translations } from '../translations';
import { Product } from '../types';
import { fetchProductShortcut } from '../lib/catalog-client';
import { useSiteContent } from '../hooks/useSiteContent';
import { SkeletonPulse } from './ui/skeletons';
import { ScrollReveal } from './ui/ScrollReveal';

interface ProductShowcaseProps {
  products: Product[];
  lang: Language;
  onProductSelect: (product: Product) => void;
}

const StarIcon = () => (
  <svg viewBox="0 0 20 20" aria-hidden="true" className="fill-current">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

const getProductSubtitle = (product: Product) =>
  product.sub?.trim() || product.description?.trim() || '';

export const ProductShowcase: React.FC<ProductShowcaseProps> = ({ products, lang, onProductSelect }) => {
  void products;
  const t = translations[lang];
  const shouldReduceMotion = useReducedMotion();
  const { productShowcaseEmpty } = useSiteContent(lang);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [remoteProducts, setRemoteProducts] = useState<Product[] | null>(null);

  useEffect(() => {
    const loadShowcaseProducts = async () => {
      const featuredProducts = await fetchProductShortcut('featured', lang, 4);
      setRemoteProducts(featuredProducts ?? []);
    };
    loadShowcaseProducts();
  }, [lang]);

  const showcaseProducts = remoteProducts ?? [];

  if (remoteProducts === null) {
    return (
      <section className="icare-index-section icare-morning-section">
        <div className="icare-morning-skeleton">
          <SkeletonPulse className="icare-morning-skeleton__media" />
          <SkeletonPulse className="icare-morning-skeleton__panel" />
        </div>
      </section>
    );
  }

  if (showcaseProducts.length === 0) {
    return (
      <section className="icare-index-section icare-morning-section">
        <div className="icare-morning-empty">{productShowcaseEmpty}</div>
      </section>
    );
  }

  const slideCount = showcaseProducts.length;
  const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % slideCount);
  const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + slideCount) % slideCount);
  const current = showcaseProducts[currentIndex];
  const lifestyleImage = current.secondaryImage ?? current.primaryImage;
  const subtitle = getProductSubtitle(current);
  const reviewCount = current.reviews?.trim() || '0';

  return (
    <section dir={lang === 'ar' ? 'rtl' : 'ltr'} className="icare-index-section icare-morning-section">
      <ScrollReveal direction="bottom" viewportMargin="-60px">
        <header className="icare-morning-header">
          <h2 className="icare-morning-title">{t.pages.showcase.featuredSkincare}</h2>
        </header>
      </ScrollReveal>

      <div className="icare-morning-grid">
        <ScrollReveal direction="left" viewportMargin="-80px">
          <div className="icare-morning-media">
            <div className="icare-morning-media__viewport">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`media-${currentIndex}`}
                  initial={shouldReduceMotion ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={shouldReduceMotion ? undefined : { opacity: 0 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="icare-morning-media__slide"
                >
                  <ImageWithFallback
                    src={lifestyleImage}
                    alt={current.title ?? current.name}
                    className="icare-morning-media__image"
                  />
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="icare-morning-media__dots" role="tablist" aria-label={t.pages.showcase.featuredSkincare}>
              {showcaseProducts.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  role="tab"
                  aria-selected={index === currentIndex}
                  aria-label={t.pages.showcase.showProduct.replace('{index}', String(index + 1))}
                  onClick={() => setCurrentIndex(index)}
                  className={`icare-morning-media__dot${index === currentIndex ? ' is-active' : ''}`}
                />
              ))}
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal direction="right" viewportMargin="-80px">
          <div className="icare-morning-products">
            <article className="icare-morning-product">
              <div className="icare-morning-product__stage">
                <button
                  type="button"
                  className="icare-morning-product__nav icare-morning-product__nav--prev"
                  onClick={prevSlide}
                  aria-label={t.pages.showcase.previousProduct}
                >
                  <ArrowLeft size={16} strokeWidth={1.5} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  className="icare-morning-product__nav icare-morning-product__nav--next"
                  onClick={nextSlide}
                  aria-label={t.pages.showcase.nextProduct}
                >
                  <ArrowRight size={16} strokeWidth={1.5} aria-hidden="true" />
                </button>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={`product-${currentIndex}`}
                    initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={shouldReduceMotion ? undefined : { opacity: 0 }}
                    transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                    className="icare-morning-product__image"
                  >
                    <ImageWithFallback
                      src={current.primaryImage}
                      alt={current.title ?? current.name}
                      className="icare-morning-product__image-media"
                    />
                  </motion.div>
                </AnimatePresence>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={`details-${currentIndex}`}
                  initial={shouldReduceMotion ? false : { opacity: 0, x: lang === 'ar' ? 8 : -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={shouldReduceMotion ? undefined : { opacity: 0 }}
                  transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                  className="icare-morning-product__details"
                >
                  <div className="icare-morning-product__meta">
                    <div className="icare-morning-product__rating">
                      <div className="icare-morning-product__stars">
                        {[...Array(5)].map((_, index) => (
                          <StarIcon key={index} />
                        ))}
                      </div>
                      <span className="icare-morning-product__reviews">({reviewCount})</span>
                    </div>
                    <p className="icare-morning-product__title">{current.title ?? current.name}</p>
                    {subtitle ? <p className="icare-morning-product__subtitle">{subtitle}</p> : null}
                  </div>
                </motion.div>
              </AnimatePresence>

              <button
                type="button"
                className="icare-morning-product__cta"
                onClick={() => onProductSelect(current)}
              >
                {t.pages.showcase.addToCart}
              </button>

              <div className="icare-morning-product__index" aria-hidden="true">
                {currentIndex + 1}/{slideCount}
              </div>
            </article>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};
