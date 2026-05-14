"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Truck, Package, RotateCcw, Globe, Clock, Shield } from 'lucide-react';
import { Language } from '../translations';
import { useSiteContent } from '../hooks/useSiteContent';

interface ShippingPageProps {
  lang: Language;
}

export const ShippingPage: React.FC<ShippingPageProps> = ({ lang }) => {
  const { shippingPageContent: text } = useSiteContent(lang);

  const shippingOptions = [
    { icon: Truck, title: text.freeShippingTitle, desc: text.freeShippingDescription, color: 'from-green-500 to-emerald-600' },
    { icon: Package, title: text.expressTitle, desc: text.expressDescription, color: 'from-blue-500 to-cyan-600' },
    { icon: Globe, title: text.internationalTitle, desc: text.internationalDescription, color: 'from-purple-500 to-violet-600' },
    { icon: Clock, title: text.processingTitle, desc: text.processingDescription, color: 'from-orange-500 to-red-600' }
  ];

  const returnSteps = [
    { number: '01', title: text.returnSteps[0] },
    { number: '02', title: text.returnSteps[1] },
    { number: '03', title: text.returnSteps[2] },
    { number: '04', title: text.returnSteps[3] }
  ];

  const faqs = [
    { q: text.faqs[0].question, a: text.faqs[0].answer },
    { q: text.faqs[1].question, a: text.faqs[1].answer },
    { q: text.faqs[2].question, a: text.faqs[2].answer },
    { q: text.faqs[3].question, a: text.faqs[3].answer }
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
        <h2 className="text-3xl font-light text-center mb-12">{text.shippingHeading}</h2>
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
            <h2 className="text-3xl font-light mb-4">{text.returnsTitle}</h2>
            <div className="inline-block px-6 py-3 bg-white rounded-full border border-[#EEE]">
              <p className="font-medium">{text.returnPolicyTitle}</p>
            </div>
            <p className="text-[#666] mt-4">{text.returnPolicyDescription}</p>
          </div>

          {/* Return Steps */}
          <h3 className="sr-only">{text.howToReturnTitle}</h3>
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
              {text.conditionsTitle}
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <span className="text-green-500 mt-1">✓</span>
                <span className="text-[#666]">{text.conditions[0]}</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-500 mt-1">✓</span>
                <span className="text-[#666]">{text.conditions[1]}</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-500 mt-1">✓</span>
                <span className="text-[#666]">{text.conditions[2]}</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-yellow-500 mt-1">!</span>
                <span className="text-[#666]">{text.conditions[3]}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* FAQs */}
      <div className="max-w-4xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-light text-center mb-12">{text.faqsTitle}</h2>
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
        <h3 className="text-2xl font-light mb-4">{text.ctaTitle}</h3>
        <p className="text-[#CCC] mb-8">{text.ctaDescription}</p>
        <button onClick={() => window.location.href = '/icare/contact'} className="px-8 py-3 bg-white text-black rounded-full hover:bg-[#EEE] transition-colors">
          {text.ctaButton}
        </button>
      </div>
    </div>
  );
};
