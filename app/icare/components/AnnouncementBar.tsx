import React, { useEffect, useMemo, useState } from 'react';
import { useReducedMotion } from 'motion/react';
import { useSiteContent } from '../hooks/useSiteContent';
import { useIcareShell } from './IcareShell';
import { translations } from '../translations';

const SLIDE_SPLIT_PATTERN = /\s*(?:•|\|\||\n\n)\s*/;

const splitAnnouncementText = (text: string) => {
  const normalizedText = text.trim();
  if (!normalizedText) return [];

  const directSegments = normalizedText
    .split(SLIDE_SPLIT_PATTERN)
    .map((segment) => segment.trim())
    .filter(Boolean);

  if (directSegments.length > 1) return directSegments;

  return [normalizedText];
};

const AnnouncementPauseIcon = () => (
  <svg width="9" height="11" viewBox="0 0 9 11" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <rect width="3" height="11" fill="currentColor" />
    <rect x="6" width="3" height="11" fill="currentColor" />
  </svg>
);

const AnnouncementPlayIcon = () => (
  <svg width="10" height="12" viewBox="0 0 10 12" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path
      d="M9.5 5.13397C10.1667 5.51888 10.1667 6.48113 9.5 6.86603L2 11.1962C1.33333 11.5811 0.5 11.0999 0.5 10.3301L0.500001 1.66987C0.500001 0.900072 1.33333 0.418947 2 0.803847L9.5 5.13397Z"
      fill="currentColor"
    />
  </svg>
);

const AnnouncementSlideText = ({ text }: { text: string }) => {
  const lines = text.split(/\||\n/).map((line) => line.trim()).filter(Boolean);

  if (lines.length <= 1) {
    return <>{text}</>;
  }

  return (
    <>
      <span className="icare-announcement__slide-lines icare-announcement__slide-lines--stacked">
        {lines.map((line, index) => (
          <React.Fragment key={`${line}-${index}`}>
            {index > 0 ? <br /> : null}
            {line}
          </React.Fragment>
        ))}
      </span>
      <span className="icare-announcement__slide-lines icare-announcement__slide-lines--inline">
        {lines.join(' | ')}
      </span>
    </>
  );
};

export const AnnouncementBar: React.FC = () => {
  const { lang } = useIcareShell();
  const t = translations[lang];
  const shouldReduceMotion = useReducedMotion();
  const { announcementText } = useSiteContent(lang);
  const slides = useMemo(() => splitAnnouncementText(announcementText), [announcementText]);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const hasMultipleSlides = slides.length > 1;
  const activeSlide = slides[activeSlideIndex % Math.max(slides.length, 1)] ?? '';

  useEffect(() => {
    setActiveSlideIndex(0);
  }, [slides.length, announcementText]);

  useEffect(() => {
    if (!hasMultipleSlides || isPaused || shouldReduceMotion) return;

    const intervalId = window.setInterval(() => {
      setActiveSlideIndex((currentIndex) => (currentIndex + 1) % slides.length);
    }, 5000);

    return () => window.clearInterval(intervalId);
  }, [hasMultipleSlides, isPaused, shouldReduceMotion, slides.length]);

  if (slides.length === 0) return null;

  return (
    <section data-icare-announcement className="icare-announcement" aria-label={t.announcementsAriaLabel}>
      <div className="icare-announcement__body">
        <div className="icare-announcement__viewport" aria-live="polite">
          <div
            className="icare-announcement__track"
            style={{
              transform: `translate3d(calc(-100% * ${activeSlideIndex}), 0, 0)`,
            }}
          >
            {slides.map((slide) => (
              <div key={slide} className="icare-announcement__slide">
                <p>
                  <AnnouncementSlideText text={slide} />
                </p>
              </div>
            ))}
          </div>
          {hasMultipleSlides ? (
            <p className="sr-only">{activeSlide}</p>
          ) : null}
        </div>

        <div className="icare-announcement__controls">
          <button
            type="button"
            className="icare-announcement__toggle"
            aria-label={isPaused ? t.resumeSlider : t.pauseSlider}
            aria-pressed={isPaused}
            onClick={() => setIsPaused((currentValue) => !currentValue)}
          >
            {isPaused ? <AnnouncementPlayIcon /> : <AnnouncementPauseIcon />}
          </button>
        </div>
      </div>
    </section>
  );
};
