import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { icareApi } from '../lib/api-client';
import { useSiteContent } from '../hooks/useSiteContent';

const SENTENCE_SPLIT_PATTERN = /\s*(?:\||\n|•|؛)\s*/;

const readAnnouncementValue = (announcement: Record<string, unknown>) => {
  const candidates = [
    announcement.message,
    announcement.text,
    announcement.title,
    announcement.content,
    announcement.body,
    announcement.description,
  ];

  return candidates.find((value): value is string => (
    typeof value === 'string' && value.trim().length > 0
  ))?.trim();
};

const splitAnnouncementText = (text: string) => {
  const normalizedText = text.trim();
  if (!normalizedText) return [];

  const directSegments = normalizedText
    .split(SENTENCE_SPLIT_PATTERN)
    .map((segment) => segment.trim())
    .filter(Boolean);

  if (directSegments.length > 1) return directSegments;

  return normalizedText
    .split(/(?<=[.!?])\s+(?=[A-Z0-9])/)
    .map((segment) => segment.trim())
    .filter(Boolean);
};

export const AnnouncementBar: React.FC = () => {
  const shouldReduceMotion = useReducedMotion();
  const { announcementText } = useSiteContent();
  const fallbackSlides = useMemo(() => splitAnnouncementText(announcementText), [announcementText]);
  const [remoteSlides, setRemoteSlides] = useState<string[]>([]);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const loadAnnouncements = async () => {
      try {
        const announcements = await icareApi.announcements.active();
        if (cancelled || !Array.isArray(announcements)) return;

        const nextSlides = announcements
          .map(readAnnouncementValue)
          .filter((value): value is string => Boolean(value));

        setRemoteSlides(nextSlides);
      } catch (error) {
        if (process.env.NODE_ENV !== 'production') {
          console.warn('Unable to load iCare announcements.', error);
        }
      }
    };

    loadAnnouncements();

    return () => {
      cancelled = true;
    };
  }, []);

  const slides = useMemo(() => {
    const seenSlides = new Set<string>();
    return [...remoteSlides, ...fallbackSlides].filter((slide) => {
      const normalizedSlide = slide.trim().toLowerCase();
      if (!normalizedSlide || seenSlides.has(normalizedSlide)) return false;
      seenSlides.add(normalizedSlide);
      return true;
    });
  }, [fallbackSlides, remoteSlides]);
  const hasMultipleSlides = slides.length > 1;
  const activeSlide = slides[activeSlideIndex % Math.max(slides.length, 1)] ?? '';

  useEffect(() => {
    setActiveSlideIndex(0);
  }, [slides.length]);

  useEffect(() => {
    if (!hasMultipleSlides || isPaused || shouldReduceMotion) return;

    const intervalId = window.setInterval(() => {
      setActiveSlideIndex((currentIndex) => (currentIndex + 1) % slides.length);
    }, 4200);

    return () => window.clearInterval(intervalId);
  }, [hasMultipleSlides, isPaused, shouldReduceMotion, slides.length]);

  if (slides.length === 0) return null;

  return (
    <section data-icare-announcement className="icare-announcement" aria-label="Announcements">
      <div className="icare-announcement__body">
        <div className="icare-announcement__viewport" aria-live="polite">
          <AnimatePresence initial={false} mode="wait">
            <motion.p
              key={`${activeSlideIndex}-${activeSlide}`}
              className="icare-announcement__slide overflow-hidden text-ellipsis whitespace-nowrap"
              initial={shouldReduceMotion ? false : { x: 12, opacity: 0 }}
              animate={shouldReduceMotion ? undefined : { x: 0, opacity: 1 }}
              exit={shouldReduceMotion ? undefined : { x: -12, opacity: 0 }}
              transition={{ duration: 0.32, ease: [0.76, 0, 0.24, 1] }}
            >
              {activeSlide}
            </motion.p>
          </AnimatePresence>
        </div>

        {hasMultipleSlides ? (
          <button
            type="button"
            aria-label={isPaused ? 'Resume announcements slider' : 'Pause announcements slider'}
            aria-pressed={isPaused}
            onClick={() => setIsPaused((currentValue) => !currentValue)}
            className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center justify-center p-2 text-[#67645E] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#67645E]/70"
          >
            {isPaused ? (
              <span
                aria-hidden="true"
                className="block h-0 w-0 border-y-[5px] border-l-[8px] border-y-transparent border-l-current"
              />
            ) : (
              <>
                <span className="block h-[11px] w-[3px] bg-current" />
                <span className="ml-[3px] block h-[11px] w-[3px] bg-current" />
              </>
            )}
          </button>
        ) : null}
      </div>
    </section>
  );
};
