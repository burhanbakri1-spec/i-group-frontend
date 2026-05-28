'use client';

import React, { useState, useCallback } from 'react';
import Link from 'next/link';
import { motion, useReducedMotion } from 'motion/react';
import { Search, Loader2, Truck, Package, Clock, CheckCircle, XCircle, AlertCircle, MapPin } from 'lucide-react';
import { icareApi } from '../lib/api-client';
import { Language, checkoutTranslations } from '../translations';

const CONTROL_FOCUS_CLASS =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7B7872]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-white';
const SHORT_TWEEN = { duration: 0.18, ease: 'easeOut' as const };

interface TrackOrderPageProps {
  lang: Language;
  initialOrderNumber?: string;
}

interface TrackingResult {
  orderNumber: string;
  status: string;
  shippingName?: string;
  shippingCity?: string;
  trackingNumber?: string | null;
  carrier?: string | null;
  shippedAt?: string | null;
  deliveredAt?: string | null;
  statusHistory?: Array<{ status: string; comment?: string | null; createdAt: string }>;
}

type LoadState = 'idle' | 'loading' | 'found' | 'not_found' | 'error';

const STATUS_MAP: Record<string, {
  labelEn: string;
  labelAr: string;
  icon: React.ReactNode;
  color: string;
}> = {
  pending: {
    labelEn: 'Pending',
    labelAr: 'قيد الانتظار',
    icon: <Clock size={16} />,
    color: 'bg-amber-100 text-amber-800',
  },
  confirmed: {
    labelEn: 'Confirmed',
    labelAr: 'تم التأكيد',
    icon: <CheckCircle size={16} />,
    color: 'bg-blue-100 text-blue-800',
  },
  processing: {
    labelEn: 'Processing',
    labelAr: 'قيد المعالجة',
    icon: <Package size={16} />,
    color: 'bg-purple-100 text-purple-800',
  },
  shipped: {
    labelEn: 'Shipped',
    labelAr: 'تم الشحن',
    icon: <Truck size={16} />,
    color: 'bg-green-100 text-green-800',
  },
  delivered: {
    labelEn: 'Delivered',
    labelAr: 'تم التوصيل',
    icon: <CheckCircle size={16} />,
    color: 'bg-green-500 text-white',
  },
  cancelled: {
    labelEn: 'Cancelled',
    labelAr: 'ملغي',
    icon: <XCircle size={16} />,
    color: 'bg-red-100 text-red-800',
  },
};

function getStatusInfo(status: string) {
  return (
    STATUS_MAP[status] ?? {
      labelEn: status,
      labelAr: status,
      icon: <Clock size={16} />,
      color: 'bg-gray-100 text-gray-800',
    }
  );
}

