'use client';

/**
 * ShowcasePreviewPage.tsx — Client component for the showcase preview sub-page.
 *
 * Renders:
 * 1. A top bar with product slug, unit count info, lang toggle
 * 2. The full ShowcaseBlock with all active units
 * 3. A sidebar/drawer showing unit type list for quick navigation
 *
 * Route: /icare/products/[slug]/showcase
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, Layers, Eye, LayoutGrid, Moon, Sun, Globe } from 'lucide-react';
import { ShowcaseBlock } from './ShowcaseBlock';
import { EASE_STANDARD } from '../../lib/showcase/motion';

interface ShowcasePreviewPageProps {
  slug: string;
}

const UNIT_LABELS: Record<string, string> = {
  hero_gallery: 'M1 Hero Gallery',
  benefits_grid: 'M2 Benefits Grid',
  application_steps: 'M3 Application Steps',
  key_ingredients: 'M4 Key Ingredients',
  value_props_grid: 'M5 Value Props Grid',
  visual_application: 'M6 Visual Application',
  ingredient_spotlight: 'M7 Ingredient Spotlight',
  results_study: 'M8 Results Study',
  routine_map: 'M9 Routine Map',
  reviews: 'M10 Reviews',
  comparison_chart: 'E1 Comparison Chart',
  kit_contents: 'E2 Kit Contents',
  results_carousel: 'E3 Results Carousel',
  shade_selector: 'E4 Shade Selector',
  lifestyle_carousel: 'E5 Lifestyle Carousel',
  research_ingredients: 'E6 Research Ingredients',
  sustainability: 'E7 Sustainability',
};

export const ShowcasePreviewPage: React.FC<ShowcasePreviewPageProps> = ({ slug }) => {
  const [lang, setLang] = useState<'en' | 'ar'>('en');
  const [showUnitList, setShowUnitList] = useState(false);

  const productLabel = slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  return (
    <div className="min-h-screen bg-[var(--rb-bg-warm-gray)] font-[var(--font-swiss)]">
      {/* ─── Preview Top Bar ──────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-[var(--rb-border-light)]">
        <div className="max-w-[1600px] mx-auto px-4 md:px-8 h-14 flex items-center gap-4">
          {/* Back link */}
          <a
            href={`/icare/products/${slug}`}
            className="flex items-center gap-1.5 text-sm text-[var(--rb-muted-text)] hover:text-[var(--rb-near-black)] transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to product</span>
          </a>

          {/* Divider */}
          <div className="h-4 w-px bg-[var(--rb-border-light)]" />

          {/* Page title */}
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Eye className="w-4 h-4 text-[var(--rb-muted-text)] shrink-0" />
            <span className="text-sm font-medium text-[var(--rb-near-black)] truncate">
              Showcase Preview
            </span>
            <span className="text-sm text-[var(--rb-muted-text)] truncate hidden sm:inline">
              — {productLabel}
            </span>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Lang toggle */}
            <button
              onClick={() => setLang((l) => (l === 'en' ? 'ar' : 'en'))}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full border border-[var(--rb-border-light)] text-[var(--rb-primary-text)] hover:bg-[var(--rb-bg-surface)] transition-colors"
              title="Toggle language direction"
            >
              <Globe className="w-3.5 h-3.5" />
              {lang === 'en' ? 'Switch to AR' : 'Switch to EN'}
            </button>

            {/* Unit list toggle */}
            <button
              onClick={() => setShowUnitList((v) => !v)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full border border-[var(--rb-border-light)] text-[var(--rb-primary-text)] hover:bg-[var(--rb-bg-surface)] transition-colors"
              title="Show unit list"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              Units
            </button>
          </div>
        </div>

        {/* Showcase-style indicator */}
        <div className="bg-[#F1F0ED] border-t border-[var(--rb-border-light)] px-4 md:px-8 py-2 flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs text-[var(--rb-muted-text)]">
              Showcase System — 17 units available
            </span>
          </div>
          <div className="h-3 w-px bg-[var(--rb-border-light)]" />
          <span className="text-xs text-[var(--rb-muted-text)]">
            Slug: <code className="font-mono text-[var(--rb-near-black)]">{slug}</code>
          </span>
          <div className="h-3 w-px bg-[var(--rb-border-light)]" />
          <span className="text-xs text-[var(--rb-muted-text)]">
            Direction: <strong className="text-[var(--rb-near-black)]">{lang === 'ar' ? 'RTL' : 'LTR'}</strong>
          </span>
        </div>
      </header>

      {/* ─── Unit List Drawer ─────────────────────────────────────────── */}
      <AnimatePresence>
        {showUnitList && (
          <motion.aside
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: EASE_STANDARD }}
            className="overflow-hidden border-b border-[var(--rb-border-light)] bg-white"
          >
            <div className="max-w-[1600px] mx-auto px-4 md:px-8 py-4">
              <div className="flex items-center gap-2 mb-3">
                <Layers className="w-4 h-4 text-[var(--rb-muted-text)]" />
                <span className="text-sm font-medium text-[var(--rb-near-black)]">All 17 Showcase Units</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                {Object.entries(UNIT_LABELS).map(([type, label]) => (
                  <a
                    key={type}
                    href={`#unit-${type}`}
                    onClick={() => setShowUnitList(false)}
                    className="px-3 py-2 text-xs rounded-lg border border-[var(--rb-border-light)] text-[var(--rb-primary-text)] hover:bg-[var(--rb-bg-surface)] hover:border-[var(--rb-taupe-7B7872)] transition-colors"
                  >
                    {label}
                  </a>
                ))}
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* ─── Main Content ─────────────────────────────────────────────── */}
      <main className="max-w-[1600px] mx-auto px-4 md:px-8 py-8 pb-24">
        {/* Intro card */}
        <div className="bg-white rounded-[12px] border border-[var(--rb-border-light)] p-6 mb-8">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-[var(--rb-bg-warm-gray)] flex items-center justify-center shrink-0">
              <Eye className="w-5 h-5 text-[var(--rb-primary-text)]" />
            </div>
            <div>
              <h1 className="text-lg font-medium text-[var(--rb-near-black)] mb-1">
                {productLabel} — Showcase Preview
              </h1>
              <p className="text-sm text-[var(--rb-muted-text)] leading-relaxed">
                This preview page renders all active showcase units for this product.
                Use the controls above to test language direction (LTR/RTL) and browse all available unit types.
                Units are loaded from the API or fallback data if the product is not yet system-enabled.
              </p>
            </div>
          </div>
        </div>

        {/* Showcase Block */}
        <ShowcaseBlock slug={slug} lang={lang} />

        {/* Footer note */}
        <div className="mt-12 pt-8 border-t border-[var(--rb-border-light)]">
          <p className="text-xs text-[var(--rb-muted-text)] text-center">
            Showcase System · iCare · 17 unit types (M1–M10 + E1–E7) ·{' '}
            <a
              href={`/icare/products/${slug}`}
              className="underline hover:text-[var(--rb-near-black)] transition-colors"
            >
              Back to product page →
            </a>
          </p>
        </div>
      </main>
    </div>
  );
};

export default ShowcasePreviewPage;
