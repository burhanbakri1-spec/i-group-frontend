import React from 'react';
import { motion } from 'framer-motion';
import { Truck, Package, RotateCcw, Globe, Clock, Shield } from 'lucide-react';
import { Language } from '../translations';

interface ShippingPageProps {
  lang: Language;
}

export const ShippingPage: React.FC<ShippingPageProps> = ({ lang }) => {
  const t = {
    en: {
      title: 'SHIPPING & RETURNS',
      subtitle: 'Everything you need to know about delivery and returns',
      shipping: 'Shipping Information',
      freeShipping: 'Free Standard Shipping',
      freeShippingDesc: 'On all orders over $45',
      express: 'Express Delivery',
      expressDesc: '2-3 business days - $15',
      international: 'International Shipping',
      internationalDesc: '7-14 business days - Starting at $25',
      processing: 'Processing Time',
      processingDesc: 'Orders are processed within 1-2 business days',
      returns: 'Returns & Exchanges',
      returnPolicy: '30-Day Return Policy',
      returnPolicyDesc: 'Not satisfied? Return within 30 days for a full refund',
      howToReturn: 'How to Return',
      step1: 'Contact our customer service',
      step2: 'Receive your return label',
      step3: 'Pack and ship your item',
      step4: 'Get your refund within 5-7 days',
      
      conditions: 'Return Conditions',
      condition1: 'Items must be unused and in original packaging',
      condition2: 'All tags and labels must be attached',
      condition3: 'Proof of purchase required',
      condition4: 'Some items may be non-returnable',
      
      tracking: 'Order Tracking',
      trackingDesc: 'Track your order in real-time with our tracking system',
      
      faqs: 'Frequently Asked Questions',
      faq1Q: 'Do you ship internationally?',
      faq1A: 'Yes, we ship to over 100 countries worldwide.',
      faq2Q: 'How long does shipping take?',
      faq2A: 'Standard shipping takes 5-7 business days, express takes 2-3 days.',
      faq3Q: 'Can I change my shipping address?',
      faq3A: 'Contact us within 24 hours of placing your order to update your address.',
      faq4Q: 'What if my package is lost?',
      faq4A: 'We\'ll work with the carrier to locate your package or send a replacement.'
    },
    ar: {
      title: 'الشحن والإرجاع',
      subtitle: 'كل ما تحتاج معرفته عن التوصيل والإرجاع',
      shipping: 'معلومات الشحن',
      freeShipping: 'شحن مجاني',
      freeShippingDesc: 'للطلبات فوق 45 دولار',
      express: 'توصيل سريع',
      expressDesc: '2-3 أيام عمل - 15 دولار',
      international: 'شحن دولي',
      internationalDesc: '7-14 يوم عمل - يبدأ من 25 دولار',
      processing: 'وقت المعالجة',
      processingDesc: 'تتم معالجة الطلبات خلال 1-2 يوم عمل',
      
      returns: 'الإرجاع والاستبدال',
      returnPolicy: 'سياسة إرجاع 30 يوماً',
      returnPolicyDesc: 'غير راضٍ؟ أرجع المنتج خلال 30 يوماً لاسترداد كامل المبلغ',
      howToReturn: 'كيفية الإرجاع',
      step1: 'تواصل مع خدمة العملاء',
      step2: 'احصل على ملصق الإرجاع',
      step3: 'قم بتغليف وإرسال المنتج',
      step4: 'استلم استرداد المبلغ خلال 5-7 أيام',
      
      conditions: 'شروط الإرجاع',
      condition1: 'يجب أن تكون المنتجات غير مستخدمة وفي عبوتها الأصلية',
      condition2: 'يجب أن تكون جميع الملصقات والبطاقات مرفقة',
      condition3: 'مطلوب إثبات الشراء',
      condition4: 'بعض المنتجات قد لا تكون قابلة للإرجاع',
      
      tracking: 'تتبع الطلب',
      trackingDesc: 'تتبع طلبك في الوقت الفعلي من خلال نظام التتبع',
      
      faqs: 'الأسئلة الشائعة',
      faq1Q: 'هل تشحنون دولياً؟',
      faq1A: 'نعم، نشحن لأكثر من 100 دولة حول العالم.',
      faq2Q: 'كم يستغرق الشحن؟',
      faq2A: 'الشحن العادي يستغرق 5-7 أيام عمل، والسريع 2-3 أيام.',
      faq3Q: 'هل يمكنني تغيير عنوان الشحن؟',
      faq3A: 'تواصل معنا خلال 24 ساعة من الطلب لتحديث العنوان.',
      faq4Q: 'ماذا لو ضاعت الطرد؟',
      faq4A: 'سنعمل مع شركة الشحن لتحديد موقع الطرد أو إرسال بديل.'
    }
  };

  const text = t[lang];

  const shippingOptions = [
    { icon: Truck, title: text.freeShipping, desc: text.freeShippingDesc, color: 'from-green-500 to-emerald-600' },
    { icon: Package, title: text.express, desc: text.expressDesc, color: 'from-blue-500 to-cyan-600' },
    { icon: Globe, title: text.international, desc: text.internationalDesc, color: 'from-purple-500 to-violet-600' },
    { icon: Clock, title: text.processing, desc: text.processingDesc, color: 'from-orange-500 to-red-600' }
  ];

  const returnSteps = [
    { number: '01', title: text.step1 },
    { number: '02', title: text.step2 },
    { number: '03', title: text.step3 },
    { number: '04', title: text.step4 }
  ];

  const faqs = [
    { q: text.faq1Q, a: text.faq1A },
    { q: text.faq2Q, a: text.faq2A },
    { q: text.faq3Q, a: text.faq3A },
    { q: text.faq4Q, a: text.faq4A }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-[#FAFAFA] py-20 text-center">
        <h1 className="text-4xl md:text-5xl font-light tracking-tight mb-4">{text.title}</h1>
        <p className="text-[#666] max-w-2xl mx-auto px-6">{text.subtitle}</p>
      </div>

      {/* Shipping Options */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-light text-center mb-12">{text.shipping}</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {shippingOptions.map((option, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-6 border border-[#EEE] rounded-lg hover:border-black transition-colors"
            >
              <div className={`w-16 h-16 bg-gradient-to-br ${option.color} rounded-lg flex items-center justify-center mb-4`}>
                <option.icon size={32} className="text-white" />
              </div>
              <h3 className="font-medium text-lg mb-2">{option.title}</h3>
              <p className="text-sm text-[#666]">{option.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Returns Section */}
      <div className="bg-[#FAFAFA] py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <RotateCcw size={48} className="mx-auto mb-4" />
            <h2 className="text-3xl font-light mb-4">{text.returns}</h2>
            <div className="inline-block px-6 py-3 bg-white rounded-full border border-[#EEE]">
              <p className="font-medium">{text.returnPolicy}</p>
            </div>
            <p className="text-[#666] mt-4">{text.returnPolicyDesc}</p>
          </div>

          {/* Return Steps */}
          <div className="grid md:grid-cols-4 gap-6 mb-12">
            {returnSteps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-light">
                  {step.number}
                </div>
                <p className="text-sm">{step.title}</p>
              </motion.div>
            ))}
          </div>

          {/* Return Conditions */}
          <div className="bg-white p-8 rounded-lg">
            <h3 className="text-xl font-medium mb-6 flex items-center gap-2">
              <Shield size={24} />
              {text.conditions}
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <span className="text-green-500 mt-1">✓</span>
                <span className="text-[#666]">{text.condition1}</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-500 mt-1">✓</span>
                <span className="text-[#666]">{text.condition2}</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-500 mt-1">✓</span>
                <span className="text-[#666]">{text.condition3}</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-yellow-500 mt-1">!</span>
                <span className="text-[#666]">{text.condition4}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* FAQs */}
      <div className="max-w-4xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-light text-center mb-12">{text.faqs}</h2>
        <div className="space-y-6">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-6 bg-[#FAFAFA] rounded-lg"
            >
              <h3 className="font-medium mb-2">{faq.q}</h3>
              <p className="text-[#666]">{faq.a}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="bg-black text-white py-16 text-center">
        <h3 className="text-2xl font-light mb-4">Still Have Questions?</h3>
        <p className="text-[#CCC] mb-8">Our customer service team is here to help</p>
        <button className="px-8 py-3 bg-white text-black rounded-full hover:bg-[#EEE] transition-colors">
          Contact Support
        </button>
      </div>
    </div>
  );
};
