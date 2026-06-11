'use client';

/**
 * ResearchIngredients.tsx — E6 showcase unit.
 * 2-col layout: hero swatch on left, tabbed ingredient display on right.
 * Each tab shows: icon, rhythmic 3× label (name), description, also-made-with pills.
 * Tab content cross-fades with tabFade animation. RTL aware, shouldReduceMotion respected.
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx } from 'clsx';
import { UnitShell, Eyebrow, SectionTitle, BodyText } from '../shared/UnitShell';
import { ImageWithFallback } from '../../figma/ImageWithFallback';
import { registerUnit } from '../../../lib/showcase/registry';
import type { NormalizedShowcaseUnit, ResearchIngredientsPayload } from '../../../types/showcase-units';
import { EASE_STANDARD, DUR, STAGGER_STEP, VIEWPORT, tabFade } from '../../../lib/showcase/motion';

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  unit: NormalizedShowcaseUnit<ResearchIngredientsPayload>;
  lang?: 'en' | 'ar';
  shouldReduceMotion: boolean;
}

// ─── Ingredient icon ──────────────────────────────────────────────────────────

interface IngredientIconProps {
  icon?: { url: string; alt: string } | null;
  className?: string;
}

const IngredientIcon: React.FC<IngredientIconProps> = ({ icon, className }) => {
  if (!icon?.url) return null;
  return (
    <img
      src={icon.url}
      alt={icon.alt}
      className={clsx('w-10 h-10 object-contain mb-3', className)}
      loading="lazy"
    />
  );
};

// ─── Rhythmic 3× label (mirrors ValuePropsGrid TripleLabel pattern) ────────────
// Ingredient name rendered at small / medium / large sizes for the system's
// characteristic vertical visual rhythm.

const TripleLabel: React.FC<{ label: string }> = ({ label }) => (
  <span className="mt-auto pt-4 flex flex-col items-start gap-0.5">
    {/* Small — micro caps label */}
    <span className="text-[var(--rb-text-2xs)] font-medium uppercase tracking-widest text-[var(--rb-muted-text)] leading-none">
      {label}
    </span>
    {/* Medium — body display */}
    <span className="text-base md:text-lg font-display font-medium leading-snug text-[var(--rb-primary-text)]">
      {label}
    </span>
    {/* Large — prominent heading weight */}
    <span className="text-xl md:text-2xl lg:text-3xl font-display font-medium tracking-tight leading-tight text-[var(--rb-primary-text)]">
      {label}
    </span>
  </span>
);

// ─── Also-made-with pills ─────────────────────────────────────────────────────

const AlsoMadeWithPills: React.FC<{ items: string[] }> = ({ items }) => (
  <div className="mt-6 flex flex-wrap gap-2">
    {items.map((item, i) => (
      <span
        key={i}
        className="inline-flex items-center px-3 py-1.5 rounded-full border border-[var(--rb-border-light)] text-[var(--rb-text-2xs)] font-medium uppercase tracking-widest text-[var(--rb-muted-text)] bg-[var(--rb-bg-warm-gray)]"
      >
        {item}
      </span>
    ))}
  </div>
);

// ─── Main component ───────────────────────────────────────────────────────────

