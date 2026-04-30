import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Language } from '../translations';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Plus, Minus } from 'lucide-react';
import { fetchFaqGroups } from '../lib/catalog-client';
import { FAQCategoryGroup } from '../types';

interface FAQPageProps {
  lang: Language;
}

const FAQAccordion = ({ question, answer, isOpen, onClick }: { question: string, answer: string, isOpen: boolean, onClick: () => void }) => (
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

export const FAQPage: React.FC<FAQPageProps> = ({ lang }) => {
  const [openId, setOpenId] = useState<string | null>(null);
  const [remoteGroups, setRemoteGroups] = useState<FAQCategoryGroup[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFaqs = async () => {
      setLoading(true);
      const groups = await fetchFaqGroups();
      setRemoteGroups(groups ?? []);
      setLoading(false);
    };
    loadFaqs();
  }, []);

  const faqGroups = remoteGroups ?? [];

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
    <div className="min-h-screen bg-white pb-32">
      {/* Header Banner */}
      <section className="relative w-full h-[30vh] md:h-[40vh] overflow-hidden rounded-b-[32px]">
        <ImageWithFallback 
          src="https://images.unsplash.com/photo-1768483018807-bd0b9ab86539?q=80&w=2000" 
          alt="FAQ Hero" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/10 flex flex-col items-center justify-center text-white text-center px-4">
          <motion.h1 
            initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
            className="text-[42px] md:text-[68px] font-black lowercase tracking-tighter"
          >
            {lang === 'en' ? 'how can we help?' : 'كيف يمكننا مساعدتك؟'}
          </motion.h1>
          <p className="text-[12px] font-bold uppercase tracking-[0.3em] mt-4 opacity-80">
            {lang === 'en' ? 'frequently asked questions' : 'الأسئلة الشائعة'}
          </p>
        </div>
      </section>

      <div className="max-w-[1400px] mx-auto grid grid-cols-12 gap-4 mt-12 px-2 md:px-8 lg:px-12">
        
        {/* Sidebar */}
        <aside className="col-span-4 md:col-span-3">
          <div className="bg-[#F2F1ED] p-4 md:p-10 rounded-[20px] sticky top-32">
            <h1 className="text-[14px] md:text-[20px] font-[900] text-[#5C5A56] mb-4 md:mb-8 tracking-tight">FAQ</h1>
            {faqGroups.length > 0 ? (
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
            ) : (
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#5C5A56]/50">
                {loading ? 'Loading FAQ...' : 'FAQ unavailable'}
              </p>
            )}
          </div>
        </aside>

        {/* Content Area */}
        <main className="col-span-8 md:col-span-9 bg-[#F2F1ED] p-5 md:p-12 rounded-[20px]">
          {loading ? (
            <div className="py-20 text-center text-[12px] font-black uppercase tracking-[0.2em] text-[#5C5A56]/50">Loading FAQ...</div>
          ) : faqGroups.length > 0 ? (
            <div className="space-y-16">
              {faqGroups.map((cat) => (
              <section key={cat.id} id={cat.id} className="space-y-6">
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
              ))}
            </div>
          ) : (
            <div className="py-20 text-center space-y-3">
              <h2 className="text-[18px] md:text-[20px] font-[900] uppercase tracking-tight text-[#5C5A56]">
                {lang === 'en' ? 'FAQ unavailable' : 'الأسئلة الشائعة غير متاحة'}
              </h2>
              <p className="text-[13px] text-[#5C5B57] font-medium">
                {lang === 'en' ? 'Questions will appear here when the backend provides them.' : 'ستظهر الأسئلة هنا عند توفرها من الخادم.'}
              </p>
            </div>
          )}
        </main>

      </div>
    </div>
  );
};
