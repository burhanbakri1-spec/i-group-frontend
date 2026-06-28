import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Language } from '../translations';
import { useSiteContent } from '../hooks/useSiteContent';
import { ScrollReveal } from './ui/ScrollReveal';

interface PromoSectionProps {
  lang: Language;
  onNavigate: (page: string) => void;
}

export const PromoSection: React.FC<PromoSectionProps> = ({ lang, onNavigate }) => {
  const shouldReduceMotion = useReducedMotion();
  const { promoHeadline, promoDescription, promoCtaLabel, promoImage } = useSiteContent(lang);
  const promoFallbacks = {
    headline: promoHeadline || 'chilly little flush',
    description: promoDescription || 'Warm up your cheeks with Pocket Blush. A touch of creamy, long-wearing color that mimics the flush you get after stepping in from the cold.',
    cta: promoCtaLabel || 'POCKET BLUSH',
    image: promoImage || 'https://images.unsplash.com/photo-1653784097013-786a8965ea3b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200',
  };

  const headline = lang === 'en'
    ? promoFallbacks.headline
    : 'احمرار صغير بارد';
  const description = lang === 'en'
    ? promoFallbacks.description
    : 'دفئي خديك مع Pocket Blush. لمسة من اللون الكريمي طويل الأمد الذي يحاكي الاحمرار الذي تحصلين عليه بعد الدخول من البرد.';
  const cta = lang === 'en' ? promoFallbacks.cta : 'بوكيت بلاش';

  const reveal = shouldReduceMotion
    ? {}
    : {
        initial: { opacity: 0, y: 16 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: false, margin: '-80px' },
        transition: { duration: 0.55, ease: [0.76, 0, 0.24, 1] },
      };

  return (
    <section className="icare-index-section icare-promo-banner">
      <ScrollReveal direction="bottom" viewportMargin="-80px">
        <motion.div className="icare-promo-banner__frame" {...reveal}>
          <div className="icare-promo-banner__media" aria-hidden="true">
            <ImageWithFallback
              src={promoFallbacks.image}
              alt=""
              className="icare-promo-banner__image"
            />
            <div className="icare-promo-banner__shade" />
          </div>

          <div className="icare-promo-banner__content">
            <div className="icare-promo-banner__content-inner">
              <h2 className="icare-promo-banner__headline">
                <b>{headline}</b>
              </h2>
              <p className="icare-promo-banner__description">{description}</p>
              <button
                type="button"
                className="icare-promo-banner__cta"
                onClick={() => onNavigate('shop')}
              >
                {cta}
              </button>
            </div>
          </div>
        </motion.div>
      </ScrollReveal>
    </section>
  );
};
