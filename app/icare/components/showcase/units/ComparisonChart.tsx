'use client';

/**
 * ComparisonChart.tsx — showcase comparison unit (E1).
 * 2–3 product side-by-side columns on desktop.
 * Mobile renders a single product with toggle between products
 * (cross-fade transition, 300ms), respecting shouldReduceMotion and RTL.
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx } from 'clsx';
import { UnitShell, Eyebrow, SectionTitle, BodyText } from '../shared/UnitShell';
import { registerUnit } from '../../../lib/showcase/registry';
import type { NormalizedShowcaseUnit, ComparisonChartPayload } from '../../../types/showcase-units';
import { EASE_STANDARD, DUR, STAGGER_STEP, VIEWPORT } from '../../../lib/showcase/motion';

interface ProductField {
  label: string;
  value: string;
}

interface ProductProps {
  product: ComparisonChartPayload['products'][number];
  isRtl: boolean;
}

const FIELDS: { label: string; key: 'whatItIs' | 'bestFor' | 'whereItFits' | 'keyIngredients' }[] = [
  { label: 'What it is', key: 'whatItIs' },
  { label: 'Best for', key: 'bestFor' },
  { label: 'Where it fits', key: 'whereItFits' },
  { label: 'Key ingredients', key: 'keyIngredients' },
];

const ProductCard: React.FC<ProductProps> = ({ product }) => (
  <div className="flex h-full flex-col rounded-[12px] border border-[var(--rb-border)] bg-[var(--rb-bg-surface)]">
    {product.image && (
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-t-[12px] bg-[var(--rb-bg-warm-gray)]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.image.url}
          alt={product.image.alt ?? product.name}
          className="h-full w-full object-cover"
        />
      </div>
    )}
    <div className="flex flex-1 flex-col p-5 md:p-6">
      <div className="mb-4">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-[var(--rb-muted-text)]">
          {product.shortName}
        </p>
        <h3 className="mt-1 font-display text-lg font-medium text-[var(--rb-near-black)] md:text-xl">
          {product.name}
        </h3>
        {product.tagline && (
          <p className="mt-1 text-sm text-[var(--rb-primary-text)]">{product.tagline}</p>
        )}
        {product.price && (
          <p className="mt-2 text-sm font-semibold text-[var(--rb-near-black)]">{product.price}</p>
        )}
      </div>
      <div className="mt-auto space-y-3">
        {FIELDS.map(({ label, key }) => (
          <div
            key={key}
            className="grid grid-cols-[auto_1fr] items-start gap-x-3 gap-y-1 text-sm"
          >
            <span className="pt-0.5 text-[11px] font-semibold uppercase tracking-widest text-[var(--rb-muted-text)]">
              {label}
            </span>
            <span className="text-[var(--rb-primary-text)]">{product.fields[key]}</span>
          </div>
        ))}
      </div>
      {product.buyUrl && (
        <div className="mt-5">
          <a
            href={product.buyUrl}
            className="inline-flex w-full items-center justify-center rounded-full bg-[var(--rb-primary-text)] px-5 py-2.5 text-sm font-semibold text-[var(--rb-pure-white)] transition-colors hover:opacity-90"
          >
            Buy now
          </a>
        </div>
      )}
    </div>
  </div>
);

const MobileToggle: React.FC<{
  products: ComparisonChartPayload['products'];
  activeIndex: number;
  setActiveIndex: (index: number) => void;
}> = ({ products, activeIndex, setActiveIndex }) => {
  return (
    <div className="mt-4 flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => setActiveIndex((activeIndex - 1 + products.length) % products.length)}
          className="rounded-full border border-[var(--rb-border)] px-3 py-1.5 text-xs font-semibold uppercase tracking-widest text-[var(--rb-primary-text)] transition hover:border-[var(--rb-near-black)]"
        >
          Prev
        </button>
        <AnimatePresence mode="wait">
          <motion.span
            key={activeIndex}
            className="text-xs font-medium text-[var(--rb-muted-text)]"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: DUR.normal / 1000, ease: EASE_STANDARD }}
          >
            {activeIndex + 1} / {products.length}
          </motion.span>
        </AnimatePresence>
        <button
          type="button"
          onClick={() => setActiveIndex((activeIndex + 1) % products.length)}
          className="rounded-full border border-[var(--rb-border)] px-3 py-1.5 text-xs font-semibold uppercase tracking-widest text-[var(--rb-primary-text)] transition hover:border-[var(--rb-near-black)]"
        >
          Next
        </button>
      </div>
      <div className="flex items-center justify-center gap-2">
        {products.map((_, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setActiveIndex(idx)}
            className={clsx(
              'h-2 rounded-full transition-all',
              idx === activeIndex ? 'w-5 bg-[var(--rb-near-black)]' : 'w-2 bg-[var(--rb-border)]',
            )}
            aria-label={`Show product ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

interface Props {
  unit: NormalizedShowcaseUnit<ComparisonChartPayload>;
  lang?: 'en' | 'ar';
  shouldReduceMotion: boolean;
}

const ComparisonChart: React.FC<Props> = ({ unit, lang = 'en', shouldReduceMotion }) => {
  const { payload, theme } = unit;
  const { heading, products } = payload;
  const isRtl = lang === 'ar' || unit.direction === 'rtl';
  const [activeIndex, setActiveIndex] = useState(0);

  const containerAnimation = {
    initial: shouldReduceMotion ? false : { opacity: 0, y: 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: VIEWPORT.default },
    transition: {
      duration: shouldReduceMotion ? 0 : DUR.normal / 1000,
      ease: EASE_STANDARD,
    },
  };

  return (
    <UnitShell theme={theme ?? 'light'} id={unit.id} innerClassName="py-12 md:py-16 lg:py-20">
      <div dir={isRtl ? 'rtl' : 'ltr'}>
        {(heading) && (
          <motion.div
            className={clsx('mb-10 md:mb-14', isRtl ? 'text-right' : 'text-left')}
            {...containerAnimation}
          >
            <SectionTitle size="lg">{heading}</SectionTitle>
          </motion.div>
        )}

        {/* Desktop: side-by-side */}
        <div className={clsx('hidden md:grid md:grid-cols-2', products.length === 3 && 'md:grid-cols-3')}>
          {products.map((product, idx) => (
            <motion.div
              key={product.id}
              initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: VIEWPORT.default }}
              transition={{
                duration: shouldReduceMotion ? 0 : DUR.normal / 1000,
                ease: EASE_STANDARD,
                delay: shouldReduceMotion ? 0 : idx * STAGGER_STEP,
              }}
            >
              <ProductCard product={product} isRtl={isRtl} />
            </motion.div>
          ))}
        </div>

        {/* Mobile: toggle */}
        <div className="md:hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={products[activeIndex]?.id}
              initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={shouldReduceMotion ? {} : { opacity: 0, y: -12 }}
              transition={{ duration: shouldReduceMotion ? 0 : DUR.normal / 1000, ease: EASE_STANDARD }}
            >
              <ProductCard product={products[activeIndex]} isRtl={isRtl} />
            </motion.div>
          </AnimatePresence>
          <MobileToggle
            products={products}
            activeIndex={activeIndex}
            setActiveIndex={setActiveIndex}
          />
        </div>
      </div>
    </UnitShell>
  );
};

// Self-register as the comparison_chart unit type.
registerUnit('comparison_chart', ComparisonChart);

export default ComparisonChart;
export { ComparisonChart };
