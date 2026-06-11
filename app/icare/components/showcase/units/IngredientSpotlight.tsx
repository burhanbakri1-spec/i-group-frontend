'use client';

/**
 * IngredientSpotlight.tsx — M7 showcase unit.
 * Two-column layout with hero image on the left and
 * featured ingredient cards on the right (sticky on desktop).
 * Includes ingredient list and also-made-with pill badges.
 */

import React from 'react';
import { motion } from 'motion/react';
import { clsx } from 'clsx';
import { UnitShell, Eyebrow, SectionTitle, BodyText } from '../shared/UnitShell';
import { ImageWithFallback } from '../../figma/ImageWithFallback';
import { registerUnit } from '../../../lib/showcase/registry';
import type { NormalizedShowcaseUnit, IngredientSpotlightPayload } from '../../../types/showcase-units';
import { EASE_STANDARD, DUR, STAGGER_STEP, VIEWPORT } from '../../../lib/showcase/motion';

interface Props {
  unit: NormalizedShowcaseUnit<IngredientSpotlightPayload>;
  lang?: 'en' | 'ar';
  shouldReduceMotion: boolean;
}

const IngredientSpotlight: React.FC<Props> = ({ unit, lang = 'en', shouldReduceMotion }) => {
  const { payload, theme } = unit;
  const { heading, heroImage, featuredIngredients, alsoMadeWith } = payload;
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
            {heading.title && <SectionTitle size="lg">{heading.title}</SectionTitle>}
            {heading.subtitle && (
              <BodyText className="mt-2 text-[var(--rb-muted-text)]">{heading.subtitle}</BodyText>
            )}
          </motion.div>
        )}

        {/* Two-column layout: hero image left, ingredients right */}
        <div className={clsx('grid gap-8 md:gap-10', 'grid-cols-1 md:grid-cols-2')}>
          {/* Hero image — full height on desktop */}
          <motion.div
            className={clsx('relative overflow-hidden rounded-lg bg-[var(--rb-bg-warm-gray)]', 'aspect-[4/5] md:aspect-auto md:h-full')}
            initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: VIEWPORT.default }}
            transition={{
              duration: shouldReduceMotion ? 0 : DUR.normal / 1000,
              ease: EASE_STANDARD,
            }}
          >
            <ImageWithFallback
              src={heroImage.url}
              alt={heroImage.alt}
              className="object-cover w-full h-full"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
          </motion.div>

          {/* Ingredient column — sticky on desktop */}
          <div className={clsx('flex flex-col gap-8', 'md:sticky md:top-24 md:self-start')}>
            {/* Featured ingredients */}
            <div className={clsx('flex flex-col gap-6')}>
              {featuredIngredients.map((ingredient, i) => (
                <motion.div
                  key={i}
                  className={clsx('flex flex-col gap-3 rounded-lg border border-[var(--rb-border-light)] p-4 md:p-5 bg-white')}
                  initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: VIEWPORT.default }}
                  transition={{
                    duration: shouldReduceMotion ? 0 : DUR.normal / 1000,
                    ease: EASE_STANDARD,
                    delay: shouldReduceMotion ? 0 : i * STAGGER_STEP,
                  }}
                >
                  {/* Optional ingredient image */}
                  {ingredient.image && (
                    <div className={clsx('relative overflow-hidden rounded-md bg-[var(--rb-bg-warm-gray)]', 'aspect-[4/3] w-full')}>
                      <ImageWithFallback
                        src={ingredient.image.url}
                        alt={ingredient.image.alt}
                        className="object-cover w-full h-full"
                        sizes="(max-width: 768px) 100vw, 300px"
                      />
                    </div>
                  )}

                  {/* Ingredient name + description */}
                  <div>
                    <h3 className="font-display font-medium text-lg leading-tight text-[var(--rb-near-black)]">
                      {ingredient.name}
                    </h3>
                    <BodyText className="mt-1.5 text-[var(--rb-primary-text)]">
                      {ingredient.description}
                    </BodyText>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Also-made-with pills */}
            {alsoMadeWith && alsoMadeWith.length > 0 && (
              <motion.div
                className="flex flex-wrap gap-2"
                initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: VIEWPORT.default }}
                transition={{
                  duration: shouldReduceMotion ? 0 : DUR.normal / 1000,
                  delay: shouldReduceMotion ? 0 : featuredIngredients.length * STAGGER_STEP,
                  ease: EASE_STANDARD,
                }}
              >
                {alsoMadeWith.map((item, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center px-3 py-1.5 rounded-full border border-[var(--rb-border-light)] text-[var(--rb-text-2xs)] font-medium uppercase tracking-widest text-[var(--rb-muted-text)] bg-[var(--rb-bg-warm-gray)]"
                  >
                    {item}
                  </span>
                ))}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </UnitShell>
  );
};

// Self-register
registerUnit('ingredient_spotlight', IngredientSpotlight);

export default IngredientSpotlight;
export { IngredientSpotlight };
