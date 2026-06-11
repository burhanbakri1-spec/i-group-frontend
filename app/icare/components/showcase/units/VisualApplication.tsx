'use client';

/**
 * M6 VisualApplication.tsx
 * Numbered how-to-apply step cards with optional imagery.
 * Desktop: 3-col grid | Mobile: stacked with image below text
 */

import React from 'react';
import { motion } from 'motion/react';
import { clsx } from 'clsx';
import { UnitShell, Eyebrow, SectionTitle } from '../shared/UnitShell';
import { ImageWithFallback } from '../../figma/ImageWithFallback';
import { registerUnit } from '../../../lib/showcase/registry';
import type { NormalizedShowcaseUnit, VisualApplicationPayload } from '../../../types/showcase-units';
import { EASE_STANDARD, DUR, STAGGER_STEP, VIEWPORT } from '../../../lib/showcase/motion';

interface Props {
  unit: NormalizedShowcaseUnit<VisualApplicationPayload>;
  lang?: 'en' | 'ar';
  shouldReduceMotion: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function padStep(n: number): string {
  return String(n).padStart(2, '0');
}

// ─── Step Card ────────────────────────────────────────────────────────────────

interface StepCardProps {
  step: VisualApplicationPayload['steps'][number];
  index: number;
  shouldReduceMotion: boolean;
}

const StepCard: React.FC<StepCardProps> = ({ step, index, shouldReduceMotion }) => {
  const delay = shouldReduceMotion ? 0 : index * STAGGER_STEP;

  return (
    <motion.div
      className="flex flex-col"
      initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: VIEWPORT.default }}
      transition={{
        duration: shouldReduceMotion ? 0 : DUR.normal / 1000,
        ease: EASE_STANDARD,
        delay,
      }}
    >
      {/* Step number — large display */}
      <span
        className={clsx(
          'font-display font-medium leading-none tracking-tighter',
          'text-[var(--rb-bg-surface)] select-none mb-5',
          'text-[clamp(3.5rem,8vw,6rem)]',
        )}
        aria-hidden="true"
      >
        {padStep(step.number)}
      </span>

      {/* Title */}
      <h3 className="font-display font-medium text-[var(--rb-near-black)] text-lg md:text-xl leading-snug mb-2">
        {step.title}
      </h3>

      {/* Description */}
      {step.description && (
        <p className="text-[var(--rb-primary-text)] text-[var(--rb-text-base)] leading-relaxed flex-1">
          {step.description}
        </p>
      )}

      {/* Mobile image — only shown on small screens */}
      {step.image && (
        <div className="mt-5 block md:hidden rounded-[8px] overflow-hidden h-[340px] w-full bg-[var(--rb-bg-surface)]">
          <ImageWithFallback
            src={step.image.url}
            alt={step.image.alt}
            className="w-full h-full object-cover"
          />
        </div>
      )}
    </motion.div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const VisualApplication: React.FC<Props> = ({ unit, lang, shouldReduceMotion }) => {
  const { payload } = unit;
  const { eyebrow, heading, steps } = payload;
  const isRtl = lang === 'ar' || unit.direction === 'rtl';

  return (
    <UnitShell
      theme={unit.theme ?? 'light'}
      id={unit.id}
      innerClassName="py-12 md:py-16 lg:py-20"
    >
      <div dir={isRtl ? 'rtl' : 'ltr'}>
        {/* Header */}
        {(eyebrow || heading) && (
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
            {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
            {heading && <SectionTitle size="lg">{heading}</SectionTitle>}
          </motion.div>
        )}

        {/* Divider line above grid */}
        <div className="w-full h-px bg-[var(--rb-border-light)] mb-10 md:mb-14" />

        {/* Steps grid */}
        <div
          className={clsx(
            'grid gap-10 md:gap-8',
            steps.length <= 2 && 'md:grid-cols-2',
            steps.length === 3 && 'md:grid-cols-3',
            steps.length === 4 && 'md:grid-cols-4',
            steps.length >= 5 && 'md:grid-cols-3 lg:grid-cols-5',
          )}
        >
          {steps.map((step, i) => (
            <StepCard
              key={step.number}
              step={step}
              index={i}
              shouldReduceMotion={shouldReduceMotion}
            />
          ))}
        </div>
      </div>
    </UnitShell>
  );
};

// ─── Self-register ────────────────────────────────────────────────────────────
registerUnit('visual_application', VisualApplication);

export default VisualApplication;
export { VisualApplication };
