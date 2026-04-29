import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, ShoppingBag, Check, ChevronRight, ArrowLeft, CreditCard, Lock } from 'lucide-react';
import { Language } from '../translations';
import { useShop } from '../context/ShopContext';

interface CheckoutPageProps {
  lang: Language;
  onNavigate: (page: string) => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({ lang, onNavigate }) => {
  const { cartItems, cartTotal, clearCart } = useShop();
  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [orderComplete, setOrderComplete] = useState(false);

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

  const steps = [
    { number: 1, title: text.shippingInfo, icon: MapPin },
    { number: 2, title: text.paymentMethod, icon: CreditCard },
    { number: 3, title: text.orderSummary, icon: ShoppingBag }
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
            {lang === 'en' ? 'Back to Shop' : 'العودة للمتجر'}
          </button>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-light tracking-tight mb-4">{text.checkout}</h1>
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
                  <h2 className="text-2xl font-light mb-6">{text.shippingInfo}</h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    <input type="text" placeholder={text.firstName} className="w-full px-4 py-3 border border-[#DDD] rounded focus:border-black focus:outline-none" />
                    <input type="text" placeholder={text.lastName} className="w-full px-4 py-3 border border-[#DDD] rounded focus:border-black focus:outline-none" />
                  </div>
                  <input type="email" placeholder={text.email} className="w-full px-4 py-3 border border-[#DDD] rounded focus:border-black focus:outline-none" />
                  <input type="tel" placeholder={text.phone} className="w-full px-4 py-3 border border-[#DDD] rounded focus:border-black focus:outline-none" />
                  <input type="text" placeholder={text.address} className="w-full px-4 py-3 border border-[#DDD] rounded focus:border-black focus:outline-none" />
                  <div className="grid md:grid-cols-3 gap-4">
                    <input type="text" placeholder={text.city} className="w-full px-4 py-3 border border-[#DDD] rounded focus:border-black focus:outline-none" />
                    <input type="text" placeholder={text.postalCode} className="w-full px-4 py-3 border border-[#DDD] rounded focus:border-black focus:outline-none" />
                    <input type="text" placeholder={text.country} className="w-full px-4 py-3 border border-[#DDD] rounded focus:border-black focus:outline-none" />
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-light mb-6">{text.paymentMethod}</h2>
                  
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
                        <span>Credit / Debit Card</span>
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
                        <span>PayPal</span>
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
                        <span>Cash on Delivery</span>
                      </div>
                      {paymentMethod === 'cod' && <Check size={20} />}
                    </button>
                  </div>

                  {paymentMethod === 'card' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="space-y-4 pt-4"
                    >
                      <input type="text" placeholder={text.cardNumber} maxLength={19} className="w-full px-4 py-3 border border-[#DDD] rounded focus:border-black focus:outline-none" />
                      <div className="grid grid-cols-2 gap-4">
                        <input type="text" placeholder={text.expiryDate} maxLength={5} className="w-full px-4 py-3 border border-[#DDD] rounded focus:border-black focus:outline-none" />
                        <input type="text" placeholder={text.cvv} maxLength={3} className="w-full px-4 py-3 border border-[#DDD] rounded focus:border-black focus:outline-none" />
                      </div>
                      <div className="flex items-center gap-2 text-sm text-[#666]">
                        <Lock size={16} />
                        <span>Your payment information is secure</span>
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
                      className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6"
                    >
                      <Check size={40} className="text-white" />
                    </motion.div>
                    <h2 className="text-3xl font-light mb-4">
                      {lang === 'en' ? 'Order Confirmed!' : 'تم تأكيد الطلب!'}
                    </h2>
                    <p className="text-[#666] mb-8">
                      {lang === 'en' 
                        ? "Thank you for your purchase. We&#39;ll send you a confirmation email shortly." 
                        : 'شكراً لشرائك. سنرسل لك رسالة تأكيد قريباً.'}
                    </p>
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
                      {lang === 'en' ? 'Review Your Order' : 'مراجعة طلبك'}
                    </h3>
                    <div className="bg-[#F5F5F5] p-6 rounded-lg">
                      <p className="text-sm text-[#666] mb-4">
                        {lang === 'en' 
                          ? 'By clicking "Place Order", you agree to our terms and conditions.' 
                          : 'بالنقر على "تأكيد الطلب"، فإنك توافق على الشروط والأحكام الخاصة بنا.'}
                      </p>
                      <button
                        onClick={() => {
                          setOrderComplete(true);
                          clearCart();
                        }}
                        className="w-full px-6 py-4 bg-black text-white rounded-full hover:bg-[#333] transition-colors flex items-center justify-center gap-2 text-lg font-medium"
                      >
                        <Lock size={20} />
                        {text.placeOrder}
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
                      {lang === 'en' ? 'Back' : 'رجوع'}
                    </button>
                  )}
                  <button
                    onClick={() => setStep(step + 1)}
                    className="flex-1 px-6 py-3 bg-black text-white rounded-full hover:bg-[#333] transition-colors flex items-center justify-center gap-2"
                  >
                    {lang === 'en' ? 'Continue' : 'متابعة'}
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
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{item.title}</p>
                      <p className="text-xs text-[#888]">Qty: {item.quantity}</p>
                      <p className="text-sm font-medium mt-1">{item.price}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3 text-sm border-t border-[#EEE] pt-4">
                <div className="flex justify-between">
                  <span className="text-[#666]">{text.subtotal}</span>
                  <span>${cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#666]">{text.shipping}</span>
                  <span className="text-green-600">{text.free}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#666]">{text.tax}</span>
                  <span>${(cartTotal * 0.08).toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-medium text-lg pt-3 border-t border-[#EEE]">
                  <span>{text.total}</span>
                  <span>${(cartTotal * 1.08).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
