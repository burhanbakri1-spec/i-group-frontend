'use client';

/**
 * ShowcasePreviewPage.tsx — Preview route for product showcase units.
 * Route: /icare/products/[slug]/showcase
 *
 * Behavior:
 * - ?demo=1 → render SHOWCASE_FALLBACK + DEMO MODE badge
 * - No flag → render backend units (or empty state with hint)
 * - Production route (?demo=1 on /icare/products/[slug]) is NOT affected —
 *   ShowcaseBlock never reads searchParams.
 */

import React from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { isDemoMode } from '../../lib/showcase/demo-mode';
import { SHOWCASE_FALLBACK } from '../../lib/showcase/fallback';
import { ShowcaseBlock } from './ShowcaseBlock';

interface ShowcasePreviewPageProps {
  slug: string;
}

export const ShowcasePreviewPage: React.FC<ShowcasePreviewPageProps> = ({ slug }) => {
  const searchParams = useSearchParams();
  const demo = isDemoMode(searchParams);

  return (
    <div className="min-h-screen bg-[var(--rb-bg-surface)]">
      {/* ── Top bar ──────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-[var(--rb-border-light)] bg-white">
        <div className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <span className="text-xs font-black uppercase tracking-[0.2em] text-[var(--rb-muted-text)]">
              Showcase Preview
            </span>
            {demo && (
              <span className="px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                DEMO MODE
              </span>
            )}
          </div>
          <Link
            href={`/icare/products/${slug}`}
            className="text-xs font-medium uppercase tracking-widest text-[var(--rb-muted-text)] hover:text-[var(--rb-primary-text)] transition-colors"
          >
            ← Back to product
          </Link>
        </div>
      </header>

      {/* ── Main content ─────────────────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {demo ? (
          <ShowcaseBlock units={SHOWCASE_FALLBACK} lang="en" />
        ) : (
          <>
            <ShowcaseBlock slug={slug} lang="en" />
            {/* Empty state hint — shown when ShowcaseBlock returns null */}
            <div className="mt-6 p-6 rounded-xl bg-white border border-[var(--rb-border-light)]">
              <p className="font-medium text-[var(--rb-primary-text)] mb-1">
                No showcase data for this product
              </p>
              <p className="text-sm text-[var(--rb-muted-text)]">
                Add <code className="font-mono text-xs bg-[var(--rb-bg-surface)] px-1.5 py-0.5 rounded">?demo=1</code> to preview the full unit library.{' '}
                <Link
                  href={`/icare/products/${slug}/showcase?demo=1`}
                  className="underline hover:text-[var(--rb-primary-text)] transition-colors"
                >
                  Preview now →
                </Link>
              </p>
            </div>
          </>
        )}
      </main>
    </div>
  );
};
