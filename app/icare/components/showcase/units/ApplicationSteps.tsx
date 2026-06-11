'use client';

/**
 * ApplicationSteps.tsx — M3 showcase unit.
 * 2-col layout: step rail + content panel (left) · large image (right on desktop).
 * Keyboard ArrowLeft/Right navigation, AnimatePresence cross-fade,
 * RTL-aware, shouldReduceMotion respected on all animations.
 */

import React, {
  useState,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx } from 'clsx';
import { UnitShell, Eyebrow, SectionTitle, BodyText } from '../shared/UnitShell';
import { ImageWithFallback } from '../../figma/ImageWithFallback';
import { registerUnit } from '../../../lib/showcase/registry';
import type { NormalizedShowcaseUnit, ApplicationStepsPayload } from '../../../types/showcase-units';
import { EASE_STANDARD, DUR, VIEWPORT } from '../../../lib/showcase/motion';

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  unit: NormalizedShowcaseUnit<ApplicationStepsPayload>;
  lang?: 'en' | 'ar';
  shouldReduceMotion: boolean;
}

// ─── Step Rail Button ─────────────────────────────────────────────────────────

interface StepRailButtonProps {
  step: ApplicationStepsPayload['steps'][number];
  index: number;
  isActive: boolean;
  onClick: () => void;
  isRtl: boolean;
  shouldReduceMotion: boolean;
}

