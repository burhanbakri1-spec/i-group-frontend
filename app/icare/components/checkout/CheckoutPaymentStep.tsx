'use client';

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Banknote, Check, Clock, CreditCard, Lock, Wallet } from 'lucide-react';
import { Language, checkoutTranslations } from '../../translations';

const CONTROL_FOCUS_CLASS =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7B7872]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-white';
const SHORT_TWEEN = { duration: 0.18, ease: 'easeOut' as const };

interface CheckoutPaymentStepProps {
  lang: Language;
  paymentMethod: 'cod' | 'card' | 'paypal';
  onSetPaymentMethod: (method: 'cod' | 'card' | 'paypal') => void;
  checkoutPaymentHeading: string;
  checkoutCardLabel: string;
  checkoutPaypalLabel: string;
  checkoutCodLabel: string;
}

export const CheckoutPaymentStep: React.FC<CheckoutPaymentStepProps> = ({
  lang,
  paymentMethod,
  onSetPaymentMethod,
  checkoutPaymentHeading,
  checkoutCardLabel,
  checkoutPaypalLabel,
  checkoutCodLabel,
}) => {
  const ct = checkoutTranslations[lang];
  const shouldReduceMotion = useReducedMotion();

  const disabledClass =
    'opacity-50 cursor-not-allowed pointer-events-none';

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-light mb-6">{checkoutPaymentHeading}</h2>

      {/* Payment Methods — COD is the only active method */}
      <div className="space-y-3">
        {/* COD — fully functional */}
        <button
          onClick={() => onSetPaymentMethod('cod')}
          className={`w-full p-4 border-2 rounded-[12px] flex items-center justify-between transition-colors duration-200 ${CONTROL_FOCUS_CLASS} ${
            paymentMethod === 'cod'
              ? 'border-[#67645E] bg-[#F1F0ED]'
              : 'border-[#DDDDDD] hover:border-[#67645E]'
          }`}
        >
          <div className="flex items-center gap-3">
            <Banknote size={24} />
            <span>{checkoutCodLabel}</span>
          </div>
          {paymentMethod === 'cod' && <Check size={20} />}
        </button>

        {/* Card — disabled, Coming Soon */}
        <div
          className={`w-full p-4 border-2 rounded-[12px] flex items-center justify-between border-[#DDDDDD] ${disabledClass}`}
        >
          <div className="flex items-center gap-3">
            <CreditCard size={24} />
            <span>{checkoutCardLabel}</span>
            <span className="ml-1 rounded-full bg-[#F0F0F0] px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-[#84827E]">
              {ct.comingSoonBadge}
            </span>
          </div>
          <Clock size={16} className="text-[#DDDDDD]" />
        </div>
        <p className="text-[11px] text-[#AAAAAA] leading-none pl-4 -mt-1">
          {ct.availableSoon}
        </p>

        {/* PayPal — disabled, Coming Soon */}
        <div
          className={`w-full p-4 border-2 rounded-[12px] flex items-center justify-between border-[#DDDDDD] ${disabledClass}`}
        >
          <div className="flex items-center gap-3">
            <Wallet size={24} />
            <span>{checkoutPaypalLabel}</span>
            <span className="ml-1 rounded-full bg-[#F0F0F0] px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-[#84827E]">
              {ct.comingSoonBadge}
            </span>
          </div>
          <Clock size={16} className="text-[#DDDDDD]" />
        </div>
        <p className="text-[11px] text-[#AAAAAA] leading-none pl-4 -mt-1">
          {ct.availableSoon}
        </p>
      </div>

      {paymentMethod === 'cod' && (
        <motion.div
          initial={
            shouldReduceMotion ? { opacity: 0 } : { opacity: 0, height: 0 }
          }
          animate={{ opacity: 1, height: 'auto' }}
          transition={SHORT_TWEEN}
          className="pt-4"
        >
          <div className="bg-[#F1F0ED] border border-[#DDDDDD] rounded-[12px] p-5 flex items-start gap-3">
            <Lock size={20} className="text-[#67645E] mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-[#67645E] mb-1">
                {ct.codPaymentMessage}
              </p>
              <p className="text-xs text-[#84827E]">
                {ct.securePayment}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};
