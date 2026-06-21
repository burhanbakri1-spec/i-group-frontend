'use client';

/**
 * KeyIngredients.tsx — M4 showcase unit.
 * Hero ingredient spotlight with "also made with" pills and optional CTA.
 * Desktop: 2-col layout | Tablet/Mobile: single column stacked.
 */

import React from 'react';
import { motion } from 'motion/react';
import { clsx } from 'clsx';
import { UnitShell, Eyebrow, SectionTitle, BodyText } from '../shared/UnitShell';
import { TextPlaceholder } from '../shared/TextPlaceholder';
import { ImagePlaceholder } from '../shared/ImagePlaceholder';
import { ImageWithFallback } from '../../figma/ImageWithFallback';
import { registerUnit } from '../../../lib/showcase/registry';
import type { NormalizedShowcaseUnit, KeyIngredientsPayload } from '../../../types/showcase-units';
import { EASE_STANDARD, DUR, STAGGER_STEP, VIEWPORT } from '../../../lib/showcase/motion';

interface Props {
  unit: NormalizedShowcaseUnit<KeyIngredientsPayload>;
  lang?: 'en' | 'ar';
  shouldReduceMotion: boolean;
}

const KeyIngredients: React.FC<Props> = ({ unit, lang = 'en', shouldReduceMotion }) => {
  const { payload, theme } = unit;
  const { heading, heroIngredients, alsoMadeWith, fullListUrl, fullListText } = payload;
  const isRtl = lang === 'ar' || unit.direction === 'rtl';

  return (
    <UnitShell
      theme={theme ?? 'light'}
      id={unit.id}
      innerClassName="py-12 md:py-16 lg:py-20"
    >
      <div dir={isRtl ? 'rtl' : 'ltr'}>
        {/* Header */}
        {heading && (
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
            {heading.eyebrow && <Eyebrow>{heading.eyebrow}</Eyebrow>}
            <SectionTitle size="lg">{heading.title}</SectionTitle>
          </motion.div>
        )}

        {/* 2-column layout: hero ingredients | also-made-with + CTA */}
        <div
          className={clsx(
            'grid gap-8 md:gap-12',
            'grid-cols-1 md:grid-cols-2',
          )}
        >
          {/* Hero ingredients */}
          <div className={clsx('grid gap-6', 'grid-cols-1')}>
            {heroIngredients.map((ingredient, i) => (
              <motion.div
                key={i}
                className="flex flex-col gap-3"
                initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: VIEWPORT.default }}
                transition={{
                  duration: shouldReduceMotion ? 0 : DUR.normal / 1000,
                  ease: EASE_STANDARD,
                  delay: shouldReduceMotion ? 0 : i * STAGGER_STEP,
                }}
              >
                {ingredient.image == null ? (
                  <ImagePlaceholder aspect="square" rounded="md" />
                ) : (
                  <div className="w-full max-w-xs overflow-hidden rounded-[8px] bg-[var(--rb-bg-surface)]">
                    <ImageWithFallback
                      src={ingredient.image.url}
                      alt={ingredient.image.alt || ingredient.name}
                      className="h-auto w-full object-cover"
                    />
                  </div>
                )}
                <div>
                  <h3 className="font-display text-lg font-medium tracking-tight text-[var(--rb-near-black)]">
                    {ingredient.name === '' ? <TextPlaceholder variant="label-line" width="half" /> : ingredient.name}
                  </h3>
                  <BodyText className="text-sm md:text-base">
                    {ingredient.description === '' ? <TextPlaceholder variant="label-line" width="full" /> : ingredient.description}
                  </BodyText>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Also-made-with pills + CTA */}
          {(alsoMadeWith.length > 0 || (fullListUrl && fullListText)) && (
            <motion.div
              className="flex flex-col gap-5 md:justify-end"
              initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: VIEWPORT.default }}
              transition={{
                duration: shouldReduceMotion ? 0 : DUR.normal / 1000,
                ease: EASE_STANDARD,
                delay: shouldReduceMotion ? 0 : Math.min(heroIngredients.length, 3) * STAGGER_STEP,
              }}
            >
              {alsoMadeWith.length === 0 ? (
                <div className="flex flex-wrap gap-2">
                  <TextPlaceholder variant="label-line" width="quarter" className="inline-block" />
                  <TextPlaceholder variant="label-line" width="quarter" className="inline-block" />
                  <TextPlaceholder variant="label-line" width="quarter" className="inline-block" />
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {alsoMadeWith.map((ingredient, i) => (
                    <span
                      key={i}
                      className="inline-flex rounded-full border border-[var(--rb-muted-text)] px-3 py-1 text-xs font-medium uppercase tracking-widest text-[var(--rb-muted-text)]"
                    >
                      {ingredient}
                    </span>
                  ))}
                </div>
              )}

              {fullListUrl && fullListText && (
                <div>
                  <a
                    href={fullListUrl}
                    className="inline-flex items-center gap-1 text-sm font-medium text-[var(--rb-primary-text)] underline underline-offset-4 transition-opacity hover:opacity-70"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {fullListText}
                    <span aria-hidden="true">→</span>
                  </a>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </UnitShell>
  );
};

// Self-register
registerUnit('key_ingredients', KeyIngredients);

export default KeyIngredients;
export { KeyIngredients };
