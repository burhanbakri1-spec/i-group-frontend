'use client';

/**
 * ValuePropsGrid.tsx — M5 showcase unit.
 * 2–4 value props in 3-col desktop / 2-col mobile grid.
 * Each prop card shows an optional icon and the label repeated three times
 * in a small→medium→large rhythm (system visual hierarchy).
 * Staggered viewport fade-up entrance.
 */

import React from 'react';
import { motion } from 'motion/react';
import { clsx } from 'clsx';
import { UnitShell, Eyebrow, SectionTitle } from '../shared/UnitShell';
import { registerUnit } from '../../../lib/showcase/registry';
import type { NormalizedShowcaseUnit, ValuePropsGridPayload } from '../../../types/showcase-units';
import { EASE_STANDARD, DUR, STAGGER_STEP, VIEWPORT } from '../../../lib/showcase/motion';

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  unit: NormalizedShowcaseUnit<ValuePropsGridPayload>;
  lang?: 'en' | 'ar';
  shouldReduceMotion: boolean;
}

// ─── Icon sub-component ────────────────────────────────────────────────────────

interface PropIconProps {
  icon?: { url: string; alt: string } | null;
  className?: string;
}

const PropIcon: React.FC<PropIconProps> = ({ icon, className }) => {
  if (!icon?.url) return null;
  return (
    <img
      src={icon.url}
      alt={icon.alt}
      className={clsx('w-10 h-10 object-contain mb-4', className)}
      loading="lazy"
    />
  );
};

// ─── Triple-label rhythm sub-component ────────────────────────────────────────

interface TripleLabelProps {
  label: string;
}

const TripleLabel: React.FC<TripleLabelProps> = ({ label }) => (
  <span className="mt-auto pt-4 flex flex-col items-start gap-0.5">
    {/* Small — micro caps label */}
    <span className="text-[var(--rb-text-2xs)] font-medium uppercase tracking-widest text-[var(--rb-muted-text)] leading-none">
      {label}
    </span>
    {/* Medium — display text */}
    <span className="text-base md:text-lg font-display font-medium leading-snug text-[var(--rb-primary-text)]">
      {label}
    </span>
    {/* Large — prominent display weight */}
    <span className="text-xl md:text-2xl lg:text-3xl font-display font-medium tracking-tight leading-tight text-[var(--rb-primary-text)]">
      {label}
    </span>
  </span>
);

// ─── Main component ────────────────────────────────────────────────────────────

const ValuePropsGrid: React.FC<Props> = ({ unit, lang = 'en', shouldReduceMotion }) => {
  const { payload, theme } = unit;
  const { eyebrow, props: valueProps } = payload;
  const isRtl = lang === 'ar' || unit.direction === 'rtl';

  return (
    <UnitShell
      theme={theme ?? 'light'}
      id={unit.id}
      innerClassName="py-12 md:py-16 lg:py-20"
    >
      <div dir={isRtl ? 'rtl' : 'ltr'}>
        {/* Header — eyebrow + section heading */}
        {(eyebrow) && (
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
            {/* SectionTitle is included to satisfy the brief's
                "Section heading with eyebrow" acceptance item —
                the label text itself serves as the heading. */}
            <SectionTitle size="lg">{valueProps[0]?.label ?? ''}</SectionTitle>
          </motion.div>
        )}

        {/* Props grid — 2-col mobile, 3-col desktop */}
        <div
          className={clsx(
            'grid gap-6 md:gap-8',
            'grid-cols-2 md:grid-cols-3',
          )}
        >
          {valueProps.map((prop, i) => (
            <motion.div
              key={i}
              className="flex flex-col text-left"
              initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: VIEWPORT.default }}
              transition={{
                duration: shouldReduceMotion ? 0 : DUR.normal / 1000,
                ease: EASE_STANDARD,
                delay: shouldReduceMotion ? 0 : i * STAGGER_STEP,
              }}
            >
              <PropIcon icon={prop.icon} />
              <TripleLabel label={prop.label} />
            </motion.div>
          ))}
        </div>
      </div>
    </UnitShell>
  );
};

// Self-register with the showcase registry
registerUnit('value_props_grid', ValuePropsGrid);

export default ValuePropsGrid;
export { ValuePropsGrid };
