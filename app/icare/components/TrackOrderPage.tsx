'use client';

import React, { useState, useCallback } from 'react';
import Link from 'next/link';
import { motion, useReducedMotion } from 'motion/react';
import { Search, Loader2, Truck, Package, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { icareApi, IcareApiError } from '../lib/api-client';
import { Language, translations } from '../translations';

const CONTROL_FOCUS_CLASS =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7B7872]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-white';
const SHORT_TWEEN = { duration: 0.18, ease: 'easeOut' as const };

interface TrackOrderPageProps {
  lang: Language;
  initialOrderNumber?: string;
}

interface TrackingResult {
  status: string;
  trackingNumber?: string | null;
  carrier?: string | null;
  shippedAt?: string | null;
  deliveredAt?: string | null;
  lastStatusUpdate?: string | null;
}

type LoadState = 'idle' | 'loading' | 'found' | 'not_found' | 'error';

const STATUS_ICONS: Record<string, React.ReactNode> = {
  pending: <Clock size={16} />,
  reviewed: <CheckCircle size={16} />,
  confirmed: <CheckCircle size={16} />,
  processing: <Package size={16} />,
  shipped: <Truck size={16} />,
  out_for_delivery: <Truck size={16} />,
  delivered: <CheckCircle size={16} />,
  cancelled: <XCircle size={16} />,
};

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800',
  reviewed: 'bg-blue-100 text-blue-800',
  confirmed: 'bg-blue-100 text-blue-800',
  processing: 'bg-purple-100 text-purple-800',
  shipped: 'bg-indigo-100 text-indigo-800',
  out_for_delivery: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-500 text-white',
  cancelled: 'bg-red-100 text-red-800',
};

function getStatusInfo(status: string, lang: Language) {
  const t = translations[lang];
  const accountStatus = t.accountPage as Record<string, string | undefined>;
  const label = accountStatus[status] ?? status;
  return {
    label,
    icon: STATUS_ICONS[status] ?? <Clock size={16} />,
    color: STATUS_COLORS[status] ?? 'bg-gray-100 text-gray-800',
  };
}

export const TrackOrderPage: React.FC<TrackOrderPageProps> = ({ lang, initialOrderNumber }) => {
  const [orderNumber, setOrderNumber] = useState(initialOrderNumber ?? '');
  const [email, setEmail] = useState('');
  const [loadState, setLoadState] = useState<LoadState>(initialOrderNumber ? 'loading' : 'idle');
  const [result, setResult] = useState<TrackingResult | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const shouldReduceMotion = useReducedMotion();

  const t = translations[lang];
  const isRtl = lang === 'ar';

  const doTrack = useCallback(async () => {
    const trimmedOrder = orderNumber.trim();
    const trimmedEmail = email.trim();
    if (!trimmedOrder || !trimmedEmail) return;

    setLoadState('loading');
    setErrorMessage('');
    setResult(null);

    try {
      const data = await icareApi.orders.track(trimmedOrder, trimmedEmail);

      setResult(data);
      setLoadState('found');
    } catch (error: unknown) {
      const status = (error as IcareApiError)?.status;
      const msg = error instanceof Error ? error.message : String(error);
      // 404 = unknown order OR email mismatch (backend deliberately identical).
      // Status-based check is primary; string-match is fallback for non-IcareApiError shapes.
      if (status === 404 || msg.includes('not found') || msg.includes('404')) {
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
              {t.pages.trackOrder.heading}
            </h1>
            <p className="text-sm text-[#84827E]">
              {t.pages.trackOrder.description}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 mb-8">
            <div>
              <label className="block text-sm font-medium text-[#67645E] mb-1.5">
                {t.pages.trackOrder.orderNumber}
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
                {t.pages.trackOrder.email}
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
                  {t.pages.trackOrder.searching}
                </>
              ) : (
                <>
                  <Search size={18} />
                  {t.pages.trackOrder.trackButton}
                </>
              )}
            </button>
          </form>

          {/* Error state */}
          {loadState === 'not_found' && (
            <div className="text-center p-6 bg-red-50 rounded-lg">
              <AlertCircle size={32} className="mx-auto mb-3 text-red-500" />
              <p className="text-red-800 text-sm font-medium">
                {t.pages.trackOrder.notFound}
              </p>
            </div>
          )}

          {loadState === 'error' && (
            <div className="text-center p-6 bg-red-50 rounded-lg">
              <AlertCircle size={32} className="mx-auto mb-3 text-red-500" />
              <p className="text-red-800 text-sm font-medium">
                {t.pages.trackOrder.error}
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
                  {t.pages.trackOrder.orderPrefix} {orderNumber.trim()}
                </h2>
                {(() => {
                  const info = getStatusInfo(result.status, lang);
                  return (
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${info.color}`}>
                      {info.icon}
                      {info.label}
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
                        {t.pages.trackOrder.trackingNumber}
                      </p>
                      <p className="font-medium">{result.trackingNumber}</p>
                    </div>
                  )}
                  {result.carrier && (
                    <div>
                      <p className="text-[#84827E] mb-0.5">
                        {t.pages.trackOrder.carrier}
                      </p>
                      <p className="font-medium">{result.carrier}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Last status update — backend exposes only the latest timestamp, not full history. */}
              {result.lastStatusUpdate && (
                <div className="flex items-center gap-2 text-sm text-[#84827E] mb-6">
                  <Clock size={14} />
                  <span>
                    {t.pages.trackOrder.statusHistory}: {new Date(result.lastStatusUpdate).toLocaleString(lang === 'ar' ? 'ar' : 'en', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </span>
                </div>
              )}

              {!result.lastStatusUpdate && (
                <p className="text-center text-sm text-[#AAA] py-6">
                  {t.pages.trackOrder.noHistory}
                </p>
              )}

              {/* Footer link */}
              <div className="text-center mt-6 pt-4 border-t border-[#EEE]">
                <Link
                  href="/icare/contact"
                  className={`text-sm text-[#67645E] hover:underline ${CONTROL_FOCUS_CLASS}`}
                >
                  {t.pages.trackOrder.needHelp}
                </Link>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};
