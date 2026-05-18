'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { fetchProductShowcase } from '../lib/catalog-client';
import { PRODUCT_SHOWCASE_FALLBACK_UNITS } from '../lib/product-showcase-fallback';
import type { ShowcaseUnit } from '../types';

interface ProductShowcaseBlockProps {
  slug?: string;
  lang?: string;
}

type ContentDirection = 'ltr' | 'rtl';
type RecordPayload = Record<string, unknown>;

interface NormalizedMedia {
  url: string;
  alt: string;
}

interface NormalizedKitItem {
  id: string;
  title: string;
  description?: string;
  quantity?: string;
  badge?: string;
  expand?: string;
  image?: NormalizedMedia;
}

interface NormalizedApplicationStep {
  id: string;
  label?: string;
  title: string;
  description: string;
  duration?: string;
  image?: NormalizedMedia;
}

interface NormalizedResultMetric {
  id: string;
  value: string;
  label: string;
  description?: string;
}

interface NormalizedBeforeAfterPair {
  before?: NormalizedMedia;
  after?: NormalizedMedia;
  caption?: string;
}

interface NormalizedResultTab {
  id: string;
  label: string;
  title?: string;
  description?: string;
  bullets: string[];
  source?: string;
  disclaimer?: string;
  metrics: NormalizedResultMetric[];
  beforeAfter?: NormalizedBeforeAfterPair;
}

interface NormalizedRoutineStep {
  id: string;
  order: number;
  label?: string;
  title: string;
  subtitle?: string;
  description?: string;
  color?: string;
  image?: NormalizedMedia;
  products: string[];
}

const LAYOUT_GAP = 'gap-8 md:gap-12';

const isRecord = (value: unknown): value is RecordPayload => (
  typeof value === 'object' && value !== null && !Array.isArray(value)
);

const asString = (value: unknown): string | undefined => (
  typeof value === 'string' && value.trim() ? value : undefined
);

const asRecordArray = (value: unknown): RecordPayload[] => (
  Array.isArray(value) ? value.filter(isRecord) : []
);

const asStringArray = (value: unknown): string[] => (
  Array.isArray(value) ? value.map(asString).filter((entry): entry is string => Boolean(entry)) : []
);

const getDirection = (dir?: string): ContentDirection => dir === 'rtl' ? 'rtl' : 'ltr';

const getMedia = (value: unknown, fallbackAlt: string): NormalizedMedia | undefined => {
  if (typeof value === 'string' && value.trim()) return { url: value, alt: fallbackAlt };
  if (!isRecord(value)) return undefined;
  const url = asString(value.url) ?? asString(value.image) ?? asString(value.src);
  if (!url) return undefined;
  return { url, alt: asString(value.alt) ?? fallbackAlt };
};

const getHeading = (payload: unknown, unit: ShowcaseUnit) => {
  if (!isRecord(payload)) return { eyebrow: undefined, title: unit.title, description: unit.description };
  const heading = isRecord(payload.heading) ? payload.heading : payload;
  return {
    eyebrow: asString(heading.eyebrow) ?? asString(heading.kicker),
    title: asString(heading.title) ?? unit.title,
    description: asString(heading.description) ?? asString(heading.subtitle) ?? unit.description,
  };
};

function renderStackedUnit(unit: ShowcaseUnit) {
  return (
    <div className="flex flex-col w-full border-b border-black/10 pb-8 md:pb-12 last:border-b-0 last:pb-0">
      <div className="aspect-[4/3] overflow-hidden rounded-2xl md:rounded-3xl bg-[#F2F1ED]">
        <ImageWithFallback src={unit.image} alt={unit.title} className="w-full h-full object-cover object-center" />
      </div>
      <div className="pt-5 md:pt-7 space-y-3 max-w-3xl">
        <h3 className="text-[18px] md:text-[22px] font-black lowercase tracking-tight text-black">{unit.title}</h3>
        <p className="text-[13px] md:text-[15px] text-[#5f5f5f] font-medium leading-relaxed">{unit.description}</p>
      </div>
    </div>
  );
}