const ResearchIngredients: React.FC<Props> = ({ unit, lang = 'en', shouldReduceMotion }) => {
  const { payload, theme } = unit;
  const { heading, heroImage, ingredients } = payload;
  const isRtl = lang === 'ar' || unit.direction === 'rtl';
  const [activeIndex, setActiveIndex] = useState(0);

  const activeIngredient = ingredients[activeIndex];
  if (!activeIngredient) return null;

  // Map tabFade variant (enter/center/exit) to AnimatePresence-compatible props
  const tabMotion = shouldReduceMotion
    ? {}
    : {
        initial: tabFade.enter,
        animate: tabFade.center,
        exit: tabFade.exit,
      };

  return (
    <UnitShell
      theme={theme ?? 'light'}
      id={unit.id}
      innerClassName="py-12 md:py-16 lg:py-20"
    >
      <div dir={isRtl ? 'rtl' : 'ltr'}>
        {/* Header — eyebrow + section title */}
            {(heading?.eyebrow || heading?.title) && (
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
                {heading?.eyebrow && <Eyebrow>{heading.eyebrow}</Eyebrow>}
                {heading?.title && <SectionTitle size="lg">{heading.title}</SectionTitle>}
              </motion.div>
            )}

        {/* 2-column: hero swatch (left) · tabbed ingredients (right) */}
        <motion.div
          className={clsx('grid gap-8 md:gap-10', 'grid-cols-1 md:grid-cols-2')}
          initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: VIEWPORT.default }}
          transition={{
            duration: shouldReduceMotion ? 0 : DUR.normal / 1000,
            ease: EASE_STANDARD,
          }}
        >
          {/* Hero swatch / image */}
          <div
            className={clsx(
              'relative overflow-hidden rounded-lg bg-[var(--rb-bg-warm-gray)]',
              'aspect-[4/5] md:aspect-auto md:h-full',
            )}
          >
            <ImageWithFallback
              src={heroImage.url}
              alt={heroImage.alt}
              className="object-cover w-full h-full"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
          </div>

          {/* Tabbed ingredient panel */}
          <div className={clsx('flex flex-col gap-6')}>
            {/* Tab rail */}
            <div
              className="flex flex-wrap gap-2"
              role="tablist"
              aria-label="Research ingredients"
            >
              {ingredients.map((ingredient, i) => (
                <button
                  key={ingredient.id}
                  type="button"
                  role="tab"
                  aria-selected={i === activeIndex}
                  aria-controls={`research-ingredient-panel-${ingredient.id}`}
                  id={`research-ingredient-tab-${ingredient.id}`}
                  tabIndex={i === activeIndex ? 0 : -1}
                  onClick={() => setActiveIndex(i)}
                  onKeyDown={(e) => {
                    const current = Array.from(e.currentTarget.parentElement!.children);
                    const idx = current.indexOf(e.currentTarget);
                    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                      e.preventDefault();
                      const next = current[(idx + 1) % current.length];
                      (next as HTMLElement).click();
                      (next as HTMLElement).focus();
                    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                      e.preventDefault();
                      const prev = current[(idx - 1 + current.length) % current.length];
                      (prev as HTMLElement).click();
                      (prev as HTMLElement).focus();
                    }
                  }}
                  className={clsx(
                    'px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200',
                    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--rb-primary-text)]',
                    i === activeIndex
                      ? 'bg-[var(--rb-near-black)] text-white'
                      : 'bg-[var(--rb-bg-warm-gray)] text-[var(--rb-muted-text)] hover:text-[var(--rb-primary-text)]',
                  )}
                >
                  {ingredient.name}
                </button>
              ))}
            </div>

            {/* Tab content — cross-fades via AnimatePresence */}
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={activeIngredient.id}
                {...tabMotion}
                className="flex flex-col"
                role="tabpanel"
                id={`research-ingredient-panel-${activeIngredient.id}`}
                aria-labelledby={`research-ingredient-tab-${activeIngredient.id}`}
              >
                {/* Optional icon */}
                <IngredientIcon icon={activeIngredient.icon} />

                {/* Rhythmic 3× label: ingredient name at small/medium/large */}
                <TripleLabel label={activeIngredient.name} />

                {/* Description */}
                <BodyText className="mt-4 text-[var(--rb-primary-text)]">
                  {activeIngredient.description}
                </BodyText>

                {/* Also-made-with pills */}
                {activeIngredient.alsoMadeWith && activeIngredient.alsoMadeWith.length > 0 && (
                  <AlsoMadeWithPills items={activeIngredient.alsoMadeWith} />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </UnitShell>
  );
};

// Self-register
registerUnit('research_ingredients', ResearchIngredients);

export default ResearchIngredients;
export { ResearchIngredients };
