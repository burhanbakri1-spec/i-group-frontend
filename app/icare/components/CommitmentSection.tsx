'use client';

import React, { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Language } from '../translations';
import { useSiteContent } from '../hooks/useSiteContent';

interface CommitmentSectionProps {
  lang: Language;
  onNavigate: (page: string) => void;
}

const DEFAULT_COMMITMENT_IMAGE = 'https://images.unsplash.com/photo-1603189777895-1dcbe39ec57e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200';

type CommitmentItem = {
  id: 'mission' | 'philanthropy' | 'sustainability';
  title: string;
  detail: string;
};

const COMMITMENT_ITEMS: Record<Language, CommitmentItem[]> = {
  en: [
    {
      id: 'mission',
      title: 'mission',
      detail: 'We formulate with intention — not trends. Every ingredient is chosen for its efficacy, safety, and skin compatibility. Our products are dermatologist-tested, vegan, and never tested on animals. We believe skincare should be honest, transparent, and accessible to everyone.',
    },
    {
      id: 'philanthropy',
      title: 'philanthropy',
      detail: 'We partner with organizations that support women\'s empowerment, mental health awareness, and environmental conservation. A portion of every purchase goes toward initiatives that create meaningful impact in communities around the world.',
    },
    {
      id: 'sustainability',
      title: 'sustainability',
      detail: 'From recyclable packaging made with post-consumer materials to carbon-neutral shipping, we\'re working to minimize our footprint at every step. Our refill program and minimalist packaging design reduce waste without compromising quality.',
    },
  ],
  ar: [
    {
      id: 'mission',
      title: 'المهمة',
      detail: 'نصنع تركيباتنا بقصد ووعي — لا لمواكبة الموضة. كل مكون يُختار لفعاليته وأمانه وتوافقه مع البشرة. منتجاتنا مختبرة من أطباء الجلد، نباتية، ولم تُختبر على الحيوانات. نؤمن أن العناية بالبشرة يجب أن تكون صادقة وشفافة ومتاحة للجميع.',
    },
    {
      id: 'philanthropy',
      title: 'العمل الخيري',
      detail: 'نتعاون مع منظمات تدعم تمكين المرأة والتوعية بالصحة النفسية والحفاظ على البيئة. يذهب جزء من كل عملية شراء لدعم مبادرات تصنع أثراً حقيقياً في المجتمعات حول العالم.',
    },
    {
      id: 'sustainability',
      title: 'الاستدامة',
      detail: 'من التغليف القابل لإعادة التدوير المصنوع من مواد معاد تدويرها إلى الشحن المحايد للكربون، نعمل على تقليل بصمتنا البيئية في كل خطوة. برنامج إعادة التعبئة وتصميم التغليف البسيط يقللان النفايات دون المساس بالجودة.',
    },
  ],
};

