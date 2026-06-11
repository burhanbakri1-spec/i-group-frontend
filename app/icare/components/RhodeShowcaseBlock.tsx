'use client';

/**
 * RhodeShowcaseBlock.tsx — Smart renderer for all 17 Rhode showcase units.
 * Dispatches to the correct unit component via the registry.
 * REQ-C3-1, REQ-C3-2, REQ-C10-1, REQ-C10-2
 */

import React, { useEffect, useMemo, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { fetchProductShowcaseRhode } from '../lib/catalog-client';
import { RHODE_SHOWCASE_FALLBACK } from '../lib/rhode/fallback';
import { getUnitComponent, isRegistered } from '../lib/rhode/registry';
import { EASE_STANDARD } from '../lib/rhode/motion';
import type { RhodeShowcaseUnit } from '../types/rhode-showcase-units';

// ─── Side-effect: register all units ─────────────────────────────────────────
// Import order matches spec: M-cluster first, E-cluster second
import './rhode/units/HeroGallery';
import './rhode/units/BenefitsGrid';
import './rhode/units/ApplicationSteps';
import './rhode/units/KeyIngredients';
import './rhode/units/ValuePropsGrid';
import './rhode/units/VisualApplication';
import './rhode/units/IngredientSpotlight';
import './rhode/units/ResultsStudy';
import './rhode/units/RoutineMap';
import './rhode/units/Reviews';
import './rhode/units/ComparisonChart';
import './rhode/units/KitContents';
import './rhode/units/ResultsCarousel';
import './rhode/units/ShadeSelector';
import './rhode/units/LifestyleCarousel';
import './rhode/units/ResearchIngredients';
import './rhode/units/Sustainability';

// ─── Props ────────────────────────────────────────────────────────────────────

export interface RhodeShowcaseBlockProps {
  /** Product slug — if omitted, fallback units are used (e.g. preview page) */
  slug?: string;
  /** UI language — controls RTL text direction */
  lang?: 'en' | 'ar';
  /** Override units directly (preview mode / admin) */
  units?: RhodeShowcaseUnit[];
}

// ─── Main Component ───────────────────────────────────────────────────────────

export const RhodeShowcaseBlock: React.FC<RhodeShowcaseBlockProps> = ({
  slug,
  lang = 'en',
  units: overrideUnits,
}) => {
  const [units, setUnits] = useState<RhodeShowcaseUnit[] | null>(
    overrideUnits ?? null,
  );
  const shouldReduceMotion = Boolean(useReducedMotion());

  useEffect(() => {
    if (overrideUnits) {
      setUnits(overrideUnits);
      return;
    }
    if (!slug) {
      setUnits(RHODE_SHOWCASE_FALLBACK);
      return;
    }
    let cancelled = false;
    void (async () => {
      try {
        const data = await fetchProductShowcaseRhode(slug);
        if (cancelled) return;
        setUnits(
          data && data.length > 0 ? data : RHODE_SHOWCASE_FALLBACK,
        );
      } catch (e) {
        console.warn('[RhodeShowcaseBlock] Fetch failed, using fallback', e);
        if (!cancelled) setUnits(RHODE_SHOWCASE_FALLBACK);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [slug, overrideUnits]);

  const activeUnits = useMemo(
    () =>
      units
        ?.filter((u) => u.isActive !== false)
        .sort((a, b) => a.sortOrder - b.sortOrder) ?? null,
    [units],
  );

  if (activeUnits === null) return <RhodeShowcaseSkeleton />;
  if (activeUnits.length === 0) return null;

  return (
    <section
      className="icare-rhode-showcase bg-[var(--rb-bg-warm-gray)] rounded-[16px] overflow-hidden py-8 md:py-12"
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
      aria-label="Product showcase"
    >
      <div className="max-w-[1600px] mx-auto px-4 md:px-8">
        <div className="flex flex-col gap-4 md:gap-6">
          {activeUnits.map((unit, idx) => (
            <UnitWrapper
              key={unit.id}
              unit={unit}
              index={idx}
              shouldReduceMotion={shouldReduceMotion}
              lang={lang}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

// ─── Unit Wrapper ─────────────────────────────────────────────────────────────

function UnitWrapper({
  unit,
  index,
  shouldReduceMotion,
  lang,
}: {
  unit: RhodeShowcaseUnit;
  index: number;
  shouldReduceMotion: boolean;
  lang: 'en' | 'ar';
}) {
  if (!isRegistered(unit.type)) {
    console.warn(`[RhodeShowcaseBlock] Unknown unit type: ${unit.type}`);
    return null;
  }

  const Component = getUnitComponent(unit.type);
  if (!Component) return null;

  return (
    <motion.div
      initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{
        duration: shouldReduceMotion ? 0 : 0.5,
        delay: shouldReduceMotion ? 0 : index * 0.06,
        ease: EASE_STANDARD,
      }}
    >
      <Component unit={unit} shouldReduceMotion={shouldReduceMotion} lang={lang} />
    </motion.div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function RhodeShowcaseSkeleton() {
  return (
    <section className="icare-rhode-showcase bg-[var(--rb-bg-warm-gray)] rounded-[16px] overflow-hidden py-8 md:py-12">
      <div className="max-w-[1600px] mx-auto px-4 md:px-8">
        <div className="flex flex-col gap-4 md:gap-6">
          <SkeletonByType />
        </div>
      </div>
    </section>
  );
}

/** Render a single skeleton card whose shape loosely matches a known unit type. */
function SkeletonByType() {
  // Match the first registered unit so the skeleton feels contextual.
  const firstType = useMemo(() => {
    try {
      const allTypes = [
        'hero_gallery', 'benefits_grid', 'application_steps', 'key_ingredients',
        'value_props_grid', 'visual_application', 'ingredient_spotlight',
        'results_study', 'routine_map', 'reviews', 'comparison_chart',
        'kit_contents', 'results_carousel', 'shade_selector',
        'lifestyle_carousel', 'research_ingredients', 'sustainability',
      ];
      for (const t of allTypes) {
        if (isRegistered(t)) return t;
      }
    } catch {
      // registry may not be fully initialised during SSR — fall through
    }
    return null;
  }, []);

  if (firstType === 'hero_gallery' || firstType === 'lifestyle_carousel') {
    return (
      <div className="bg-white rounded-[12px] p-6 md:p-8 animate-pulse motion-reduce:animate-none">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="aspect-[4/3] bg-[#E5E3DF] rounded-lg" />
          <div className="space-y-3">
            <div className="h-3 w-24 bg-[#E5E3DF] rounded" />
            <div className="h-6 w-3/4 bg-[#E5E3DF] rounded" />
            <div className="h-4 w-full bg-[#E5E3DF] rounded" />
            <div className="h-10 w-32 bg-[#E5E3DF] rounded-full mt-4" />
          </div>
        </div>
      </div>
    );
  }

  if (firstType === 'benefits_grid' || firstType === 'key_ingredients') {
    return (
      <div className="bg-white rounded-[12px] p-6 md:p-8 animate-pulse motion-reduce:animate-none">
        <div className="h-3 w-24 bg-[#E5E3DF] rounded mb-4" />
        <div className="h-7 w-1/2 bg-[#E5E3DF] rounded mb-6" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-10 w-10 bg-[#E5E3DF] rounded-full" />
              <div className="h-3 w-full bg-[#E5E3DF] rounded" />
              <div className="h-3 w-2/3 bg-[#E5E3DF] rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (firstType === 'comparison_chart') {
    return (
      <div className="bg-white rounded-[12px] p-6 md:p-8 animate-pulse motion-reduce:animate-none">
        <div className="h-3 w-24 bg-[#E5E3DF] rounded mb-4" />
        <div className="h-7 w-1/3 bg-[#E5E3DF] rounded mb-6" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <div className="aspect-square bg-[#E5E3DF] rounded-lg" />
              <div className="h-4 w-3/4 bg-[#E5E3DF] rounded" />
              <div className="h-3 w-1/2 bg-[#E5E3DF] rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Default / fallback skeleton (media-left / text-right)
  return (
    <div className="bg-white rounded-[12px] p-8 animate-pulse motion-reduce:animate-none">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="aspect-[4/3] bg-[#E5E3DF] rounded-lg" />
        <div className="space-y-3">
          <div className="h-3 w-20 bg-[#E5E3DF] rounded" />
          <div className="h-6 w-2/3 bg-[#E5E3DF] rounded" />
          <div className="h-4 w-full bg-[#E5E3DF] rounded" />
          <div className="h-4 w-5/6 bg-[#E5E3DF] rounded" />
        </div>
      </div>
    </div>
  );
}

export default RhodeShowcaseBlock;
