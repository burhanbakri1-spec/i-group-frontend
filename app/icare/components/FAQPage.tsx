import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Language } from '../translations';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Plus, Minus } from 'lucide-react';
import { FAQCategoryGroup } from '../types';

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

const FAQ_GROUPS: Record<Language, FAQCategoryGroup[]> = {
  en: [
    {
      id: 'orders-shipping',
      name: 'Orders & Shipping',
      items: [
        { q: 'How long does shipping take?', a: 'Standard delivery usually takes 3–7 business days depending on your city and selected shipping method.' },
        { q: 'Can I change my order after checkout?', a: 'Please contact us as soon as possible. Once an order is packed or shipped, we may not be able to change its items or address.' },
        { q: 'How can I track my order?', a: 'After your order is confirmed, you will receive order updates by email or phone with the latest delivery status.' },
      ],
    },
    {
      id: 'products-routine',
      name: 'Products & Routine',
      items: [
        { q: 'How do I choose the right product?', a: 'Start with your main skin concern, then check each product description for skin type, benefits, and suggested use.' },
        { q: 'Are iCare products suitable for sensitive skin?', a: 'Many of our products are designed for gentle daily routines. Always review ingredients and patch test new products if your skin is reactive.' },
        { q: 'Can I use multiple iCare products together?', a: 'Yes. Introduce one new product at a time and follow the usage guidance on each product page for the best routine order.' },
      ],
    },
    {
      id: 'returns-support',
      name: 'Returns & Support',
      items: [
        { q: 'What is your return policy?', a: 'If something is not right, contact our support team with your order details so we can review the best available option.' },
        { q: 'What should I do if my item arrives damaged?', a: 'Keep the product and packaging, then send photos and your order number to support so we can help quickly.' },
        { q: 'How do I contact customer care?', a: 'Use the contact page or the support email listed in the footer. Our team will get back to you as soon as possible.' },
      ],
    },
  ],
  ar: [
    {
      id: 'orders-shipping',
      name: 'الطلبات والشحن',
      items: [
        { q: 'كم يستغرق الشحن؟', a: 'يستغرق التوصيل عادة من 3 إلى 7 أيام عمل حسب مدينتك وطريقة الشحن المختارة.' },
        { q: 'هل يمكنني تعديل الطلب بعد الدفع؟', a: 'يرجى التواصل معنا في أقرب وقت ممكن. بعد تجهيز الطلب أو شحنه قد لا نتمكن من تعديل المنتجات أو العنوان.' },
        { q: 'كيف يمكنني تتبع طلبي؟', a: 'بعد تأكيد الطلب ستصلك تحديثات عبر البريد الإلكتروني أو الهاتف بحالة التوصيل.' },
      ],
    },
    {
      id: 'products-routine',
      name: 'المنتجات والروتين',
      items: [
        { q: 'كيف أختار المنتج المناسب؟', a: 'ابدئي بتحديد احتياج بشرتك الأساسي، ثم راجعي وصف كل منتج لمعرفة نوع البشرة والفوائد وطريقة الاستخدام.' },
        { q: 'هل منتجات آي كير مناسبة للبشرة الحساسة؟', a: 'صُممت العديد من منتجاتنا لروتين يومي لطيف. ننصح دائمًا بمراجعة المكونات وتجربة المنتج على منطقة صغيرة أولًا.' },
        { q: 'هل يمكن استخدام أكثر من منتج معًا؟', a: 'نعم. أدخلي منتجًا جديدًا واحدًا في كل مرة واتبعي إرشادات الاستخدام في صفحة المنتج للحصول على أفضل ترتيب للروتين.' },
      ],
    },
    {
      id: 'returns-support',
      name: 'الإرجاع والدعم',
      items: [
        { q: 'ما سياسة الإرجاع؟', a: 'إذا واجهتك أي مشكلة، تواصلي مع فريق الدعم وأرسلي تفاصيل الطلب لنراجع أفضل حل متاح.' },
        { q: 'ماذا أفعل إذا وصل المنتج تالفًا؟', a: 'احتفظي بالمنتج والتغليف، ثم أرسلي صورًا ورقم الطلب إلى الدعم لنتمكن من مساعدتك بسرعة.' },
        { q: 'كيف أتواصل مع خدمة العملاء؟', a: 'يمكنك استخدام صفحة التواصل أو بريد الدعم الموجود في أسفل الموقع، وسيرد عليك فريقنا في أقرب وقت ممكن.' },
      ],
    },
  ],
};

export const FAQPage: React.FC<FAQPageProps> = ({ lang }) => {
  const [openId, setOpenId] = useState<string | null>(null);
  const faqGroups = FAQ_GROUPS[lang];

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
        </aside>

        {/* Content Area */}
        <main className="col-span-8 md:col-span-9 bg-[#F2F1ED] p-5 md:p-12 rounded-[20px]">
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
        </main>

      </div>
    </div>
  );
};
