'use client';

/**
 * KitContents.tsx — E2 showcase unit.
 * Mobile: horizontal scroll-snap carousel of product cards.
 * Desktop: 2-column layout — product grid on the left, sticky active-product
 *          media on the right with AnimatePresence cross-fade.
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx } from 'clsx';
import { UnitShell, Eyebrow, SectionTitle } from '../shared/UnitShell';
import { registerUnit } from '../../../lib/showcase/registry';
import type { NormalizedShowcaseUnit, KitContentsPayload } from '../../../types/showcase-units';
import { EASE_STANDARD, DUR, STAGGER_STEP, VIEWPORT } from '../../../lib/showcase/motion';
import { ImageWithFallback } from '../../figma/ImageWithFallback';
import { TextPlaceholder } from '../shared/TextPlaceholder';
import { ImagePlaceholder } from '../shared/ImagePlaceholder';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Props {
  unit: NormalizedShowcaseUnit<KitContentsPayload>;
  lang?: 'en' | 'ar';
  shouldReduceMotion: boolean;
}

interface ProductCardProps {
  product: KitContentsPayload['products'][number];
  isActive: boolean;
  onClick: () => void;
  index: number;
  shouldReduceMotion: boolean;
  isRtl: boolean;
}

// ─── Star rating SVG ──────────────────────────────────────────────────────────

const StarDisplay: React.FC<{ rating: number; className?: string }> = ({ rating, className }) => (
  <span className={clsx('inline-flex gap-0.5', className)} aria-hidden="true">
    {[...Array(5)].map((_, i) => {
      const filled = i < Math.floor(rating) || (i === Math.floor(rating) && rating - Math.floor(rating) >= 0.5);
      return (
        <svg key={i} width="12" height="12" viewBox="0 0 20 20" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      );
    })}
  </span>
);

// ─── Product card (shared between mobile scroll and desktop grid) ─────────────

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  isActive,
  onClick,
  index,
  shouldReduceMotion,
  isRtl,
}) => (
  <motion.div
    className={clsx(
      'flex-shrink-0 md:flex-shrink rounded-[12px] border border-black/5 bg-white p-4 transition-colors duration-200',
      'snap-center',
      'cursor-pointer',
      isActive ? 'ring-2 ring-[var(--rb-primary-text)]' : 'hover:border-black/10',
    )}
    onClick={onClick}
    initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: VIEWPORT.default }}
    transition={{
      duration: shouldReduceMotion ? 0 : DUR.normal / 1000,
      ease: EASE_STANDARD,
      delay: shouldReduceMotion ? 0 : index * STAGGER_STEP,
    }}
  >
    {/* Product image */}
    <div className="aspect-square rounded-[12px] overflow-hidden bg-white mb-3">
      {product.image.url === '' ? (
        <ImagePlaceholder aspect="square" rounded="lg" />
      ) : (
        <ImageWithFallback src={product.image.url} alt={product.image.alt} className="h-full w-full object-contain p-2" />
      )}
    </div>

    {/* Name */}
    <h3 className="text-sm font-bold text-[var(--rb-near-black)] leading-snug">
      {product.name === '' ? <TextPlaceholder variant="label-line" width="three-quarter" /> : product.name}
    </h3>

    {/* Subtitle */}
    {product.subtitle === '' ? (
      <TextPlaceholder variant="label-line" width="full" />
    ) : product.subtitle ? (
      <p className="text-xs text-[var(--rb-muted-text)] mt-0.5">{product.subtitle}</p>
    ) : null}

    {/* Rating + review count */}
    {product.rating !== undefined && (
      <div className="mt-2 flex items-center gap-1.5">
        <StarDisplay rating={product.rating} className="text-[var(--rb-pure-black)]" />
        {product.reviewCount !== undefined && (
          <span className="text-[10px] text-[var(--rb-muted-text)]">
            ({product.reviewCount.toLocaleString()})
          </span>
        )}
      </div>
    )}

    {/* Price + optional buy label */}
    <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-0.5">
      {product.price === '' ? (
        <TextPlaceholder variant="label-line" width="third" />
      ) : product.price ? (
        <span className="text-sm font-black text-[var(--rb-near-black)]">{product.price}</span>
      ) : null}
      {product.buyLabel && (
        <span className="text-[10px] font-black uppercase tracking-[0.12em] text-[var(--rb-muted-text)] underline underline-offset-2">
          {product.buyLabel}
        </span>
      )}
    </div>
  </motion.div>
);