const StepRailButton: React.FC<StepRailButtonProps> = ({
  step,
  index,
  isActive,
  onClick,
  isRtl,
  shouldReduceMotion,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={isActive}
      aria-label={`Step ${step.stepNumber ?? index + 1}: ${step.title}`}
      className={clsx(
        'relative flex items-center gap-4 w-full text-start group',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--rb-primary-text)]',
      )}
    >
      {/* Step number — large display */}
      <span
        className={clsx(
          'font-display font-medium leading-none tracking-tighter select-none shrink-0',
          'text-[clamp(2.5rem,5vw,3.75rem)] transition-colors duration-200',
          isActive
            ? 'text-[var(--rb-near-black)]'
            : 'text-[var(--rb-border-light)] group-hover:text-[var(--rb-muted-text)]',
        )}
        aria-hidden="true"
      >
        {String(step.stepNumber ?? index + 1).padStart(2, '0')}
      </span>

      {/* Active indicator bar */}
      {isActive && (
        <motion.div
          className={clsx(
            'absolute rounded-full bg-[var(--rb-primary-text)]',
            isRtl ? 'right-0' : 'left-0',
            'w-1 h-8 md:h-10',
          )}
          layoutId="active-step-bar"
          transition={{
            duration: shouldReduceMotion ? 0 : DUR.normal / 1000,
            ease: EASE_STANDARD,
          }}
        />
      )}
    </button>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const ApplicationSteps: React.FC<Props> = ({ unit, lang = 'en', shouldReduceMotion }) => {
  const { payload, theme } = unit;
  const { eyebrow, heading, steps, defaultActiveStepId } = payload;
  const isRtl = lang === 'ar' || unit.direction === 'rtl';
  const containerRef = useRef<HTMLDivElement>(null);

  // Resolve the initial active step index
  const initialIndex = useMemo(() => {
    if (defaultActiveStepId) {
      const found = steps.findIndex((s) => s.id === defaultActiveStepId);
      if (found !== -1) return found;
    }
    return 0;
  }, [defaultActiveStepId, steps]);

  const [activeIndex, setActiveIndex] = useState(initialIndex);

  // Sync state if the unit payload changes externally
  useEffect(() => {
    setActiveIndex(initialIndex);
  }, [initialIndex]);

  const activeStep = steps[activeIndex];
  if (!activeStep) return null;

  const totalSteps = steps.length;

  const go = useCallback(
    (idx: number) => {
      setActiveIndex(((idx % totalSteps) + totalSteps) % totalSteps);
    },
    [totalSteps],
  );

  const prev = useCallback(
    () => go(isRtl ? activeIndex + 1 : activeIndex - 1),
    [activeIndex, go, isRtl],
  );

  const next = useCallback(
    () => go(isRtl ? activeIndex - 1 : activeIndex + 1),
    [activeIndex, go, isRtl],
  );

  // Keyboard navigation: ArrowLeft / ArrowRight on the focused region
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prev();
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        next();
      }
    };

    el.addEventListener('keydown', onKey);
    return () => el.removeEventListener('keydown', onKey);
  }, [prev, next]);

  // Resolve which eyebrow / title to show:
  // payload.eyebrow takes precedence; fallback to heading.eyebrow from SectionHeadingSchema
  const resolvedEyebrow = eyebrow ?? heading?.eyebrow;
  const resolvedTitle = heading?.title ?? heading?.subtitle;

  // Cross-fade motion props for the AnimatePresence-wrapped block
  const fadeMotion = shouldReduceMotion
    ? {}
    : {
        initial: { opacity: 0, y: 10 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -10 },
        transition: {
          duration: DUR.normal / 1000,
          ease: EASE_STANDARD,
        },
      };

  const imageFadeMotion = shouldReduceMotion
    ? {}
    : {
        initial: { opacity: 0, scale: 1.02 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.98 },
        transition: {
          duration: DUR.emphasis / 1000,
          ease: EASE_STANDARD,
        },
      };

  return (
    <UnitShell
      theme={theme ?? 'light'}
      id={unit.id}
      innerClassName="py-12 md:py-16 lg:py-20"
    >
      <div dir={isRtl ? 'rtl' : 'ltr'}>
        {/* Header */}
        {(resolvedEyebrow || resolvedTitle) && (
          <motion.div
            className="mb-10 md:mb-14 max-w-xl"
            initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: VIEWPORT.default }}
            transition={{
              duration: shouldReduceMotion ? 0 : DUR.normal / 1000,
              ease: EASE_STANDARD,
            }}
          >
            {resolvedEyebrow && <Eyebrow>{resolvedEyebrow}</Eyebrow>}
            {resolvedTitle && <SectionTitle size="lg">{resolvedTitle}</SectionTitle>}
          </motion.div>
        )}

        {/* 2-col layout: rail + content (left) · large image (right on desktop) */}
        <div
          ref={containerRef}
          role="region"
          aria-label="Application steps"
          aria-live="polite"
          tabIndex={0}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-12 lg:gap-16">
            {/* Left col: step rail + text content panel */}
            <div className="flex flex-col">
              {/* Step rail */}
              <div className="flex flex-col gap-1 mb-8 md:mb-10">
                {steps.map((step, i) => (
                  <StepRailButton
                    key={step.id}
                    step={step}
                    index={i}
                    isActive={i === activeIndex}
                    onClick={() => go(i)}
                    isRtl={isRtl}
                    shouldReduceMotion={shouldReduceMotion}
                  />
                ))}
              </div>

              {/* Active step text — animated via AnimatePresence */}
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={activeStep.id}
                  {...fadeMotion}
                >
                  {activeStep.title && (
                    <h3 className="font-display font-medium text-[var(--rb-near-black)] text-xl md:text-2xl leading-snug mb-3">
                      {activeStep.title}
                    </h3>
                  )}
                  {activeStep.description && (
                    <BodyText className="max-w-md">{activeStep.description}</BodyText>
                  )}
                  {activeStep.duration && (
                    <p className="mt-3 text-[var(--rb-text-2xs)] font-medium uppercase tracking-widest text-[var(--rb-muted-text)]">
                      {activeStep.duration}
                    </p>
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Mobile image below text at h-[340px] */}
              {activeStep.image && (
                <div className="mt-8 md:hidden rounded-[8px] overflow-hidden h-[340px] w-full bg-[var(--rb-bg-surface)]">
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                      key={activeStep.id}
                      {...(shouldReduceMotion
                        ? {}
                        : {
                            initial: { opacity: 0 },
                            animate: { opacity: 1 },
                            exit: { opacity: 0 },
                            transition: {
                              duration: DUR.normal / 1000,
                              ease: EASE_STANDARD,
                            },
                          })}
                      className="w-full h-full"
                    >
                      <ImageWithFallback
                        src={activeStep.image.url}
                        alt={activeStep.image.alt ?? activeStep.title}
                        className="w-full h-full object-cover"
                      />
                    </motion.div>
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Right col: large image (desktop only) */}
            <div className="hidden md:block relative rounded-[12px] overflow-hidden aspect-[3/4] bg-[var(--rb-bg-surface)]">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={activeStep.id}
                  {...imageFadeMotion}
                  className="absolute inset-0"
                >
                  <ImageWithFallback
                    src={activeStep.image?.url}
                    alt={activeStep.image?.alt ?? activeStep.title}
                    className="w-full h-full object-cover"
                  />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </UnitShell>
  );
};

// Self-register
registerUnit('application_steps', ApplicationSteps);

export default ApplicationSteps;
export { ApplicationSteps };
