'use client';

/**
 * ResultsStudy.tsx — M8 Rhode showcase unit.
 * Results display with two modes:
 *  - 'tabs': 2-col layout (metrics + content left · before/after right) with tab bar at bottom
 *  - 'timeline': hero before/after images at top + tabbed timeline selector below
 * Tab content cross-fades via AnimatePresence + tabFade variant (600ms).
 * Viewport-triggered fade-up, RTL-aware, shouldReduceMotion respected.
 */

import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx } from 'clsx';
import { UnitShell, Eyebrow, SectionTitle, BodyText } from '../shared/UnitShell';
import { ImageWithFallback } from '../../figma/ImageWithFallback';
import { registerUnit } from '../../../lib/rhode/registry';
import type { NormalizedRhodeUnit, ResultsStudyPayload } from '../../../types/rhode-showcase-units';
import { EASE_STANDARD, DUR, VIEWPORT, tabFade } from '../../../lib/rhode/motion';

// ─── Props ─────────────────────────────────────────────────────────────────────

interface Props {
  unit: NormalizedRhodeUnit<ResultsStudyPayload>;
  lang?: 'en' | 'ar';
  shouldReduceMotion: boolean;
}

// ─── Types (inferred from payload schema) ──────────────────────────────────────

type Metric = ResultsStudyPayload['tabs'][number]['metrics'][number];
type BeforeAfter = ResultsStudyPayload['tabs'][number]['beforeAfter'];
type Tab = ResultsStudyPayload['tabs'][number];

// ─── Sub-components ────────────────────────────────────────────────────────────

interface MetricCardProps {
  metric: Metric;
  isRtl: boolean;
  shouldReduceMotion: boolean;
}

const MetricCard: React.FC<MetricCardProps> = ({ metric, isRtl, shouldReduceMotion }) => {
  const { value, label, description } = metric;

  return (
    <motion.div
      className={clsx(
        'flex flex-col gap-1 p-4 md:p-5 rounded-[8px]',
        'bg-[var(--rb-bg-surface)]',
      )}
      initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: VIEWPORT.default }}
      transition={{
        duration: shouldReduceMotion ? 0 : DUR.normal / 1000,
        ease: EASE_STANDARD,
      }}
    >
      <span
        className={clsx(
          'font-display font-medium leading-none tracking-tight',
          'text-[clamp(1.75rem,3.5vw,2.5rem)]',
          'text-[var(--rb-near-black)]',
        )}
      >
        {value}
      </span>
      <span
        className={clsx(
          'text-[var(--rb-text-2xs)] font-medium uppercase tracking-widest',
          'text-[var(--rb-muted-text)]',
        )}
      >
        {label}
      </span>
      {description && (
        <p className="text-sm text-[var(--rb-primary-text)] mt-1 leading-relaxed">
          {description}
        </p>
      )}
    </motion.div>
  );
};

interface BeforeAfterImageProps {
  beforeAfter?: BeforeAfter;
  caption?: string;
  isRtl: boolean;
  shouldReduceMotion: boolean;
}

const BeforeAfterImage: React.FC<BeforeAfterImageProps> = ({
  beforeAfter,
  caption,
  isRtl,
  shouldReduceMotion,
}) => {
  if (!beforeAfter?.before && !beforeAfter?.after) return null;

  const imageMotion = shouldReduceMotion
    ? {}
    : {
        initial: { opacity: 0, scale: 1.02 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.98 },
        transition: {
          duration: DUR.emphasis / 1000,
          ease: EASE_STANDARD,
        },
      };

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3">
        {beforeAfter.before && (
          <div className="rounded-[8px] overflow-hidden aspect-[3/4] bg-[var(--rb-bg-surface)]">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={`before-${beforeAfter.before.url}`}
                className="w-full h-full"
                {...imageMotion}
              >
                <ImageWithFallback
                  src={beforeAfter.before.url}
                  alt={beforeAfter.before.alt ?? 'Before'}
                  className="w-full h-full object-cover"
                />
              </motion.div>
            </AnimatePresence>
          </div>
        )}
        {beforeAfter.after && (
          <div className="rounded-[8px] overflow-hidden aspect-[3/4] bg-[var(--rb-bg-surface)]">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={`after-${beforeAfter.after.url}`}
                className="w-full h-full"
                {...imageMotion}
              >
                <ImageWithFallback
                  src={beforeAfter.after.url}
                  alt={beforeAfter.after.alt ?? 'After'}
                  className="w-full h-full object-cover"
                />
              </motion.div>
            </AnimatePresence>
          </div>
        )}
      </div>
      {caption && (
        <p className="text-xs text-[var(--rb-muted-text)] text-center uppercase tracking-widest">
          {caption}
        </p>
      )}
    </div>
  );
};