function renderMotionUnit(unit: ShowcaseUnit, idx: number, children: React.ReactNode, shouldReduceMotion: boolean, yOffset = 40) {
  return (
    <motion.div
      key={unit.id}
      initial={shouldReduceMotion ? false : { opacity: 0, y: yOffset }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.5, delay: shouldReduceMotion ? 0 : idx * 0.06, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}

function KitContentsShowcaseSection({ unit, direction }: { unit: ShowcaseUnit; direction: ContentDirection }) {
  const payload = isRecord(unit.payload) ? unit.payload : undefined;
  const heading = getHeading(payload, unit);
  const items = asRecordArray(payload?.items)
    .map((item, index): NormalizedKitItem => ({
      id: asString(item.id) ?? `kit-item-${index}`,
      title: asString(item.title) ?? asString(item.name) ?? '',
      description: asString(item.description),
      quantity: asString(item.quantity),
      badge: asString(item.badge),
      expand: asString(item.expand),
      image: getMedia(item.image, asString(item.title) ?? 'Kit item'),
    }))
    .filter((item) => item.title);

  const sideMedia = getMedia(payload?.media, heading.title) ?? items[0]?.image;

  const [openItemId, setOpenItemId] = useState<string | null>(null);

  const toggleItem = (itemId: string) => {
    setOpenItemId((current) => current === itemId ? null : itemId);
  };

  if (!heading.title || items.length === 0) return null;

  const textOrder = direction === 'rtl' ? 'order-1 md:order-2' : 'order-2 md:order-1';
  const mediaOrder = direction === 'rtl' ? 'order-2 md:order-1' : 'order-1 md:order-2';

  const listPanel = (
    <div className={`${textOrder} space-y-8 md:space-y-12`}>
      {heading.eyebrow && <p className="text-[10px] font-black uppercase tracking-[0.25em] text-black/35">{heading.eyebrow}</p>}
      <div className="space-y-3">
        <h2 className="text-[28px] md:text-[44px] tracking-tight leading-[1] text-[#333]">
          <span className="font-black uppercase">{heading.title}</span>
        </h2>
        {heading.description && <p className="text-[13px] md:text-[15px] font-medium leading-relaxed text-[#666]">{heading.description}</p>}
      </div>
      <div className="border-t border-black/10">
        {items.map((item) => {
          const isOpen = openItemId === item.id;
          const buttonId = `kit-item-${item.id}-button`;
          const panelId = `kit-item-${item.id}-panel`;

          return (
            <div key={item.id} className="border-b border-black/10">
              <button
                id={buttonId}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => toggleItem(item.id)}
                className="group flex w-full items-center gap-4 py-5 md:py-6 text-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#F2F1ED] transition-colors duration-300 hover:bg-black/[0.03] px-2 -mx-2 rounded-xl"
              >
                {item.image && (
                  <div className="w-14 h-14 md:w-16 md:h-16 rounded-xl overflow-hidden bg-white shrink-0">
                    <ImageWithFallback src={item.image.url} alt={item.image.alt} className="w-full h-full object-cover object-center" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[13px] md:text-[15px] font-black uppercase tracking-[0.12em] group-hover:text-black/80 transition-colors">{item.title}</span>
                    {item.badge && <span className="rounded-full bg-white px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.12em] text-black/50">{item.badge}</span>}
                  </div>
                  {(item.quantity || item.description) && (
                    <div className="mt-1 space-y-0.5">
                      {item.quantity && <p className="text-[11px] text-black/45 font-black uppercase tracking-[0.12em]">{item.quantity}</p>}
                      {item.description && <p className="text-[11px] text-black/45 font-medium lowercase">{item.description}</p>}
                    </div>
                  )}
                </div>
                <span className="w-7 h-7 md:w-8 md:h-8 shrink-0 rounded-full border border-black/10 flex items-center justify-center bg-white group-hover:bg-black group-hover:text-white transition-colors duration-300">
                  <svg
                    aria-hidden="true"
                    className={`${isOpen ? 'rotate-45' : 'rotate-0'} transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]`}
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 5v14" />
                    <path d="M5 12h14" />
                  </svg>
                </span>
              </button>

              <motion.div
                id={panelId}
                role="region"
                aria-labelledby={buttonId}
                aria-hidden={!isOpen}
                initial={false}
                animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                className="overflow-hidden"
              >
                <div className="pb-6 md:pb-8 pl-[72px] md:pl-[80px] pr-2">
                  <p className="text-[14px] md:text-[16px] leading-[1.7] text-black/60 font-medium">
                    {item.expand || item.description || ''}
                  </p>
                </div>
              </motion.div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <section className="bg-[#F2F1ED] rounded-[24px] md:rounded-[40px] px-6 md:px-20 py-10 md:py-16 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-20 items-start overflow-hidden">
      {listPanel}
      {sideMedia && (
        <div className={`${mediaOrder} bg-white rounded-[24px] md:rounded-[32px] overflow-hidden aspect-square md:h-[500px] shadow-sm sticky md:top-24`}>
          <ImageWithFallback src={sideMedia.url} alt={sideMedia.alt} className="w-full h-full object-cover object-center" />
        </div>
      )}
    </section>
  );
}

function ApplicationStepsShowcaseSection({ unit, shouldReduceMotion, direction }: { unit: ShowcaseUnit; shouldReduceMotion: boolean; direction: ContentDirection }) {
  const payload = isRecord(unit.payload) ? unit.payload : undefined;
  const heading = getHeading(payload, unit);
  const steps = asRecordArray(payload?.steps)
    .map((step, index): NormalizedApplicationStep => {
      const title = asString(step.title) ?? asString(step.text) ?? '';
      const description = asString(step.description) ?? asString(step.text) ?? '';
      return {
        id: asString(step.id) ?? `application-step-${index}`,
        label: asString(step.label),
        title,
        description,
        duration: asString(step.duration) ?? asString(step.tip),
        image: getMedia(step.image, title),
      };
    })
    .filter((step) => step.title);
  const defaultIndex = Math.max(0, steps.findIndex((step) => step.id === asString(payload?.defaultActiveStepId)));
  const [activeStep, setActiveStep] = useState(defaultIndex);
  const safeActiveStep = steps[activeStep] ? activeStep : 0;
  const active = steps[safeActiveStep];

  if (!active) return null;

  const textPanel = (
    <div className="bg-[#F2F1ED] rounded-[32px] p-6 md:p-12 flex flex-col justify-between min-h-fit md:min-h-[600px] shadow-sm">
      <div className="space-y-6 md:space-y-10">
        <div className="flex gap-2 md:gap-3 overflow-x-auto pb-1">
          {steps.map((step, index) => (
            <button
              type="button"
              key={step.id}
              onClick={() => setActiveStep(index)}
              className={`rounded-xl overflow-hidden shadow-sm transition-opacity duration-400 shrink-0 w-16 md:w-28 aspect-square ${safeActiveStep === index ? 'opacity-100' : 'opacity-30 hover:opacity-100'}`}
              aria-label={`Show ${step.title}`}
            >
              {step.image ? (
                <ImageWithFallback src={step.image.url} alt={step.image.alt} className="w-full h-full object-cover object-center" />
              ) : (
                <span className="flex h-full w-full items-center justify-center bg-white px-2 text-center text-[9px] font-black uppercase tracking-[0.12em] text-black/50">{String(index + 1).padStart(2, '0')}</span>
              )}
            </button>
          ))}
        </div>
        <AnimatePresence mode="wait">
          <motion.div key={active.id} initial={shouldReduceMotion ? false : { y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -10, opacity: 0 }} transition={{ duration: shouldReduceMotion ? 0 : 0.5 }} className="space-y-4 md:space-y-6">
            <p className="text-[9px] md:text-[11px] font-black uppercase tracking-[0.25em] opacity-40">{heading.eyebrow ?? 'application'}</p>
            <div className="flex gap-3 md:gap-4 items-start max-w-md">
              <span className="text-[10px] md:text-[11px] font-bold opacity-30 mt-1.5">{String(safeActiveStep + 1).padStart(2, '0')}</span>
              <div className="space-y-3">
                <h3 className="text-[20px] md:text-[32px] font-medium leading-[1.3] text-[#333] tracking-tight">{active.title}</h3>
                {active.description && <p className="text-[13px] md:text-[15px] text-[#666] font-medium leading-relaxed">{active.description}</p>}
                {active.duration && <p className="text-[10px] font-black uppercase tracking-[0.2em] text-black/35">{active.duration}</p>}
              </div>
            </div>
            {active.image && (
              <div className="md:hidden relative h-[340px] md:h-[400px] rounded-[24px] overflow-hidden shadow-inner mt-2">
                <ImageWithFallback src={active.image.url} alt={active.image.alt} className="w-full h-full object-cover object-center" />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="flex justify-end pt-6">
        <button type="button" onClick={() => setActiveStep((prev) => (prev + 1) % steps.length)} className="w-10 h-10 md:w-12 md:h-12 rounded-full border border-black/10 flex items-center justify-center bg-white/50 md:bg-transparent hover:bg-black hover:text-white transition-colors duration-300 group" aria-label="Next application step">
          <ChevronRight size={18} className="group-hover:translate-x-0.5 transition-transform duration-300" />
        </button>
      </div>
    </div>
  );

  const imagePanel = (
    <div className="hidden md:block bg-white rounded-[32px] overflow-hidden min-h-[600px] shadow-sm relative group">
      <AnimatePresence mode="wait">
        <motion.div key={active.id} initial={shouldReduceMotion ? false : { opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: shouldReduceMotion ? 0 : 0.6 }} className="absolute inset-0">
          {active.image ? (
            <ImageWithFallback src={active.image.url} alt={active.image.alt} className="w-full h-full object-cover object-center" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-[#F2F1ED] p-12 text-center text-[12px] font-black uppercase tracking-[0.2em] text-black/30">image not provided</div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {direction === 'rtl' ? <>{imagePanel}{textPanel}</> : <>{textPanel}{imagePanel}</>}
    </section>
  );
}

const getBeforeAfterPair = (tab: RecordPayload, payload?: RecordPayload): NormalizedBeforeAfterPair | undefined => {
  const tabPairs = asRecordArray(tab.beforeAfterImages);
  const payloadPairs = asRecordArray(payload?.beforeAfterImages);
  const pair = tabPairs[0] ?? payloadPairs[0];
  const caption = asString(tab.caption) ?? asString(payload?.caption);
  if (pair) return { before: getMedia(pair.before, 'Before result'), after: getMedia(pair.after, 'After result'), caption };
  const beforeAfter = isRecord(payload?.beforeAfter) ? payload?.beforeAfter : undefined;
  if (beforeAfter) return { before: getMedia(beforeAfter.beforeImage, 'Before result'), after: getMedia(beforeAfter.afterImage, 'After result'), caption: asString(beforeAfter.caption) ?? caption };
  const tabImage = getMedia(tab.image, 'Result image');
  return tabImage ? { after: tabImage, caption } : undefined;
};

function ResultsStudyShowcaseSection({ unit, shouldReduceMotion, direction }: { unit: ShowcaseUnit; shouldReduceMotion: boolean; direction: ContentDirection }) {
  const payload = isRecord(unit.payload) ? unit.payload : undefined;
  const globalMetrics = asRecordArray(payload?.metrics)
    .map((metric, metricIndex): NormalizedResultMetric => ({
      id: asString(metric.id) ?? `global-metric-${metricIndex}`,
      value: asString(metric.value) ?? '',
      label: asString(metric.label) ?? '',
      description: asString(metric.description),
    }))
    .filter((metric) => metric.value && metric.label);
  const resultTabs = asRecordArray(payload?.tabs)
    .map((tab, index): NormalizedResultTab => {
      const metrics = asRecordArray(tab.metrics)
        .map((metric, metricIndex): NormalizedResultMetric => ({
          id: asString(metric.id) ?? `metric-${index}-${metricIndex}`,
          value: asString(metric.value) ?? '',
          label: asString(metric.label) ?? '',
          description: asString(metric.description),
        }))
        .filter((metric) => metric.value && metric.label);
      return {
        id: asString(tab.id) ?? `results-tab-${index}`,
        label: asString(tab.label) ?? asString(tab.title) ?? `results ${index + 1}`,
        title: asString(tab.title),
        description: asString(tab.description),
        bullets: asStringArray(tab.bullets),
        source: asString(tab.source) ?? asString(payload?.source),
        disclaimer: asString(tab.disclaimer) ?? asString(payload?.disclaimer),
        metrics,
        beforeAfter: getBeforeAfterPair(tab, payload),
      };
    })
    .filter((tab) => tab.label || tab.title || tab.description || tab.metrics.length > 0 || tab.beforeAfter);
  const tabs: NormalizedResultTab[] = resultTabs.length > 0 ? resultTabs : globalMetrics.length > 0 ? [{
    id: 'global-results',
    label: asString(payload?.defaultTabLabel) ?? asString(payload?.label) ?? 'results',
    title: asString(payload?.title),
    description: asString(payload?.description),
    bullets: asStringArray(payload?.bullets),
    source: asString(payload?.source),
    disclaimer: asString(payload?.disclaimer),
    metrics: [],
    beforeAfter: getBeforeAfterPair({}, payload),
  }] : [];
  const shouldShowGlobalMetrics = globalMetrics.length > 0 && tabs.every((tab) => tab.metrics.length === 0);
  const defaultIndex = Math.max(0, tabs.findIndex((tab) => tab.id === asString(payload?.defaultTabId)));
  const [activeTabIndex, setActiveTabIndex] = useState(defaultIndex);
  const safeActiveTabIndex = tabs[activeTabIndex] ? activeTabIndex : 0;
  const activeTab = tabs[safeActiveTabIndex];

  if (!activeTab) return null;

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {direction === 'rtl' ? (
        <>
          <BeforeAfterImage pair={activeTab.beforeAfter} className="hidden md:flex bg-white rounded-[32px] overflow-hidden aspect-[4/5] md:min-h-[600px] relative group shadow-sm" />
          <div className="bg-[#F2F1ED] rounded-[32px] p-8 md:p-16 flex flex-col justify-between min-h-[550px] md:min-h-[600px]">
            <div className="space-y-12 md:space-y-16">
              {shouldShowGlobalMetrics && (
                <div className="space-y-8 md:space-y-10">
                  {globalMetrics.map((metric) => (
                    <ResultMetricStat key={metric.id} metric={metric} />
                  ))}
                </div>
              )}
              <AnimatePresence mode="wait">
                <motion.div key={activeTab.id} initial={shouldReduceMotion ? false : { opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: shouldReduceMotion ? 0 : 0.6, ease: 'easeOut' }} className="space-y-10 md:space-y-14">
                  {(activeTab.title || activeTab.description || activeTab.bullets.length > 0) && (
                    <div className="space-y-4 max-w-md">
                      {activeTab.title && <h3 className="text-[24px] md:text-[36px] font-medium leading-[1.1] text-[#333] tracking-tight">{activeTab.title}</h3>}
                      {activeTab.description && <p className="text-[13px] md:text-[15px] text-[#666] font-medium leading-relaxed">{activeTab.description}</p>}
                      {activeTab.bullets.length > 0 && (
                        <ul className="space-y-2 text-[12px] md:text-[13px] text-[#555] font-medium leading-relaxed">
                          {activeTab.bullets.map((bullet) => <li key={bullet} className="flex gap-2"><span aria-hidden="true">•</span><span>{bullet}</span></li>)}
                        </ul>
                      )}
                    </div>
                  )}
                  {activeTab.metrics.map((metric) => <ResultMetricStat key={metric.id} metric={metric} />)}
                </motion.div>
              </AnimatePresence>
            </div>
            <BeforeAfterImage pair={activeTab.beforeAfter} className="md:hidden relative h-[340px] rounded-[24px] overflow-hidden mt-10 shadow-sm" />
            <div className="space-y-8 md:space-y-10 pt-12">
              {(activeTab.beforeAfter?.caption || activeTab.source || activeTab.disclaimer) && (
                <p className="text-[9px] md:text-[10px] leading-relaxed opacity-40 italic max-w-[360px]">{[activeTab.beforeAfter?.caption, activeTab.source, activeTab.disclaimer].filter(Boolean).join(' · ')}</p>
              )}
              <div className="space-y-2.5">
                {tabs.map((tab, index) => (
                  <button key={tab.id} type="button" onClick={() => setActiveTabIndex(index)} className={`w-full py-5 px-8 rounded-[14px] text-left transition-colors text-[15px] md:text-[17px] font-medium lowercase ${safeActiveTabIndex === index ? 'bg-black/[0.04] text-black shadow-sm' : 'text-black/30 hover:text-black/50'}`}>
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="bg-[#F2F1ED] rounded-[32px] p-8 md:p-16 flex flex-col justify-between min-h-[550px] md:min-h-[600px]">
            <div className="space-y-12 md:space-y-16">
              {shouldShowGlobalMetrics && (
                <div className="space-y-8 md:space-y-10">
                  {globalMetrics.map((metric) => (
                    <ResultMetricStat key={metric.id} metric={metric} />
                  ))}
                </div>
              )}
              <AnimatePresence mode="wait">
                <motion.div key={activeTab.id} initial={shouldReduceMotion ? false : { opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: shouldReduceMotion ? 0 : 0.6, ease: 'easeOut' }} className="space-y-10 md:space-y-14">
                  {(activeTab.title || activeTab.description || activeTab.bullets.length > 0) && (
                    <div className="space-y-4 max-w-md">
                      {activeTab.title && <h3 className="text-[24px] md:text-[36px] font-medium leading-[1.1] text-[#333] tracking-tight">{activeTab.title}</h3>}
                      {activeTab.description && <p className="text-[13px] md:text-[15px] text-[#666] font-medium leading-relaxed">{activeTab.description}</p>}
                      {activeTab.bullets.length > 0 && (
                        <ul className="space-y-2 text-[12px] md:text-[13px] text-[#555] font-medium leading-relaxed">
                          {activeTab.bullets.map((bullet) => <li key={bullet} className="flex gap-2"><span aria-hidden="true">•</span><span>{bullet}</span></li>)}
                        </ul>
                      )}
                    </div>
                  )}
                  {activeTab.metrics.map((metric) => <ResultMetricStat key={metric.id} metric={metric} />)}
                </motion.div>
              </AnimatePresence>
            </div>
            <BeforeAfterImage pair={activeTab.beforeAfter} className="md:hidden relative h-[340px] rounded-[24px] overflow-hidden mt-10 shadow-sm" />
            <div className="space-y-8 md:space-y-10 pt-12">
              {(activeTab.beforeAfter?.caption || activeTab.source || activeTab.disclaimer) && (
                <p className="text-[9px] md:text-[10px] leading-relaxed opacity-40 italic max-w-[360px]">{[activeTab.beforeAfter?.caption, activeTab.source, activeTab.disclaimer].filter(Boolean).join(' · ')}</p>
              )}
              <div className="space-y-2.5">
                {tabs.map((tab, index) => (
                  <button key={tab.id} type="button" onClick={() => setActiveTabIndex(index)} className={`w-full py-5 px-8 rounded-[14px] text-left transition-colors text-[15px] md:text-[17px] font-medium lowercase ${safeActiveTabIndex === index ? 'bg-black/[0.04] text-black shadow-sm' : 'text-black/30 hover:text-black/50'}`}>
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <BeforeAfterImage pair={activeTab.beforeAfter} className="hidden md:flex bg-white rounded-[32px] overflow-hidden aspect-[4/5] md:min-h-[600px] relative group shadow-sm" />
        </>
      )}
    </section>
  );
}

function ResultMetricStat({ metric }: { metric: NormalizedResultMetric }) {
  return (
    <div className="space-y-2">
      <h4 className="text-[48px] md:text-[64px] font-bold text-[#4A5D4E] tracking-tight leading-none">{metric.value}</h4>
      <p className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-[#333] opacity-60">{metric.label}</p>
      {metric.description && <p className="text-[11px] md:text-[12px] text-[#666] font-medium leading-relaxed max-w-[280px]">{metric.description}</p>}
    </div>
  );
}

function BeforeAfterImage({ pair, className }: { pair?: NormalizedBeforeAfterPair; className: string }) {
  if (!pair?.before && !pair?.after) return null;
  return (
    <div className={className}>
      {pair.before && (
          <div className="relative w-1/2 h-full overflow-hidden">
          <ImageWithFallback src={pair.before.url} alt={pair.before.alt} className="w-full h-full object-cover object-center grayscale-[0.2]" />
          <div className="absolute bottom-6 left-0 w-full flex justify-center z-10"><span className="bg-black/20 backdrop-blur-md px-4 py-1.5 rounded-full text-[9px] font-bold text-white uppercase tracking-widest border border-white/10">Before</span></div>
        </div>
      )}
      {pair.after && (
        <div className="relative flex-1 h-full overflow-hidden">
          <ImageWithFallback src={pair.after.url} alt={pair.after.alt} className="w-full h-full object-cover object-center" />
          <div className="absolute bottom-6 left-0 w-full flex justify-center z-10"><span className="bg-white/20 backdrop-blur-lg px-4 py-1.5 rounded-full text-[9px] font-bold text-white uppercase tracking-widest border border-white/20">After</span></div>
        </div>
      )}
      {pair.caption && <div className="absolute left-4 right-4 top-4 z-20 rounded-full bg-black/25 px-4 py-2 text-center text-[9px] font-bold uppercase tracking-[0.16em] text-white backdrop-blur-md">{pair.caption}</div>}
    </div>
  );
}

function RoutineStepsShowcaseSection({ unit, shouldReduceMotion, direction }: { unit: ShowcaseUnit; shouldReduceMotion: boolean; direction: ContentDirection }) {
  const payload = isRecord(unit.payload) ? unit.payload : undefined;
  const heading = getHeading(payload, unit);
  const heroImage = getMedia(payload?.heroImage ?? payload?.lifestyleImage ?? unit.image, heading.title);
  const steps = asRecordArray(payload?.steps)
    .map((step, index): NormalizedRoutineStep => ({
      id: asString(step.id) ?? `routine-step-${index}`,
      order: Number(step.order ?? index + 1),
      label: asString(step.label) ?? asString(step.timeOfDay),
      title: asString(step.title) ?? '',
      subtitle: asString(step.subtitle) ?? asString(step.timing),
      description: asString(step.description),
      color: asString(step.color),
      image: getMedia(step.image, asString(step.title) ?? 'Routine step'),
      products: asStringArray(step.products),
    }))
    .filter((step) => step.title)
    .sort((a, b) => a.order - b.order);
  const defaultIndex = Math.max(0, steps.findIndex((step) => step.id === asString(payload?.defaultActiveStepId)));
  const [activeStepIndex, setActiveStepIndex] = useState(defaultIndex);
  const safeActiveStepIndex = steps[activeStepIndex] ? activeStepIndex : 0;
  const active = steps[safeActiveStepIndex];

  if (!active || !heroImage) return null;

  const heroPanel = (
    <div className="bg-white rounded-[24px] overflow-hidden min-h-[500px] lg:min-h-[700px] relative">
      <ImageWithFallback src={heroImage.url} alt={heroImage.alt} className="w-full h-full object-cover object-center" />
    </div>
  );

  const stepsPanel = (
    <div className="bg-[#FAF9F6] rounded-[24px] p-8 lg:p-16 flex flex-col justify-between min-h-[500px] lg:min-h-[700px] relative overflow-hidden">
      <div className="space-y-4">
        <h2 className="text-[44px] lg:text-[56px] font-medium leading-[1] text-[#333]">{asString(payload?.routineTitle) ?? heading.title}</h2>
        {(asString(payload?.routineSubtitle) ?? heading.description) && <p className="text-[14px] text-[#666]">{asString(payload?.routineSubtitle) ?? heading.description}</p>}
      </div>
      <div className="flex-1 flex items-center justify-center relative py-12">
        <AnimatePresence mode="wait">
          <motion.div key={active.id} initial={shouldReduceMotion ? false : { opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: shouldReduceMotion ? 0 : 0.6, ease: 'easeOut' }} className="relative w-full aspect-square max-w-[360px]">
            {active.image ? (
              <ImageWithFallback src={active.image.url} alt={active.image.alt} className="w-full h-full object-contain object-center mix-blend-multiply" />
            ) : (
              <div className="flex h-full w-full items-center justify-center rounded-[28px] bg-white p-8 text-center shadow-sm">
                <div className="space-y-3">
                  <p className="text-[11px] font-black uppercase tracking-[0.2em] text-black/30">routine step</p>
                  <p className="text-[22px] font-medium leading-tight text-[#333]">{active.title}</p>
                </div>
              </div>
            )}
            <motion.div initial={shouldReduceMotion ? false : { opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: shouldReduceMotion ? 0 : 0.3, duration: shouldReduceMotion ? 0 : 0.5, ease: 'easeOut' }} className="absolute top-[40%] left-[-20px] lg:left-[-40px] z-10">
              <div className="flex flex-col">
                <span className="text-[14px] font-black uppercase tracking-widest text-[#333] mb-0.5">{active.title}</span>
                {(active.subtitle || active.description) && <span className="text-[12px] text-[#666]">{active.subtitle ?? active.description}</span>}
                {active.products.length > 0 && <span className="mt-1 text-[10px] font-bold uppercase tracking-[0.16em] text-black/35">{active.products.join(' + ')}</span>}
                <div className="w-[100px] lg:w-[150px] h-[1px] bg-black/10 mt-2 relative"><div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-black/20 rounded-full" /></div>
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-2 lg:gap-4">
        {steps.map((step, index) => (
          <button key={step.id} type="button" onClick={() => setActiveStepIndex(index)} className="flex flex-col items-center gap-4 group" aria-label={`Show ${step.title}`}>
            <div className={`w-12 h-12 lg:w-16 lg:h-16 rounded-full border-2 flex items-center justify-center text-[12px] font-black transition-colors duration-500 ${safeActiveStepIndex === index ? 'bg-black border-black text-white' : 'border-black/10 bg-transparent text-black/40 hover:border-black/30'}`}>{String(index + 1).padStart(2, '0')}</div>
            <span className={`text-[9px] lg:text-[10px] font-black uppercase tracking-[0.2em] transition-opacity duration-500 ${safeActiveStepIndex === index ? 'opacity-100' : 'opacity-20 group-hover:opacity-60'}`}>{step.label ?? step.title}</span>
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {direction === 'rtl' ? <>{stepsPanel}{heroPanel}</> : <>{heroPanel}{stepsPanel}</>}
    </section>
  );
}

function SemanticShowcaseUnit({ unit, shouldReduceMotion }: { unit: ShowcaseUnit; shouldReduceMotion: boolean }) {
  const direction = getDirection(unit.direction);
  switch (unit.type) {
    case 'kit_contents': return <KitContentsShowcaseSection unit={unit} direction={direction} />;
    case 'application_steps': return <ApplicationStepsShowcaseSection unit={unit} shouldReduceMotion={shouldReduceMotion} direction={direction} />;
    case 'results_study': return <ResultsStudyShowcaseSection unit={unit} shouldReduceMotion={shouldReduceMotion} direction={direction} />;
    case 'routine_steps': return <RoutineStepsShowcaseSection unit={unit} shouldReduceMotion={shouldReduceMotion} direction={direction} />;
    default: return renderStackedUnit(unit);
  }
}

function renderMixedLayoutUnits(units: ShowcaseUnit[], shouldReduceMotion: boolean) {
  return units.map((unit, index) =>
    renderMotionUnit(unit, index, <SemanticShowcaseUnit unit={unit} shouldReduceMotion={shouldReduceMotion} />, shouldReduceMotion)
  );
}

function SkeletonLoader() {
  return (
    <section className="bg-white py-12 md:py-20">
      <div className="max-w-[1600px] mx-auto px-4 lg:px-12">
        <div className="flex flex-col gap-8 md:gap-12">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="w-full border-b border-black/10 pb-8 md:pb-12 last:border-b-0 last:pb-0 animate-pulse motion-reduce:animate-none">
              <div className="aspect-[4/3] bg-[#F1F0ED] rounded-2xl md:rounded-3xl" />
              <div className="pt-5 md:pt-7 space-y-3 max-w-3xl">
                <div className="h-5 w-2/5 bg-[#E5E3DF] rounded" />
                <div className="h-4 w-full bg-[#E5E3DF] rounded" />
                <div className="h-4 w-3/4 bg-[#E5E3DF] rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export const ProductShowcaseBlock: React.FC<ProductShowcaseBlockProps> = ({ slug }) => {
  const [showcaseUnits, setShowcaseUnits] = useState<ShowcaseUnit[] | null>(null);
  const shouldReduceMotion = Boolean(useReducedMotion());

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    const load = async () => {
      const data = await fetchProductShowcase(slug);
      if (cancelled) return;
      setShowcaseUnits(data && data.length > 0 ? data : PRODUCT_SHOWCASE_FALLBACK_UNITS);
    };
    load();
    return () => { cancelled = true; };
  }, [slug]);

  const unitsToRender = slug ? showcaseUnits : PRODUCT_SHOWCASE_FALLBACK_UNITS;
  const activeUnits = useMemo(() => unitsToRender?.filter((unit) => unit.isActive !== false) ?? null, [unitsToRender]);

  if (activeUnits === null) return <SkeletonLoader />;
  if (activeUnits.length === 0) return null;

  return (
    <section className="overflow-hidden bg-white py-12 md:py-20">
      <div className="max-w-[1600px] mx-auto px-4 lg:px-12">
        <div className={`flex flex-col ${LAYOUT_GAP}`}>{renderMixedLayoutUnits(activeUnits, shouldReduceMotion)}</div>
      </div>
    </section>
  );
};
