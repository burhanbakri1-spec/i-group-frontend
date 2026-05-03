import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { ChevronDown } from 'lucide-react';
import { Language } from '../translations';
import { useSiteContent } from '../hooks/useSiteContent';

interface AboutPageProps {
  onNavigate?: (page: string) => void;
  lang?: Language;
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
            <div className="pb-8 text-[15px] md:text-[16px] text-[#666] leading-relaxed max-w-xl">
              {content}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const DEFAULT_HERO_IMAGE = 'https://images.unsplash.com/photo-1713425886063-4a49da507ada?q=80&w=2000';
const DEFAULT_INTENTIONAL_IMAGE = 'https://images.unsplash.com/photo-1644011047934-b00d5aa404d4?q=80&w=1200';
const DEFAULT_FOUNDATION_IMAGE = 'https://images.unsplash.com/photo-1638609927040-8a7e97cd9d6a?q=80&w=1200';
const DEFAULT_VALUES_IMAGE = 'https://images.unsplash.com/photo-1642080668102-dc8f5ce8e752?q=80&w=1200';
const DEFAULT_TEAM_1_IMAGE = 'https://images.unsplash.com/photo-1702261347927-11207f77e751?q=80&w=800';
const DEFAULT_TEAM_2_IMAGE = 'https://images.unsplash.com/photo-1763692108454-6cfa2b0af5c1?q=80&w=800';
const DEFAULT_TEAM_3_IMAGE = 'https://images.unsplash.com/photo-1631214565164-dd0b7fba0295?q=80&w=800';
const DEFAULT_SIGNATURE_IMAGE = 'https://via.placeholder.com/200x60/000000/FFFFFF?text=iCare+Beauty';

export const AboutPage: React.FC<AboutPageProps> = ({ onNavigate }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const {
    aboutHeroHeadline, aboutHeroCta, aboutHeroImage,
    aboutIntentionalTitle, aboutIntentionalText, aboutIntentionalImage,
    aboutFoundationLabel, aboutFoundationTitle, aboutFoundationText1, aboutFoundationText2, aboutFoundationImage,
    aboutTeamLabel, aboutTeamTitle, aboutTeamDescription,
    aboutTeamMember1Name, aboutTeamMember1Title, aboutTeamMember1Image,
    aboutTeamMember2Name, aboutTeamMember2Title, aboutTeamMember2Image,
    aboutTeamMember3Name, aboutTeamMember3Title, aboutTeamMember3Image,
    aboutValuesImage, aboutFounderNoteHeading, aboutFounderLetter, aboutFounderSignatureImage,
  } = useSiteContent();

  const valuesData = [
    {
      title: "our values",
      content: "It was important to us to build a value driven business. At icare, we believe in: Simplicity. Affordability. Authenticity. Quality. Transparency."
    },
    {
      title: "scientifically proven formulas",
      content: "Every icare formula is developed in collaboration with leading dermatologists and chemists. We prioritize high-performance, clinical-grade ingredients that are proven to strengthen the skin barrier and deliver visible results without irritation."
    },
    {
      title: "our minimal footprint",
      content: "We are committed to a sustainable future. This means using 100% recyclable packaging, minimizing secondary boxes, and sourcing ingredients responsibly. Our goal is to create products that are as kind to the planet as they are to your skin."
    }
  ];

  return (
    <div className="bg-white">
      {/* 1. CINEMATIC HERO SECTION */}
      <section className="relative w-full h-screen overflow-hidden group">
        <ImageWithFallback 
          src={aboutHeroImage || DEFAULT_HERO_IMAGE} 
          alt="icare Philosophy" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/10" />
        
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-32 px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-10"
          >
            <h1 className="text-white text-[32px] md:text-[56px] lg:text-[64px] font-[400] tracking-tight leading-tight">
              {aboutHeroHeadline}
            </h1>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onNavigate?.('shop')}
              className="border border-white text-white px-12 py-3 rounded-full text-[11px] font-bold tracking-[0.2em] uppercase hover:bg-white hover:text-black transition-all duration-500"
            >
              {aboutHeroCta}
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* 2. INTENTIONAL SKINCARE SECTION */}
      <section className="bg-white py-8 px-4 md:px-8">
        <div className="max-w-[1600px] mx-auto relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 items-center">
            <div className="rounded-[16px] overflow-hidden aspect-[4/5] lg:aspect-auto lg:h-[80vh] z-0">
              <ImageWithFallback 
                src={aboutIntentionalImage || DEFAULT_INTENTIONAL_IMAGE} 
                alt="Intentional Skincare" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="lg:absolute lg:right-20 lg:top-1/2 lg:-translate-y-1/2 bg-[#F2F1ED] p-10 md:p-20 rounded-[16px] lg:max-w-xl -mt-20 mx-4 lg:mt-0 lg:mx-0 shadow-2xl lg:shadow-none z-10">
              <h2 className="text-[32px] md:text-[48px] font-black tracking-tight text-[#444] mb-6 lowercase">
                {aboutIntentionalTitle}
              </h2>
              <p className="text-[16px] md:text-[18px] text-[#666] leading-[1.6]">
                {aboutIntentionalText}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. OUR FOUNDATION SECTION */}
      <section className="py-8 md:py-12 px-4 md:px-12 bg-white">
        <div className="max-w-[1600px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div className="space-y-8 md:space-y-10 order-2 lg:order-1 px-4 lg:px-0">
              <div className="space-y-2">
                <span className="text-[10px] font-black tracking-[0.3em] uppercase text-[#999]">{aboutFoundationLabel}</span>
                <h2 className="text-[42px] md:text-[64px] font-[900] leading-[0.9] tracking-[-0.04em] text-[#222] lowercase">
                  {aboutFoundationTitle}
                </h2>
              </div>
              <div className="space-y-6 max-w-lg">
                <p className="text-[18px] text-[#555] leading-relaxed">
                  {aboutFoundationText1}
                </p>
                <p className="text-[16px] text-[#777] leading-relaxed">
                  {aboutFoundationText2}
                </p>
              </div>
            </div>
            <div className="relative aspect-[3/4] rounded-[16px] md:rounded-[24px] overflow-hidden lg:h-[80vh] order-1 lg:order-2">
              <ImageWithFallback 
                src={aboutFoundationImage || DEFAULT_FOUNDATION_IMAGE} 
                alt="Skincare Texture" 
                className="w-full h-full object-cover scale-110"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 4. OUR VALUES ACCORDION SECTION */}
      <section className="py-8 px-4 md:px-8 bg-white">
        <div className="max-w-[1600px] mx-auto relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-0 items-stretch">
            <div className="rounded-[16px] overflow-hidden aspect-[4/5] lg:aspect-auto lg:h-[80vh]">
              <ImageWithFallback 
                src={aboutValuesImage || DEFAULT_VALUES_IMAGE} 
                alt="Our Values Journey" 
                className="w-full h-full object-cover grayscale"
              />
            </div>
            <div className="bg-[#F2F1ED] p-8 md:p-20 rounded-[16px] lg:-ml-20 lg:my-20 relative z-10 flex flex-col justify-center shadow-xl lg:shadow-2xl">
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
          </div>
        </div>
      </section>

      {/* 5. OUR CREW SECTION */}
      <section className="py-10 px-4 md:px-8 bg-white overflow-hidden">
        <div className="max-w-[1600px] mx-auto space-y-12 md:space-y-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-black/10 pb-10">
            <div className="space-y-4">
              <span className="text-[10px] font-black tracking-[0.3em] uppercase text-[#999]">{aboutTeamLabel}</span>
              <h2 className="text-[42px] md:text-[64px] font-[900] leading-[0.9] tracking-[-0.04em] text-[#222] lowercase">
                {aboutTeamTitle}
              </h2>
            </div>
            <p className="text-[16px] text-[#706E6A] max-w-sm leading-relaxed">
              {aboutTeamDescription}
            </p>
          </div>

          <div className="flex overflow-x-auto md:grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 pb-10 px-2 md:px-0 no-scrollbar snap-x snap-mandatory">
            {/* Member 1 */}
            <div className="min-w-[75vw] md:min-w-0 snap-center group space-y-6">
              <div className="aspect-[3/4] rounded-[16px] overflow-hidden bg-[#F2F1ED]">
                <ImageWithFallback 
                  src={aboutTeamMember1Image || DEFAULT_TEAM_1_IMAGE} 
                  alt="Team Member" 
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                />
              </div>
              <div className="space-y-1 px-4 text-center">
                <h4 className="text-[20px] font-black tracking-tight text-[#222] lowercase">{aboutTeamMember1Name}</h4>
                <p className="text-[12px] font-bold uppercase tracking-widest text-[#999]">{aboutTeamMember1Title}</p>
              </div>
            </div>

            {/* Member 2 */}
            <div className="min-w-[75vw] md:min-w-0 snap-center group space-y-6">
              <div className="aspect-[3/4] rounded-[16px] overflow-hidden bg-[#F2F1ED]">
                <ImageWithFallback 
                  src={aboutTeamMember2Image || DEFAULT_TEAM_2_IMAGE} 
                  alt="Team Member" 
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                />
              </div>
              <div className="space-y-1 px-4 text-center">
                <h4 className="text-[20px] font-black tracking-tight text-[#222] lowercase">{aboutTeamMember2Name}</h4>
                <p className="text-[12px] font-bold uppercase tracking-widest text-[#999]">{aboutTeamMember2Title}</p>
              </div>
            </div>

            {/* Member 3 */}
            <div className="min-w-[75vw] md:min-w-0 snap-center group space-y-6">
              <div className="aspect-[3/4] rounded-[16px] overflow-hidden bg-[#F2F1ED]">
                <ImageWithFallback 
                  src={aboutTeamMember3Image || DEFAULT_TEAM_3_IMAGE} 
                  alt="Team Member" 
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                />
              </div>
              <div className="space-y-1 px-4 text-center">
                <h4 className="text-[20px] font-black tracking-tight text-[#222] lowercase">{aboutTeamMember3Name}</h4>
                <p className="text-[12px] font-bold uppercase tracking-widest text-[#999]">{aboutTeamMember3Title}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. A NOTE FROM OUR FOUNDER */}
      <section className="py-12 px-6 md:px-12 bg-[#F2F1ED] min-h-[70vh] flex items-center">
        <div className="max-w-4xl mx-auto text-center space-y-12">
          <h2 className="text-[12px] font-black tracking-[0.3em] uppercase text-[#706E6A]">
            {aboutFounderNoteHeading}
          </h2>
          
          <p className="text-[20px] md:text-[26px] text-[#444] leading-[1.6] font-[400] tracking-tight">
            {aboutFounderLetter}
          </p>

          <div className="flex flex-col items-center pt-8">
            <div className="w-48 h-20 relative">
              <ImageWithFallback 
                src={aboutFounderSignatureImage || DEFAULT_SIGNATURE_IMAGE} 
                alt="Founder Signature" 
                className="w-full h-full object-contain mix-blend-multiply"
              />
            </div>
          </div>
        </div>
      </section>

      <div className="h-12 md:h-20" />
    </div>
  );
};
