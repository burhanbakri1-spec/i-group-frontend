'use client';

/**
 * HeroGallery.tsx — M1 Rhode showcase unit.
 * Full-bleed product image gallery with animated transitions,
 * vertical thumbnail strip (desktop), dot navigation (mobile),
 * optional size selector, and badge row.
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx } from 'clsx';
import { UnitShell } from '../shared/UnitShell';
import { ImageWithFallback } from '../../figma/ImageWithFallback';
import { registerUnit } from '../../../lib/rhode/registry';
import type { NormalizedRhodeUnit, HeroGalleryPayload } from '../../../types/rhode-showcase-units';
import { EASE_STANDARD, DUR, heroSwap, STAGGER_STEP } from '../../../lib/rhode/motion';

interface Props {
  unit: NormalizedRhodeUnit<HeroGalleryPayload>;
  lang?: 'en' | 'ar';
  shouldReduceMotion: boolean;
}

const HeroGallery: React.FC<Props> = ({ unit, lang = 'en', shouldReduceMotion }) => {
  const { payload, theme } = unit;
  const { images, badges, sizes, defaultSizeId, videoUrl, videoPoster } = payload;

  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedSizeId, setSelectedSizeId] = useState<string>(
    defaultSizeId ?? sizes?.[0]?.id ?? '',
  );
  const [showVideo, setShowVideo] = useState(false);
  const regionRef = useRef<HTMLDivElement>(null);
  const dir = lang === 'ar' ? 'rtl' : 'ltr';

  const total = images.length;

  const go = useCallback(
    (idx: number) => {
      setActiveIndex(((idx % total) + total) % total);
      setShowVideo(false);
    },
    [total],
  );

  const prev = useCallback(() => go(activeIndex - 1), [activeIndex, go]);
  const next = useCallback(() => go(activeIndex + 1), [activeIndex, go]);

  useEffect(() => {
    const el = regionRef.current;
    if (!el) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') { e.preventDefault(); dir === 'rtl' ? next() : prev(); }
      if (e.key === 'ArrowRight') { e.preventDefault(); dir === 'rtl' ? prev() : next(); }
    };
    el.addEventListener('keydown', onKey);
    return () => el.removeEventListener('keydown', onKey);
  }, [prev, next, dir]);

  const motionProps = shouldReduceMotion
    ? {}
    : { initial: 'enter', animate: 'center', exit: 'exit', variants: heroSwap };

  const imgTransition = shouldReduceMotion
    ? { duration: 0 }
    : { duration: DUR.emphasis / 1000, ease: EASE_STANDARD };

  return (
    <UnitShell
      theme={theme ?? 'light'}
      className="overflow-hidden"
      innerClassName="!p-0"
    >
      <div dir={dir} className="flex flex-col md:flex-row gap-0">
        {/* ── Thumbnail strip (desktop) ───────────────────────────────── */}
        <div className="hidden md:flex flex-col gap-2 p-4 justify-start items-center w-[68px] shrink-0 border-e border-[var(--rb-border-light)] bg-[var(--rb-bg-warm-gray)]">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => go(i)}
              aria-label={img.alt || `Image ${i + 1}`}
              className={clsx(
                'relative w-11 h-11 rounded-lg overflow-hidden border-2 transition-all',
                'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--rb-primary-text)]',
                i === activeIndex
                  ? 'border-[var(--rb-primary-text)] opacity-100 scale-105'
                  : 'border-transparent opacity-50 hover:opacity-75',
              )}
              style={{ transition: `all ${DUR.fast}ms` }}
            >
              <ImageWithFallback
                src={img.url}
                alt={img.alt}
                className="object-cover w-full h-full"
                sizes="44px"
              />
            </button>
          ))}
          {videoUrl && (
            <button
              onClick={() => setShowVideo(true)}
              aria-label="Play video"
              className={clsx(
                'relative w-11 h-11 rounded-lg overflow-hidden border-2 transition-all flex items-center justify-center bg-[var(--rb-near-black)]',
                showVideo
                  ? 'border-[var(--rb-primary-text)] opacity-100'
                  : 'border-transparent opacity-50 hover:opacity-75',
              )}
              style={{ transition: `all ${DUR.fast}ms` }}
            >
              <svg className="w-4 h-4 text-white fill-current" viewBox="0 0 16 16" aria-hidden>
                <path d="M6 3.5l7 4.5-7 4.5V3.5z" />
              </svg>
            </button>
          )}
        </div>

        {/* ── Main media region ────────────────────────────────────────── */}
        <div className="flex flex-col flex-1">
          <div
            ref={regionRef}
            role="region"
            aria-label="Product gallery"
            aria-live="polite"
            tabIndex={0}
            className="relative aspect-[3/4] md:aspect-[4/5] overflow-hidden bg-[var(--rb-bg-warm-gray)] focus-visible:outline-none cursor-pointer select-none group"
            onClick={next}
          >
            <AnimatePresence mode="wait" initial={false}>
              {showVideo && videoUrl ? (
                <motion.div
                  key="video"
                  className="absolute inset-0"
                  initial={shouldReduceMotion ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={shouldReduceMotion ? {} : { opacity: 0 }}
                  transition={imgTransition}
                >
                  <video
                    src={videoUrl}
                    poster={videoPoster?.url}
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="w-full h-full object-cover"
                  />
                </motion.div>
              ) : (
                <motion.div
                  key={activeIndex}
                  className="absolute inset-0"
                  {...motionProps}
                  transition={imgTransition}
                >
                  <ImageWithFallback
                    src={images[activeIndex].url}
                    alt={images[activeIndex].alt}
                    className="object-cover w-full h-full"
                    sizes="(max-width: 768px) 100vw, 60vw"
                    priority={activeIndex === 0}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Arrow buttons */}
            <button
              onClick={(e) => { e.stopPropagation(); dir === 'rtl' ? next() : prev(); }}
              aria-label="Previous image"
              className="absolute start-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity focus-visible:opacity-100"
            >
              <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <path d="M10 3L5 8l5 5" />
              </svg>
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); dir === 'rtl' ? prev() : next(); }}
              aria-label="Next image"
              className="absolute end-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity focus-visible:opacity-100"
            >
              <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <path d="M6 3l5 5-5 5" />
              </svg>
            </button>

            {/* Mobile dot indicators */}
            <div className="md:hidden absolute bottom-4 start-0 end-0 flex justify-center items-center gap-1.5" aria-hidden>
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); go(i); }}
                  className={clsx(
                    'rounded-full bg-white transition-all duration-300',
                    i === activeIndex ? 'w-4 h-1.5 opacity-100' : 'w-1.5 h-1.5 opacity-50',
                  )}
                />
              ))}
            </div>
          </div>

          {/* ── Badges row ─────────────────────────────────────────────── */}
          {badges && badges.length > 0 && (
            <div className="flex flex-wrap gap-2 px-5 pt-4 pb-0">
              {badges.map((badge, i) => (
                <motion.span
                  key={badge}
                  initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-80px' }}
                  transition={{
                    duration: shouldReduceMotion ? 0 : DUR.normal / 1000,
                    delay: shouldReduceMotion ? 0 : i * STAGGER_STEP,
                    ease: EASE_STANDARD,
                  }}
                  className="inline-flex items-center px-3 py-1 rounded-full border border-[var(--rb-border-light)] text-[var(--rb-text-2xs)] font-medium uppercase tracking-widest text-[var(--rb-muted-text)] bg-[var(--rb-bg-warm-gray)]"
                >
                  {badge}
                </motion.span>
              ))}
            </div>
          )}

          {/* ── Size selector ───────────────────────────────────────────── */}
          {sizes && sizes.length > 0 && (
            <div className="px-5 pt-4 pb-5">
              <p className="text-[var(--rb-text-2xs)] font-medium uppercase tracking-widest text-[var(--rb-muted-text)] mb-2">
                Size
              </p>
              <div className="flex flex-wrap gap-2">
                {sizes.map((sz) => {
                  const isSelected = selectedSizeId === sz.id;
                  return (
                    <button
                      key={sz.id}
                      onClick={() => setSelectedSizeId(sz.id)}
                      aria-pressed={isSelected}
                      className={clsx(
                        'flex flex-col items-start px-4 py-2.5 rounded-lg border text-start transition-all',
                        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--rb-primary-text)]',
                        isSelected
                          ? 'border-[var(--rb-primary-text)] bg-[var(--rb-primary-text)] text-[var(--rb-pure-white)]'
                          : 'border-[var(--rb-border-light)] hover:border-[var(--rb-muted-text)] bg-transparent text-[var(--rb-primary-text)]',
                      )}
                      style={{ transition: `all ${DUR.fast}ms` }}
                    >
                      <span className="text-sm font-medium leading-tight">{sz.label}</span>
                      {sz.subtext && (
                        <span className={clsx('text-[10px] leading-tight mt-0.5', isSelected ? 'text-white/70' : 'text-[var(--rb-muted-text)]')}>
                          {sz.subtext}
                        </span>
                      )}
                      {sz.priceDelta !== undefined && sz.priceDelta !== 0 && (
                        <span className={clsx('text-[10px] leading-tight', isSelected ? 'text-white/70' : 'text-[var(--rb-muted-text)]')}>
                          {sz.priceDelta > 0 ? `+$${sz.priceDelta}` : `-$${Math.abs(sz.priceDelta)}`}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </UnitShell>
  );
};

// Self-register
registerUnit('hero_gallery', HeroGallery);

export default HeroGallery;
export { HeroGallery };
