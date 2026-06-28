"use client";

import React from 'react';
import { Truck, Package, RotateCcw, Globe, Clock, Shield } from 'lucide-react';
import { Language } from '../translations';
import { useSiteContent } from '../hooks/useSiteContent';
import { ScrollReveal, StaggerContainer } from './ui/ScrollReveal';
import { PageHero } from './PageHero';

interface ShippingPageProps {
  lang: Language;
}

export const ShippingPage: React.FC<ShippingPageProps> = ({ lang }) => {
  const { shippingPageContent: text } = useSiteContent(lang);

  const shippingOptions = [
    { icon: Truck, title: text.freeShippingTitle, desc: text.freeShippingDescription, color: 'bg-[#67645E]' },
    { icon: Package, title: text.expressTitle, desc: text.expressDescription, color: 'bg-[#7B7872]' },
    { icon: Globe, title: text.internationalTitle, desc: text.internationalDescription, color: 'bg-[#67645E]' },
    { icon: Clock, title: text.processingTitle, desc: text.processingDescription, color: 'bg-[#7B7872]' }
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
      <PageHero
        image="https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?q=80&w=2000"
        fallbackImage="https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?q=80&w=2000"
        alt={text.title}
        title={text.title}
        subtitle={text.subtitle}
        priority
      />

      {/* Shipping Options */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <ScrollReveal direction="bottom" viewportMargin="-60px">
          <h2 className="text-3xl font-light text-center mb-12">{text.shippingHeading}</h2>
        </ScrollReveal>
        <StaggerContainer className="grid md:grid-cols-2 lg:grid-cols-4 gap-6" staggerDelay={0.08} viewportMargin="-40px">
          {shippingOptions.map((option, index) => (
            <ScrollReveal key={index} direction="bottom" delay={index * 0.08}>
              <div className="p-6 border border-[#DDDDDD] rounded-[12px] hover:border-black transition-colors">
                <div className={`w-16 h-16 ${option.color} rounded-[12px] flex items-center justify-center mb-4`}>
                  <option.icon size={32} className="text-white" />
                </div>
                <h3 className="font-medium text-lg mb-2">{option.title}</h3>
                <p className="text-sm text-[#84827E]">{option.desc}</p>
              </div>
            </ScrollReveal>
          ))}
        </StaggerContainer>
      </div>

      {/* Returns Section */}
      <div className="bg-[#F1F0ED] py-20">
        <div className="max-w-7xl mx-auto px-6">
          <ScrollReveal direction="bottom" viewportMargin="-60px">
            <div className="text-center mb-12">
              <RotateCcw size={48} className="mx-auto mb-4" />
              <h2 className="text-3xl font-light mb-4">{text.returnsTitle}</h2>
              <div className="inline-block px-6 py-3 bg-white rounded-full border border-[#DDDDDD]">
                <p className="font-medium">{text.returnPolicyTitle}</p>
              </div>
              <p className="text-[#84827E] mt-4">{text.returnPolicyDescription}</p>
            </div>
          </ScrollReveal>

          {/* Return Steps */}
          <h3 className="sr-only">{text.howToReturnTitle}</h3>
          <StaggerContainer className="grid md:grid-cols-4 gap-6 mb-12" staggerDelay={0.08} viewportMargin="-40px">
            {returnSteps.map((step, index) => (
              <ScrollReveal key={index} direction="bottom" delay={index * 0.08}>
                <div className="text-center">
                  <div className="w-16 h-16 bg-[#67645E] text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-light">
                    {step.number}
                  </div>
                  <p className="text-sm">{step.title}</p>
                </div>
              </ScrollReveal>
            ))}
          </StaggerContainer>

          {/* Return Conditions */}
          <ScrollReveal direction="bottom" delay={0.1} viewportMargin="-40px">
            <div className="bg-white p-8 rounded-[12px] border border-[#DDDDDD]">
              <h3 className="text-xl font-medium mb-6 flex items-center gap-2">
                <Shield size={24} />
                {text.conditionsTitle}
              </h3>
              <ul className="space-y-3">
                {text.conditions.map((condition, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className={index === 3 ? 'text-yellow-500 mt-1' : 'text-green-500 mt-1'}>{index === 3 ? '!' : '✓'}</span>
                    <span className="text-[#84827E]">{condition}</span>
                  </li>
                ))}
              </ul>
            </div>
          </ScrollReveal>
        </div>
      </div>

      {/* FAQs */}
      <div className="max-w-4xl mx-auto px-6 py-20">
        <ScrollReveal direction="bottom" viewportMargin="-60px">
          <h2 className="text-3xl font-light text-center mb-12">{text.faqsTitle}</h2>
        </ScrollReveal>
        <StaggerContainer className="space-y-6" staggerDelay={0.08} viewportMargin="-40px">
          {faqs.map((faq, index) => (
            <ScrollReveal key={index} direction="bottom" delay={index * 0.08}>
              <div className="p-6 bg-[#F1F0ED] rounded-[12px]">
                <h3 className="font-medium mb-2">{faq.q}</h3>
                <p className="text-[#84827E]">{faq.a}</p>
              </div>
            </ScrollReveal>
          ))}
        </StaggerContainer>
      </div>

      {/* CTA */}
      <ScrollReveal direction="bottom" viewportMargin="-40px">
        <div className="bg-[#67645E] text-white py-16 text-center">
          <h3 className="text-2xl font-light mb-4">{text.ctaTitle}</h3>
          <p className="text-[#CCC] mb-8">{text.ctaDescription}</p>
          <button onClick={() => window.location.href = '/icare/contact'} className="inline-flex min-h-12 items-center justify-center whitespace-nowrap px-8 py-3 bg-white text-black rounded-full hover:bg-[#EEE] transition-colors">
            {text.ctaButton}
          </button>
        </div>
      </ScrollReveal>
    </div>
  );
};
