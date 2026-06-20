import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Language, translations } from '../translations';
import { Plus, Minus } from 'lucide-react';
import { useContent } from '../hooks/useContent';
import { fetchFaqGroups } from '../lib/catalog-client';
import { FAQCategoryGroup } from '../types';
import { PageHero } from './PageHero';
import { ScrollReveal } from './ui/ScrollReveal';
import { FAQSkeleton } from './ui/skeletons';

interface FAQPageProps {
  lang: Language;
}

const FAQAccordionBase = ({ question, answer, isOpen, onClick }: { question: string, answer: string, isOpen: boolean, onClick: () => void }) => (
  <div className="border-b border-black/5 last:border-0">
    <button
      onClick={onClick}
      className="w-full py-5 flex items-center justify-between text-left group transition-all"
    >
      <span className="text-[12px] md:text-[13px] font-extrabold uppercase tracking-[0.05em] text-[#5C5A56] leading-tight pr-4">
        {question}
      </span>
      <div className={`flex-shrink-0 w-5 h-5 rounded-full border border-black/20 flex items-center justify-center transition-transform duration-300 ${isOpen ? 'rotate-90' : 'rotate-0'}`}>
        {isOpen ? (
          <Minus size={10} className="text-[#5C5A56]" strokeWidth={3} />
        ) : (
          <Plus size={10} className="text-[#5C5A56]" strokeWidth={3} />
        )}
      </div>
    </button>
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
          className="overflow-hidden"
        >
          <div className="pb-6 text-[13px] text-[#5C5B57] leading-relaxed font-medium">
            {answer}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

const FAQAccordion = React.memo(FAQAccordionBase);

export const FAQPage: React.FC<FAQPageProps> = ({ lang }) => {
  const [openId, setOpenId] = useState<string | null>(null);
  const t = translations[lang];
  const fallbackGroups: FAQCategoryGroup[] = t.pages.faq.categories;
  const [groups, setGroups] = useState<FAQCategoryGroup[] | null>(null);
  const [loading, setLoading] = useState(true);

  // ContentProvider keys — BE provides defaults via
  // LegacyContentService.registerFaq() (registered in e-commerce-backend).
  const { val: faqImageCp } = useContent('home.faq.image', { lang, fallback: '' });
  const { val: faqTitleCp } = useContent('faq.hero.title', { lang, fallback: t.pages.faq.heroTitle });
  const { val: faqSubtitleCp } = useContent('faq.hero.subtitle', { lang, fallback: t.pages.faq.heroSubtitle });
  const FAQ_HERO_FALLBACK = 'https://images.unsplash.com/photo-1768483018807-bd0b9ab86539?q=80&w=2000';

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetchFaqGroups()
      .then((fetched) => {
        if (!mounted) return;
        // API returns null on outage / unconfigured → keep translations
        // so the page never renders empty.
        setGroups(fetched && fetched.length > 0 ? fetched : fallbackGroups);
        setLoading(false);
      })
      .catch(() => {
        if (!mounted) return;
        setGroups(fallbackGroups);
        setLoading(false);
      });
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  const faqGroups = groups ?? fallbackGroups;

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      window.scrollTo({
        top: element.offsetTop - 100,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#F1F0ED] pb-32 px-4 sm:px-6 lg:px-8">
      <PageHero
        image={faqImageCp}
        fallbackImage={FAQ_HERO_FALLBACK}
        alt="FAQ iCare"
        title={faqTitleCp || t.pages.faq.heroTitle}
        subtitle={faqSubtitleCp || t.pages.faq.heroSubtitle}
        priority
      />

      <div className="max-w-[1400px] mx-auto grid grid-cols-12 gap-4 mt-12 px-2 md:px-8 lg:px-12">

        {/* Sidebar */}
        <aside className="col-span-4 md:col-span-3">
          <ScrollReveal direction="left" viewportMargin="-60px">
            <div className="bg-[#F2F1ED] p-4 md:p-10 rounded-[20px] sticky top-32">
              <h1 className="text-[14px] md:text-[20px] font-[900] text-[#5C5A56] mb-4 md:mb-8 tracking-tight">FAQ</h1>
              <nav className="flex flex-col space-y-3 md:space-y-4">
                {faqGroups.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => scrollToSection(cat.id)}
                    className="text-[9px] md:text-[11px] font-[800] text-[#5C5A56]/60 hover:text-black transition-colors text-left uppercase tracking-widest leading-tight"
                  >
                    {cat.name}
                  </button>
                ))}
              </nav>
            </div>
          </ScrollReveal>
        </aside>

        {/* Content Area */}
        <main className="col-span-8 md:col-span-9 bg-[#F2F1ED] p-5 md:p-12 rounded-[20px]">
          {loading ? (
            <FAQSkeleton count={6} />
          ) : (
          <div className="space-y-16">
            {faqGroups.map((cat) => (
            <ScrollReveal key={cat.id} direction="bottom" viewportMargin="-40px">
              <section id={cat.id} className="space-y-6">
                <h2 className="text-[18px] md:text-[20px] font-[900] uppercase tracking-tight text-[#5C5A56]">
                  {cat.name}
                </h2>
                <div className="border-t border-black/10">
                  {cat.items.map((item, idx) => (
                    <FAQAccordion
                      key={`${cat.id}-${idx}`}
                      question={item.q}
                      answer={item.a}
                      isOpen={openId === `${cat.id}-${idx}`}
                      onClick={() => setOpenId(openId === `${cat.id}-${idx}` ? null : `${cat.id}-${idx}`)}
                    />
                  ))}
                </div>
              </section>
            </ScrollReveal>
            ))}
          </div>
          )}
        </main>

      </div>
    </div>
  );
};