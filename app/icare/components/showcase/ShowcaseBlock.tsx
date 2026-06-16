'use client';

/**
 * ShowcaseBlock.tsx — Renders showcase units for a product.
 *
 * Behavior:
 * - With `units` prop (preview/admin override): render those units directly.
 * - With `slug` prop: fetch from backend. On empty/error: return null (no fallback).
 * - During fetch: show skeleton.
 * - No slug, no units: return null.
 *
 * SHOWCASE_FALLBACK is NEVER rendered here — that path lives in ShowcasePreviewPage
 * under ?demo=1 control only.
 */

import React, { useEffect, useState } from 'react';
import { useReducedMotion } from 'motion/react';
import { SkeletonPulse } from '../ui/skeletons';
import { fetchProductShowcase } from '../../lib/catalog-client';
import { getUnitComponent } from '../../lib/showcase/registry';
import type { ShowcaseUnit } from '../../types/showcase-units';
import { clsx } from 'clsx';

// ─── Self-register all unit components ─────────────────────────────────────────
import '../units/HeroGallery';
import '../units/BenefitsGrid';
import '../units/ApplicationSteps';
import '../units/KeyIngredients';
import '../units/ValuePropsGrid';
import '../units/VisualApplication';
import '../units/IngredientSpotlight';
import '../units/ResultsStudy';
import '../units/RoutineMap';
import '../units/Reviews';
import '../units/ComparisonChart';
import '../units/KitContents';
import '../units/ResultsCarousel';
import '../units/ShadeSelector';
import '../units/LifestyleCarousel';
import '../units/ResearchIngredients';
import '../units/Sustainability';

interface ShowcaseBlockProps {
  slug?: string;
  lang?: 'en' | 'ar';
  units?: ShowcaseUnit[] | null;
}

const ShowcaseSkeleton: React.FC<{ lang?: 'en' | 'ar' }> = ({ lang = 'en' }) => {
  const dir = lang === 'ar' ? 'rtl' : 'ltr';
  return (
    <section
      className="py-12 md:py-16"
      dir={dir}
    >
      <div className="max-w-7xl mx-auto px-4 space-y-8">
        <div className="space-y-3">
          <SkeletonPulse className="h-4 w-24 rounded" />
          <SkeletonPulse className="h-8 w-48 rounded" />
        </div>
        <SkeletonPulse className="h-64 w-full rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[0, 1, 2].map((i) => (
            <SkeletonPulse key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      </div>
    </section>
  );
};

export const ShowcaseBlock: React.FC<ShowcaseBlockProps> = ({ slug, lang = 'en', units: overrideUnits }) => {
  const shouldReduceMotion = useReducedMotion();
  const [units, setUnits] = useState<ShowcaseUnit[] | null>(undefined);
  const [loading, setLoading] = useState(!overrideUnits && !!slug);

  useEffect(() => {
    if (overrideUnits !== undefined) {
      setUnits(overrideUnits ?? null);
      setLoading(false);
      return;
    }

    if (!slug) {
      setUnits(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setUnits(undefined);

    void (async () => {
      try {
        const data = await fetchProductShowcase(slug);
        if (cancelled) return;
        // fetchProductShowcase already returns null for empty/error
        setUnits(data && data.length > 0 ? data : null);
      } catch (e) {
        if (!cancelled) {
          console.warn('[ShowcaseBlock] Fetch failed, hiding showcase', e);
          setUnits(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [slug, overrideUnits]);

  if (loading) {
    return <ShowcaseSkeleton lang={lang} />;
  }

  // Explicit null / empty → hide section (no fallback)
  if (units === null) {
    return null;
  }

  // undefined = not yet fetched (should not happen after initial load, but guard anyway)
  if (units === undefined) {
    return null;
  }

  if (units.length === 0) {
    return null;
  }

  const activeUnits = units
    .filter((u) => u.isActive)
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

  if (activeUnits.length === 0) {
    return null;
  }

  return (
    <section className={clsx('py-12 md:py-16')}>
      <div className="max-w-7xl mx-auto px-4 space-y-8">
        {activeUnits.map((unit) => {
          const Component = getUnitComponent(unit.type);
          if (!Component) {
            console.warn(`[ShowcaseBlock] No component registered for type: ${unit.type}`);
            return null;
          }
          return (
            <Component
              key={unit.id}
              unit={unit as Parameters<typeof Component>[0]['unit']}
              lang={lang}
              shouldReduceMotion={shouldReduceMotion}
            />
          );
        })}
      </div>
    </section>
  );
};
