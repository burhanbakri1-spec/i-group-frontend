'use client';

/**
 * UnitShell.tsx — Common wrapper for all showcase units.
 * Provides consistent padding, theme variants, and section structure.
 */

import React from 'react';
import { clsx } from 'clsx';

type UnitTheme = 'light' | 'dark' | 'cream' | 'clinical' | 'brand';

interface UnitShellProps {
  children: React.ReactNode;
  theme?: UnitTheme;
  className?: string;
  innerClassName?: string;
  id?: string;
  as?: React.ElementType;
}

const themeClasses: Record<UnitTheme, string> = {
  light: 'bg-white text-[var(--rb-primary-text)]',
  dark: 'bg-[var(--rb-near-black)] text-[var(--rb-pure-white)]',
  cream: 'bg-[var(--rb-bg-warm-gray)] text-[var(--rb-primary-text)]',
  clinical: 'bg-[var(--rb-bg-surface)] text-[var(--rb-primary-text)]',
  brand: 'bg-[var(--rb-primary-text)] text-[var(--rb-pure-white)]',
};

export const UnitShell: React.FC<UnitShellProps> = ({
  children,
  theme = 'light',
  className,
  innerClassName,
  id,
  as: Tag = 'section',
}) => {
  return (
    <Tag
      id={id}
      className={clsx(
        'rounded-[12px] overflow-hidden',
        themeClasses[theme],
        className,
      )}
    >
      <div className={clsx('px-6 py-10 md:px-10 md:py-14', innerClassName)}>
        {children}
      </div>
    </Tag>
  );
};

// ─── Eyebrow label ─────────────────────────────────────────────────────────────

interface EyebrowProps {
  children: React.ReactNode;
  className?: string;
}

export const Eyebrow: React.FC<EyebrowProps> = ({ children, className }) => (
  <p
    className={clsx(
      'text-[var(--rb-text-2xs)] font-medium uppercase tracking-widest text-[var(--rb-muted-text)] mb-2',
      className,
    )}
  >
    {children}
  </p>
);

// ─── Section heading ───────────────────────────────────────────────────────────

interface SectionTitleProps {
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const SectionTitle: React.FC<SectionTitleProps> = ({ children, className, size = 'md' }) => {
  const sizeClasses = {
    sm: 'text-xl md:text-2xl',
    md: 'text-2xl md:text-3xl',
    lg: 'text-3xl md:text-4xl',
  };
  return (
    <h2
      className={clsx(
        'font-display font-medium leading-tight tracking-tight text-[var(--rb-near-black)]',
        sizeClasses[size],
        className,
      )}
    >
      {children}
    </h2>
  );
};

// ─── Body text ─────────────────────────────────────────────────────────────────

interface BodyTextProps {
  children: React.ReactNode;
  className?: string;
}

export const BodyText: React.FC<BodyTextProps> = ({ children, className }) => (
  <p
    className={clsx(
      'text-[var(--rb-text-base)] leading-relaxed text-[var(--rb-primary-text)]',
      className,
    )}
  >
    {children}
  </p>
);
