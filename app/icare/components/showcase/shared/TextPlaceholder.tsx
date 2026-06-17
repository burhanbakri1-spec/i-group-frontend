'use client';

import React from 'react';
import { clsx } from 'clsx';

type TextVariant = 'single-line' | 'multi-line' | 'label-line';
type TextWidth = 'full' | 'three-quarter' | 'half' | 'third' | 'quarter';

interface Props {
  variant?: TextVariant;
  width?: TextWidth;
  className?: string;
  'aria-label'?: string;
}

const WIDTH_CLASS: Record<TextWidth, string> = {
  full: 'w-full',
  'three-quarter': 'w-3/4',
  half: 'w-1/2',
  third: 'w-1/3',
  quarter: 'w-1/4',
};

const HEIGHT_CLASS: Record<TextVariant, string> = {
  'single-line': 'h-3',
  'multi-line': 'h-3',
  'label-line': 'h-2',
};

export const TextPlaceholder: React.FC<Props> = ({
  variant = 'single-line',
  width = 'full',
  className,
  'aria-label': ariaLabel = 'Content placeholder',
}) => (
  <div
    role="status"
    aria-label={ariaLabel}
    className={clsx(
      'rounded bg-[var(--rb-bg-warm-gray)] animate-pulse motion-reduce:animate-none',
      WIDTH_CLASS[width],
      HEIGHT_CLASS[variant],
      className,
    )}
  />
);
