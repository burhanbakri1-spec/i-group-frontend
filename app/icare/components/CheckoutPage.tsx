import React, { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { motion, useReducedMotion } from 'framer-motion';
import { MapPin, ShoppingBag, Check, ChevronRight, ArrowLeft, CreditCard, Lock } from 'lucide-react';
import { Language } from '../translations';
import { useShop } from '../context/ShopContext';
import { useSiteContent } from '../hooks/useSiteContent';
import { icareApi } from '../lib/api-client';
import { CreatedOrder, CreateOrderInput, OrderSummary, UserAddress } from '../types';
import { ImageWithFallback } from './figma/ImageWithFallback';

const MAP_PICKER_FRAME_CLASS = 'w-full h-64 md:h-80 rounded-lg overflow-hidden border border-gray-300 mb-4';
const CONTROL_FOCUS_CLASS = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E11D48]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-white';
const INPUT_FOCUS_CLASS = 'focus-visible:outline-none focus-visible:border-black focus-visible:ring-2 focus-visible:ring-[#E11D48]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-white';
const CHECKOUT_INPUT_CLASS = `w-full px-4 py-3 border border-[#8A867E] rounded text-[#222] placeholder:text-[#666] transition-[border-color,box-shadow] duration-200 ${INPUT_FOCUS_CLASS}`;
const SHORT_TWEEN = { duration: 0.18, ease: 'easeOut' as const };

