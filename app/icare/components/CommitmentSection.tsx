'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
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
  const { commitmentImage } = useSiteContent(lang);
  const commitmentItems = COMMITMENT_ITEMS[lang];
  const scrollInInitialX = lang === 'ar' ? 10 : -10;
  const [activeId, setActiveId] = useState<CommitmentItem['id']>('mission');

  const activeItem = commitmentItems.find((item) => item.id === activeId) ?? commitmentItems[0];

  return (
    <section dir={lang === 'ar' ? 'rtl' : 'ltr'} className="icare-index-section icare-mission-section">
      <ScrollReveal direction="right" viewportMargin="-80px">
        <div className="icare-mission-image">
          <ImageWithFallback
            src={commitmentImage || DEFAULT_COMMITMENT_IMAGE}
            alt=""
            className="icare-mission-image__media"
          />
          <div className="icare-mission-image__shade" aria-hidden="true" />
        </div>
      </ScrollReveal>

      <div className="icare-mission-panel">
        <div className="icare-mission-copy">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeId}
              initial={shouldReduceMotion ? false : { opacity: 0, y: 6 }}
              animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
              exit={shouldReduceMotion ? undefined : { opacity: 0, y: -6 }}
              transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            >
              <p className="icare-mission-detail">{activeItem.detail}</p>
              <button
                type="button"
                onClick={() => onNavigate('story')}
                className="icare-mission-cta"
              >
                {activeItem.cta}
              </button>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="icare-mission-tabs" role="tablist" aria-label={lang === 'en' ? 'Our values' : 'قيمنا'}>
          {commitmentItems.map((item, index) => (
            <motion.article
              key={item.id}
              role="tab"
              aria-selected={activeId === item.id}
              onMouseEnter={() => setActiveId(item.id)}
              onClick={() => setActiveId(item.id)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  setActiveId(item.id);
                }
              }}
              tabIndex={0}
              initial={shouldReduceMotion ? false : { x: scrollInInitialX }}
              whileInView={shouldReduceMotion ? undefined : { x: 0 }}
              viewport={{ once: false, margin: '-50px' }}
              transition={{
                delay: shouldReduceMotion ? 0 : index * 0.05,
                duration: 0.3,
                ease: [0.22, 1, 0.36, 1],
              }}
              className={`icare-mission-tab${activeId === item.id ? ' is-active' : ''}`}
            >
              <h3 className="icare-mission-tab__title">{item.title}</h3>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
};
