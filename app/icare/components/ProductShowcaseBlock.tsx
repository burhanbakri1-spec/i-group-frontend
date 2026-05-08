'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { fetchProductShowcase } from '../lib/catalog-client';
import { ShowcaseUnit } from '../types';

/* ─── Props ────────────────────────────────────────────────────────── */

interface ProductShowcaseBlockProps {
  slug?: string;
  lang?: string;
}

/* ─── Dummy fallback ───────────────────────────────────────────────── */

const DUMMY_SHOWCASE: ShowcaseUnit[] = [
  {
    id: -1,
    image: 'https://images.unsplash.com/photo-1611930022073-b7a3da7e7e9a?w=600',
    title: 'Premium Ingredients',
    description: 'Our products are formulated with the finest naturally-derived ingredients, sourced sustainably from around the world.',
    layout: 'stacked',
  },
  {
    id: -2,
    image: 'https://images.unsplash.com/photo-1556228841-68a4a2e7a1e8?w=600',
    title: 'Science-Backed Formulas',
    description: 'Every formula is developed with dermatologists and tested rigorously to deliver visible, lasting results.',
    layout: 'stacked',
  },
  {
    id: -3,
    image: 'https://images.unsplash.com/photo-1611080622513-7e5aa0e7e7f5?w=600',
    title: 'Clean Beauty Promise',
    description: 'Cruelty-free, vegan, and free from harmful chemicals. Beautiful skin should never come at a cost.',
    layout: 'stacked',
  },
];

/* ─── Layout helper — render a single unit in the given layout ────── */

const LAYOUT_GAP = 'gap-8 md:gap-12';

function renderStackedUnit(unit: ShowcaseUnit) {
  return (
    <div className="flex flex-col w-full border-b border-black/10 pb-8 md:pb-12 last:border-b-0 last:pb-0">
      <div className="aspect-[16/10] overflow-hidden rounded-2xl md:rounded-3xl">
        <ImageWithFallback
          src={unit.image}
          alt={unit.title}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="pt-5 md:pt-7 space-y-3 max-w-3xl">
        <h3 className="text-[18px] md:text-[22px] font-black lowercase tracking-tight text-black">
          {unit.title}
        </h3>
        <p className="text-[13px] md:text-[15px] text-[#707070] font-medium leading-relaxed">
          {unit.description}
        </p>
      </div>
    </div>
  );
}

function renderSideBySideUnit(unit: ShowcaseUnit, imageLeft: boolean) {
  const imageCol = (
    <div className="h-full min-h-[280px] overflow-hidden rounded-2xl md:rounded-3xl">
      <ImageWithFallback
        src={unit.image}
        alt={unit.title}
        className="w-full h-full object-cover"
      />
    </div>
  );

  const textCol = (
    <div className="flex flex-col justify-center space-y-3 md:px-6">
      <h3 className="text-[18px] md:text-[22px] font-black lowercase tracking-tight text-black">
        {unit.title}
      </h3>
      <p className="text-[13px] md:text-[15px] text-[#707070] font-medium leading-relaxed">
        {unit.description}
      </p>
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12 items-center w-full border-b border-black/10 pb-8 md:pb-12 last:border-b-0 last:pb-0">
      {imageLeft ? (
        <>
          {imageCol}
          {textCol}
        </>
      ) : (
        <>
          {textCol}
          {imageCol}
        </>
      )}
    </div>
  );
}

function renderTwoColumnCard(unit: ShowcaseUnit) {
  return (
    <div className="flex flex-col w-full">
      <div className="aspect-[16/10] overflow-hidden rounded-2xl md:rounded-3xl">
        <ImageWithFallback
          src={unit.image}
          alt={unit.title}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="pt-4 md:pt-5 space-y-2">
        <h3 className="text-[16px] md:text-[18px] font-black lowercase tracking-tight text-black">
          {unit.title}
        </h3>
        <p className="text-[12px] md:text-[14px] text-[#707070] font-medium leading-relaxed line-clamp-3">
          {unit.description}
        </p>
      </div>
    </div>
  );
}

function renderFullBleedUnit(unit: ShowcaseUnit) {
  return (
    <div className="relative rounded-2xl md:rounded-3xl overflow-hidden w-full aspect-[16/10] md:aspect-[21/9]">
      <ImageWithFallback
        src={unit.image}
        alt={unit.title}
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 space-y-2">
        <h3 className="text-[20px] md:text-[28px] font-black lowercase tracking-tight text-white">
          {unit.title}
        </h3>
        <p className="text-[13px] md:text-[16px] text-white/80 font-medium leading-relaxed">
          {unit.description}
        </p>
      </div>
    </div>
  );
}

/* ─── Unit renderer dispatcher ──────────────────────────────────────── */

type LayoutType = 'stacked' | 'side-by-side' | 'side-by-side-alt' | 'two-column' | 'full-bleed';

function renderUnit(layout: LayoutType, unit: ShowcaseUnit) {
  switch (layout) {
    case 'side-by-side':
      return renderSideBySideUnit(unit, true);
    case 'side-by-side-alt':
      return renderSideBySideUnit(unit, false);
    case 'two-column':
      return renderTwoColumnCard(unit);
    case 'full-bleed':
      return renderFullBleedUnit(unit);
    case 'stacked':
    default:
      return renderStackedUnit(unit);
  }
}

/* ─── Skeleton loader ─────────────────────────────────────────────── */

function SkeletonLoader() {
  return (
    <section className="bg-white py-12 md:py-20">
      <div className="max-w-[1600px] mx-auto px-4 lg:px-12">
        <div className="flex flex-col gap-8 md:gap-12">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="w-full border-b border-black/10 pb-8 md:pb-12 last:border-b-0 last:pb-0 animate-pulse"
            >
              <div className="aspect-[16/10] bg-[#F1F0ED] rounded-2xl md:rounded-3xl" />
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

/* ─── Component ─────────────────────────────────────────────────────── */

export const ProductShowcaseBlock: React.FC<ProductShowcaseBlockProps> = ({ slug }) => {
  const [showcaseUnits, setShowcaseUnits] = useState<ShowcaseUnit[] | null>(null);

  useEffect(() => {
    if (!slug) {
      setShowcaseUnits(DUMMY_SHOWCASE);
      return;
    }
    let cancelled = false;
    const load = async () => {
      const data = await fetchProductShowcase(slug);
      if (cancelled) return;
      setShowcaseUnits(data && data.length > 0 ? data : DUMMY_SHOWCASE);
    };
    load();
    return () => { cancelled = true; };
  }, [slug]);

  /* ── Loading state ────────────────────────────────────────────── */
  if (showcaseUnits === null) {
    return <SkeletonLoader />;
  }

  /* ── Determine layout from first unit ─────────────────────────── */
  const layout = (showcaseUnits[0]?.layout || 'stacked') as LayoutType;

  return (
    <section className="bg-white py-12 md:py-20">
      <div className="max-w-[1600px] mx-auto px-4 lg:px-12">
        {/* Units — vertical stack */}
        {layout === 'two-column' ? (
          /* Two-column grid layout */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10 md:gap-x-12 md:gap-y-14">
            {showcaseUnits.map((unit, idx) => (
              <motion.div
                key={unit.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
              >
                {renderTwoColumnCard(unit)}
              </motion.div>
            ))}
          </div>
        ) : (
          /* All other layouts: stacked vertically */
          <div className={`flex flex-col ${LAYOUT_GAP}`}>
            {showcaseUnits.map((unit, idx) => (
              <motion.div
                key={unit.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.6, delay: idx * 0.15 }}
              >
                {renderUnit(layout, unit)}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
