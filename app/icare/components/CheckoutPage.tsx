import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, ShoppingBag, Check, ChevronRight, ArrowLeft, CreditCard, Lock } from 'lucide-react';
import { Language } from '../translations';
import { useShop } from '../context/ShopContext';
import { useSiteContent } from '../hooks/useSiteContent';
import { icareApi } from '../lib/api-client';
import { CreatedOrder, CreateOrderInput, OrderSummary } from '../types';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface CheckoutPageProps {
  lang: Language;
  onNavigate: (page: string) => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({ lang, onNavigate }) => {
  const { cartItems, cartTotal, clearCart, accessToken, isAuthenticated, user } = useShop();
  const {
    checkoutHeading,
    checkoutShippingHeading,
    checkoutPaymentHeading,
    checkoutPlaceOrder,
    checkoutTaxRate,
    checkoutCardLabel,
    checkoutPaypalLabel,
    checkoutCodLabel,
    checkoutReviewHeading,
    checkoutTermsText,
    checkoutConfirmedHeading,
    checkoutConfirmedMessage,
    checkoutNavBack,
    checkoutNavContinue,
    checkoutSubmittingText,
    checkoutBackToShop,
    freeShippingThreshold,
    defaultShippingCost,
    shippingRates,
  } = useSiteContent();
  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [orderComplete, setOrderComplete] = useState(false);
  const [order, setOrder] = useState<CreatedOrder | null>(null);
  const [orderSummary, setOrderSummary] = useState<OrderSummary | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [verifyingPayment, setVerifyingPayment] = useState(false);
  const [paymentVerified, setPaymentVerified] = useState(false);
  const [shippingForm, setShippingForm] = useState({
    firstName: user?.name?.split(' ')[0] ?? '',
    lastName: user?.name?.split(' ').slice(1).join(' ') ?? '',
    email: user?.email ?? '',
    phone: user?.phone ?? '',
    address: user?.address ?? '',
    city: user?.city ?? '',
    postalCode: '',
    country: user?.country ?? 'Egypt',
  });

  const t = {
    en: {
      checkout: 'CHECKOUT',
      shippingInfo: 'Shipping Information',
      paymentMethod: 'Payment Method',
      orderSummary: 'Order Summary',
      firstName: 'First Name',
      lastName: 'Last Name',
      email: 'Email',
      phone: 'Phone',
      address: 'Address',
      city: 'City',
      postalCode: 'Postal Code',
      country: 'Country',
      cardNumber: 'Card Number',
      expiryDate: 'Expiry Date',
      cvv: 'CVV',
      gatewayRedirect: 'You will be redirected to our secure payment gateway to complete your purchase.',
      securePayment: 'Secure payment processed by our payment partner',
      placeOrder: 'PLACE ORDER',
      continueShopping: 'Continue Shopping',
      subtotal: 'Subtotal',
      shipping: 'Shipping',
      tax: 'Tax',
      total: 'Total',
      free: 'FREE'
    },
    ar: {
      checkout: 'إتمام الطلب',
      shippingInfo: 'معلومات الشحن',
      paymentMethod: 'طريقة الدفع',
      orderSummary: 'ملخص الطلب',
      firstName: 'الاسم الأول',
      lastName: 'اسم العائلة',
      email: 'البريد الإلكتروني',
      phone: 'الهاتف',
      address: 'العنوان',
      city: 'المدينة',
      postalCode: 'الرمز البريدي',
      country: 'البلد',
      cardNumber: 'رقم البطاقة',
      expiryDate: 'تاريخ الانتهاء',
      cvv: 'رمز الأمان',
      gatewayRedirect: 'سيتم توجيهك إلى بوابة الدفع الآمنة لإتمام عملية الشراء.',
      securePayment: 'دفع آمن عبر شريك الدفع الخاص بنا',
      placeOrder: 'تأكيد الطلب',
      continueShopping: 'متابعة التسوق',
      subtotal: 'المجموع الفرعي',
      shipping: 'الشحن',
      tax: 'الضريبة',
      total: 'المجموع الكلي',
      free: 'مجاني'
    }
  };

  const text = t[lang];

  const fallbackOrderSummary = useMemo<OrderSummary>(() => {
    const shipping = cartTotal >= freeShippingThreshold ? 0 : defaultShippingCost;
    const tax = cartTotal * checkoutTaxRate;
    return {
      items: cartItems.map((item) => ({
        productId: item.backendId ?? Number(item.id),
        variantId: item.variantId,
        productName: item.name,
        variantName: item.type,
        quantity: item.quantity,
        unitPrice: item.rawPrice ?? Number(item.price.replace(/[^0-9.]/g, '')),
        totalPrice: (item.rawPrice ?? Number(item.price.replace(/[^0-9.]/g, ''))) * item.quantity,
      })),
      subtotal: cartTotal,
      shipping,
      tax,
      discount: 0,
      total: cartTotal + shipping + tax,
    };
  }, [cartItems, cartTotal, checkoutTaxRate, freeShippingThreshold, defaultShippingCost]);

  const displayOrderSummary = orderSummary ?? fallbackOrderSummary;

  useEffect(() => {
    if (!isAuthenticated || !accessToken || !icareApi.isConfigured() || cartItems.length === 0) {
      setOrderSummary(null);
      setSummaryLoading(false);
      return;
    }

    const loadOrderSummary = async () => {
      setSummaryLoading(true);
      try {
        const summary = await icareApi.orders.summary(accessToken);
        setOrderSummary(summary);
      } catch (error) {
        console.error('Failed to load order summary', error);
        setOrderSummary(null);
        setCheckoutError(error instanceof Error ? error.message : 'Unable to refresh order summary.');
      } finally {
        setSummaryLoading(false);
      }
    };

    loadOrderSummary();
  }, [accessToken, cartItems.length, isAuthenticated]);

  const updateShippingField = (field: keyof typeof shippingForm, value: string) => {
    setShippingForm((prev) => ({ ...prev, [field]: value }));
  };

  const buildOrderInput = (): CreateOrderInput => {
    const shippingName = `${shippingForm.firstName} ${shippingForm.lastName}`.trim();
    const baseOrder: CreateOrderInput = {
      paymentMethod: paymentMethod === 'cod' ? 'cash_on_delivery' : 'online',
      paymentGateway: paymentMethod === 'cod' ? undefined : 'paymob',
      shippingName,
      shippingEmail: shippingForm.email,
      shippingPhone: shippingForm.phone,
      shippingAddress: shippingForm.address,
      shippingCity: shippingForm.city,
      shippingPostalCode: shippingForm.postalCode,
      shippingCountry: shippingForm.country || 'Egypt',
      billingSameAsShipping: true,
    };

    if (isAuthenticated) return baseOrder;

    const items = cartItems
      .filter((item) => item.backendId)
      .map((item) => ({ productId: item.backendId as number, variantId: item.variantId, quantity: item.quantity }));

    return {
      ...baseOrder,
      guestEmail: shippingForm.email,
      guestPhone: shippingForm.phone,
      items,
    };
  };

  const validateCheckout = () => {
    if (!icareApi.isConfigured()) return 'Checkout is unavailable because NEXT_PUBLIC_ICARE_API_URL is not configured.';
    if (cartItems.length === 0) return 'Your cart is empty.';
    if (!shippingForm.firstName || !shippingForm.email || !shippingForm.phone || !shippingForm.address || !shippingForm.city) {
      return 'Please complete the required shipping fields.';
    }
    if (!isAuthenticated && cartItems.some((item) => !item.backendId)) {
      return 'Some guest cart items are local-only demo products. Please add backend catalog products before checkout.';
    }
    return null;
  };

  const placeOrder = async () => {
    const validationError = validateCheckout();
    if (validationError) {
      setCheckoutError(validationError);
      return;
    }

    setIsSubmitting(true);
    setCheckoutError(null);
    try {
      if (isAuthenticated && accessToken && icareApi.isConfigured()) {
        await icareApi.cart.syncPrices(accessToken).catch(() => undefined);
      }
      const createdOrder = await icareApi.orders.create(buildOrderInput(), accessToken ?? undefined);
      setOrder(createdOrder);
      setOrderComplete(true);
      clearCart();

      // Verify payment for online orders
      // transactionId comes from the backend's response (see Section 12.4 of api-references.md).
      // For COD orders or if the gateway hasn't processed yet, it remains undefined/null.
      const transactionId = createdOrder.transactionId;
      if (paymentMethod !== 'cod' && transactionId) {
        setVerifyingPayment(true);
        try {
          const result = await icareApi.payment.verify(transactionId);
          setPaymentVerified(result.status === 'success');
        } catch {
          setPaymentVerified(false);
        } finally {
          setVerifyingPayment(false);
        }
      } else {
        setPaymentVerified(false);
      }
    } catch (error) {
      setCheckoutError(error instanceof Error ? error.message : 'Failed to place order.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { number: 1, title: lang === 'en' ? checkoutShippingHeading : 'معلومات الشحن', icon: MapPin },
    { number: 2, title: lang === 'en' ? checkoutPaymentHeading : 'طريقة الدفع', icon: CreditCard },
    { number: 3, title: lang === 'en' ? checkoutReviewHeading : 'ملخص الطلب', icon: ShoppingBag }
  ];

  return (
    <div className="min-h-screen bg-[#FAFAFA] py-8 md:py-12">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <button
            onClick={() => onNavigate('shop')}
            className="inline-flex items-center gap-2 text-xs md:text-sm text-[#666] hover:text-black mb-4 transition-colors"
          >
            <ArrowLeft size={16} />
            {checkoutBackToShop}
          </button>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-light tracking-tight mb-4">{checkoutHeading}</h1>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-12 space-x-4 rtl:space-x-reverse">
          {steps.map((s, idx) => (
            <React.Fragment key={s.number}>
              <div className="flex flex-col items-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all ${
                  step >= s.number ? 'bg-black border-black text-white' : 'border-[#DDD] text-[#888]'
                }`}>
                  {step > s.number ? <Check size={20} /> : <s.icon size={20} />}
                </div>
                <span className="text-xs mt-2 text-[#666] hidden md:block">{s.title}</span>
              </div>
              {idx < steps.length - 1 && (
                <div className={`w-20 h-[2px] ${step > s.number ? 'bg-black' : 'bg-[#DDD]'}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-8 rounded-lg shadow-sm"
            >
              {step === 1 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-light mb-6">{lang === 'en' ? checkoutShippingHeading : 'معلومات الشحن'}</h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    <input type="text" value={shippingForm.firstName} onChange={(event) => updateShippingField('firstName', event.target.value)} placeholder={text.firstName} className="w-full px-4 py-3 border border-[#DDD] rounded focus:border-black focus:outline-none" />
                    <input type="text" value={shippingForm.lastName} onChange={(event) => updateShippingField('lastName', event.target.value)} placeholder={text.lastName} className="w-full px-4 py-3 border border-[#DDD] rounded focus:border-black focus:outline-none" />
                  </div>
                  <input type="email" value={shippingForm.email} onChange={(event) => updateShippingField('email', event.target.value)} placeholder={text.email} className="w-full px-4 py-3 border border-[#DDD] rounded focus:border-black focus:outline-none" />
                  <input type="tel" value={shippingForm.phone} onChange={(event) => updateShippingField('phone', event.target.value)} placeholder={text.phone} className="w-full px-4 py-3 border border-[#DDD] rounded focus:border-black focus:outline-none" />
                  <input type="text" value={shippingForm.address} onChange={(event) => updateShippingField('address', event.target.value)} placeholder={text.address} className="w-full px-4 py-3 border border-[#DDD] rounded focus:border-black focus:outline-none" />
                  <div className="grid md:grid-cols-3 gap-4">
                    <input type="text" value={shippingForm.city} onChange={(event) => updateShippingField('city', event.target.value)} placeholder={text.city} className="w-full px-4 py-3 border border-[#DDD] rounded focus:border-black focus:outline-none" />
                    <input type="text" value={shippingForm.postalCode} onChange={(event) => updateShippingField('postalCode', event.target.value)} placeholder={text.postalCode} className="w-full px-4 py-3 border border-[#DDD] rounded focus:border-black focus:outline-none" />
                    <input type="text" value={shippingForm.country} onChange={(event) => updateShippingField('country', event.target.value)} placeholder={text.country} className="w-full px-4 py-3 border border-[#DDD] rounded focus:border-black focus:outline-none" />
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-light mb-6">{lang === 'en' ? checkoutPaymentHeading : 'طريقة الدفع'}</h2>
                  
                  {/* Payment Methods */}
                  <div className="space-y-3">
                    <button
                      onClick={() => setPaymentMethod('card')}
                      className={`w-full p-4 border-2 rounded-lg flex items-center justify-between transition-all ${
                        paymentMethod === 'card' ? 'border-black bg-[#FAFAFA]' : 'border-[#DDD]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <CreditCard size={24} />
                        <span>{checkoutCardLabel}</span>
                      </div>
                      {paymentMethod === 'card' && <Check size={20} />}
                    </button>
                    
                    <button
                      onClick={() => setPaymentMethod('paypal')}
                      className={`w-full p-4 border-2 rounded-lg flex items-center justify-between transition-all ${
                        paymentMethod === 'paypal' ? 'border-black bg-[#FAFAFA]' : 'border-[#DDD]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">💳</div>
                        <span>{checkoutPaypalLabel}</span>
                      </div>
                      {paymentMethod === 'paypal' && <Check size={20} />}
                    </button>

                    <button
                      onClick={() => setPaymentMethod('cod')}
                      className={`w-full p-4 border-2 rounded-lg flex items-center justify-between transition-all ${
                        paymentMethod === 'cod' ? 'border-black bg-[#FAFAFA]' : 'border-[#DDD]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">💵</div>
                        <span>{checkoutCodLabel}</span>
                      </div>
                      {paymentMethod === 'cod' && <Check size={20} />}
                    </button>
                  </div>

                  {paymentMethod === 'card' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="pt-4"
                    >
                      <div className="bg-[#F0F7FF] border border-[#B8D8FF] rounded-lg p-5 flex items-start gap-3">
                        <Lock size={20} className="text-[#3A7BD5] mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-[#1A1A1A] mb-1">
                            {text.gatewayRedirect}
                          </p>
                          <p className="text-xs text-[#666]">
                            {text.securePayment}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              )}

              {step === 3 && (
                orderComplete ? (
                  <div className="text-center py-12">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${
                        verifyingPayment ? 'bg-amber-500' : paymentVerified ? 'bg-green-500' : 'bg-green-500'
                      }`}
                    >
                      {verifyingPayment ? (
                        <div className="w-10 h-10 border-[3px] border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Check size={40} className="text-white" />
                      )}
                    </motion.div>
                    <h2 className="text-3xl font-light mb-4">
                      {lang === 'en' ? checkoutConfirmedHeading : 'تم تأكيد الطلب!'}
                    </h2>
                    {verifyingPayment && (
                      <p className="text-[#666] mb-4">
                        {lang === 'en' ? 'Verifying your payment...' : 'جارٍ التحقق من الدفع...'}
                      </p>
                    )}
                    {!verifyingPayment && paymentVerified && (
                      <p className="text-green-600 text-sm font-medium mb-4">
                        {lang === 'en' ? 'Payment confirmed.' : 'تم تأكيد الدفع.'}
                      </p>
                    )}
                    {!verifyingPayment && !paymentVerified && (
                      <p className="text-[#666] mb-8">
                        {lang === 'en' 
                          ? `${checkoutConfirmedMessage} Order ${order?.orderNumber ?? ''} has been created.` 
                          : 'شكراً لشرائك. سنرسل لك رسالة تأكيد قريباً.'}
                      </p>
                    )}
                    <button
                      onClick={() => onNavigate('shop')}
                      className="px-8 py-3 bg-black text-white rounded-full hover:bg-[#333] transition-colors"
                    >
                      {text.continueShopping}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <h3 className="text-2xl font-light mb-6">
                      {lang === 'en' ? checkoutReviewHeading : 'مراجعة طلبك'}
                    </h3>
                    <div className="bg-[#F5F5F5] p-6 rounded-lg">
                      <p className="text-sm text-[#666] mb-4">
                        {lang === 'en' 
                          ? checkoutTermsText
                          : 'بالنقر على "تأكيد الطلب"، فإنك توافق على الشروط والأحكام الخاصة بنا.'}
                      </p>
                      {checkoutError && (
                        <p className="text-sm text-red-600 mb-4">{checkoutError}</p>
                      )}
                      <button
                        onClick={placeOrder}
                        disabled={isSubmitting}
                        className="w-full px-6 py-4 bg-black text-white rounded-full hover:bg-[#333] transition-colors flex items-center justify-center gap-2 text-lg font-medium disabled:opacity-50"
                      >
                        <Lock size={20} />
                        {isSubmitting ? checkoutSubmittingText : checkoutPlaceOrder}
                      </button>
                    </div>
                  </div>
                )
              )}

              {/* Navigation Buttons */}
              {step < 3 && !orderComplete && (
                <div className="flex gap-4 mt-8">
                  {step > 1 && (
                    <button
                      onClick={() => setStep(step - 1)}
                      className="flex-1 px-6 py-3 border border-black rounded-full hover:bg-[#FAFAFA] transition-colors"
                    >
                      {lang === 'en' ? checkoutNavBack : 'رجوع'}
                    </button>
                  )}
                  <button
                    onClick={() => setStep(step + 1)}
                    className="flex-1 px-6 py-3 bg-black text-white rounded-full hover:bg-[#333] transition-colors flex items-center justify-center gap-2"
                  >
                    {lang === 'en' ? checkoutNavContinue : 'متابعة'}
                    <ChevronRight size={18} />
                  </button>
                </div>
              )}
            </motion.div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-lg shadow-sm sticky top-24">
              <h3 className="text-xl font-light mb-6">{text.orderSummary}</h3>
              
              <div className="space-y-4 mb-6">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 pb-4 border-b border-[#EEE]">
                    <div className="w-20 h-20 bg-[#F5F5F5] rounded overflow-hidden">
                      <ImageWithFallback src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{item.title}</p>
                      <p className="text-xs text-[#888]">Qty: {item.quantity}</p>
                      <p className="text-sm font-medium mt-1">{item.price}</p>
                    </div>
                  </div>
                ))}
              </div>

              {summaryLoading ? (
                <div className="flex justify-center py-4 border-t border-[#EEE] pt-4">
                  <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (

              <div className="space-y-3 text-sm border-t border-[#EEE] pt-4">
                <div className="flex justify-between">
                  <span className="text-[#666]">{text.subtotal}</span>
                  <span>EGP {displayOrderSummary.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#666]">{text.shipping}</span>
                  <span className={displayOrderSummary.shipping === 0 ? 'text-green-600' : ''}>
                    {displayOrderSummary.shipping === 0 ? text.free : `EGP ${displayOrderSummary.shipping.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#666]">{text.tax}</span>
                  <span>EGP {displayOrderSummary.tax.toFixed(2)}</span>
                </div>
                {displayOrderSummary.discount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-[#666]">Discount</span>
                    <span>-EGP {displayOrderSummary.discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-medium text-lg pt-3 border-t border-[#EEE]">
                  <span>{text.total}</span>
                  <span>EGP {displayOrderSummary.total.toFixed(2)}</span>
                </div>
              </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
