import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { translations, Language } from '../translations';
import { useSiteContent } from '../hooks/useSiteContent';
import { getSocialPlatformIcon, getSocialPlatformLabel } from '../lib/social-links';

interface FooterProps {
  lang: Language;
  onNavigate?: (page: string) => void;
}

const FOCUS_VISIBLE_CLASS = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7B7872]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#F1F0ED]';
const FOOTER_LINK_CLASS = `min-h-[44px] flex items-center rounded-sm text-[14px] text-[#84827E] hover:text-[#5C5A56] transition-colors text-left ${FOCUS_VISIBLE_CLASS}`;

export const Footer: React.FC<FooterProps> = ({ lang, onNavigate }) => {
  const {
    footerNewsletterText,
    footerNewsletterSubtitle,
    footerCopyright,
    footerCountryRegion,
    footerEmailPlaceholder,
    footerSubscribeBtn,
    footerPrivacyNotice,
    footerNavigateTitle,
    footerSocialTitle,
    footerOfficialTitle,
    footerSupportTitle,
    footerSupportSubtext,
    footerCookieLink,
    footerLinkShop,
    footerLinkStory,
    footerLinkVlog,
    footerLinkFindUs,
    footerLinkPrivacy,
    footerLinkTerms,
    footerLinkAccessibility,
    footerLinkFaq,
    footerLinkContact,
    contactSupportHours,
    socialLinks: rawSocialLinks,
  } = useSiteContent(lang);

  const [newsletterEmail, setNewsletterEmail] = React.useState('');
  const t = translations[lang];
  const shouldReduceMotion = useReducedMotion();
  const calmTween = shouldReduceMotion ? { duration: 0 } : { duration: 0.24, ease: 'easeOut' as const };

  const handleNewsletterSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!newsletterEmail.trim()) return;
    alert(t.ui.thankYouForSubscribing);
    setNewsletterEmail('');
  };

  const socialLinks = rawSocialLinks.map(({ platform, url }) => {
    const name = getSocialPlatformLabel(platform);
    const Icon = getSocialPlatformIcon(platform);
    return { name, url, Icon };
  });

  return (
    <footer className="bg-[#F1F0ED] font-sans mx-4 sm:mx-6 lg:mx-8 mb-8 rounded-[24px] overflow-hidden border border-[#DDDDDD]">
      {/* 1. LOGO SECTION */}
      <div className="w-full py-16 md:py-24 overflow-hidden flex justify-center items-center">
        <motion.h2 
          className="text-[clamp(4rem,18vw,13rem)] leading-[0.82] font-[900] tracking-[-0.055em] text-[#84827E] lowercase select-none"
          initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }}
          transition={calmTween}
        >
          icare
        </motion.h2>
      </div>

      {/* 2. MAIN FOOTER CONTENT */}
      <div className="max-w-full mx-auto grid grid-cols-1 lg:grid-cols-12">
        
        {/* Newsletter Section */}
        <div className="lg:col-span-5 p-8 md:p-12 space-y-8 border-b lg:border-b-0 border-[#D9D7D2]">
          <div className="space-y-4">
            <p className="text-[15px] text-[#67645E] leading-tight font-medium">
              {footerNewsletterText}
            </p>
            <p className="text-[14px] text-[#67645E] leading-relaxed max-w-sm">
              {footerNewsletterSubtitle}
            </p>
          </div>
          
          <div className="space-y-4">
            <form className="icare-footer-newsletter-form" onSubmit={handleNewsletterSubmit}>
              <label className="sr-only" htmlFor="icare-footer-newsletter-email">
                {footerEmailPlaceholder}
              </label>
              <input
                id="icare-footer-newsletter-email"
                type="email"
                autoComplete="email"
                required
                placeholder={footerEmailPlaceholder}
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                className={`icare-footer-newsletter-input ${FOCUS_VISIBLE_CLASS}`}
              />
              <button type="submit" className={`icare-footer-newsletter-button ${FOCUS_VISIBLE_CLASS}`}>
                {footerSubscribeBtn}
              </button>
            </form>
            <p className="text-[11px] text-[#84827E] leading-tight">
                {footerPrivacyNotice}
            </p>
          </div>
        </div>

        {/* Links Grid */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 divide-x divide-[#D9D7D2] border-l border-[#D9D7D2]">
          
          {/* Navigate */}
          <div className="p-8 md:p-12 space-y-6">
            <h4 className="text-[12px] font-bold uppercase tracking-widest text-[#67645E]">{footerNavigateTitle}</h4>
            <ul className="space-y-3">
              <li><button onClick={() => onNavigate?.('shop')} className={FOOTER_LINK_CLASS}>{footerLinkShop}</button></li>
              <li><button onClick={() => onNavigate?.('story')} className={FOOTER_LINK_CLASS}>{footerLinkStory}</button></li>
              <li><button onClick={() => onNavigate?.('vlog')} className={FOOTER_LINK_CLASS}>{footerLinkVlog}</button></li>
              <li><button onClick={() => onNavigate?.('find-us')} className={FOOTER_LINK_CLASS}>{footerLinkFindUs}</button></li>
            </ul>
          </div>

          {/* Social — dynamic from backend */}
          <div className="p-8 md:p-12 space-y-6">
            <h4 className="text-[12px] font-bold uppercase tracking-widest text-[#67645E]">{footerSocialTitle}</h4>
            {socialLinks.length > 0 ? (
              <ul className="space-y-3">
                {socialLinks.map((social) => (
                  <li key={social.name}>
                    <motion.a
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center gap-2 min-h-[44px] text-[14px] text-[#84827E] hover:text-[#5C5A56] transition-colors group ${FOCUS_VISIBLE_CLASS}`}
                      whileHover={shouldReduceMotion ? undefined : { x: 2 }}
                      transition={calmTween}
                    >
                      <motion.div whileHover={shouldReduceMotion ? undefined : { rotate: 6, scale: 1.05 }} transition={calmTween}>
                        <social.Icon size={14} strokeWidth={1.5} />
                      </motion.div>
                      <span>{social.name}</span>
                    </motion.a>
                  </li>
                ))}
              </ul>
            ) : (
               <p className="text-[12px] text-[#84827E] italic">{t.socialLinksComingSoon}</p>
            )}
          </div>

          {/* Official */}
          <div className="p-8 md:p-12 space-y-6">
            <h4 className="text-[12px] font-bold uppercase tracking-widest text-[#67645E]">{footerOfficialTitle}</h4>
            <ul className="space-y-3">
              <li><button onClick={() => onNavigate?.('privacy')} className={FOOTER_LINK_CLASS}>{footerLinkPrivacy}</button></li>
              <li><button onClick={() => onNavigate?.('terms')} className={FOOTER_LINK_CLASS}>{footerLinkTerms}</button></li>
              <li><button onClick={() => onNavigate?.('accessibility')} className={FOOTER_LINK_CLASS}>{footerLinkAccessibility}</button></li>
              <li><button onClick={() => onNavigate?.('faq')} className={FOOTER_LINK_CLASS}>{footerLinkFaq}</button></li>
              <li><button onClick={() => onNavigate?.('contact')} className={FOOTER_LINK_CLASS}>{footerLinkContact}</button></li>
            </ul>
          </div>

          {/* Support */}
          <div className="p-8 md:p-12 space-y-6">
            <h4 className="text-[12px] font-bold uppercase tracking-widest text-[#67645E]">{footerSupportTitle}</h4>
            <div className="space-y-6">
              <div className="space-y-1">
                <p className="text-[13px] text-[#67645E]">{contactSupportHours}</p>
                <p className="text-[13px] text-[#67645E]">{footerSupportSubtext}</p>
              </div>
              <ul className="space-y-3">
                <li><button onClick={() => onNavigate?.('privacy')} className={FOOTER_LINK_CLASS}>{footerCookieLink}</button></li>
              </ul>
              <div className="pt-4">
                <p className="text-[13px] text-[#84827E]">{footerCopyright}</p>
                <div className="flex gap-2 mt-4 opacity-40">
                  <div className="w-8 h-5 bg-black/20 rounded-sm" />
                  <div className="w-8 h-5 bg-black/20 rounded-sm" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom Info Bar */}
      <div className="border-t border-[#D9D7D2] py-6 text-center">
        <p className="text-[10px] text-[#84827E] uppercase tracking-[0.2em]">{footerCountryRegion}</p>
      </div>
    </footer>
  );
};
