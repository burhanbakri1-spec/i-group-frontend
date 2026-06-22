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
    <div className="min-h-screen bg-[#F1F0ED] pb-32">
      <PageHero
        image={contactHeroImage}
        fallbackImage="https://images.unsplash.com/photo-1729952620303-4dc47fb5d93a?q=80&w=2000"
        alt="Contact iCare"
        title={contactHeroHeading || t.pages.contact.heroHeading}
        subtitle={t.pages.contact.heroSubtitle}
        priority
      />

      {/* Main Content Layout */}
      <div className="max-w-[1200px] mx-auto px-4 md:px-12 -mt-20 md:-mt-32 relative z-10 pb-20">
        <div className="max-w-[600px] mx-auto space-y-12">
          
          {/* Info & Guidelines */}
          <ScrollReveal direction="left" viewportMargin="-60px">
            <div className="space-y-8 md:space-y-16 pt-8 md:pt-24">
              <div className="space-y-4 md:space-y-6 px-2 md:px-0">
                <h2 className="text-[28px] md:text-[42px] font-bold lowercase tracking-tight text-[#67645E] leading-tight">
                  {contactInfoTitle || t.pages.contact.infoTitle}
                </h2>
                <div className="space-y-4 md:space-y-6 text-[13px] md:text-[16px] text-[#5C5A56] leading-relaxed font-medium">
                  <p className="opacity-80">
                    {contactSupportInfo || t.pages.contact.supportInfo}
                  </p>
                  <div className="pt-4 md:pt-6 border-t border-black/5 space-y-4 md:space-y-6">
                    <div>
                      <span className="block text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-black/40 mb-1">{contactFallbacks.emailLabel}</span>
                      <a href={`mailto:${contactFallbacks.email}`} className="text-[14px] md:text-[18px] text-black font-black hover:opacity-50 transition-opacity lowercase">{contactFallbacks.email}</a>
                    </div>
                    <div>
                      <span className="block text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-black/40 mb-1">{contactFallbacks.wholesaleLabel}</span>
                      <a href={`mailto:${contactFallbacks.wholesaleEmail}`} className="text-[14px] md:text-[18px] text-black font-black hover:opacity-50 transition-opacity lowercase">{contactFallbacks.wholesaleEmail}</a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* FAQ Link */}
          <ScrollReveal direction="bottom" delay={0.1} viewportMargin="-40px">
            <div className="bg-[#F2F1ED] p-6 md:p-10 rounded-[24px] md:rounded-[40px] space-y-4 border border-black/[0.03]">
              <h3 className="text-[9px] md:text-[11px] font-black uppercase tracking-[0.2em]">{contactFallbacks.faqTitle}</h3>
              <p className="text-[12px] md:text-[14px] text-[#5C5A56] leading-relaxed opacity-70">
                {contactFaqText || t.pages.contact.faqText}
              </p>
              <button
                onClick={() => router.push('/icare/faq')}
                className="text-[10px] md:text-[12px] font-black uppercase tracking-[0.2em] border-b-2 border-black pb-1 hover:opacity-50 transition-all inline-block"
              >
                {contactFaqCta || t.pages.contact.faqCta}
              </button>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </div>
  );
};
