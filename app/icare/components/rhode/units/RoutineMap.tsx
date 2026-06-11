'use client';

/**
 * RoutineMap.tsx — M9 Rhode showcase unit.
 * 2-col layout: lifestyle imagery on the left; step rail + active product display on the right.
 * Viewport-triggered fade-up, AnimatePresence cross-fades, RTL-aware, shouldReduceMotion respected.
 */

import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx } from 'clsx';
import { UnitShell, Eyebrow, SectionTitle, BodyText } from '../shared/UnitShell';
import { ImageWithFallback } from '../../figma/ImageWithFallback';
import { registerUnit } from '../../../lib/rhode/registry';
import type { NormalizedRhodeUnit, RoutineMapPayload } from '../../../types/rhode-showcase-units';
import { EASE_STANDARD, DUR, VIEWPORT } from '../../../lib/rhode/motion';

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  unit: NormalizedRhodeUnit<RoutineMapPayload>;
  lang?: 'en' | 'ar';
  shouldReduceMotion: boolean;
}

// ─── Step Rail Button ─────────────────────────────────────────────────────────

interface StepButtonProps {
  step: RoutineMapPayload['steps'][number];
  index: number;
  isActive: boolean;
  onClick: () => void;
  shouldReduceMotion: boolean;
}

const StepButton: React.FC<StepButtonProps> = ({
  step,
  index,
  isActive,
  onClick,
  shouldReduceMotion,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={isActive}
      aria-label={`Step ${step.number}: ${step.label}`}
      className={clsx(
        'relative flex flex-col items-center gap-2',
        'w-16 md:w-20 shrink-0',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--rb-primary-text)]',
      )}
    >
      {/* Circular number badge */}
      <motion.div
        className={clsx(
          'w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center',
          'font-display font-medium text-sm md:text-base',
          'border-2',
        )}
        animate={shouldReduceMotion ? {} : {
          backgroundColor: isActive ? 'var(--rb-near-black)' : 'transparent',
          borderColor: isActive ? 'var(--rb-near-black)' : 'var(--rb-border-light)',
          color: isActive ? 'var(--rb-pure-white)' : 'var(--rb-muted-text)',
          scale: isActive ? 1 : 0.96,
        }}
        transition={shouldReduceMotion ? { duration: 0 } : {
          duration: DUR.slow / 1000,
          ease: EASE_STANDARD,
        }}
      >
        {String(step.number).padStart(2, '0')}
      </motion.div>

      {/* Step label with 500ms opacity animation per spec */}
      <motion.span
        className={clsx(
          'text-[10px] md:text-xs font-medium uppercase tracking-widest',
        )}
        animate={shouldReduceMotion ? {} : {
          opacity: isActive ? 1 : 0.65,
          color: isActive ? 'var(--rb-near-black)' : 'var(--rb-muted-text)',
        }}
        transition={shouldReduceMotion ? { duration: 0 } : {
          duration: DUR.slow / 1000,
          ease: EASE_STANDARD,
        }}
      >
        {step.label}
      </motion.span>
    </button>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const RoutineMap: React.FC<Props> = ({ unit, lang = 'en', shouldReduceMotion }) => {
  const { payload, theme } = unit;
  const { title, subtitle, steps } = payload;
  const isRtl = lang === 'ar' || unit.direction === 'rtl';

  const [activeIndex, setActiveIndex] = useState(0);
  const activeStep = steps[activeIndex];

  const go = useCallback(
    (idx: number) => {
      setActiveIndex(((idx % steps.length) + steps.length) % steps.length);
    },
    [steps.length],
  );

  // ─── Motion constants ────────────────────────────────────────────────────

  // Viewport fade-up (entire unit): DUR.normal = 300ms
  const containerMotion = shouldReduceMotion
    ? {}
    : {
        initial: { opacity: 0, y: 24 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, margin: VIEWPORT.default },
        transition: {
          duration: DUR.normal / 1000,
          ease: EASE_STANDARD,
        },
      };

  // Image cross-fade: 600ms per spec (DUR.enter)
  const imageFadeMotion = shouldReduceMotion
    ? {}
    : {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: {
          duration: DUR.enter / 1000,
          ease: EASE_STANDARD,
        },
      };

  // Step label / product info animation: 500ms per spec (DUR.slow)
  const labelMotion = shouldReduceMotion
    ? {}
    : {
        initial: { opacity: 0, y: 6 },
        animate: { opacity: 1, y: 0 },
        transition: {
          duration: DUR.slow / 1000,
          ease: EASE_STANDARD,
        },
      };

  // ─── Swatch + lifestyle swap ─────────────────────────────────────────────

  const [showSwatch, setShowSwatch] = useState(false);
  const hasSwatch = !!activeStep.swatchImage;

  useEffect(() => {
    setShowSwatch(false);
    if (!activeStep.swatchImage) return;
    // Cross-fade to swatch after 2.5s, back to lifestyle on step change
    const timer = setTimeout(() => setShowSwatch(true), 2500);
    return () => clearTimeout(timer);
  }, [activeStep.id, activeStep.swatchImage]);

  return (
    <UnitShell
      theme={theme ?? 'light'}
      id={unit.id}
      innerClassName="py-12 md:py-16 lg:py-20"
    >
      <div dir={isRtl ? 'rtl' : 'ltr'}>
        {/* ─── Header ───────────────────────────────────────────────────── */}
        {(subtitle || title) && (
          <motion.div
            className="mb-10 md:mb-14 max-w-xl"
            {...containerMotion}
          >
            {subtitle && <Eyebrow>{subtitle}</Eyebrow>}
            {title && <SectionTitle size="lg">{title}</SectionTitle>}
          </motion.div>
        )}

        {/* ─── 2-col layout: lifestyle left, steps + product right ─────── */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 lg:gap-16 items-start"
          {...containerMotion}
        >
          {/* Left column: lifestyle imagery */}
          <div className="relative rounded-[12px] overflow-hidden aspect-[3/4] bg-[var(--rb-bg-surface)]">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={activeStep.id}
                {...imageFadeMotion}
                className="absolute inset-0"
              >
                <ImageWithFallback
                  src={activeStep.lifestyleImage.url}
                  alt={activeStep.lifestyleImage.alt ?? activeStep.productName}
                  className="w-full h-full object-cover"
                />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right column: step rail + active product display */}
          <div className="flex flex-col">
            {/* Step rail */}
            <div
              className="flex flex-wrap gap-3 md:gap-4 mb-8 md:mb-10"
              role="tablist"
              aria-label="Routine steps"
            >
              {steps.map((step, i) => (
                <StepButton
                  key={step.id}
                  step={step}
                  index={i}
                  isActive={i === activeIndex}
                  onClick={() => go(i)}
                  shouldReduceMotion={shouldReduceMotion}
                />
              ))}
            </div>

            {/* Active step display */}
            <div className="flex-1">
              <div className="flex items-stretch gap-3 md:gap-5">
                {/* Step label — vertical on desktop, horizontal on mobile */}
                <div className="hidden md:flex items-center">
                  <motion.span
                    key={`label-${activeStep.id}`}
                    className="text-[var(--rb-text-2xs)] font-medium uppercase tracking-widest"
                    style={{ writingMode: 'vertical-rl' }}
                    {...labelMotion}
                  >
                    {activeStep.label}
                  </motion.span>
                </div>

                {/* Image container with swatch + lifestyle cross-fade */}
                <div className="flex-1 relative rounded-[12px] overflow-hidden aspect-[4/5] bg-[var(--rb-bg-surface)]">
                  <AnimatePresence mode="wait" initial={false}>
                    {hasSwatch && showSwatch ? (
                      <motion.div
                        key={`swatch-${activeStep.id}`}
                        {...imageFadeMotion}
                        className="absolute inset-0"
                      >
                        <ImageWithFallback
                          src={activeStep.swatchImage!.url}
                          alt={activeStep.swatchImage!.alt}
                          className="w-full h-full object-cover"
                        />
                      </motion.div>
                    ) : (
                      <motion.div
                        key={`lifestyle-${activeStep.id}`}
                        {...imageFadeMotion}
                        className="absolute inset-0"
                      >
                        <ImageWithFallback
                          src={activeStep.lifestyleImage.url}
                          alt={activeStep.lifestyleImage.alt ?? activeStep.productName}
                          className="w-full h-full object-cover"
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Product info */}
              <motion.div
                key={`info-${activeStep.id}`}
                className="mt-5 md:mt-6"
                {...labelMotion}
              >
                <h3 className="font-display font-medium text-[var(--rb-near-black)] text-lg md:text-xl leading-tight mb-1">
                  {activeStep.productName}
                </h3>
                {activeStep.productSubtitle && (
                  <BodyText className="text-[var(--rb-muted-text)] text-sm">
                    {activeStep.productSubtitle}
                  </BodyText>
                )}
                {activeStep.dayNight && (
                  <p className="mt-2 text-[10px] font-medium uppercase tracking-widest text-[var(--rb-muted-text)]">
                    {activeStep.dayNight === 'both' ? 'AM + PM' : activeStep.dayNight === 'day' ? 'AM' : 'PM'}
                  </p>
                )}
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </UnitShell>
  );
};

// Self-register
registerUnit('routine_map', RoutineMap);

export default RoutineMap;
export { RoutineMap };
