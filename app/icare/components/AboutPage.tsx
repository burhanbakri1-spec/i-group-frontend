import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Image from 'next/image';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { ChevronDown } from 'lucide-react';
import { Language, translations } from '../translations';
import { useSiteContent } from '../hooks/useSiteContent';
import { PageHero } from './PageHero';
import { ScrollReveal, StaggerContainer } from './ui/ScrollReveal';

interface AboutPageProps {
  onNavigate?: (page: string) => void;
  lang: Language;
}

const AccordionItem = ({ title, content, isOpen, onClick }: { title: string, content: string, isOpen: boolean, onClick: () => void }) => {
  return (
    <div className="border-b border-black/5 last:border-0">
      <button 
        onClick={onClick}
        className="w-full py-8 flex items-center justify-between text-left group"
      >
        <span className={`text-[20px] md:text-[24px] font-black tracking-tight transition-colors duration-300 ${isOpen ? 'text-black' : 'text-[#706E6A]'}`}>
          {title}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          className="text-[#706E6A]"
        >
          <ChevronDown size={24} strokeWidth={1.5} />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="pb-8 text-[15px] md:text-[16px] text-[#84827E] leading-relaxed max-w-xl">
              {content}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const DEFAULT_HERO_IMAGE = '';
const DEFAULT_INTENTIONAL_IMAGE = '';
const DEFAULT_VALUES_IMAGE = '';
const DEFAULT_TEAM_1_IMAGE = '';
const DEFAULT_TEAM_2_IMAGE = '';
const DEFAULT_TEAM_3_IMAGE = '';


export const AboutPage: React.FC<AboutPageProps> = ({ onNavigate, lang }) => {
  const t = translations[lang];
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const {
    aboutHeroHeadline, aboutHeroCta, aboutHeroImage,
    aboutIntentionalTitle, aboutIntentionalText, aboutIntentionalImage,
    aboutFoundationLabel, aboutFoundationTitle, aboutFoundationText1, aboutFoundationText2,
    aboutTeamLabel, aboutTeamTitle, aboutTeamDescription,
    aboutTeamMember1Name, aboutTeamMember1Title, aboutTeamMember1Image,
    aboutTeamMember2Name, aboutTeamMember2Title, aboutTeamMember2Image,
    aboutTeamMember3Name, aboutTeamMember3Title, aboutTeamMember3Image,
    aboutValuesImage, aboutFounderNoteHeading, aboutFounderLetter,
  } = useSiteContent(lang);

  // Defense-in-depth: FALLBACK_CONTENT pre-populates these, but if a future
  // key is removed from the registry the consumer still gets a brand-safe label
  // instead of an invisible empty heading.
  const aboutFallbacks = {
    heroHeadline: aboutHeroHeadline || 'A new PHILOSOPHY on SKINCARE.',
    heroCta: aboutHeroCta || 'SHOP NOW',
    intentionalTitle: aboutIntentionalTitle || 'intentional skincare',
    intentionalText: aboutIntentionalText || 'iCare is a line of curated skincare essentials.',
    foundationLabel: aboutFoundationLabel || 'The Foundation',
    foundationTitle: aboutFoundationTitle || 'one of everything really good.',
    foundationText1: aboutFoundationText1 || 'Founded on the belief that beauty is about essentials.',
    foundationText2: aboutFoundationText2 || 'Every iCare product is developed with intent.',
    teamLabel: aboutTeamLabel || 'Meet the team',
    teamTitle: aboutTeamTitle || 'our crew.',
    teamDescription: aboutTeamDescription || 'A diverse group of experts.',
    member1Name: aboutTeamMember1Name || 'sarah jenkins',
    member1Title: aboutTeamMember1Title || 'creative director',
    member2Name: aboutTeamMember2Name || 'dr. amira fahad',
    member2Title: aboutTeamMember2Title || 'lead dermatologist',
    member3Name: aboutTeamMember3Name || 'elena rodriguez',
    member3Title: aboutTeamMember3Title || 'product development',
    founderNoteHeading: aboutFounderNoteHeading || 'A NOTE FROM OUR FOUNDER',
    founderLetter: aboutFounderLetter || 'My journey towards healthier skin inspired me.',
  };

  // TODO: Move valuesData to CMS (useSiteContent) for centralized content management.
  // Now driven from translations[lang] for bilingual support.
  const valuesData = [
    {
      title: t.aboutValuesTitle,
      content: t.aboutValuesContent,
    },
    {
      title: t.aboutProvenTitle,
      content: t.aboutProvenContent,
    },
    {
      title: t.aboutFootprintTitle,
      content: t.aboutFootprintContent,
    }
  ];

  return (
    <div className="bg-white">
      {/* 1. HERO */}
      <PageHero
        image={aboutHeroImage}
        fallbackImage={DEFAULT_HERO_IMAGE}
         alt={t.aboutAltBrand}
        title={aboutFallbacks.heroHeadline}
        ctaLabel={aboutFallbacks.heroCta}
        onCtaClick={() => onNavigate?.('shop')}
        priority
      />

      {/* 2. INTENTIONAL SKINCARE SECTION */}
      <section className="icare-index-section bg-[#F1F0ED] rounded-[12px] overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 items-center">
          <ScrollReveal direction="left" viewportMargin="-80px">
            <div className="overflow-hidden aspect-[4/5] lg:aspect-auto lg:h-[80vh] z-0">
               <ImageWithFallback 
                 src={aboutIntentionalImage || DEFAULT_INTENTIONAL_IMAGE} 
                 alt={t.aboutAltTexture} 
                className="w-full h-full object-cover"
              />
            </div>
          </ScrollReveal>
          <ScrollReveal direction="right" viewportMargin="-80px">
            <div className="bg-[#F2F1ED] p-10 md:p-20 rounded-[16px] lg:max-w-xl -mt-20 mx-4 lg:mt-0 lg:mx-0 z-10">
              <h2 className="text-[32px] md:text-[48px] font-bold tracking-tight text-[#67645E] mb-6 lowercase">
                {aboutFallbacks.intentionalTitle}
              </h2>
              <p className="text-[16px] md:text-[18px] text-[#84827E] leading-[1.6]">
                {aboutFallbacks.intentionalText}
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* 3. OUR FOUNDATION SECTION */}
      <section className="icare-index-section relative flex min-h-[42rem] items-center overflow-hidden rounded-[12px] bg-[#F1F0ED] px-4 py-8 md:min-h-[70vh] md:px-12 md:py-12 lg:min-h-[80vh]">
        <Image
          src="/images/icare/icare-model-hero.jpeg"
          alt={t.aboutAltTexture}
          fill
          sizes="100vw"
          className="object-cover object-[43%_center] md:object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#F1F0ED]/55 via-[#F1F0ED]/20 to-transparent md:from-[#F1F0ED]/72 md:via-[#F1F0ED]/28" />
        <div className="relative z-10 mx-auto w-full max-w-[1600px]">
          <div className="grid grid-cols-1 items-center lg:grid-cols-2 lg:gap-20">
            <ScrollReveal direction="left" viewportMargin="-80px">
              <div className="flex max-w-2xl flex-col space-y-8 rounded-[16px] bg-[#F1F0ED]/78 px-6 py-8 shadow-[0_16px_50px_rgba(70,58,42,0.08)] backdrop-blur-[3px] md:space-y-10 md:px-10 md:py-12 lg:px-12">
                <div className="space-y-2">
                  <span className="text-[10px] font-black tracking-[0.3em] uppercase text-[#999]">{aboutFallbacks.foundationLabel}</span>
                  <h2 className="text-[42px] md:text-[64px] font-bold leading-[0.9] tracking-[-0.04em] text-[#67645E] lowercase">
                    {aboutFallbacks.foundationTitle}
                  </h2>
                </div>
                <div className="space-y-6 max-w-lg">
                  <p className="text-[18px] text-[#84827E] leading-relaxed">
                    {aboutFallbacks.foundationText1}
                  </p>
                  <p className="text-[16px] text-[#777] leading-relaxed">
                    {aboutFallbacks.foundationText2}
                  </p>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* 4. OUR VALUES ACCORDION SECTION */}
      <section className="icare-index-section bg-[#F1F0ED] rounded-[12px] overflow-hidden py-8 px-4 md:px-8">
        <div className="max-w-[1600px] mx-auto relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8 items-stretch">
            <ScrollReveal direction="left" viewportMargin="-80px">
              <div className="rounded-[16px] overflow-hidden aspect-[4/5] lg:aspect-auto lg:h-[80vh]">
                 <ImageWithFallback 
                   src={aboutValuesImage || DEFAULT_VALUES_IMAGE} 
                   alt={t.aboutAltValues} 
                  className="w-full h-full object-cover grayscale"
                />
              </div>
            </ScrollReveal>
            <ScrollReveal direction="right" viewportMargin="-80px">
              <div className="bg-[#F2F1ED] p-8 md:p-20 rounded-[16px] lg:-ml-20 lg:my-20 relative z-10 flex flex-col justify-center">
                <div className="space-y-2">
                  {valuesData.map((item, index) => (
                    <AccordionItem 
                      key={index}
                      title={item.title}
                      content={item.content}
                      isOpen={openIndex === index}
                      onClick={() => setOpenIndex(openIndex === index ? null : index)}
                    />
                  ))}
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* 5. OUR CREW SECTION */}
      <section className="icare-index-section bg-[#F1F0ED] rounded-[12px] overflow-hidden py-10 px-4 md:px-8">
        <div className="max-w-[1600px] mx-auto space-y-12 md:space-y-16">
          <ScrollReveal direction="bottom" viewportMargin="-60px">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-black/10 pb-10">
              <div className="space-y-4">
                <span className="text-[10px] font-black tracking-[0.3em] uppercase text-[#999]">{aboutFallbacks.teamLabel}</span>
                <h2 className="text-[42px] md:text-[64px] font-bold leading-[0.9] tracking-[-0.04em] text-[#67645E] lowercase">
                  {aboutFallbacks.teamTitle}
                </h2>
              </div>
              <p className="text-[16px] text-[#706E6A] max-w-sm leading-relaxed">
                {aboutFallbacks.teamDescription}
              </p>
            </div>
          </ScrollReveal>

          <StaggerContainer className="flex overflow-x-auto md:grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 pb-10 px-2 md:px-0 no-scrollbar snap-x snap-mandatory" staggerDelay={0.1} viewportMargin="-40px">
            {/* Member 1 */}
            <ScrollReveal direction="bottom" delay={0}>
              <div className="min-w-[75vw] md:min-w-0 snap-center group space-y-6">
                <div className="aspect-[3/4] rounded-[16px] overflow-hidden bg-[#F2F1ED]">
                  <ImageWithFallback 
                    src={aboutTeamMember1Image || DEFAULT_TEAM_1_IMAGE} 
                    alt={t.aboutAltTeam} 
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                  />
                </div>
                <div className="space-y-1 px-4 text-center">
                  <h4 className="text-[20px] font-black tracking-tight text-[#67645E] lowercase">{aboutFallbacks.member1Name}</h4>
                  <p className="text-[12px] font-bold uppercase tracking-widest text-[#999]">{aboutFallbacks.member1Title}</p>
                </div>
              </div>
            </ScrollReveal>

            {/* Member 2 */}
            <ScrollReveal direction="bottom" delay={0.1}>
              <div className="min-w-[75vw] md:min-w-0 snap-center group space-y-6">
                <div className="aspect-[3/4] rounded-[16px] overflow-hidden bg-[#F2F1ED]">
                  <ImageWithFallback 
                    src={aboutTeamMember2Image || DEFAULT_TEAM_2_IMAGE} 
                    alt={t.aboutAltTeam} 
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                  />
                </div>
                <div className="space-y-1 px-4 text-center">
                  <h4 className="text-[20px] font-black tracking-tight text-[#67645E] lowercase">{aboutFallbacks.member2Name}</h4>
                  <p className="text-[12px] font-bold uppercase tracking-widest text-[#999]">{aboutFallbacks.member2Title}</p>
                </div>
              </div>
            </ScrollReveal>

            {/* Member 3 */}
            <ScrollReveal direction="bottom" delay={0.2}>
              <div className="min-w-[75vw] md:min-w-0 snap-center group space-y-6">
                <div className="aspect-[3/4] rounded-[16px] overflow-hidden bg-[#F2F1ED]">
                  <ImageWithFallback 
                    src={aboutTeamMember3Image || DEFAULT_TEAM_3_IMAGE} 
                    alt={t.aboutAltTeam} 
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                  />
                </div>
                <div className="space-y-1 px-4 text-center">
                  <h4 className="text-[20px] font-black tracking-tight text-[#67645E] lowercase">{aboutFallbacks.member3Name}</h4>
                  <p className="text-[12px] font-bold uppercase tracking-widest text-[#999]">{aboutFallbacks.member3Title}</p>
                </div>
              </div>
            </ScrollReveal>
          </StaggerContainer>
        </div>
      </section>

      {/* 6. A NOTE FROM OUR FOUNDER */}
      <section className="icare-index-section bg-[#F2F1ED] rounded-[12px] overflow-hidden py-12 px-6 md:px-12 min-h-[50vh] flex items-center">
        <ScrollReveal direction="bottom" viewportMargin="-60px">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h2 className="text-[12px] font-black tracking-[0.3em] uppercase text-[#706E6A]">
              {aboutFallbacks.founderNoteHeading}
            </h2>

            <p className="text-[20px] md:text-[26px] text-[#67645E] leading-[1.6] font-[400] tracking-tight">
              {aboutFallbacks.founderLetter}
            </p>
          </div>
        </ScrollReveal>
      </section>

      <div className="h-12 md:h-20" />
    </div>
  );
};
