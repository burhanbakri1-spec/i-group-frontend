'use client';

/**
 * Reviews.tsx — M10 showcase unit.
 * Renders Okendo iframe embed or native review summary + cards.
 */

import React from 'react';
import { motion } from 'motion/react';
import { clsx } from 'clsx';
import { UnitShell, Eyebrow, SectionTitle, BodyText } from '../shared/UnitShell';
import { registerUnit } from '../../../lib/showcase/registry';
import type { NormalizedShowcaseUnit, ReviewsPayload } from '../../../types/showcase-units';
import { EASE_STANDARD, DUR, STAGGER_STEP, VIEWPORT } from '../../../lib/showcase/motion';

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  unit: NormalizedShowcaseUnit<ReviewsPayload>;
  lang?: 'en' | 'ar';
  shouldReduceMotion: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const OKENDO_EMBED_BASE = 'https://www.okendo.io/product-reviews';

function formatDate(dateStr?: string): string {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

function roundRating(rating?: number): number {
  if (typeof rating !== 'number') return 0;
  return Math.round(rating * 10) / 10;
}

function buildStarDistribution(nativeReviews: ReviewsPayload['nativeReviews']): { stars: number; count: number; pct: number }[] {
  const counts = [0, 0, 0, 0, 0]; // index 0 = 1 star
  (nativeReviews ?? []).forEach((r) => {
    const idx = Math.min(4, Math.max(0, r.rating - 1));
    counts[idx] += 1;
  });
  const total = counts.reduce((a, b) => a + b, 0);
  return counts.map((count, i) => ({
    stars: 5 - i,
    count,
    pct: total > 0 ? (count / total) * 100 : 0,
  })).reverse();
}

function StarIcon({ filled, className }: { filled: boolean; className?: string }) {
  return (
    <svg
      className={clsx(className)}
      viewBox="0 0 20 20"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={filled ? 0 : 1.2}
      aria-hidden="true"
    >
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.118l-3.37-2.448a1 1 0 00-1.176 0l-3.37 2.448c-.784.57-1.838-.197-1.539-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.063 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.957z" />
    </svg>
  );
}

// ─── Sub-components ────────────────────────────────────────────────────────────

const OverallRating: React.FC<{
  rating: number;
  totalReviews: number;
  isRtl: boolean;
}> = ({ rating, totalReviews, isRtl }) => {
  const fullStars = Math.floor(rating);
  const partial = rating - fullStars;
  const stars = Array.from({ length: 5 }, (_, i) => {
    const filled = i < fullStars || (i === fullStars && partial >= 0.5);
    return <StarIcon key={i} filled={filled} className="w-5 h-5 text-[var(--rb-pure-black)] inline-block" />;
  });

  return (
    <div className={clsx('flex items-center gap-3', isRtl && 'flex-row-reverse')}>
      <div className="flex items-center gap-1" aria-label={`${rating} out of 5 stars`}>
        {stars}
      </div>
      <span className="text-xl font-semibold text-[var(--rb-near-black)]">{roundRating(rating)}</span>
      <span className="text-[var(--rb-muted-text)] text-sm">
        ({totalReviews.toLocaleString()} {totalReviews === 1 ? 'review' : 'reviews'})
      </span>
    </div>
  );
};

const StarDistribution: React.FC<{
  distribution: { stars: number; count: number; pct: number }[];
  isRtl: boolean;
}> = ({ distribution, isRtl }) => {
  const sorted = [...distribution].sort((a, b) => b.stars - a.stars);

  return (
    <div className="space-y-1.5" role="list" aria-label="Star distribution">
      {sorted.map((item) => (
        <div
          key={item.stars}
          role="listitem"
          className={clsx('flex items-center gap-2 text-sm', isRtl && 'flex-row-reverse')}
        >
          <span className="w-6 text-right font-medium text-[var(--rb-primary-text)]">
            {item.stars}★
          </span>
          <div className="flex-1 h-2 rounded-full bg-[var(--rb-bg-warm-gray)] overflow-hidden">
            <div
              className="h-full rounded-full bg-[var(--rb-near-black)]"
              style={{ width: `${Math.max(0, Math.min(100, item.pct))}%` }}
              aria-hidden="true"
            />
          </div>
          <span className="w-8 tabular-nums text-[var(--rb-muted-text)]">{item.count}</span>
        </div>
      ))}
    </div>
  );
};

const ReviewCard: React.FC<{
  review: {
    author: string;
    rating: number;
    title?: string;
    body: string;
    date?: string;
    skinType?: string;
    verified: boolean;
  };
  isRtl: boolean;
}> = ({ review, isRtl }) => {
  const fullStars = Math.floor(review.rating);
  const partial = review.rating - fullStars;
  const stars = Array.from({ length: 5 }, (_, i) => {
    const filled = i < fullStars || (i === fullStars && partial >= 0.5);
    return <StarIcon key={i} filled={filled} className="w-3.5 h-3.5 text-[var(--rb-pure-black)] inline-block" />;
  });

  return (
    <div
      className={clsx(
        'rounded-xl border border-[var(--rb-bg-warm-gray)] bg-white p-5 md:p-6',
        'shadow-sm hover:shadow-md transition-shadow duration-200',
      )}
    >
      <div className={clsx('flex items-start justify-between gap-3', isRtl && 'flex-row-reverse')}>
        <div className={clsx(isRtl && 'text-right')}>
          <p className="font-semibold text-[var(--rb-near-black)]">{review.author}</p>
          {review.skinType && (
            <p className="text-xs text-[var(--rb-muted-text)] mt-0.5">{review.skinType}</p>
          )}
        </div>
        <div className="flex items-center gap-1">{stars}</div>
      </div>

      {review.title && (
        <h3 className="mt-3 font-medium text-[var(--rb-primary-text)]">{review.title}</h3>
      )}
      <p className="mt-1.5 text-[var(--rb-primary-text)] leading-relaxed">{review.body}</p>

      <div className={clsx('mt-3 flex items-center gap-2 text-xs text-[var(--rb-muted-text)]', isRtl && 'flex-row-reverse')}>
        {review.date && <time dateTime={review.date}>{formatDate(review.date)}</time>}
        {review.verified && (
          <span
            className={clsx(
              'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide',
              'bg-[var(--rb-bg-warm-gray)] text-[var(--rb-muted-text)]',
            )}
          >
            <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            Verified
          </span>
        )}
      </div>
    </div>
  );
};

// ─── Main ─────────────────────────────────────────────────────────────────────

const Reviews: React.FC<Props> = ({ unit, lang = 'en', shouldReduceMotion }) => {
  const { payload, theme } = unit;
  const { source, okendoId, nativeReviews, overallRating, totalReviews, customRatingField } = payload;
  const isRtl = lang === 'ar' || unit.direction === 'rtl';

  // Okendo iframe path
  const okendoSrc = typeof okendoId === 'string' && okendoId.trim().length > 0
    ? `${OKENDO_EMBED_BASE}/${okendoId.trim()}`
    : null;

  const starDistribution = buildStarDistribution(nativeReviews);

  return (
    <UnitShell
      theme={theme ?? 'light'}
      id={unit.id}
      innerClassName="py-12 md:py-16 lg:py-20"
    >
      <div dir={isRtl ? 'rtl' : 'ltr'}>
        {/* Header */}
        <motion.div
          className="mb-10 md:mb-14 max-w-2xl"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: VIEWPORT.default }}
          transition={{
            duration: shouldReduceMotion ? 0 : DUR.normal / 1000,
            ease: EASE_STANDARD,
          }}
        >
          <Eyebrow>Reviews</Eyebrow>
          <SectionTitle size="lg">What our customers think.</SectionTitle>
          <BodyText className="mt-2">Real reviews from real skin.</BodyText>
        </motion.div>

        {/* Okendo iframe */}
        {source === 'okendo' && okendoSrc ? (
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: VIEWPORT.default }}
            transition={{
              duration: shouldReduceMotion ? 0 : DUR.normal / 1000,
              ease: EASE_STANDARD,
            }}
          >
            <div className="relative w-full" style={{ paddingBottom: '75%' }}>
              <iframe
                src={okendoSrc}
                title="Okendo product reviews"
                className="absolute inset-0 h-full w-full rounded-xl border border-[var(--rb-bg-warm-gray)]"
                allowFullScreen
              />
            </div>
          </motion.div>
        ) : null}

        {/* Native fallback */}
        {(source !== 'okendo' || typeof okendoId !== 'string' || okendoId.trim().length === 0) && (
          <div className="grid gap-8 md:gap-10 lg:grid-cols-[300px_1fr]">
            {/* Summary sidebar */}
            <motion.div
              className="space-y-6"
              initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: VIEWPORT.default }}
              transition={{
                duration: shouldReduceMotion ? 0 : DUR.normal / 1000,
                ease: EASE_STANDARD,
              }}
            >
              {typeof overallRating === 'number' && typeof totalReviews === 'number' ? (
                <OverallRating
                  rating={overallRating}
                  totalReviews={totalReviews}
                  isRtl={isRtl}
                />
              ) : null}

              {starDistribution.length > 0 && (
                <StarDistribution distribution={starDistribution} isRtl={isRtl} />
              )}

              {customRatingField && nativeReviews && nativeReviews.length > 0 && (
                <div className="pt-4 border-t border-[var(--rb-bg-warm-gray)]">
                  <p className="text-sm font-medium text-[var(--rb-primary-text)]">{customRatingField}</p>
                  <p className="text-xs text-[var(--rb-muted-text)] mt-1">Average from {nativeReviews.length} reviews</p>
                </div>
              )}
            </motion.div>

            {/* Review cards */}
            {nativeReviews && nativeReviews.length > 0 && (
              <motion.div
                className="grid gap-5 sm:grid-cols-2"
                initial={shouldReduceMotion ? false : { opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true, margin: VIEWPORT.default }}
                transition={{
                  duration: shouldReduceMotion ? 0 : DUR.normal / 1000,
                  ease: EASE_STANDARD,
                }}
              >
                {nativeReviews.map((review, i) => (
                  <motion.div
                    key={review.id}
                    initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: VIEWPORT.default }}
                    transition={{
                      duration: shouldReduceMotion ? 0 : DUR.normal / 1000,
                      ease: EASE_STANDARD,
                      delay: shouldReduceMotion ? 0 : i * STAGGER_STEP,
                    }}
                  >
                    <ReviewCard review={review} isRtl={isRtl} />
                  </motion.div>
                ))}
              </motion.div>
            )}

            {(!nativeReviews || nativeReviews.length === 0) && source !== 'okendo' && (
              <BodyText className="text-[var(--rb-muted-text)]">No reviews available yet.</BodyText>
            )}
          </div>
        )}
      </div>
    </UnitShell>
  );
};

// Self-register
registerUnit('reviews', Reviews);

export default Reviews;
export { Reviews };
