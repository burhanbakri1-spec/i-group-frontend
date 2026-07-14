import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import Image from 'next/image';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface PageHeroProps {
  image?: string | null;
  fallbackImage: string;
  alt: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  ctaLabel?: React.ReactNode;
  onCtaClick?: () => void;
  priority?: boolean;
  objectPosition?: string;
}

const HERO_EASE = [0.76, 0, 0.24, 1] as const;

export const PageHero: React.FC<PageHeroProps> = ({
  image,
  fallbackImage,
  alt,
  title,
  subtitle,
  ctaLabel,
  onCtaClick,
  priority = false,
  objectPosition = 'center',
}) => {
  const shouldReduceMotion = useReducedMotion();
  const imageSrc = image?.trim() || fallbackImage;
  const isLocalImage = imageSrc.startsWith('/images/');

  return (
    <section data-icare-hero className="icare-page-hero">
      <motion.div
        className="icare-page-hero__frame"
        initial={shouldReduceMotion ? false : { opacity: 0, scale: 1.04 }}
        animate={shouldReduceMotion ? undefined : { opacity: 1, scale: 1 }}
        transition={{ duration: 0.65, ease: HERO_EASE }}
      >
        <div className="icare-page-hero__media">
          {isLocalImage ? (
            <Image
              src={imageSrc}
              alt={alt}
              fill
              sizes="100vw"
              priority={priority}
              className="rounded-[inherit] object-cover"
              style={{ objectPosition }}
            />
          ) : (
            <ImageWithFallback
              src={imageSrc}
              alt={alt}
              priority={priority}
              className="h-full w-full overflow-hidden rounded-[inherit] object-cover"
              style={{ objectPosition }}
            />
          )}
        </div>
        <div className="icare-page-hero__overlay" />

        <motion.div
          className="icare-page-hero__content absolute inset-x-0 bottom-0 z-10 grid justify-items-start gap-4 text-left text-white"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
          animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8, ease: HERO_EASE }}
        >
          <div className="grid max-w-[70rem] gap-3">
            <h1 className="m-0 max-w-[22rem] text-[clamp(1.875rem,7.2vw,2.25rem)] font-medium leading-[1.12] tracking-[-0.02em] md:max-w-[70rem] md:text-[calc(1.8rem_+_.2vw)] md:leading-[1.2]">
              {title}
            </h1>
            {subtitle ? (
              <p className="m-0 text-[12px] font-bold uppercase leading-[1.5] tracking-[0.14em] text-white/90">
                {subtitle}
              </p>
            ) : null}
          </div>

          {ctaLabel && onCtaClick ? (
            <button
              type="button"
              onClick={onCtaClick}
              className="relative isolate inline-flex items-center justify-center overflow-hidden rounded-full border border-white/95 px-8 py-2.5 text-[13px] font-bold uppercase leading-[1.5] text-white transition-[color,transform,border-color] duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] before:absolute before:inset-0 before:-z-10 before:origin-bottom before:scale-y-0 before:rounded-full before:bg-white before:transition-transform before:duration-500 before:ease-[cubic-bezier(0.76,0,0.24,1)] hover:-translate-y-px hover:border-white hover:text-[#67645E] hover:before:scale-y-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black/30"
            >
              {ctaLabel}
            </button>
          ) : null}
        </motion.div>

      </motion.div>
    </section>
  );
};