interface TimelineHeroProps {
  heroImages?: ResultsStudyPayload['heroImages'];
  isRtl: boolean;
  shouldReduceMotion: boolean;
}

const TimelineHero: React.FC<TimelineHeroProps> = ({ heroImages, isRtl, shouldReduceMotion }) => {
  if (!heroImages || heroImages.length < 2) return null;

  const imageMotion = shouldReduceMotion
    ? {}
    : {
        initial: { opacity: 0, scale: 1.03 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.97 },
        transition: {
          duration: DUR.emphasis / 1000,
          ease: EASE_STANDARD,
        },
      };

  return (
    <div className="grid grid-cols-2 gap-3 md:gap-4 mb-8">
      {heroImages.map((image, i) => (
        <div
          key={i}
          className={clsx(
            'rounded-[12px] overflow-hidden aspect-square md:aspect-[4/3]',
            'bg-[var(--rb-bg-surface)]',
          )}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={image.url}
              className="w-full h-full"
              {...imageMotion}
            >
              <ImageWithFallback
                src={image.url}
                alt={image.alt ?? ''}
                className="w-full h-full object-cover"
              />
            </motion.div>
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
};

// ─── Tab Button ────────────────────────────────────────────────────────────────

interface TabButtonProps {
  tab: Tab;
  isActive: boolean;
  onClick: () => void;
  isRtl: boolean;
  shouldReduceMotion: boolean;
}

const TabButton: React.FC<TabButtonProps> = ({
  tab,
  isActive,
  onClick,
  isRtl,
  shouldReduceMotion,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={isActive}
      className={clsx(
        'relative flex items-center justify-center px-4 py-3 md:px-5 md:py-3.5',
        'rounded-[8px] font-medium text-sm md:text-base',
        'transition-colors duration-200',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--rb-primary-text)]',
        isActive
          ? 'bg-[var(--rb-near-black)] text-[var(--rb-pure-white)]'
          : 'bg-transparent text-[var(--rb-muted-text)] hover:text-[var(--rb-primary-text)]',
      )}
    >
      <span className="relative z-10">{tab.label}</span>
      {isActive && (
        <motion.div
          className={clsx(
            'absolute inset-0 rounded-[8px] bg-[var(--rb-near-black)]',
            isRtl ? 'right-0' : 'left-0',
          )}
          layoutId="active-tab-indicator"
          transition={{
            duration: shouldReduceMotion ? 0 : DUR.normal / 1000,
            ease: EASE_STANDARD,
          }}
        />
      )}
    </button>
  );
};

// ─── Tab Content Renderer ──────────────────────────────────────────────────────

interface TabContentProps {
  tab: Tab;
  isRtl: boolean;
  shouldReduceMotion: boolean;
}

const TabContent: React.FC<TabContentProps> = ({ tab, isRtl, shouldReduceMotion }) => {
  return (
    <motion.div
      key={tab.id}
      {...tabFade}
      transition={shouldReduceMotion ? { duration: 0 } : undefined}
      className="flex flex-col gap-5"
    >
      {tab.title && (
        <h3 className="font-display font-medium text-[var(--rb-near-black)] text-xl md:text-2xl leading-snug">
          {tab.title}
        </h3>
      )}
      {tab.description && (
        <BodyText className="max-w-2xl">{tab.description}</BodyText>
      )}

      {/* Bullets */}
      {tab.bullets.length > 0 && (
        <ul className="flex flex-col gap-2.5">
          {tab.bullets.map((bullet, i) => (
            <li
              key={i}
              className="flex items-start gap-2.5 text-[var(--rb-primary-text)]"
            >
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[var(--rb-primary-text)] flex-shrink-0" />
              <span className="text-sm md:text-base leading-relaxed">{bullet}</span>
            </li>
          ))}
        </ul>
      )}

      {/* Metrics grid */}
      {tab.metrics.length > 0 && (
        <div
          className={clsx(
            'grid gap-3 md:gap-4',
            tab.metrics.length === 1 && 'grid-cols-1',
            tab.metrics.length === 2 && 'grid-cols-2',
            tab.metrics.length >= 3 && 'grid-cols-2 md:grid-cols-3',
          )}
        >
          {tab.metrics.map((metric) => (
            <MetricCard
              key={metric.id}
              metric={metric}
              isRtl={isRtl}
              shouldReduceMotion={shouldReduceMotion}
            />
          ))}
        </div>
      )}

      {/* Before/after image */}
      {tab.beforeAfter && (
        <BeforeAfterImage
          beforeAfter={tab.beforeAfter}
          caption={tab.beforeAfter.caption}
          isRtl={isRtl}
          shouldReduceMotion={shouldReduceMotion}
        />
      )}

      {/* Per-tab source / disclaimer */}
      {(tab.source || tab.disclaimer) && (
        <div className="flex flex-col gap-1 pt-3 border-t border-[var(--rb-border-light)]">
          {tab.source && (
            <p className="text-xs text-[var(--rb-muted-text)]">Source: {tab.source}</p>
          )}
          {tab.disclaimer && (
            <p className="text-xs text-[var(--rb-muted-text)] italic">{tab.disclaimer}</p>
          )}
        </div>
      )}
    </motion.div>
  );
};

// ─── Main Component ────────────────────────────────────────────────────────────

const ResultsStudy: React.FC<Props> = ({ unit, lang = 'en', shouldReduceMotion }) => {
  const { payload, theme } = unit;
  const { mode, heading, tabs, defaultTabId, source, disclaimer } = payload;
  const isRtl = lang === 'ar' || unit.direction === 'rtl';

  // Resolve initial active tab
  const initialIndex = useMemo(() => {
    if (defaultTabId) {
      const found = tabs.findIndex((t) => t.id === defaultTabId);
      if (found !== -1) return found;
    }
    return 0;
  }, [defaultTabId, tabs]);

  const [activeIndex, setActiveIndex] = useState(initialIndex);

  // Sync state if payload changes externally
  const resolvedIndex = useMemo(() => {
    if (defaultTabId) {
      const found = tabs.findIndex((t) => t.id === defaultTabId);
      if (found !== -1) return found;
    }
    return activeIndex;
  }, [defaultTabId, tabs, activeIndex]);

  const activeTab = tabs[resolvedIndex] ?? tabs[0];
  if (!activeTab || tabs.length === 0) return null;

  const go = useCallback(
    (idx: number) => {
      setActiveIndex(((idx % tabs.length) + tabs.length) % tabs.length);
    },
    [tabs.length],
  );

  const resolvedEyebrow = heading?.eyebrow;
  const resolvedTitle = heading?.title ?? heading?.subtitle;

  const isTimeline = mode === 'timeline';

  return (
    <UnitShell
      theme={theme ?? 'light'}
      id={unit.id}
      innerClassName="py-12 md:py-16 lg:py-20"
    >
      <div dir={isRtl ? 'rtl' : 'ltr'}>
        {/* Header */}
        {(resolvedEyebrow || resolvedTitle) && (
          <motion.div
            className="mb-10 md:mb-14 max-w-xl"
            initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: VIEWPORT.default }}
            transition={{
              duration: shouldReduceMotion ? 0 : DUR.normal / 1000,
              ease: EASE_STANDARD,
            }}
          >
            {resolvedEyebrow && <Eyebrow>{resolvedEyebrow}</Eyebrow>}
            {resolvedTitle && <SectionTitle size="lg">{resolvedTitle}</SectionTitle>}
          </motion.div>
        )}

        {/* TIMELINE MODE */}
        {isTimeline && (
          <div className="flex flex-col gap-8">
            {/* Hero before/after images */}
            <TimelineHero
              heroImages={payload.heroImages}
              isRtl={isRtl}
              shouldReduceMotion={shouldReduceMotion}
            />

            {/* Tabbed timeline selector */}
            <div
              className="flex flex-wrap gap-2 md:gap-3"
              role="tablist"
              aria-label="Results timeline"
            >
              {tabs.map((tab, i) => (
                <TabButton
                  key={tab.id}
                  tab={tab}
                  isActive={i === resolvedIndex}
                  onClick={() => go(i)}
                  isRtl={isRtl}
                  shouldReduceMotion={shouldReduceMotion}
                />
              ))}
            </div>

            {/* Active timeline content */}
            <AnimatePresence mode="wait" initial={false}>
              <TabContent
                key={activeTab.id}
                tab={activeTab}
                isRtl={isRtl}
                shouldReduceMotion={shouldReduceMotion}
              />
            </AnimatePresence>
          </div>
        )}

        {/* TABS MODE */}
        {!isTimeline && (
          <div className="flex flex-col gap-8">
            {/* 2-col layout on desktop: content left · before/after right */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10 lg:gap-12">
              {/* Left col: metrics + text content */}
              <div>
                <AnimatePresence mode="wait" initial={false}>
                  <TabContent
                    key={activeTab.id}
                    tab={activeTab}
                    isRtl={isRtl}
                    shouldReduceMotion={shouldReduceMotion}
                  />
                </AnimatePresence>
              </div>

              {/* Right col: before/after image (desktop) */}
              <div className="hidden md:block">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={`ba-${activeTab.id}`}
                    {...(shouldReduceMotion
                      ? {}
                      : {
                          initial: { opacity: 0, scale: 1.02 },
                          animate: { opacity: 1, scale: 1 },
                          exit: { opacity: 0, scale: 0.98 },
                          transition: {
                            duration: DUR.emphasis / 1000,
                            ease: EASE_STANDARD,
                          },
                        })}
                    className="sticky top-8"
                  >
                    <BeforeAfterImage
                      beforeAfter={activeTab.beforeAfter}
                      caption={activeTab.beforeAfter?.caption}
                      isRtl={isRtl}
                      shouldReduceMotion={shouldReduceMotion}
                    />
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            {/* Mobile before/after image below content */}
            <div className="md:hidden">
              <BeforeAfterImage
                beforeAfter={activeTab.beforeAfter}
                caption={activeTab.beforeAfter?.caption}
                isRtl={isRtl}
                shouldReduceMotion={shouldReduceMotion}
              />
            </div>

            {/* Tab buttons at bottom */}
            <div
              className="flex flex-wrap gap-2 md:gap-3"
              role="tablist"
              aria-label="Results tabs"
            >
              {tabs.map((tab, i) => (
                <TabButton
                  key={tab.id}
                  tab={tab}
                  isActive={i === resolvedIndex}
                  onClick={() => go(i)}
                  isRtl={isRtl}
                  shouldReduceMotion={shouldReduceMotion}
                />
              ))}
            </div>
          </div>
        )}

        {/* Global source / disclaimer */}
        {(source || disclaimer) && (
          <motion.div
            className="mt-10 pt-6 border-t border-[var(--rb-border-light)]"
            initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: VIEWPORT.default }}
            transition={{
              duration: shouldReduceMotion ? 0 : DUR.normal / 1000,
              ease: EASE_STANDARD,
            }}
          >
            {source && <p className="text-xs text-[var(--rb-muted-text)]">Source: {source}</p>}
            {disclaimer && (
              <p className="text-xs text-[var(--rb-muted-text)] italic mt-1">{disclaimer}</p>
            )}
          </motion.div>
        )}
      </div>
    </UnitShell>
  );
};

// Self-register
registerUnit('results_study', ResultsStudy);

export default ResultsStudy;
export { ResultsStudy };