// ─── Main component ───────────────────────────────────────────────────────────

const KitContents: React.FC<Props> = ({ unit, lang = 'en', shouldReduceMotion }) => {
  const { payload, theme } = unit;
  const { heading, products } = payload;
  const eyebrow = heading?.eyebrow;
  const isRtl = lang === 'ar' || unit.direction === 'rtl';

  // Ensure at least one product is selected for desktop active-media display
  const [activeIndex, setActiveIndex] = useState(0);
  const safeActiveIndex = Math.min(activeIndex, products.length - 1);
  const activeProduct = products[safeActiveIndex];
  const activeMediaKey = `kit-${activeProduct.slug}-${activeProduct.image.url}`;

  if (!products.length) return null;

  return (
    <UnitShell
      theme={theme ?? 'light'}
      id={unit.id}
      innerClassName="py-10 md:py-14 lg:py-16"
    >
      <div dir={isRtl ? 'rtl' : 'ltr'}>
        {/* ── Heading ────────────────────────────────────────────────────── */}
        {(eyebrow || heading) && (
          <motion.div
            className={clsx('mb-8 md:mb-10', isRtl ? 'md:text-right' : 'md:text-left')}
            initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: VIEWPORT.default }}
            transition={{
              duration: shouldReduceMotion ? 0 : DUR.normal / 1000,
              ease: EASE_STANDARD,
            }}
          >
            {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
            {heading === undefined && <TextPlaceholder variant="single-line" width="half" />}
            {heading?.title && <SectionTitle size="lg">{heading.title}</SectionTitle>}
            {heading?.subtitle && (
              <p className="mt-2 text-[var(--rb-text-base)] text-[var(--rb-primary-text)]">
                {heading.subtitle}
              </p>
            )}
          </motion.div>
        )}

        {/* ── Mobile: horizontal scroll carousel ─────────────────────────── */}
        <div className="md:hidden">
          <div
            className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-2"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            role="list"
            aria-label={heading?.title ?? 'Kit products'}
          >
            {products.map((product, i) => (
              <div key={product.slug} className="w-[280px] snap-center">
                <ProductCard
                  product={product}
                  isActive={activeIndex === i}
                  onClick={() => setActiveIndex(i)}
                  index={i}
                  shouldReduceMotion={shouldReduceMotion}
                  isRtl={isRtl}
                />
              </div>
            ))}
          </div>
        </div>

        {/* ── Desktop: two-column — grid left, sticky media right ───────── */}
        <div className="hidden md:grid md:grid-cols-2 gap-8 lg:gap-12 items-start">
          {/* Product grid */}
          <div
            className="grid grid-cols-2 gap-4 lg:gap-6"
            role="list"
            aria-label={heading?.title ?? 'Kit products'}
          >
            {products.map((product, i) => (
              <div key={product.slug} role="listitem">
                <ProductCard
                  product={product}
                  isActive={activeIndex === i}
                  onClick={() => setActiveIndex(i)}
                  index={i}
                  shouldReduceMotion={shouldReduceMotion}
                  isRtl={isRtl}
                />
              </div>
            ))}
          </div>

          {/* Sticky active-product media */}
          <div className="md:sticky md:top-24">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={activeMediaKey}
                initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={shouldReduceMotion ? {} : { opacity: 0, scale: 1.03 }}
                transition={{
                  duration: shouldReduceMotion ? 0 : DUR.emphasis / 1000,
                  ease: EASE_STANDARD,
                }}
                className="rounded-[12px] aspect-square bg-white overflow-hidden"
              >
                {activeProduct.image.url === '' ? (
                  <ImagePlaceholder aspect="square" rounded="lg" />
                ) : (
                  <ImageWithFallback
                    src={activeProduct.image.url}
                    alt={activeProduct.image.alt}
                    className="h-full w-full object-contain p-6 lg:p-8"
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </UnitShell>
  );
};

// Self-register
registerUnit('kit_contents', KitContents);

export default KitContents;
export { KitContents };
