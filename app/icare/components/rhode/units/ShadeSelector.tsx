'use client';

/**
 * ShadeSelector.tsx — E4 Rhode showcase unit.
 * Circular swatch buttons grouped into Limited Edition and Core collections.
 * Selection animates with ring + scale (300ms), hover shifts opacity (200ms).
 * RTL-aware layout, respects shouldReduceMotion, self-registers on import.
 */

import React from 'react';
import { motion } from 'motion/react';
import { clsx } from 'clsx';
import { UnitShell, SectionTitle, BodyText } from '../shared/UnitShell';
import { registerUnit } from '../../../lib/rhode/registry';
import type { NormalizedRhodeUnit, ShadeSelectorPayload } from '../../../types/rhode-showcase-units';
import { EASE_STANDARD, DUR, STAGGER_STEP, VIEWPORT } from '../../../lib/rhode/motion';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface Props {
  unit: NormalizedRhodeUnit<ShadeSelectorPayload>;
  lang?: 'en' | 'ar';
  shouldReduceMotion: boolean;
}

type GroupKey = 'limited_edition' | 'core';

const GROUP_LABELS: Record<GroupKey, string> = {
  limited_edition: 'Limited Edition',
  core: 'Core',
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const ShadeSelector: React.FC<Props> = ({ unit, lang = 'en', shouldReduceMotion }) => {
  const { payload, theme } = unit;
  const { heading, shades, defaultShadeId } = payload;
  const isRtl = lang === 'ar' || unit.direction === 'rtl';

  const [selectedShadeId, setSelectedShadeId] = React.useState<string | undefined>(
    defaultShadeId,
  );

  const grouped = React.useMemo(() => {
    const groups: Record<GroupKey, ShadeSelectorPayload['shades']> = {
      limited_edition: [],
      core: [],
    };
    shades.forEach((shade) => {
      groups[shade.group].push(shade);
    });
    return groups;
  }, [shades]);

  const handleSelect = (id: string, isOutOfStock: boolean) => {
    if (isOutOfStock) return;
    setSelectedShadeId(id);
  };

  return (
    <UnitShell
      theme={theme ?? 'light'}
      id={unit.id}
      innerClassName="py-12 md:py-16 lg:py-20"
    >
      <div dir={isRtl ? 'rtl' : 'ltr'}>
        {/* ── Optional heading ─────────────────────────────────────────── */}
        {heading && (
          <motion.div
            className="mb-10 md:mb-14"
            initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: VIEWPORT.default }}
            transition={{
              duration: shouldReduceMotion ? 0 : DUR.normal / 1000,
              ease: EASE_STANDARD,
            }}
          >
            <SectionTitle size="lg">{heading}</SectionTitle>
          </motion.div>
        )}

        {/* ── Shade groups ─────────────────────────────────────────────── */}
        {(Object.keys(GROUP_LABELS) as GroupKey[]).map((groupKey) => {
          const groupShades = grouped[groupKey];
          if (groupShades.length === 0) return null;

          return (
            <div key={groupKey} className="mb-10 last:mb-0">
              {/* Group sub-heading */}
              <h3
                className={clsx(
                  'text-[var(--rb-text-2xs)] font-medium uppercase tracking-widest text-[var(--rb-muted-text)] mb-6',
                )}
              >
                {GROUP_LABELS[groupKey]}
              </h3>

              {/* Swatches */}
              <div
                className={clsx(
                  'flex flex-wrap gap-6 md:gap-8',
                  isRtl ? 'flex-row-reverse' : 'flex-row',
                )}
              >
                {groupShades.map((shade, i) => {
                  const isSelected = selectedShadeId === shade.id;

                  // Swatch content: hex fill or image thumbnail
                  const swatchContent = shade.hex ? (
                    <span
                      className="block w-full h-full rounded-full"
                      style={{ backgroundColor: shade.hex }}
                    />
                  ) : shade.image ? (
                    <img
                      src={shade.image.url}
                      alt={shade.image.alt || shade.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : null;

                  return (
                    <motion.button
                      key={shade.id}
                      type="button"
                      onClick={() => handleSelect(shade.id, shade.isOutOfStock)}
                      disabled={shade.isOutOfStock}
                      aria-pressed={isSelected && !shade.isOutOfStock}
                      aria-label={`${shade.name}${shade.isOutOfStock ? ' (out of stock)' : ''}`}
                      className={clsx(
                        'relative flex flex-col items-center gap-2',
                        'disabled:cursor-not-allowed',
                      )}
                      initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: VIEWPORT.default }}
                      transition={{
                        duration: shouldReduceMotion ? 0 : DUR.normal / 1000,
                        ease: EASE_STANDARD,
                        delay: shouldReduceMotion ? 0 : i * STAGGER_STEP,
                      }}
                    >
                      {/* Swatch circle */}
                      <motion.div
                        className={clsx(
                          'relative w-12 h-12 md:w-14 md:h-14 rounded-full shadow-sm',
                          {
                            'ring-2 ring-offset-2 ring-[var(--rb-near-black)]':
                              isSelected && !shade.isOutOfStock,
                          },
                        )}
                        // Selection: ring is handled by classname; scale animates with 300ms token
                        animate={
                          shouldReduceMotion
                            ? undefined
                            : {
                                scale: isSelected ? 1.1 : 1,
                              }
                        }
                        transition={{
                          duration: DUR.normal / 1000,
                          ease: EASE_STANDARD,
                        }}
                        // Hover: opacity shift (200ms = DUR.fast)
                        whileHover={
                          shade.isOutOfStock ? undefined : { opacity: 0.8 }
                        }
                        style={
                          shade.isOutOfStock ? { opacity: 0.4 } : undefined
                        }
                      >
                        {swatchContent}

                        {/* New badge */}
                        {shade.isNew && !shade.isOutOfStock && (
                          <span
                            className={clsx(
                              'absolute -top-1 -right-1 bg-[var(--rb-pure-black)] text-[var(--rb-pure-white)]',
                              'text-[10px] font-semibold px-1.5 py-0.5 rounded-full leading-none',
                              'whitespace-nowrap',
                            )}
                          >
                            NEW
                          </span>
                        )}

                        {/* Out-of-stock slash overlay */}
                        {shade.isOutOfStock && (
                          <span
                            className="absolute inset-0 flex items-center justify-center rounded-full pointer-events-none"
                          >
                            <svg
                              className="w-3/4 h-3/4 text-[var(--rb-near-black)] opacity-70"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                              aria-hidden="true"
                            >
                              <line x1="4" y1="4" x2="20" y2="20" />
                              <line x1="20" y1="4" x2="4" y2="20" />
                            </svg>
                          </span>
                        )}
                      </motion.div>

                      {/* Shade name */}
                      <p className="text-xs md:text-sm text-[var(--rb-primary-text)] text-center leading-tight min-w-[48px]">
                        {shade.name}
                      </p>

                      {/* Description (desktop / wider screens) */}
                      {shade.description && (
                        <p className="text-[11px] text-[var(--rb-muted-text)] text-center max-w-[120px] hidden md:block leading-snug">
                          {shade.description}
                        </p>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </UnitShell>
  );
};

// ---------------------------------------------------------------------------
// Self-register
// ---------------------------------------------------------------------------

registerUnit('shade_selector', ShadeSelector);

export default ShadeSelector;
export { ShadeSelector };
