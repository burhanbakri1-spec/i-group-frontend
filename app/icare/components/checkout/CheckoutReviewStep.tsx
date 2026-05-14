'use client';

import React from 'react';
import { Lock } from 'lucide-react';
import { Language, checkoutTranslations } from '../../translations';
import { CreatedOrder } from '../../types';

const CONTROL_FOCUS_CLASS =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E11D48]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-white';
const SHORT_TWEEN = { duration: 0.18, ease: 'easeOut' as const };

interface CheckoutReviewStepProps {
  lang: Language;
  checkoutError: string | null;
  isSubmitting: boolean;
  onPlaceOrder: () => Promise<void>;
  checkoutReviewHeading: string;
  checkoutTermsText: string;
  checkoutPlaceOrder: string;
  checkoutSubmittingText: string;
}

export const CheckoutReviewStep: React.FC<CheckoutReviewStepProps> = ({
  lang,
  checkoutError,
  isSubmitting,
  onPlaceOrder,
  checkoutReviewHeading,
  checkoutTermsText,
  checkoutPlaceOrder,
  checkoutSubmittingText,
}) => {
  const ct = checkoutTranslations[lang];

  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-light mb-6">{checkoutReviewHeading}</h3>
      <div className="bg-[#F5F5F5] p-6 rounded-lg">
        <p className="text-sm text-[#5F5D59] mb-4">
          {checkoutTermsText}
        </p>
        {checkoutError && (
          <p className="text-sm text-red-600 mb-4">{checkoutError}</p>
        )}
        <button
          onClick={onPlaceOrder}
          disabled={isSubmitting}
          className={`w-full px-6 py-4 bg-black text-white rounded-full hover:bg-[#333] transition-colors flex items-center justify-center gap-2 text-lg font-medium disabled:opacity-50 ${CONTROL_FOCUS_CLASS}`}
        >
          <Lock size={20} />
          {isSubmitting ? checkoutSubmittingText : checkoutPlaceOrder}
        </button>
      </div>
    </div>
  );
};