export const CommitmentSection: React.FC<CommitmentSectionProps> = ({ lang, onNavigate }) => {
  const shouldReduceMotion = useReducedMotion();
  const { commitmentHeadline, commitmentCta, commitmentImage } = useSiteContent();
  const [openItemId, setOpenItemId] = useState<CommitmentItem['id'] | null>(null);
  const commitmentItems = COMMITMENT_ITEMS[lang];
  const scrollInInitialX = lang === 'ar' ? 10 : -10;

  const toggleItem = (itemId: CommitmentItem['id']) => {
    setOpenItemId((currentItemId) => currentItemId === itemId ? null : itemId);
  };

  return (
    <section dir={lang === 'ar' ? 'rtl' : 'ltr'} className="px-4 md:px-8 py-4 md:py-8 bg-white">
      <div className="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8">
        
        {/* Left Side: Info Box */}
        <div className="bg-[#EDECEB] rounded-[12px] p-8 md:p-14 lg:p-16 flex flex-col justify-between min-h-[460px] md:min-h-[650px]">
          <div>
            <motion.div
              initial={shouldReduceMotion ? false : { opacity: 0, y: 14 }}
              whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <h2 className="text-[22px] md:text-[36px] font-[500] leading-[1.25] text-[#67645E] mb-10 max-w-lg">
                {commitmentHeadline ? (
                  <span>{commitmentHeadline}</span>
                ) : (
                  lang === 'en' 
                    ? <>From consciously-sourced ingredients to packaging made with post-consumer recycled materials, we&apos;re committed to <span className="text-[#67645E] font-[900]">MINDFUL SKINCARE.</span></>
                    : <>من المكونات المختارة بوعي إلى التغليف المصنوع من مواد معاد تدويرها، نحن ملتزمون بـ<span className="text-[#67645E] font-[900]">العناية الواعية بالبشرة.</span></>
                )}
              </h2>
              
              <motion.button 
                onClick={() => onNavigate('story')}
                whileTap={shouldReduceMotion ? undefined : { scale: 0.99 }}
                className="border border-[#DDDDDD] bg-white rounded-full px-8 py-3 text-[10px] font-black tracking-[0.2em] uppercase text-[#67645E] hover:bg-[#67645E] hover:text-white transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#EDECEB]"
              >
                {commitmentCta || (lang === 'en' ? 'OUR FOOTPRINT' : 'بصمتنا')}
              </motion.button>
            </motion.div>
          </div>

          {/* Bottom List / Accordion Style */}
          <div className="mt-16">
            {commitmentItems.map((item, index) => {
              const isOpen = openItemId === item.id;
              const buttonId = `commitment-${item.id}-button`;
              const panelId = `commitment-${item.id}-panel`;

              return (
              <motion.div 
                key={item.id}
                initial={shouldReduceMotion ? false : { opacity: 0, x: scrollInInitialX }}
                whileInView={shouldReduceMotion ? undefined : { opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ 
                  delay: shouldReduceMotion ? 0 : index * 0.05,
                  duration: 0.3,
                  ease: [0.22, 1, 0.36, 1]
                }}
                className={`border-t border-[#DDDDDD] ${index === commitmentItems.length - 1 ? 'border-b' : ''}`}
              >
                <button
                  id={buttonId}
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => toggleItem(item.id)}
                  className="group flex w-full items-center justify-between gap-6 rounded-[12px] py-6 text-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#EDECEB]"
                >
                  <span
                    className="text-[20px] md:text-[28px] font-[900] text-[#84827E] group-hover:text-[#67645E] group-focus-visible:text-[#67645E] transition-colors duration-300 lowercase"
                  >
                    {item.title}
                  </span>
                  <span
                    className="w-8 h-8 shrink-0 rounded-full border border-[#DDDDDD] flex items-center justify-center bg-white group-hover:bg-[#67645E] group-hover:text-white group-focus-visible:bg-[#67645E] group-focus-visible:text-white transition-colors duration-300"
                  >
                    <svg
                      aria-hidden="true"
                      className={`${isOpen ? 'rotate-45' : 'rotate-0'} ${shouldReduceMotion ? 'transition-none' : 'transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]'}`}
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M12 5v14" />
                      <path d="M5 12h14" />
                    </svg>
                  </span>
                </button>

                {shouldReduceMotion ? (
                  <div
                    id={panelId}
                    role="region"
                    aria-labelledby={buttonId}
                    hidden={!isOpen}
                    className="pb-6 pe-12"
                  >
                    <p className="max-w-xl text-[14px] md:text-[15px] leading-[1.8] text-[#84827E]">
                      {item.detail}
                    </p>
                  </div>
                ) : (
                  <motion.div
                    id={panelId}
                    role="region"
                    aria-labelledby={buttonId}
                    aria-hidden={!isOpen}
                    initial={false}
                    animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
                    transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="pb-6 pe-12">
                      <p className="max-w-xl text-[14px] md:text-[15px] leading-[1.8] text-[#84827E]">
                        {item.detail}
                      </p>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            );
            })}
          </div>
        </div>

        {/* Right Side: Visual Box */}
        <motion.div 
          className="relative aspect-square md:aspect-auto h-[400px] md:h-full overflow-hidden rounded-[12px]"
        >
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0 }}
            whileInView={shouldReduceMotion ? undefined : { opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="w-full h-full"
          >
            <ImageWithFallback 
              src={commitmentImage || DEFAULT_COMMITMENT_IMAGE} 
              alt="" 
              className="w-full h-full object-cover"
            />
          </motion.div>
          <div className="absolute inset-0 bg-black/5" />
        </motion.div>
      </div>
    </section>
  );
};
