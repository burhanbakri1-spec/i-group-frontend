'use client';

import React from 'react';
import { ImageOff } from 'lucide-react';
import { clsx } from 'clsx';

type Aspect = 'square' | 'video' | 'portrait' | 'circle' | 'inherit';

interface Props {
  aspect?: Aspect;
  className?: string;
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'full';
}

const ASPECT_CLASS: Record<Aspect, string> = {
  square: 'aspect-square',
  video: 'aspect-video',
  portrait: 'aspect-[3/4]',
  circle: 'aspect-square rounded-full',
  inherit: '',
};

const ROUNDED_CLASS = {
  none: '',
  sm: 'rounded',
  md: 'rounded-lg',
  lg: 'rounded-xl',
  full: 'rounded-full',
} as const;

export const ImagePlaceholder: React.FC<Props> = ({
  aspect = 'square',
  className,
  rounded = 'md',
}) => (
  <div
    role="img"
    aria-label="Image placeholder"
    className={clsx(
      'flex items-center justify-center',
      'bg-[var(--rb-bg-warm-gray)] text-[var(--rb-muted-text)]',
      ASPECT_CLASS[aspect],
      ROUNDED_CLASS[rounded],
      className,
    )}
  >
    <ImageOff className="w-1/3 h-1/3" aria-hidden />
  </div>
);
