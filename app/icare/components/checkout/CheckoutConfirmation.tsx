'use client';

import React from 'react';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { Check, XCircle, Loader2, Banknote } from 'lucide-react';
import { Language, checkoutTranslations } from '../../translations';
import { CreatedOrder } from '../../types';

const CONTROL_FOCUS_CLASS =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7B7872]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-white';
const SHORT_TWEEN = { duration: 0.18, ease: 'easeOut' as const };

export type PaymentStatus = 'idle' | 'processing' | 'success' | 'failed' | 'not_applicable';

interface CheckoutConfirmationProps {
  lang: Language;
  order: CreatedOrder | null;
  paymentStatus: PaymentStatus;
  checkoutConfirmedHeading: string;
  checkoutConfirmedMessage: string;
  onNavigate: (page: string) => void;
  onSwitchToCod?: () => void;
}

export const CheckoutConfirmation: React.FC<CheckoutConfirmationProps> = ({
  lang,
  order,
  paymentStatus,
  checkoutConfirmedHeading,
  checkoutConfirmedMessage,
  onNavigate,
  onSwitchToCod,
}) => {
  const ct = checkoutTranslations[lang];
  const shouldReduceMotion = useReducedMotion();

  const isPaymentPending = paymentStatus === 'idle' || paymentStatus === 'processing';

  const bgColor =
    paymentStatus === 'success' ? 'bg-green-500' :
    paymentStatus === 'failed' ? 'bg-red-500' :
    paymentStatus === 'not_applicable' ? 'bg-gray-400' :
    'bg-amber-500'; // idle / processing

  const icon = () => {
    switch (paymentStatus) {
      case 'success':
        return <Check size={40} className="text-white" />;
      case 'failed':
        return <XCircle size={40} className="text-white" />;
      case 'not_applicable':
        return <Banknote size={40} className="text-white" />;
      case 'processing':
        return <Loader2 size={40} className="text-white animate-spin" />;
      case 'idle':
      default:
        return (
          <div className="w-10 h-10 border-[3px] border-white border-t-transparent rounded-full animate-spin motion-reduce:animate-none" />
        );
    }
  };

  const statusMessage = () => {
    switch (paymentStatus) {
      case 'success':
        return (
          <p className="text-green-600 text-sm font-medium mb-4">
            {ct.paymentConfirmed}
            {order?.transactionId ? ` — ${order.transactionId}` : ''}
          </p>
        );
      case 'failed':
        return (
          <div className="mb-4">
            <p className="text-red-600 text-sm font-medium mb-2">
              {ct.paymentFailed}
            </p>
            <p className="text-[#84827E] text-sm mb-3">
              {ct.paymentFailedMessage}
            </p>
            {onSwitchToCod && (
              <button
                onClick={onSwitchToCod}
                className={`text-sm px-4 py-2 border border-[#DDDDDD] rounded-[12px] hover:bg-[#F1F0ED] transition-colors ${CONTROL_FOCUS_CLASS}`}
              >
                {ct.switchToCod}
              </button>
            )}
          </div>
        );
      case 'not_applicable':
        return (
          <p className="text-[#84827E] text-sm font-medium mb-4">
            {ct.codPaymentMessage}
          </p>
        );
      case 'processing':
        return (
          <p className="text-amber-600 text-sm font-medium mb-4">
            {ct.paymentProcessing}
          </p>
        );
      case 'idle':
      default:
        return null;
    }
  };

  return (
    <div className="text-center py-12">
      <motion.div
        initial={
          shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96 }
        }
        animate={{ opacity: 1, scale: 1 }}
        transition={SHORT_TWEEN}
        className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${bgColor}`}
      >
        {icon()}
      </motion.div>
      <h2 className="text-3xl font-light mb-4">
        {checkoutConfirmedHeading || ct.orderConfirmedHeading}
      </h2>
      {isPaymentPending && paymentStatus === 'processing' && (
        <p className="text-[#84827E] mb-4">{ct.verifyingPayment}</p>
      )}
      {statusMessage()}
      {!isPaymentPending && paymentStatus !== 'failed' && (
        <>
        <p className="text-[#84827E] mb-4">
          {(checkoutConfirmedMessage || ct.orderConfirmedMessage)}{' '}
          {order?.orderNumber
            ? `${ct.orderWord} ${order.orderNumber} ${ct.orderCreatedSuffix}`
            : ''}
        </p>
        <p className="text-green-600 text-sm mb-8">
          {order?.shippingEmail
            ? `${ct.emailConfirmationSent} ${order.shippingEmail}`
            : ct.emailConfirmationSentNoEmail}
        </p>
        </>
      )}
      {paymentStatus === 'failed' && (
        <p className="text-[#84827E] mb-8">
          {(checkoutConfirmedMessage || ct.orderConfirmedMessage)}{' '}
          {order?.orderNumber
            ? `${ct.orderWord} ${order.orderNumber} ${ct.orderCreatedSuffix}`
            : ''}
        </p>
      )}
      <button
        onClick={() => onNavigate('shop')}
        className={`px-8 py-3 bg-[#67645E] text-white rounded-full hover:bg-[#5A5853] transition-colors ${CONTROL_FOCUS_CLASS}`}
      >
        {ct.continueShopping}
      </button>
      {!isPaymentPending && paymentStatus !== 'failed' && order?.orderNumber && (
        <div className="mt-4">
          <Link
            href={`/icare/track-order?orderNumber=${order.orderNumber}`}
            className={`inline-block text-sm text-[#67645E] hover:underline ${CONTROL_FOCUS_CLASS}`}
          >
            {ct.trackYourOrder}
          </Link>
        </div>
      )}
    </div>
  );
};
