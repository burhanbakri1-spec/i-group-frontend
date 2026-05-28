'use client';

import React, { useCallback, useRef } from 'react';
import { motion, useReducedMotion } from 'motion/react';

type Direction = 'bottom' | 'left' | 'right';

interface ScrollRevealProps {
  children: React.ReactNode;
  direction?: Direction;
  delay?: number;
  duration?: number;
  className?: string;
  as?: keyof React.JSX.IntrinsicElements;
  viewportMargin?: string;
}

const directionVectors: Record<Direction, { x: number; y: number }> = {
  bottom: { x: 0, y: 24 },
  left: { x: -40, y: 0 },
  right: { x: 40, y: 0 },
};

const STANDARD_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
const MAX_DELAY = 1.2;

/**
 * ScrollReveal — Universal scroll-triggered entrance animation.
 *
 * All animations use transform + opacity only (GPU-composited on the browser
 * compositor thread via Motion's WAAPI-first engine). Zero layout recalculations.
 *
 * - Respects prefers-reduced-motion (all animations become instant).
 * - Uses viewport.once to disconnect IntersectionObserver after first trigger.
 * - Manages will-change lifecycle to free GPU memory after animation completes.
 */
export const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  direction = 'bottom',
  delay = 0,
  duration = 0.6,
  className = '',
  as: Tag = 'div',
  viewportMargin = '-50px',
}) => {
  const shouldReduceMotion = useReducedMotion();
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const vector = directionVectors[direction];
  const safeDelay = Math.min(delay, MAX_DELAY);

  const handleAnimationComplete = useCallback(() => {
    const el = wrapperRef.current;
    if (el) {
      el.style.willChange = 'auto';
      el.classList.add('animate-done');
    }
  }, []);

  return (
    <motion.div
      ref={wrapperRef}
      className={`scroll-reveal ${className}`}
      initial={
        shouldReduceMotion
          ? false
          : { opacity: 0, x: vector.x, y: vector.y }
      }
      whileInView={
        shouldReduceMotion
          ? undefined
          : { opacity: 1, x: 0, y: 0 }
      }
      viewport={{ once: true, margin: viewportMargin }}
      transition={{
        delay: shouldReduceMotion ? 0 : safeDelay,
        duration: shouldReduceMotion ? 0 : duration,
        ease: STANDARD_EASE,
      }}
      onAnimationComplete={handleAnimationComplete}
    >
      {children}
    </motion.div>
  );
};

/**
 * Stagger container — wraps children and sequences their entrance animations
 * using Motion's staggerChildren. Each child should be wrapped in ScrollReveal
 * for the actual animation while this parent controls the stagger rhythm.
 */
interface StaggerContainerProps {
  children: React.ReactNode;
  staggerDelay?: number;
  className?: string;
  as?: keyof React.JSX.IntrinsicElements;
  viewportMargin?: string;
}

export const StaggerContainer: React.FC<StaggerContainerProps> = ({
  children,
  staggerDelay = 0.06,
  className = '',
  as: Tag = 'div',
  viewportMargin = '-50px',
}) => {
  const shouldReduceMotion = useReducedMotion();
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const handleAnimationComplete = useCallback(() => {
    const el = wrapperRef.current;
    if (el) {
      el.style.willChange = 'auto';
      el.classList.add('animate-done');
    }
  }, []);

  return (
    <motion.div
      ref={wrapperRef}
      className={`scroll-reveal ${className}`}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: viewportMargin }}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: shouldReduceMotion ? 0 : staggerDelay,
            delayChildren: 0.02,
          },
        },
      }}
      onAnimationComplete={handleAnimationComplete}
    >
      {children}
    </motion.div>
  );
};
