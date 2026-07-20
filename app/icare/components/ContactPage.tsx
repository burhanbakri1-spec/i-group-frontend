import React from 'react';
import { useRouter } from 'next/navigation';
import { Language, translations } from '../translations';
import { useSiteContent } from '../hooks/useSiteContent';
import { PageHero } from './PageHero';
import { ScrollReveal } from './ui/ScrollReveal';

interface ContactPageProps {
  lang: Language;
}

export const ContactPage: React.FC<ContactPageProps> = ({ lang }) => {
  const router = useRouter();
  const t = translations[lang];
  const {
    contactHeroHeading,
    contactHeroImage,
    contactInfoTitle,
    contactSupportInfo,
    contactEmail,
    contactEmailLabel,
    contactWholesaleEmail,
    contactWholesaleLabel,
    contactFaqTitle,
    contactFaqText,
    contactFaqCta,
  } = useSiteContent(lang);

  const contactFallbacks = {
    email: contactEmail || 'hello@icare.com',
    emailLabel: contactEmailLabel || 'email',
    wholesaleEmail: contactWholesaleEmail || 'wholesale@icare.com',
    wholesaleLabel: contactWholesaleLabel || 'wholesale',
    faqTitle: contactFaqTitle || 'frequently asked questions',
  };

  return (
    <div className="min-h-screen bg-white pb-32">
      <PageHero
        image={contactHeroImage}
        fallbackImage=""
        alt="Contact iCare"
        title={contactHeroHeading || t.pages.contact.heroHeading}
        subtitle={t.pages.contact.heroSubtitle}
        priority
      />

      <section className="icare-index-section icare-contact-section">
        <div className="icare-contact-section__inner">
          <ScrollReveal direction="bottom" viewportMargin="-60px">
            <div className="icare-contact-section__copy">
              <h2 className="icare-contact-section__title">
                {contactInfoTitle || t.pages.contact.infoTitle}
              </h2>
              <p className="icare-contact-section__lede">
                {contactSupportInfo || t.pages.contact.supportInfo}
              </p>

              <div className="icare-contact-section__channels">
                <div className="icare-contact-section__channel">
                  <span className="icare-contact-section__label">{contactFallbacks.emailLabel}</span>
                  <a href={`mailto:${contactFallbacks.email}`} className="icare-contact-section__link">
                    {contactFallbacks.email}
                  </a>
                </div>

                <div className="icare-contact-section__channel">
                  <span className="icare-contact-section__label">{contactFallbacks.wholesaleLabel}</span>
                  <a href={`mailto:${contactFallbacks.wholesaleEmail}`} className="icare-contact-section__link">
                    {contactFallbacks.wholesaleEmail}
                  </a>
                </div>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal direction="bottom" delay={0.1} viewportMargin="-40px">
            <div className="icare-contact-section__faq">
              <h3 className="icare-contact-section__faq-title">{contactFallbacks.faqTitle}</h3>
              <p className="icare-contact-section__faq-text">
                {contactFaqText || t.pages.contact.faqText}
              </p>
              <button
                type="button"
                onClick={() => router.push('/icare/faq')}
                className="icare-contact-section__faq-cta"
              >
                {contactFaqCta || t.pages.contact.faqCta}
              </button>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
};