export const TrackOrderPage: React.FC<TrackOrderPageProps> = ({ lang, initialOrderNumber }) => {
  const [orderNumber, setOrderNumber] = useState(initialOrderNumber ?? '');
  const [email, setEmail] = useState('');
  const [loadState, setLoadState] = useState<LoadState>(initialOrderNumber ? 'loading' : 'idle');
  const [result, setResult] = useState<TrackingResult | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const shouldReduceMotion = useReducedMotion();

  const ct = checkoutTranslations[lang];
  const isRtl = lang === 'ar';

  const doTrack = useCallback(async () => {
    const trimmedOrder = orderNumber.trim();
    if (!trimmedOrder) return;

    setLoadState('loading');
    setErrorMessage('');
    setResult(null);

    try {
      const data = await icareApi.orders.track(trimmedOrder);

      setResult(data);
      setLoadState('found');
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      // Detect 404 vs other errors
      if (msg.includes('not found') || msg.includes('404') || (error as any)?.status === 404) {
        setLoadState('not_found');
      } else {
        setLoadState('error');
        setErrorMessage(msg);
      }
    }
  }, [orderNumber, email]);

  // Auto-track if initialOrderNumber is provided
  React.useEffect(() => {
    if (initialOrderNumber && initialOrderNumber.trim()) {
      doTrack();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    doTrack();
  };

  const statusTimeline = result?.statusHistory && result.statusHistory.length > 0
    ? [...result.statusHistory].reverse()
    : [];

  return (
    <div className="min-h-screen bg-[#F1F0ED] py-12">
      <div className="max-w-2xl mx-auto px-4">
        <motion.div
          initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={SHORT_TWEEN}
          className="bg-white p-8 md:p-10 rounded-[12px] border border-[#DDDDDD]"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-[#FAFAFA] rounded-full flex items-center justify-center mx-auto mb-4">
              <Truck size={24} className="text-[#67645E]" />
            </div>
            <h1 className="text-2xl md:text-3xl font-light mb-2">
              {lang === 'ar' ? 'تتبع طلبك' : 'Track Your Order'}
            </h1>
            <p className="text-sm text-[#84827E]">
              {lang === 'ar'
                ? 'أدخل رقم الطلب والبريد الإلكتروني للتحقق من حالة طلبك'
                : 'Enter your order number and email to check your order status'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 mb-8">
            <div>
              <label className="block text-sm font-medium text-[#67645E] mb-1.5">
                {lang === 'ar' ? 'رقم الطلب' : 'Order Number'}
              </label>
              <input
                type="text"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                placeholder="ORD-YYYYMMDD-XXXX"
                required
                className={`w-full px-4 py-3 border border-[#DDDDDD] rounded-[12px] text-sm bg-white
                  placeholder:text-[#BBB] focus:outline-none focus:border-[#7B7872] focus:ring-1 focus:ring-[#7B7872]/30
                  ${isRtl ? 'text-right' : 'text-left'}`}
                dir="ltr"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#67645E] mb-1.5">
                {lang === 'ar' ? 'البريد الإلكتروني' : 'Email'}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className={`w-full px-4 py-3 border border-[#DDDDDD] rounded-[12px] text-sm bg-white
                  placeholder:text-[#BBB] focus:outline-none focus:border-[#7B7872] focus:ring-1 focus:ring-[#7B7872]/30
                  ${isRtl ? 'text-right' : 'text-left'}`}
                dir="ltr"
              />
            </div>
            <button
              type="submit"
              disabled={loadState === 'loading'}
              className={`w-full px-6 py-3.5 bg-[#67645E] text-white rounded-full
                hover:bg-[#7B7872] transition-colors disabled:opacity-50 flex items-center
                justify-center gap-2 text-sm font-medium ${CONTROL_FOCUS_CLASS}`}
            >
              {loadState === 'loading' ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  {lang === 'ar' ? 'جارٍ البحث...' : 'Searching...'}
                </>
              ) : (
                <>
                  <Search size={18} />
                  {lang === 'ar' ? 'تتبع الطلب' : 'Track Order'}
                </>
              )}
            </button>
          </form>

          {/* Error state */}
          {loadState === 'not_found' && (
            <div className="text-center p-6 bg-red-50 rounded-lg">
              <AlertCircle size={32} className="mx-auto mb-3 text-red-500" />
              <p className="text-red-800 text-sm font-medium">
                {lang === 'ar'
                  ? 'الطلب غير موجود. يرجى التحقق من رقم الطلب والبريد الإلكتروني.'
                  : 'Order not found. Please check your order number and email.'}
              </p>
            </div>
          )}

          {loadState === 'error' && (
            <div className="text-center p-6 bg-red-50 rounded-lg">
              <AlertCircle size={32} className="mx-auto mb-3 text-red-500" />
              <p className="text-red-800 text-sm font-medium">
                {lang === 'ar'
                  ? 'تعذر تحميل معلومات التتبع. يرجى المحاولة مرة أخرى لاحقاً.'
                  : 'Unable to load tracking information. Please try again later.'}
              </p>
              {errorMessage && <p className="text-red-600 text-xs mt-2">{errorMessage}</p>}
            </div>
          )}

          {/* Results */}
          {loadState === 'found' && result && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={SHORT_TWEEN}
              className="border-t border-[#EEE] pt-6"
            >
              {/* Status badge */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-medium">
                  {lang === 'ar' ? 'الطلب' : 'Order'} {result.orderNumber}
                </h2>
                {(() => {
                  const info = getStatusInfo(result.status);
                  return (
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${info.color}`}>
                      {info.icon}
                      {lang === 'ar' ? info.labelAr : info.labelEn}
                    </span>
                  );
                })()}
              </div>

              {/* Tracking info */}
              {(result.trackingNumber || result.carrier) && (
                <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-[#F1F0ED] rounded-[12px] text-sm">
                  {result.trackingNumber && (
                    <div>
                      <p className="text-[#84827E] mb-0.5">
                        {lang === 'ar' ? 'رقم التتبع' : 'Tracking Number'}
                      </p>
                      <p className="font-medium">{result.trackingNumber}</p>
                    </div>
                  )}
                  {result.carrier && (
                    <div>
                      <p className="text-[#84827E] mb-0.5">
                        {lang === 'ar' ? 'شركة الشحن' : 'Carrier'}
                      </p>
                      <p className="font-medium">{result.carrier}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Shipping destination */}
              {result.shippingCity && (
                <div className="flex items-center gap-2 text-sm text-[#84827E] mb-6">
                  <MapPin size={14} />
                  <span>{result.shippingCity}</span>
                </div>
              )}

              {/* Status timeline */}
              {statusTimeline.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-[#67645E] mb-4">
                    {lang === 'ar' ? 'سجل الحالة' : 'Status History'}
                  </h3>
                  <div className="space-y-0">
                    {statusTimeline.map((entry, idx) => {
                      const info = getStatusInfo(entry.status);
                      const isLast = idx === statusTimeline.length - 1;
                      return (
                        <div key={idx} className="flex gap-4">
                          {/* Timeline line */}
                          <div className="flex flex-col items-center">
                            <div className={`w-3 h-3 rounded-full ${info.color.split(' ')[0]}`} />
                            {!isLast && <div className="w-0.5 flex-1 bg-[#EEE] my-0.5" />}
                          </div>
                          {/* Content */}
                          <div className={`pb-5 ${isLast ? '' : ''}`}>
                            <p className="text-sm">
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${info.color}`}>
                                {info.icon}
                                {lang === 'ar' ? info.labelAr : info.labelEn}
                              </span>
                            </p>
                            {entry.comment && (
                              <p className="text-xs text-[#84827E] mt-1">{entry.comment}</p>
                            )}
                            <p className="text-xs text-[#AAA] mt-1">
                              {new Date(entry.createdAt).toLocaleString(lang === 'ar' ? 'ar' : 'en', {
                                dateStyle: 'medium',
                                timeStyle: 'short',
                              })}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* No history */}
              {statusTimeline.length === 0 && (
                <p className="text-center text-sm text-[#AAA] py-6">
                  {lang === 'ar' ? 'لا يوجد سجل حالة حتى الآن' : 'No status history available yet'}
                </p>
              )}

              {/* Footer link */}
              <div className="text-center mt-6 pt-4 border-t border-[#EEE]">
                <Link
                  href="/icare/contact"
                  className={`text-sm text-[#67645E] hover:underline ${CONTROL_FOCUS_CLASS}`}
                >
                  {lang === 'ar' ? 'بحاجة لمساعدة؟ اتصل بنا' : 'Need help? Contact support'}
                </Link>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};
