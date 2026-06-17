'use client';

/**
 * BenefitsGrid.tsx — M2 showcase unit.
 * 4-column benefit cards with checkmark icons, staggered viewport entrance.
 * Desktop: 4-col | Tablet: 2-col | Mobile: 2-col
 */

import React from 'react';
import { motion } from 'motion/react';
import { clsx } from 'clsx';
import { UnitShell, Eyebrow, SectionTitle, BodyText } from '../shared/UnitShell';
import { registerUnit } from '../../../lib/showcase/registry';
import type { NormalizedShowcaseUnit, BenefitsGridPayload } from '../../../types/showcase-units';
import { EASE_STANDARD, DUR, STAGGER_STEP, VIEWPORT } from '../../../lib/showcase/motion';
import { TextPlaceholder } from '../shared/TextPlaceholder';
import { ImagePlaceholder } from '../shared/ImagePlaceholder';

interface Props {
  unit: NormalizedShowcaseUnit<BenefitsGridPayload>;
  lang?: 'en' | 'ar';
  shouldReduceMotion: boolean;
}

const CheckIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={clsx('w-5 h-5 flex-shrink-0 text-[var(--rb-pure-black)]', className)}
    viewBox="0 0 20 20"
    fill="currentColor"
    aria-hidden="true"
  >
    <path
      fillRule="evenodd"
      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
      clipRule="evenodd"
    />
  </svg>
);

const BenefitsGrid: React.FC<Props> = ({ unit, lang = 'en', shouldReduceMotion }) => {
  const { payload, theme } = unit;
  const { eyebrow, heading, items } = payload;
  const isRtl = lang === 'ar' || unit.direction === 'rtl';

  return (
    <UnitShell
      theme={theme ?? 'light'}
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
            {heading ? (
              <SectionTitle size="lg">{heading}</SectionTitle>
            ) : heading === '' ? (
              <TextPlaceholder variant="single-line" width="half" />
            ) : null}
          </motion.div>
        )}

        {/* Benefits grid */}
        <div className={clsx(
          'grid gap-6 md:gap-8',
          'grid-cols-2 md:grid-cols-4',
        )}>
          {items.map((item, i) => (
            <motion.div
              key={i}
              className="flex flex-col items-center text-center"
              initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: VIEWPORT.default }}
              transition={{
                duration: shouldReduceMotion ? 0 : DUR.normal / 1000,
                ease: EASE_STANDARD,
                delay: shouldReduceMotion ? 0 : i * STAGGER_STEP,
              }}
            >
              {/* Checkmark */}
              <div className="w-10 h-10 mx-auto mb-3 flex items-center justify-center text-[var(--rb-pure-black)]">
                {item.icon === undefined ? (
                  <ImagePlaceholder aspect="square" rounded="full" className="w-8 h-8" />
                ) : (
                  <CheckIcon className="w-5 h-5" />
                )}
              </div>

              {/* Benefit text */}
              <BodyText className="text-[var(--rb-primary-text)]">
                {item.text === '' ? (
                  <TextPlaceholder variant="label-line" width="three-quarter" />
                ) : (
                  item.text
                )}
              </BodyText>
            </motion.div>
          ))}
        </div>
      </div>
    </UnitShell>
  );
};

// Self-register
registerUnit('benefits_grid', BenefitsGrid);

export default BenefitsGrid;
export { BenefitsGrid };