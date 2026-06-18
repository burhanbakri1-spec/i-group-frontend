'use client';

import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowLeft, ChevronRight, Lock } from 'lucide-react';
import { Language } from '../translations';
import { useSiteContent } from '../hooks/useSiteContent';
import { useContent } from '../hooks/useContent';
import { useCheckout } from '../hooks/useCheckout';
import { CheckoutProgressBar } from './checkout/CheckoutProgressBar';
import { CheckoutShippingForm } from './checkout/CheckoutShippingForm';
import { CheckoutPaymentStep } from './checkout/CheckoutPaymentStep';
import { CheckoutReviewStep } from './checkout/CheckoutReviewStep';
import { CheckoutConfirmation } from './checkout/CheckoutConfirmation';
import { CheckoutOrderSummary } from './checkout/CheckoutOrderSummary';
import { CheckoutErrorBoundary } from './checkout/CheckoutErrorBoundary';

const CONTROL_FOCUS_CLASS =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7B7872]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-white';
const SHORT_TWEEN = { duration: 0.18, ease: 'easeOut' as const };

interface CheckoutPageProps {
  lang: Language;
  onNavigate: (page: string) => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({ lang, onNavigate }) => {
  const checkout = useCheckout(lang);
  const siteContent = useSiteContent(lang);
  const shouldReduceMotion = useReducedMotion();

  // ContentProvider overrides — 18 checkout keys.
  const { val: checkoutBackToShopCp } = useContent('checkout.back.to.shop', { lang, fallback: '' });
  const { val: checkoutHeadingCp } = useContent('checkout.heading', { lang, fallback: '' });
  const { val: checkoutShippingHeadingCp } = useContent('checkout.shipping.heading', { lang, fallback: '' });
  const { val: checkoutPaymentHeadingCp } = useContent('checkout.payment.heading', { lang, fallback: '' });
  const { val: checkoutReviewHeadingCp } = useContent('checkout.review.heading', { lang, fallback: '' });
  const { val: checkoutCardLabelCp } = useContent('checkout.card.label', { lang, fallback: '' });
  const { val: checkoutPaypalLabelCp } = useContent('checkout.paypal.label', { lang, fallback: '' });
  const { val: checkoutCodLabelCp } = useContent('checkout.cod.label', { lang, fallback: '' });
  const { val: checkoutTermsTextCp } = useContent('checkout.terms.text', { lang, fallback: '' });
  const { val: checkoutConfirmedHeadingCp } = useContent('checkout.confirmed.heading', { lang, fallback: '' });
  const { val: checkoutConfirmedMessageCp } = useContent('checkout.confirmed.message', { lang, fallback: '' });
  const { val: checkoutPlaceOrderCp } = useContent('checkout.place.order', { lang, fallback: '' });
  const { val: checkoutSubmittingTextCp } = useContent('checkout.submitting.text', { lang, fallback: '' });
  const { val: checkoutNavBackCp } = useContent('checkout.nav.back', { lang, fallback: '' });
  const { val: checkoutNavContinueCp } = useContent('checkout.nav.continue', { lang, fallback: '' });

  // Memoize priority-chain helpers (closure-trap on siteContent to avoid recomputing per render).
  const v = (cpVal: string, legacy: string) => cpVal || legacy;

  // ── Unauthenticated gate ──
  if (!checkout.isAuthenticated) {
    const { ct } = checkout;
    return (
      <div className="min-h-screen bg-[#F1F0ED] py-8 md:py-12">
        <div className="max-w-3xl mx-auto px-4 md:px-6">
          <div className="text-center mb-8 md:mb-12">
            <button
              onClick={() => onNavigate('shop')}
              className={`inline-flex items-center gap-2 text-xs md:text-sm text-[#67645E] hover:text-black mb-4 transition-colors ${CONTROL_FOCUS_CLASS}`}
            >
              <ArrowLeft size={16} />
              {v(checkoutBackToShopCp, siteContent.checkoutBackToShop)}
            </button>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-light tracking-tight mb-4">
              {v(checkoutHeadingCp, siteContent.checkoutHeading)}
            </h1>
          </div>
          <motion.div
            initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 12 }}
            animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
            transition={SHORT_TWEEN}
            className="bg-white p-8 md:p-10 rounded-[12px] text-center"
          >
            <Lock size={36} className="mx-auto mb-5 text-[#67645E]" />
            <h2 className="text-2xl md:text-3xl font-light mb-4">{ct.authRequiredTitle}</h2>
            <p className="text-sm md:text-base text-[#67645E] mb-8">{ct.authRequiredMessage}</p>
            <button
              onClick={() => onNavigate('account')}
              className={`px-8 py-3 bg-[#67645E] text-white rounded-full text-[12px] font-black uppercase tracking-[0.2em] hover:bg-[#5A5853] transition-colors ${CONTROL_FOCUS_CLASS}`}
            >
              {ct.signInToCheckout}
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <CheckoutErrorBoundary lang={lang} onNavigate={onNavigate}>
      <div className="min-h-screen bg-[#F1F0ED] py-8 md:py-12">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          {/* Header */}
          <div className="text-center mb-8 md:mb-12">
            <button
              onClick={() => onNavigate('shop')}
              className={`inline-flex items-center gap-2 text-xs md:text-sm text-[#67645E] hover:text-black mb-4 transition-colors ${CONTROL_FOCUS_CLASS}`}
            >
              <ArrowLeft size={16} />
              {v(checkoutBackToShopCp, siteContent.checkoutBackToShop)}
            </button>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-light tracking-tight mb-4">
              {v(checkoutHeadingCp, siteContent.checkoutHeading)}
            </h1>
          </div>

          {/* Progress */}
          <CheckoutProgressBar
            currentStep={checkout.step}
            lang={lang}
            checkoutShippingHeading={v(checkoutShippingHeadingCp, siteContent.checkoutShippingHeading)}
            checkoutPaymentHeading={v(checkoutPaymentHeadingCp, siteContent.checkoutPaymentHeading)}
            checkoutReviewHeading={v(checkoutReviewHeadingCp, siteContent.checkoutReviewHeading)}
          />

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main form area */}
            <div className="lg:col-span-2">
              <motion.div
                initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 12 }}
                animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
                transition={SHORT_TWEEN}
                className="bg-white p-8 rounded-[12px]"
              >
                {/* Step 1: Shipping */}
                {checkout.step === 1 && (
                  <CheckoutShippingForm
                    lang={lang}
                    shippingForm={checkout.shippingForm}
                    updateShippingField={checkout.updateShippingField}
                    savedAddresses={checkout.savedAddresses}
                    selectedAddress={checkout.selectedAddress}
                    onSelectSavedAddress={checkout.selectSavedAddress}
                    checkoutShippingHeading={v(checkoutShippingHeadingCp, siteContent.checkoutShippingHeading)}
                    cartItems={checkout.cartItems}
                  />
                )}

                {/* Step 2: Payment */}
                {checkout.step === 2 && (
                  <CheckoutPaymentStep
                    lang={lang}
                    paymentMethod={checkout.paymentMethod}
                    onSetPaymentMethod={checkout.setPaymentMethod}
                    checkoutPaymentHeading={v(checkoutPaymentHeadingCp, siteContent.checkoutPaymentHeading)}
                    checkoutCardLabel={v(checkoutCardLabelCp, siteContent.checkoutCardLabel)}
                    checkoutPaypalLabel={v(checkoutPaypalLabelCp, siteContent.checkoutPaypalLabel)}
                    checkoutCodLabel={v(checkoutCodLabelCp, siteContent.checkoutCodLabel)}
                  />
                )}

                {/* Step 3: Review or Confirmation */}
                {checkout.step === 3 &&
                  (checkout.orderComplete ? (
                    <CheckoutConfirmation
                      lang={lang}
                      order={checkout.order}
                      paymentStatus={checkout.paymentStatus}
                      checkoutConfirmedHeading={v(checkoutConfirmedHeadingCp, siteContent.checkoutConfirmedHeading)}
                      checkoutConfirmedMessage={v(checkoutConfirmedMessageCp, siteContent.checkoutConfirmedMessage)}
                      onNavigate={onNavigate}
                      onSwitchToCod={() => {
                        checkout.setPaymentMethod('cod');
                        checkout.setPaymentStatus('not_applicable');
                      }}
                    />
                  ) : (
                    <CheckoutReviewStep
                      lang={lang}
                      checkoutError={checkout.checkoutError}
                      isSubmitting={checkout.isSubmitting}
                      isPending={checkout.isPending}
                      submitGuardRef={checkout.submitGuardRef}
                      onPlaceOrder={checkout.placeOrder}
                      checkoutReviewHeading={v(checkoutReviewHeadingCp, siteContent.checkoutReviewHeading)}
                      checkoutTermsText={v(checkoutTermsTextCp, siteContent.checkoutTermsText)}
                      checkoutPlaceOrder={v(checkoutPlaceOrderCp, siteContent.checkoutPlaceOrder)}
                      checkoutSubmittingText={v(checkoutSubmittingTextCp, siteContent.checkoutSubmittingText)}
                    />
                  ))}

                {/* Navigation */}
                {checkout.step < 3 && !checkout.orderComplete && (
                  <div className="flex gap-4 mt-8">
                    {checkout.step > 1 && (
                      <button
                        onClick={checkout.previousStep}
                        className={`flex-1 px-6 py-3 border border-[#67645E] rounded-full hover:bg-[#F1F0ED] transition-colors ${CONTROL_FOCUS_CLASS}`}
                      >
                        {v(checkoutNavBackCp, siteContent.checkoutNavBack)}
                      </button>
                    )}
                    <button
                      onClick={checkout.nextStep}
                      className={`flex-1 px-6 py-3 bg-[#67645E] text-white rounded-full hover:bg-[#5A5853] transition-colors flex items-center justify-center gap-2 ${CONTROL_FOCUS_CLASS}`}
                    >
                      {v(checkoutNavContinueCp, siteContent.checkoutNavContinue)}
                      <ChevronRight size={18} />
                    </button>
                  </div>
                )}
              </motion.div>
            </div>

            {/* Sidebar: Order Summary */}
            <div className="lg:col-span-1">
              <CheckoutOrderSummary
                lang={lang}
                cartItems={checkout.cartItems}
                displayOrderSummary={checkout.displayOrderSummary}
                summaryLoading={checkout.summaryLoading}
                currencyCode={siteContent.currencyCode}
                appliedCoupon={checkout.appliedCoupon}
                applyCoupon={checkout.applyCoupon}
                couponRemove={checkout.removeCoupon}
              />
            </div>
          </div>
        </div>
      </div>
    </CheckoutErrorBoundary>
  );
};
