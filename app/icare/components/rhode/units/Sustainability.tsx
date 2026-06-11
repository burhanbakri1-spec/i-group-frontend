'use client';

/**
 * Sustainability.tsx — E7 Rhode showcase unit.
 * Packaging specs, optional recycle CTA, and numbered recycling steps.
 * Desktop: 2-col specs grid | Mobile: 1-col
 */

import React from 'react';
import { motion } from 'motion/react';
import { clsx } from 'clsx';
import { UnitShell, Eyebrow, SectionTitle, BodyText } from '../shared/UnitShell';
import { registerUnit } from '../../../lib/rhode/registry';
import type { NormalizedRhodeUnit, SustainabilityPayload } from '../../../types/rhode-showcase-units';
import { EASE_STANDARD, DUR, VIEWPORT } from '../../../lib/rhode/motion';

interface Props {
  unit: NormalizedRhodeUnit<SustainabilityPayload>;
  lang?: 'en' | 'ar';
  shouldReduceMotion: boolean;
}

const Sustainability: React.FC<Props> = ({ unit, lang = 'en', shouldReduceMotion }) => {
  const { payload, theme } = unit;
  const { title, intro, specs, recycleCta, steps, closingNote } = payload;
  const isRtl = lang === 'ar' || unit.direction === 'rtl';

  return (
    <UnitShell
      theme={theme ?? 'light'}
      id={unit.id}
      innerClassName="py-12 md:py-16 lg:py-20"
    >
      <div dir={isRtl ? 'rtl' : 'ltr'}>
        {/* Header */}
        {(title || intro) && (
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
            {title && <SectionTitle size="lg">{title}</SectionTitle>}
            {intro && (
              <BodyText className="mt-3 text-[var(--rb-text-base)]">{intro}</BodyText>
            )}
          </motion.div>
        )}

        {/* Specs grid */}
        {specs.length > 0 && (
          <div
            className={clsx(
              'grid gap-4 md:gap-6 mb-10 md:mb-14',
              'grid-cols-1 md:grid-cols-2',
            )}
          >
            {specs.map((spec, i) => (
              <motion.div
                key={i}
                className="flex flex-col gap-1 rounded-lg border border-[var(--rb-border)] bg-white/60 p-4 md:p-5"
                initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: VIEWPORT.default }}
                transition={{
                  duration: shouldReduceMotion ? 0 : DUR.normal / 1000,
                  ease: EASE_STANDARD,
                  delay: shouldReduceMotion ? 0 : i * 0.06,
                }}
              >
                <span className="text-sm font-medium text-[var(--rb-near-black)]">
                  {spec.component}
                </span>
                <span className="text-sm text-[var(--rb-muted-text)]">
                  {spec.detail}
                </span>
              </motion.div>
            ))}
          </div>
        )}

        {/* Recycle CTA */}
        {recycleCta && (
          <motion.div
            className="mb-10 md:mb-14"
            initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: VIEWPORT.default }}
            transition={{
              duration: shouldReduceMotion ? 0 : DUR.normal / 1000,
              ease: EASE_STANDARD,
            }}
          >
            <a
              href={recycleCta.href}
              className={clsx(
                'inline-flex items-center rounded-full bg-[var(--rb-near-black)] px-6 py-3',
                'text-sm font-medium text-[var(--rb-pure-white)]',
                'transition-colors hover:bg-[var(--rb-primary-text)]',
              )}
            >
              {recycleCta.label}
            </a>
          </motion.div>
        )}

        {/* Steps */}
        {steps.length > 0 && (
          <div className="mb-10 md:mb-14">
            <h3 className="text-lg font-medium text-[var(--rb-near-black)] mb-4">
              How to recycle
            </h3>
            <ol className="flex flex-col gap-3">
              {steps.map((step, i) => (
                <li
                  key={i}
                  className={clsx(
                    'flex items-start gap-3',
                    isRtl ? 'flex-row-reverse' : 'flex-row',
                  )}
                >
                  <span
                    className={clsx(
                      'flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full',
                      'bg-[var(--rb-near-black)] text-xs font-medium text-[var(--rb-pure-white)]',
                    )}
                  >
                    {i + 1}
                  </span>
                  <BodyText className="text-sm text-[var(--rb-primary-text)] pt-0.5">
                    {step}
                  </BodyText>
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* Closing note */}
        {closingNote && (
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: VIEWPORT.default }}
            transition={{
              duration: shouldReduceMotion ? 0 : DUR.normal / 1000,
              ease: EASE_STANDARD,
            }}
          >
            <BodyText className="text-[var(--rb-muted-text)] italic">
              {closingNote}
            </BodyText>
          </motion.div>
        )}
      </div>
    </UnitShell>
  );
};

// Self-register
registerUnit('sustainability', Sustainability);

export default Sustainability;
export { Sustainability };
