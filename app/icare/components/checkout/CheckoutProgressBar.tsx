'use client';

import React from 'react';
import { MapPin, ShoppingBag, Check, CreditCard } from 'lucide-react';
import { Language, checkoutTranslations } from '../../translations';

interface CheckoutProgressBarProps {
  currentStep: number;
  lang: Language;
  checkoutShippingHeading: string;
  checkoutPaymentHeading: string;
  checkoutReviewHeading: string;
}

export const CheckoutProgressBar: React.FC<CheckoutProgressBarProps> = ({
  currentStep,
  lang,
  checkoutShippingHeading,
  checkoutPaymentHeading,
  checkoutReviewHeading,
}) => {
  const ct = checkoutTranslations[lang];

  const steps = [
    { number: 1, title: checkoutShippingHeading, icon: MapPin },
    { number: 2, title: checkoutPaymentHeading, icon: CreditCard },
    { number: 3, title: checkoutReviewHeading, icon: ShoppingBag },
  ];

  return (
    <div className="flex items-center justify-center mb-12 space-x-4 rtl:space-x-reverse">
      {steps.map((s, idx) => (
        <React.Fragment key={s.number}>
          <div className="flex flex-col items-center">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all ${
                currentStep >= s.number
                  ? 'bg-[#67645E] border-[#67645E] text-white'
                  : 'border-[#DDDDDD] text-[#84827E]'
              }`}
            >
              {currentStep > s.number ? (
                <Check size={20} />
              ) : (
                <s.icon size={20} />
              )}
            </div>
            <span className="text-xs mt-2 text-[#67645E] hidden md:block">
              {s.title}
            </span>
          </div>
          {idx < steps.length - 1 && (
            <div
              className={`w-20 h-[2px] ${
                currentStep > s.number ? 'bg-[#67645E]' : 'bg-[#DDDDDD]'
              }`}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};