const MapAddressPicker = dynamic(() => import('./MapAddressPicker'), {
  ssr: false,
  loading: () => (
    <div className={`${MAP_PICKER_FRAME_CLASS} bg-gray-50 animate-pulse motion-reduce:animate-none`} aria-hidden="true" />
  ),
});

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
    country: user?.country ?? 'Palestine',
  });
  const shouldReduceMotion = useReducedMotion();

  // Map & address state
  const [mapLat, setMapLat] = useState<number | null>(null);
  const [mapLng, setMapLng] = useState<number | null>(null);
  const [savedAddresses, setSavedAddresses] = useState<UserAddress[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<UserAddress | null>(null);

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
      free: 'FREE',
      deliveryLocation: '📍 Select delivery location on the map',
      clickMapToSetLocation: 'Click on the map to set your delivery location',
      savedAddresses: 'Or select a saved address',
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
      free: 'مجاني',
      deliveryLocation: '📍 اختر موقع التوصيل على الخريطة',
      clickMapToSetLocation: 'اضغط على الخريطة لتحديد موقع التوصيل',
      savedAddresses: 'أو اختر عنوان محفوظ',
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

  // Load saved addresses if authenticated
  useEffect(() => {
    if (user?.id && accessToken) {
      icareApi.addresses.list(accessToken)
        .then((addresses) => setSavedAddresses(addresses))
        .catch((error) => {
          console.error('Failed to load saved addresses', error);
        });
    }
  }, [user?.id, accessToken]);

  const updateShippingField = (field: keyof typeof shippingForm, value: string) => {
    setShippingForm((prev) => ({ ...prev, [field]: value }));
  };

  const buildOrderInput = (): CreateOrderInput => {
    const shippingName = `${shippingForm.firstName} ${shippingForm.lastName}`.trim();
    const gatewayMap: Record<string, CreateOrderInput['paymentGateway']> = {
      card: 'paymob',
      paypal: 'paypal',
      cod: undefined,
    };
    const baseOrder: CreateOrderInput = {
      paymentMethod: paymentMethod === 'cod' ? 'cash_on_delivery' : 'online',
      paymentGateway: gatewayMap[paymentMethod],
      shippingName,
      shippingEmail: shippingForm.email,
      shippingPhone: shippingForm.phone,
      shippingAddress: shippingForm.address,
      shippingCity: shippingForm.city,
      shippingPostalCode: shippingForm.postalCode,
      shippingCountry: shippingForm.country || 'Palestine',
      billingSameAsShipping: true,
    };

    // Add location data
    if (selectedAddress?.id) {
      baseOrder.addressId = selectedAddress.id;
    }
    if (mapLat !== null && mapLng !== null) {
      baseOrder.shippingLatitude = mapLat;
      baseOrder.shippingLongitude = mapLng;
    }

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
      const orderInput = buildOrderInput();
      const createdOrder = await icareApi.orders.create(orderInput, accessToken ?? undefined);
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
      console.error('[CheckoutPage] Order creation failed:', error);
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
            className={`inline-flex items-center gap-2 text-xs md:text-sm text-[#5F5D59] hover:text-black mb-4 transition-colors ${CONTROL_FOCUS_CLASS}`}
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
                <span className="text-xs mt-2 text-[#5F5D59] hidden md:block">{s.title}</span>
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
              initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 12 }}
              animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
              transition={SHORT_TWEEN}
              className="bg-white p-8 rounded-lg shadow-sm"
            >
              {step === 1 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-light mb-6">{lang === 'en' ? checkoutShippingHeading : 'معلومات الشحن'}</h2>

                  {/* Map Section */}
                  {mapLat !== null && mapLng !== null ? (
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {text.deliveryLocation}
                      </label>
                      <MapAddressPicker
                        initialLat={mapLat}
                        initialLng={mapLng}
                        onLocationSelect={(lat: number, lng: number) => {
                          setMapLat(lat);
                          setMapLng(lng);
                          setSelectedAddress(null);
                        }}
                        lang={lang}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Lat: {mapLat.toFixed(6)}, Lng: {mapLng.toFixed(6)}
                      </p>
                    </div>
                  ) : (
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {text.deliveryLocation}
                      </label>
                      <MapAddressPicker
                        onLocationSelect={(lat: number, lng: number) => {
                          setMapLat(lat);
                          setMapLng(lng);
                          setSelectedAddress(null);
                        }}
                        lang={lang}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {text.clickMapToSetLocation}
                      </p>
                    </div>
                  )}

                  {/* Saved Addresses */}
                  {savedAddresses.length > 0 && (
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {text.savedAddresses}
                      </label>
                      <div className="space-y-2">
                        {savedAddresses.map((addr) => (
                          <button
                            key={addr.id}
                            type="button"
                            onClick={() => {
                              setSelectedAddress(addr);
                              setMapLat(addr.latitude);
                              setMapLng(addr.longitude);
                            }}
                          className={`w-full p-3 border rounded-lg text-left transition-colors ${CONTROL_FOCUS_CLASS} ${
                              selectedAddress?.id === addr.id 
                                ? 'border-blue-500 bg-blue-50' 
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-sm">{addr.label}</span>
                              {addr.isDefault && (
                                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                                  Default
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                              {[addr.street, addr.building, addr.apartment].filter(Boolean).join(', ')}
                              {addr.area ? `, ${addr.area}` : ''}
                            </p>
                            <p className="text-xs text-gray-600">{addr.city}, {addr.governorate || addr.country}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="grid md:grid-cols-2 gap-4">
                    <input type="text" value={shippingForm.firstName} onChange={(event) => updateShippingField('firstName', event.target.value)} placeholder={text.firstName} className={CHECKOUT_INPUT_CLASS} />
                    <input type="text" value={shippingForm.lastName} onChange={(event) => updateShippingField('lastName', event.target.value)} placeholder={text.lastName} className={CHECKOUT_INPUT_CLASS} />
                  </div>
                  <input type="email" value={shippingForm.email} onChange={(event) => updateShippingField('email', event.target.value)} placeholder={text.email} className={CHECKOUT_INPUT_CLASS} />
                  <input type="tel" value={shippingForm.phone} onChange={(event) => updateShippingField('phone', event.target.value)} placeholder={text.phone} className={CHECKOUT_INPUT_CLASS} />
                  <input type="text" value={shippingForm.address} onChange={(event) => updateShippingField('address', event.target.value)} placeholder={text.address} className={CHECKOUT_INPUT_CLASS} />
                  <div className="grid md:grid-cols-3 gap-4">
                    <input type="text" value={shippingForm.city} onChange={(event) => updateShippingField('city', event.target.value)} placeholder={text.city} className={CHECKOUT_INPUT_CLASS} />
                    <input type="text" value={shippingForm.postalCode} onChange={(event) => updateShippingField('postalCode', event.target.value)} placeholder={text.postalCode} className={CHECKOUT_INPUT_CLASS} />
                    <input type="text" value={shippingForm.country} onChange={(event) => updateShippingField('country', event.target.value)} placeholder={text.country} className={CHECKOUT_INPUT_CLASS} />
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
                      className={`w-full p-4 border-2 rounded-lg flex items-center justify-between transition-colors duration-200 ${CONTROL_FOCUS_CLASS} ${
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
                      className={`w-full p-4 border-2 rounded-lg flex items-center justify-between transition-colors duration-200 ${CONTROL_FOCUS_CLASS} ${
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
                      className={`w-full p-4 border-2 rounded-lg flex items-center justify-between transition-colors duration-200 ${CONTROL_FOCUS_CLASS} ${
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
                      initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      transition={SHORT_TWEEN}
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
                      initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={SHORT_TWEEN}
                      className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${
                        verifyingPayment ? 'bg-amber-500' : paymentVerified ? 'bg-green-500' : 'bg-green-500'
                      }`}
                    >
                      {verifyingPayment ? (
                        <div className="w-10 h-10 border-[3px] border-white border-t-transparent rounded-full animate-spin motion-reduce:animate-none" />
                      ) : (
                        <Check size={40} className="text-white" />
                      )}
                    </motion.div>
                    <h2 className="text-3xl font-light mb-4">
                      {lang === 'en' ? checkoutConfirmedHeading : 'تم تأكيد الطلب!'}
                    </h2>
                    {verifyingPayment && (
                      <p className="text-[#5F5D59] mb-4">
                        {lang === 'en' ? 'Verifying your payment...' : 'جارٍ التحقق من الدفع...'}
                      </p>
                    )}
                    {!verifyingPayment && paymentVerified && (
                      <p className="text-green-600 text-sm font-medium mb-4">
                        {lang === 'en' ? 'Payment confirmed.' : 'تم تأكيد الدفع.'}
                      </p>
                    )}
                    {!verifyingPayment && !paymentVerified && (
                      <p className="text-[#5F5D59] mb-8">
                        {lang === 'en' 
                          ? `${checkoutConfirmedMessage} Order ${order?.orderNumber ?? ''} has been created.` 
                          : 'شكراً لشرائك. سنرسل لك رسالة تأكيد قريباً.'}
                      </p>
                    )}
                    <button
                      onClick={() => onNavigate('shop')}
                      className={`px-8 py-3 bg-black text-white rounded-full hover:bg-[#333] transition-colors ${CONTROL_FOCUS_CLASS}`}
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
                      <p className="text-sm text-[#5F5D59] mb-4">
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
                        className={`w-full px-6 py-4 bg-black text-white rounded-full hover:bg-[#333] transition-colors flex items-center justify-center gap-2 text-lg font-medium disabled:opacity-50 ${CONTROL_FOCUS_CLASS}`}
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
                      className={`flex-1 px-6 py-3 border border-black rounded-full hover:bg-[#FAFAFA] transition-colors ${CONTROL_FOCUS_CLASS}`}
                    >
                      {lang === 'en' ? checkoutNavBack : 'رجوع'}
                    </button>
                  )}
                  <button
                    onClick={() => setStep(step + 1)}
                    className={`flex-1 px-6 py-3 bg-black text-white rounded-full hover:bg-[#333] transition-colors flex items-center justify-center gap-2 ${CONTROL_FOCUS_CLASS}`}
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
                      <p className="text-xs text-[#5F5D59]">Qty: {item.quantity}</p>
                      <p className="text-sm font-medium mt-1">{item.price}</p>
                    </div>
                  </div>
                ))}
              </div>

              {summaryLoading ? (
                <div className="flex justify-center py-4 border-t border-[#EEE] pt-4">
                  <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin motion-reduce:animate-none" />
                </div>
              ) : (

              <div className="space-y-3 text-sm border-t border-[#EEE] pt-4">
                <div className="flex justify-between">
                  <span className="text-[#5F5D59]">{text.subtotal}</span>
                  <span>EGP {displayOrderSummary.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#5F5D59]">{text.shipping}</span>
                  <span className={displayOrderSummary.shipping === 0 ? 'text-green-600' : ''}>
                    {displayOrderSummary.shipping === 0 ? text.free : `EGP ${displayOrderSummary.shipping.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#5F5D59]">{text.tax}</span>
                  <span>EGP {displayOrderSummary.tax.toFixed(2)}</span>
                </div>
                {displayOrderSummary.discount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-[#5F5D59]">Discount</span>
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
