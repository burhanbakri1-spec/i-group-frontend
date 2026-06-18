'use client';

import React, { type RefObject } from 'react';
import { Lock } from 'lucide-react';
import { Language, checkoutTranslations } from '../../translations';
import { CreatedOrder } from '../../types';

const CONTROL_FOCUS_CLASS =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7B7872]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-white';
const SHORT_TWEEN = { duration: 0.18, ease: 'easeOut' as const };

interface CheckoutReviewStepProps {
  lang: Language;
  checkoutError: string | null;
  isSubmitting: boolean;
  /**
   * T010 / C-05 — when true, the React 19 transition is still
   * pending (request in flight). Drives `aria-busy`.
   */
  isPending?: boolean;
  /**
   * T010 / C-05 — synchronous re-entrancy sentinel. While
   * `.current === true`, the button is a hard no-op even if a
   * second click fires before React commits `disabled=true`.
   */
  submitGuardRef?: RefObject<boolean>;
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
  isPending = false,
  submitGuardRef,
  onPlaceOrder,
  checkoutReviewHeading,
  checkoutTermsText,
  checkoutPlaceOrder,
  checkoutSubmittingText,
}) => {
  const ct = checkoutTranslations[lang];

  // T010 / C-05 — `disabled` reflects BOTH the React 19 transition
  // pending state AND the synchronous submit guard. The guard is the
  // safety net for clicks that fire inside the same commit window.
  const guardLocked = submitGuardRef?.current === true;
  const disabled = isSubmitting || isPending || guardLocked;

  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-light mb-6">{checkoutReviewHeading}</h3>
      <div className="bg-[#F1F0ED] p-6 rounded-[12px]">
        <p className="text-sm text-[#67645E] mb-4">
          {checkoutTermsText}
        </p>
        {checkoutError && (
          <p className="text-sm text-red-600 mb-4">{checkoutError}</p>
        )}
        <button
          type="button"
          onClick={onPlaceOrder}
          disabled={disabled}
          aria-busy={isPending || isSubmitting}
          aria-disabled={disabled}
          className={`w-full px-6 py-4 bg-[#67645E] text-white rounded-full hover:bg-[#5A5853] transition-colors flex items-center justify-center gap-2 text-lg font-medium disabled:opacity-50 ${CONTROL_FOCUS_CLASS}`}
        >
          <Lock size={20} />
          {isSubmitting || isPending ? checkoutSubmittingText : checkoutPlaceOrder}
        </button>
      </div>
    </div>
  );
};
