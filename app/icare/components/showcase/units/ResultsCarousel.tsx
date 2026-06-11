'use client';

/**
 * ResultsCarousel.tsx — E3 showcase unit.
 * Horizontal scroll carousel of 2-8 result metric cards with creator attribution.
 * Desktop: 3-4 cols | Tablet: 2 cols | Mobile: 1 col
 */

import React from 'react';
import { motion } from 'motion/react';
import { clsx } from 'clsx';
import { UnitShell, Eyebrow, SectionTitle, BodyText } from '../shared/UnitShell';
import { registerUnit } from '../../../lib/showcase/registry';
import type { NormalizedShowcaseUnit, ResultsCarouselPayload } from '../../../types/showcase-units';
import { EASE_STANDARD, DUR, STAGGER_STEP, VIEWPORT } from '../../../lib/showcase/motion';

interface Props {
  unit: NormalizedShowcaseUnit<ResultsCarouselPayload>;
  lang?: 'en' | 'ar';
  shouldReduceMotion: boolean;
}

const ProfileIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={clsx('w-4 h-4 flex-shrink-0', className)}
    viewBox="0 0 20 20"
    fill="currentColor"
    aria-hidden="true"
  >
    <path
      fillRule="evenodd"
      d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
      clipRule="evenodd"
    />
  </svg>
);

const ResultsCarousel: React.FC<Props> = ({ unit, lang = 'en', shouldReduceMotion }) => {
  const { payload, theme } = unit;
  const { heading, subtitle, cards } = payload;
  const isRtl = lang === 'ar' || unit.direction === 'rtl';

  return (
    <UnitShell
      theme={theme ?? 'light'}
      id={unit.id}
      innerClassName="py-12 md:py-16 lg:py-20"
    >
      <div dir={isRtl ? 'rtl' : 'ltr'}>
        {/* Header */}
        {(heading || subtitle) && (
          <motion.div
            className="mb-8 md:mb-10 max-w-2xl"
            initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: VIEWPORT.default }}
            transition={{
              duration: shouldReduceMotion ? 0 : DUR.normal / 1000,
              ease: EASE_STANDARD,
            }}
          >
            {heading && <SectionTitle size="lg">{heading}</SectionTitle>}
            {subtitle && (
              <BodyText className="mt-3 text-lg">{subtitle}</BodyText>
            )}
          </motion.div>
        )}

        {/* Carousel container */}
        <div className="relative">
          <div
            className={clsx(
              'flex gap-4 overflow-x-auto scroll-smooth',
              'scroll-snap-type-x snap-x',
              'no-scrollbar',
              'overscroll-behavior-x-contain',
              '-webkit-overflow-scrolling-touch',
              'touch-pan-y',
              // RTL flip
              isRtl ? 'flex-row-reverse' : 'flex-row',
            )}
            style={{ scrollSnapType: 'x proximity' } as React.CSSProperties}
          >
            {cards.map((card, i) => (
              <motion.div
                key={card.id}
                className={clsx(
                  'flex-shrink-0',
                  'w-[85vw] min-[400px]:w-[70vw]',
                  'sm:w-[45vw]',
                  'md:w-[38vw] lg:w-[28vw] xl:w-[22vw]',
                  'snap-start',
                  'bg-[var(--rb-bg-warm-gray)]',
                  'rounded-[var(--rb-radius-card)]',
                  'overflow-hidden',
                )}
                initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: VIEWPORT.default }}
                transition={{
                  duration: shouldReduceMotion ? 0 : DUR.normal / 1000,
                  ease: EASE_STANDARD,
                  delay: shouldReduceMotion ? 0 : i * STAGGER_STEP,
                }}
              >
                {/* Card image */}
                <div className="relative w-full aspect-square overflow-hidden bg-[var(--rb-bg-light)]">
                  <img
                    src={card.image.url}
                    alt={card.image.alt}
                    className="w-full h-full object-contain"
                    loading="lazy"
                  />
                </div>

                {/* Card body */}
                <div className="px-5 py-5 flex flex-col gap-2">
                  {/* Product name */}
                  {card.productName && (
                    <p className="text-xs font-semibold uppercase tracking-widest text-[var(--rb-muted-text)]">
                      {card.productName}
                    </p>
                  )}

                  {/* Metric */}
                  <div className="flex flex-col gap-0.5">
                    <span className="text-4xl md:text-5xl font-display font-bold leading-none tracking-tight text-[var(--rb-near-black)]">
                      {card.metricValue}
                    </span>
                    <span className="text-sm text-[var(--rb-primary-text)] leading-snug">
                      {card.metricLabel}
                    </span>
                  </div>

                  {/* Creator attribution */}
                  {card.creator && (
                    <div className="mt-1 flex items-center gap-2">
                      <ProfileIcon className="text-[var(--rb-muted-text)]" />
                      <span className="text-xs text-[var(--rb-muted-text)]">
                        {card.creator.handle}
                        {card.creator.skinType && (
                          <span className="ml-1">
                            · {card.creator.skinType}
                          </span>
                        )}
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </UnitShell>
  );
};

// Self-register
registerUnit('results_carousel', ResultsCarousel);

export default ResultsCarousel;
export { ResultsCarousel };
