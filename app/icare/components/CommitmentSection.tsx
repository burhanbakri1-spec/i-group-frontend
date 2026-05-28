'use client';

import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Language } from '../translations';
import { useSiteContent } from '../hooks/useSiteContent';
import { ScrollReveal } from './ui/ScrollReveal';

interface CommitmentSectionProps {
  lang: Language;
  onNavigate: (page: string) => void;
}

const DEFAULT_COMMITMENT_IMAGE = 'https://images.unsplash.com/photo-1603189777895-1dcbe39ec57e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200';

type CommitmentItem = {
  id: 'mission' | 'philanthropy' | 'sustainability';
  title: string;
  detail: string;
  cta: string;
};

const COMMITMENT_ITEMS: Record<Language, CommitmentItem[]> = {
  en: [
    {
      id: 'mission',
      title: 'mission',
      detail: 'We formulate with intention, not trends. Every ingredient is chosen for efficacy, safety, and skin compatibility.',
      cta: 'our values',
    },
    {
      id: 'philanthropy',
      title: 'philanthropy',
      detail: 'We partner with organizations that support women, mental health awareness, and environmental conservation.',
      cta: 'our impact',
    },
    {
      id: 'sustainability',
      title: 'sustainability',
      detail: 'From recyclable packaging to lower-waste shipping, we are working to reduce our footprint at every step.',
      cta: 'our footprint',
    },
  ],
  ar: [
    {
      id: 'mission',
      title: 'المهمة',
      detail: 'نصنع تركيباتنا بقصد ووعي، لا لمواكبة الموضة. كل مكون يختار لفعاليته وأمانه وتوافقه مع البشرة.',
      cta: 'قيمنا',
    },
    {
      id: 'philanthropy',
      title: 'العمل الخيري',
      detail: 'نتعاون مع منظمات تدعم تمكين المرأة والتوعية بالصحة النفسية والحفاظ على البيئة.',
      cta: 'أثرنا',
    },
    {
      id: 'sustainability',
      title: 'الاستدامة',
      detail: 'من التغليف القابل لإعادة التدوير إلى تقليل الهدر في الشحن، نعمل على تقليل بصمتنا في كل خطوة.',
      cta: 'بصمتنا',
    },
  ],
};

export const CommitmentSection: React.FC<CommitmentSectionProps> = ({ lang, onNavigate }) => {
  const shouldReduceMotion = useReducedMotion();
  const { commitmentHeadline, commitmentCta, commitmentImage } = useSiteContent();
  const commitmentItems = COMMITMENT_ITEMS[lang];
  const scrollInInitialX = lang === 'ar' ? 10 : -10;

  return (
    <section dir={lang === 'ar' ? 'rtl' : 'ltr'} className="icare-index-section icare-mission-section">
      <div className="icare-mission-panel">
        <ScrollReveal direction="bottom" viewportMargin="-50px">
          <motion.button
            onClick={() => onNavigate('story')}
            whileTap={shouldReduceMotion ? undefined : { scale: 0.99 }}
            className="relative isolate mb-[12.9rem] w-[10.5rem] overflow-hidden rounded-full bg-white px-8 py-2.5 text-[13px] font-bold uppercase text-[#67645E] shadow-[inset_0_0_0_1px_#67645E] transition-all duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] before:absolute before:inset-0 before:-z-10 before:origin-bottom before:scale-y-0 before:rounded-full before:bg-[#67645E] before:transition-transform before:duration-500 before:ease-[cubic-bezier(0.76,0,0.24,1)] hover:-translate-y-px hover:text-white hover:before:scale-y-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#F1F0ED] max-[980px]:mb-32"
          >
            {commitmentCta || (lang === 'en' ? 'our values' : 'قيمنا')}
          </motion.button>
        </ScrollReveal>

        {commitmentItems.map((item, index) => (
          <motion.article
            key={item.id}
            initial={shouldReduceMotion ? false : { opacity: 0, x: scrollInInitialX }}
            whileInView={shouldReduceMotion ? undefined : { opacity: 1, x: 0 }}
            viewport={{ once: false, margin: '-50px' }}
            transition={{
              delay: shouldReduceMotion ? 0 : index * 0.05,
              duration: 0.3,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="grid grid-cols-[1fr_auto] items-center gap-8 border-t border-[#67645E]/20 py-[1.55rem] last:border-b max-[980px]:grid-cols-1 max-[980px]:gap-3"
          >
            <div>
              <h3 className="m-0 text-[clamp(1.65rem,2.15vw,2.25rem)] font-bold lowercase leading-[1.1] tracking-normal text-[#67645E]">
                {item.title}
              </h3>
              <p className="m-0 mt-1 max-w-[34rem] text-[14px] leading-[1.45] text-[#84827E] md:text-[15px]">
                {commitmentHeadline && index === 0 ? commitmentHeadline : item.detail}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('story')}
              className="self-center text-[13px] font-bold uppercase text-[#67645E] underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/70"
            >
              {item.cta}
            </button>
          </motion.article>
        ))}
      </div>

      <ScrollReveal direction="right" viewportMargin="-80px">
        <motion.div
          className="icare-mission-image relative"
          initial={shouldReduceMotion ? false : { opacity: 0 }}
          whileInView={shouldReduceMotion ? undefined : { opacity: 1 }}
viewport={{ once: false }}
        >
          <ImageWithFallback
            src={commitmentImage || DEFAULT_COMMITMENT_IMAGE}
            alt=""
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-black/5" />
        </motion.div>
      </ScrollReveal>
    </section>
  );
};
