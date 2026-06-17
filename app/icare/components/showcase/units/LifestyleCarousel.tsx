'use client';

/**
 * LifestyleCarousel.tsx — E5 showcase unit.
 * Horizontally-scrollable lifestyle image carousel with scroll-snap,
 * AnimatePresence cross-fade, dot indicators (mobile), and arrow
 * navigation (desktop).
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx } from 'clsx';
import { UnitShell, SectionTitle } from '../shared/UnitShell';
import { ImageWithFallback } from '../../figma/ImageWithFallback';
import { registerUnit } from '../../../lib/showcase/registry';
import type { NormalizedShowcaseUnit, LifestyleCarouselPayload } from '../../../types/showcase-units';
import { EASE_STANDARD, DUR, crossfade, VIEWPORT } from '../../../lib/showcase/motion';
import { TextPlaceholder } from '../shared/TextPlaceholder';
import { ImagePlaceholder } from '../shared/ImagePlaceholder';

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  unit: NormalizedShowcaseUnit<LifestyleCarouselPayload>;
  lang?: 'en' | 'ar';
  shouldReduceMotion: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────

const LifestyleCarousel: React.FC<Props> = ({ unit, lang = 'en', shouldReduceMotion }) => {
  const { payload, theme } = unit;
  const { heading, images } = payload;
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const isRtl = lang === 'ar' || unit.direction === 'rtl';
  const total = images.length;

  // Navigate to a given index (handles wrap-around)
  const go = useCallback(
    (idx: number) => {
      setActiveIndex(((idx % total) + total) % total);
    },
    [total],
  );

  const prev = useCallback(() => go(activeIndex - 1), [activeIndex, go]);
  const next = useCallback(() => go(activeIndex + 1), [activeIndex, go]);

  // Touch / swipe handling
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      touchEndX.current = e.changedTouches[0].clientX;
      const diff = touchStartX.current - touchEndX.current;
      const threshold = 50;
      if (Math.abs(diff) > threshold) {
        // In RTL, swipe left = go prev, swipe right = go next (mirrored)
        if (diff > 0) {
          isRtl ? prev() : next();
        } else {
          isRtl ? next() : prev();
        }
      }
    },
    [next, prev, isRtl],
  );

  // Keyboard navigation (when focused)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        isRtl ? next() : prev();
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        isRtl ? prev() : next();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [prev, next, isRtl]);

  // Intersection observer to sync activeIndex with scroll position
  // (useful if a future change enables scrollable layout)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = Number((entry.target as HTMLElement).dataset.index);
            if (!isNaN(idx) && idx !== activeIndex) {
              setActiveIndex(idx);
            }
          }
        });
      },
      { root: el, threshold: 0.6 },
    );

    const slides = el.querySelectorAll('[data-index]');
    slides.forEach((slide) => observer.observe(slide));
    return () => observer.disconnect();
  }, [activeIndex]);

  // Motion props for image cross-fade
  const motionProps = shouldReduceMotion
    ? {}
    : { initial: 'enter', animate: 'center', exit: 'exit', variants: crossfade };

  const imgTransition = shouldReduceMotion
    ? { duration: 0 }
    : { duration: DUR.emphasis / 1000, ease: EASE_STANDARD };

  const active = images[activeIndex];
  const caption = active?.caption;

  return (
    <UnitShell
      theme={theme ?? 'light'}
      id={unit.id}
      innerClassName="py-12 md:py-16 lg:py-20"
    >
      <div dir={isRtl ? 'rtl' : 'ltr'} className="flex flex-col">
        {/* Header */}
        {heading || heading === '' ? (
          <motion.div
            className="mb-6 md:mb-10 max-w-2xl"
            initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: VIEWPORT.default }}
            transition={{
              duration: shouldReduceMotion ? 0 : DUR.normal / 1000,
              ease: EASE_STANDARD,
            }}
          >
            {heading ? <SectionTitle size="lg">{heading}</SectionTitle> : <TextPlaceholder variant="single-line" width="half" />}
          </motion.div>
        ) : null}

        {/* Carousel strip — CSS scroll-snap strip */}
        <div
          ref={containerRef}
          role="region"
          aria-label={heading ? `${heading} carousel` : 'Lifestyle images carousel'}
          aria-roledescription="carousel"
          tabIndex={0}
          className={clsx(
            'flex overflow-x-auto scroll-smooth',
            'scroll-snap-type: x mandatory',
            '[&::-webkit-scrollbar]:hidden',
            '[-ms-overflow-style:none]',
            '[scrollbar-width:none]',
          )}
          style={{ scrollSnapType: 'x mandatory' }}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {images.map((item, i) => (
            <div
              key={item.id}
              data-index={i}
              role="group"
              aria-roledescription="slide"
              aria-label={`Slide ${i + 1} of ${total}${item.caption ? `: ${item.caption}` : ''}`}
              className={clsx(
                'w-full flex-shrink-0',
                'snap-start',
              )}
              style={{ scrollSnapAlign: isRtl ? 'end' : 'start' }}
            >
              <div className="relative aspect-[3/4] md:aspect-[16/9] overflow-hidden rounded-lg bg-[var(--rb-bg-warm-gray)]">
                {item.image.url === '' ? (
                  <ImagePlaceholder aspect="portrait" rounded="lg" />
                ) : (
                  <ImageWithFallback
                    src={item.image.url}
                    alt={item.image.alt || `${heading || 'Lifestyle image'} ${i + 1}`}
                    className="object-cover w-full h-full select-none pointer-events-none"
                    sizes="(max-width: 768px) 100vw, 80vw"
                  />
                )}
                {/* Caption overlay */}
                {item.caption === '' ? (
                  <div className="absolute inset-x-0 bottom-0 p-4 md:p-5 bg-gradient-to-t from-black/50 via-black/20 to-transparent">
                    <p className="text-white/90 text-sm md:text-base font-medium leading-snug max-w-lg">
                      <TextPlaceholder variant="label-line" width="three-quarter" />
                    </p>
                  </div>
                ) : item.caption ? (
                  <div className="absolute inset-x-0 bottom-0 p-4 md:p-5 bg-gradient-to-t from-black/50 via-black/20 to-transparent">
                    <p className="text-white/90 text-sm md:text-base font-medium leading-snug max-w-lg">
                      {item.caption}
                    </p>
                  </div>
                ) : null}
              </div>
            </div>
          ))}
        </div>

        {/* Navigation row: arrows (desktop) + dots (mobile) */}
        <div className="flex items-center justify-between mt-5">
          {/* Mobile dots */}
          <div className="flex md:hidden items-center gap-2" role="tablist" aria-label="Slide indicators">
            {images.map((item, i) => (
              <button
                key={item.id}
                role="tab"
                aria-selected={i === activeIndex}
                aria-label={`Go to slide ${i + 1}${item.caption ? `: ${item.caption}` : ''}`}
                onClick={() => go(i)}
                className={clsx(
                  'rounded-full transition-all duration-300',
                  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--rb-primary-text)]',
                  i === activeIndex
                    ? 'w-6 h-2 bg-[var(--rb-primary-text)]'
                    : 'w-2 h-2 bg-[var(--rb-border-light)] hover:bg-[var(--rb-muted-text)]',
                )}
                style={{ transition: `all ${DUR.fast}ms` }}
              />
            ))}
          </div>

          {/* Spacer to balance dots on mobile */}
          <div className="hidden md:block" />

          {/* Desktop prev / next arrows */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={prev}
              aria-label="Previous image"
              className="w-10 h-10 rounded-full border border-[var(--rb-border-light)] bg-white flex items-center justify-center hover:border-[var(--rb-primary-text)] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--rb-primary-text)]"
            >
              <svg
                className="w-4 h-4 text-[var(--rb-near-black)]"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path d={isRtl ? 'M6 3l5 5-5 5' : 'M10 3l-5 5 5 5'} />
              </svg>
            </button>
            <button
              onClick={next}
              aria-label="Next image"
              className="w-10 h-10 rounded-full border border-[var(--rb-border-light)] bg-white flex items-center justify-center hover:border-[var(--rb-primary-text)] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--rb-primary-text)]"
            >
              <svg
                className="w-4 h-4 text-[var(--rb-near-black)]"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path d={isRtl ? 'M10 3l-5 5 5 5' : 'M6 3l5 5-5 5'} />
              </svg>
            </button>
          </div>
        </div>

        {/* Caption text below the carousel (accessibility / SEO fallback) */}
        {caption && (
          <p className="md:hidden mt-3 text-sm text-[var(--rb-primary-text)]">{caption}</p>
        )}
      </div>
    </UnitShell>
  );
};

// Self-register
registerUnit('lifestyle_carousel', LifestyleCarousel);

export default LifestyleCarousel;
export { LifestyleCarousel };
