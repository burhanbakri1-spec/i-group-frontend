import React from 'react';
import { motion } from 'framer-motion';
import { Instagram, Youtube, Music2, Facebook, Ghost } from 'lucide-react';
import { Language } from '../translations';
import { useSiteContent } from '../hooks/useSiteContent';

interface FooterProps {
  lang: Language;
  onNavigate?: (page: string) => void;
}

const SOCIAL_ICON_MAP: Record<string, React.ComponentType<{ size: number; strokeWidth: number }>> = {
  instagram: Instagram,
  youtube: Youtube,
  tiktok: Music2,
  facebook: Facebook,
  snapchat: Ghost,
};

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
    footerDnsLink,
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
  } = useSiteContent();

  const socialLinks = rawSocialLinks.map(({ platform, url }) => {
    const name = platform.charAt(0).toUpperCase() + platform.slice(1);
    const Icon = SOCIAL_ICON_MAP[platform.toLowerCase()] || Facebook;
    return { name, url, Icon };
  });

  return (
    <footer className="bg-[#F2F0EA] border-t border-black/10 font-sans mx-4 md:mx-8 mb-8 rounded-[16px] overflow-hidden">
      {/* 1. HUGE LOGO SECTION */}
      <div className="w-full py-12 md:py-20 border-b border-black/10 overflow-hidden flex justify-center items-center">
        <motion.h2 
          className="text-[28vw] leading-[0.75] font-[900] tracking-[-0.06em] text-[#5C5A56] lowercase select-none"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        >
          icare
        </motion.h2>
      </div>

      {/* 2. MAIN FOOTER CONTENT */}
      <div className="max-w-full mx-auto grid grid-cols-1 lg:grid-cols-12">
        
        {/* Newsletter Section */}
        <div className="lg:col-span-4 p-8 md:p-12 space-y-8 border-b lg:border-b-0 border-black/10">
          <div className="space-y-4">
            <p className="text-[15px] text-[#5C5A56] leading-tight font-medium">
              {footerNewsletterText}
            </p>
            <p className="text-[14px] text-[#706E6A] leading-relaxed max-w-sm">
              {footerNewsletterSubtitle}
            </p>
          </div>
          
          <div className="space-y-4">
            <div className="flex border border-black/10 bg-white">
              <input 
                type="email" 
                placeholder={footerEmailPlaceholder} 
                className="bg-transparent border-none outline-none flex-1 text-[13px] px-4 py-3 placeholder:text-[#BBB]"
              />
              <button className="text-[11px] font-bold uppercase tracking-widest px-6 py-3 border-l border-black/10 hover:bg-[#5C5A56] hover:text-white transition-all">
                {footerSubscribeBtn}
              </button>
            </div>
            <p className="text-[11px] text-[#999] leading-tight">
                {footerPrivacyNotice}
            </p>
          </div>
        </div>

        {/* Links Grid */}
        <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-4 divide-x divide-black/10 border-l border-black/10">
          
          {/* Navigate */}
          <div className="p-8 md:p-12 space-y-6">
            <h4 className="text-[12px] font-bold uppercase tracking-widest text-[#5C5A56]">{footerNavigateTitle}</h4>
            <ul className="space-y-3">
              <li><button onClick={() => onNavigate?.('shop')} className="text-[14px] text-[#706E6A] hover:text-black transition-colors text-left">{footerLinkShop}</button></li>
              <li><button onClick={() => onNavigate?.('story')} className="text-[14px] text-[#706E6A] hover:text-black transition-colors text-left">{footerLinkStory}</button></li>
              <li><button onClick={() => onNavigate?.('vlog')} className="text-[14px] text-[#706E6A] hover:text-black transition-colors text-left">{footerLinkVlog}</button></li>
              <li><button onClick={() => onNavigate?.('find-us')} className="text-[14px] text-[#706E6A] hover:text-black transition-colors text-left">{footerLinkFindUs}</button></li>
            </ul>
          </div>

          {/* Social — dynamic from settings */}
          <div className="p-8 md:p-12 space-y-6">
            <h4 className="text-[12px] font-bold uppercase tracking-widest text-[#5C5A56]">{footerSocialTitle}</h4>
            <ul className="space-y-3">
              {socialLinks.map((social) => (
                <li key={social.name}>
                  <motion.a
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-[14px] text-[#706E6A] hover:text-black transition-colors group"
                    whileHover={{ x: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <motion.div whileHover={{ rotate: 15, scale: 1.2 }}>
                      <social.Icon size={14} strokeWidth={1.5} />
                    </motion.div>
                    <span>{social.name}</span>
                  </motion.a>
                </li>
              ))}
            </ul>
          </div>

          {/* Official */}
          <div className="p-8 md:p-12 space-y-6">
            <h4 className="text-[12px] font-bold uppercase tracking-widest text-[#5C5A56]">{footerOfficialTitle}</h4>
            <ul className="space-y-3">
              <li><button onClick={() => onNavigate?.('privacy')} className="text-[14px] text-[#706E6A] hover:text-black transition-colors text-left">{footerLinkPrivacy}</button></li>
              <li><button onClick={() => onNavigate?.('terms')} className="text-[14px] text-[#706E6A] hover:text-black transition-colors text-left">{footerLinkTerms}</button></li>
              <li><button onClick={() => onNavigate?.('accessibility')} className="text-[14px] text-[#706E6A] hover:text-black transition-colors text-left">{footerLinkAccessibility}</button></li>
              <li><button onClick={() => onNavigate?.('faq')} className="text-[14px] text-[#706E6A] hover:text-black transition-colors text-left">{footerLinkFaq}</button></li>
              <li><button onClick={() => onNavigate?.('contact')} className="text-[14px] text-[#706E6A] hover:text-black transition-colors text-left">{footerLinkContact}</button></li>
            </ul>
          </div>

          {/* Support */}
          <div className="p-8 md:p-12 space-y-6">
            <h4 className="text-[12px] font-bold uppercase tracking-widest text-[#5C5A56]">{footerSupportTitle}</h4>
            <div className="space-y-6">
              <div className="space-y-1">
                <p className="text-[13px] text-[#706E6A]">{contactSupportHours}</p>
                <p className="text-[13px] text-[#706E6A]">{footerSupportSubtext}</p>
              </div>
              <ul className="space-y-3">
                <li><button className="text-[13px] text-[#706E6A] hover:text-black transition-colors text-left leading-tight">{footerDnsLink}</button></li>
                <li><button className="text-[14px] text-[#706E6A] hover:text-black transition-colors text-left">{footerCookieLink}</button></li>
              </ul>
              <div className="pt-4">
                <p className="text-[13px] text-[#706E6A]">{footerCopyright}</p>
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
      <div className="border-t border-black/10 py-4 text-center">
        <p className="text-[10px] text-[#999] uppercase tracking-[0.2em]">{footerCountryRegion}</p>
      </div>
    </footer>
  );
};
