/**
 * showcase-motion.ts — Centralized motion configuration for the showcase system.
 * All durations, easings, stagger values, and Framer variants live here.
 * All units import from this file (REQ-C8-1).
 */

/** System standard cubic-bezier easing */
export const EASE_STANDARD: [number, number, number, number] = [0.22, 1, 0.36, 1];

/** System section-level slide-up easing (slightly softer enter) */
export const EASE_SLIDE: [number, number, number, number] = [0.32, 0.72, 0, 1];

/** Duration tokens in milliseconds */
export const DUR = {
  fast: 200,       // Color / border / text hover transitions
  normal: 300,     // Opacity / transform / standard transitions
  slow: 500,       // Complex sequences, image swap
  enter: 600,      // Viewport-triggered content reveal
  emphasis: 350,   // Hero image cross-fade
} as const;

/** Stagger step (seconds) for child arrays in AnimatePresence/staggerChildren */
export const STAGGER_STEP = 0.06;

/** Viewport trigger margins for useInView / motion `viewport` */
export const VIEWPORT = {
  default: '-80px',
  hero: '-60px',
} as const;

// ─── Re-exports for named compatibility ───────────────────────────────────────
/** @deprecated use DUR.fast */
export const DUR_FAST = DUR.fast;
/** @deprecated use DUR.normal */
export const DUR_NORMAL = DUR.normal;
/** @deprecated use DUR.slow */
export const DUR_SLOW = DUR.slow;
/** @deprecated use DUR.enter */
export const DUR_ENTER = DUR.enter;

// ─── Reusable Framer Motion variant sets ─────────────────────────────────────

/** Standard viewport-triggered fade + slide-up used on most units */
export const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: DUR.normal / 1000, ease: EASE_STANDARD },
  },
} as const;

/** Staggered children container */
export const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: STAGGER_STEP,
    },
  },
} as const;

/** Image cross-fade (AnimatePresence mode="wait") */
export const crossfade = {
  enter: { opacity: 0 },
  center: {
    opacity: 1,
    transition: { duration: DUR.emphasis / 1000, ease: EASE_STANDARD },
  },
  exit: { opacity: 0, transition: { duration: DUR.normal / 1000 } },
} as const;

/** Hero gallery image swap — scale + opacity */
export const heroSwap = {
  enter: { opacity: 0, scale: 1.03 },
  center: {
    opacity: 1,
    scale: 1,
    transition: { duration: DUR.emphasis / 1000, ease: EASE_STANDARD },
  },
  exit: { opacity: 0, scale: 0.97, transition: { duration: DUR.normal / 1000 } },
} as const;

/** Tab content cross-fade (600ms) */
export const tabFade = {
  enter: { opacity: 0, y: 8 },
  center: {
    opacity: 1,
    y: 0,
    transition: { duration: DUR.enter / 1000, ease: EASE_STANDARD },
  },
  exit: { opacity: 0, y: -8, transition: { duration: DUR.normal / 1000 } },
} as const;
