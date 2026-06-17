import React from 'react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { ScrollReveal, StaggerContainer } from './ui/ScrollReveal';
import { Language, translations } from '../translations';
import { useContent } from '../hooks/useContent';

interface StoryProps {
  onNavigate: (page: string) => void;
  lang: Language;
}

const DEFAULT_STORY_IMAGE = 'https://images.unsplash.com/photo-1501876725168-00c445821c9e?q=80&w=1000';

export const Story: React.FC<StoryProps> = ({ onNavigate, lang }) => {
  const t = translations[lang];
  // ContentProvider key — BE provides Unsplash default via
  // PagesService.onModuleInit() (registered in e-commerce-backend).
  const { val: storyImageCp } = useContent('home.story.image', { lang, fallback: '' });

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">

        {/* Left: Image slides in from the left */}
        <ScrollReveal direction="left" viewportMargin="-80px">
          <div className="rounded-[32px] overflow-hidden aspect-[4/5]">
            <ImageWithFallback 
              src={storyImageCp || DEFAULT_STORY_IMAGE}
              alt={t.storyAltOurStory}
              className="w-full h-full object-cover"
            />
          </div>
        </ScrollReveal>

        {/* Right: Text column with staggered reveals */}
        <StaggerContainer className="space-y-10" staggerDelay={0.08} viewportMargin="-80px">
          <ScrollReveal direction="bottom" delay={0}>
            <h2 className="text-[56px] font-black tracking-[-0.03em] leading-none text-[#5C5A56]">
              {t.storyOurPhilosophy}
            </h2>
          </ScrollReveal>

          <ScrollReveal direction="bottom" delay={0.08}>
            <p className="text-[20px] text-[#706E6A] leading-relaxed max-w-lg">
              {t.storyP1}
            </p>
          </ScrollReveal>

          <ScrollReveal direction="bottom" delay={0.14}>
            <p className="text-[20px] text-[#706E6A] leading-relaxed max-w-lg">
              {t.storyP2}
            </p>
          </ScrollReveal>

          <ScrollReveal direction="bottom" delay={0.20}>
            <button
              onClick={() => onNavigate('shop')}
              className="text-[14px] font-black uppercase tracking-widest border-b-2 border-black pb-1 hover:opacity-50 transition-opacity"
            >
              {t.storyExploreRange}
            </button>
          </ScrollReveal>
        </StaggerContainer>
      </div>
    </div>
  );
};
