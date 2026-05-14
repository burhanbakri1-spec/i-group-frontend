'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { Check, Loader2, AlertCircle, ArrowLeft, Truck, Package } from 'lucide-react';
import { icareApi } from '../../../lib/api-client';
import { CreatedOrder } from '../../../types';
import { Language, checkoutTranslations } from '../../../translations';

const CONTROL_FOCUS_CLASS =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E11D48]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-white';
const SHORT_TWEEN = { duration: 0.18, ease: 'easeOut' as const };

interface OrderConfirmationContentProps {
  orderNumber: string;
}

type LoadState = 'loading' | 'found' | 'not_found' | 'error';

export const OrderConfirmationContent: React.FC<OrderConfirmationContentProps> = ({ orderNumber }) => {
  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [order, setOrder] = useState<CreatedOrder | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [lang, setLang] = useState<Language>('en');
  const shouldReduceMotion = useReducedMotion();

  const ct = checkoutTranslations[lang];

  useEffect(() => {
    // Detect language from document direction
    const dir = document.documentElement.dir;
    if (dir === 'rtl') setLang('ar');
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadOrder() {
      setLoadState('loading');
      try {
        // Try with stored access token first
        const token = typeof window !== 'undefined'
          ? window.localStorage.getItem('icare_access_token') ?? undefined
          : undefined;

        const data = await icareApi.orders.detail(token ?? '', orderNumber);
        if (!cancelled) {
          setOrder(data);
          setLoadState('found');
        }
      } catch (error: unknown) {
        if (!cancelled) {
          const msg = error instanceof Error ? error.message : String(error);
          if (msg.includes('not found') || msg.includes('404')) {
            setLoadState('not_found');
          } else {
            setLoadState('error');
            setErrorMessage(msg);
          }
        }
      }
    }

    loadOrder();
    return () => { cancelled = true; };
  }, [orderNumber]);

  if (loadState === 'loading') {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-white">
        <Loader2 size={36} className="animate-spin text-[#E11D48]" />
      </div>
    );
  }

  if (loadState === 'not_found' || loadState === 'error') {
    return (
      <div className="min-h-screen bg-[#FAFAFA] py-12">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <motion.div
            initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={SHORT_TWEEN}
            className="bg-white p-10 rounded-lg shadow-sm"
          >
            <AlertCircle size={48} className="mx-auto mb-5 text-[#5F5D59]" />
            <h2 className="text-2xl font-light mb-4">
              {loadState === 'not_found' ? 'Order Not Found' : 'Unable to Load Order'}
            </h2>
            <p className="text-[#5F5D59] mb-8">
              {loadState === 'not_found'
                ? "We couldn't find your order. The order number may be incorrect or the order may have expired."
                : errorMessage || 'Something went wrong loading your order. Please try again.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/icare/shop"
                className={`px-6 py-3 bg-black text-white rounded-full hover:bg-[#333] transition-colors ${CONTROL_FOCUS_CLASS}`}
              >
                {ct.continueShopping}
              </Link>
              <Link
                href="/icare/contact"
                className={`px-6 py-3 border border-black rounded-full hover:bg-[#FAFAFA] transition-colors ${CONTROL_FOCUS_CLASS}`}
              >
                Contact Support
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  if (!order) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] py-12">
      <div className="max-w-3xl mx-auto px-4">
        {/* Back navigation */}
        <Link
          href="/icare/shop"
          className={`inline-flex items-center gap-2 text-xs md:text-sm text-[#5F5D59] hover:text-black mb-6 transition-colors ${CONTROL_FOCUS_CLASS}`}
        >
          <ArrowLeft size={16} />
          {ct.continueShopping}
        </Link>

        <motion.div
          initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={SHORT_TWEEN}
          className="bg-white p-8 md:p-10 rounded-lg shadow-sm"
        >
          {/* Success header */}
          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-5">
              <Check size={32} className="text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-light mb-2">
              {ct.orderConfirmedHeading}
            </h1>
            <p className="text-[#5F5D59] text-sm">
              {ct.orderWord} <strong>{order.orderNumber}</strong> {ct.orderCreatedSuffix}
            </p>
          </div>

          {/* Order details */}
          <div className="border-t border-[#EEE] pt-8">
            <h2 className="text-lg font-medium mb-5">Order Details</h2>

            {/* Items */}
            {order.items && order.items.length > 0 && (
              <div className="mb-6">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left border-b border-[#EEE]">
                      <th className="pb-2 font-medium text-[#5F5D59]">Product</th>
                      <th className="pb-2 font-medium text-[#5F5D59] text-center">Qty</th>
                      <th className="pb-2 font-medium text-[#5F5D59] text-right">Price</th>
                      <th className="pb-2 font-medium text-[#5F5D59] text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items.map((item, idx) => (
                      <tr key={item.id ?? idx} className="border-b border-[#F5F5F5]">
                        <td className="py-3">
                          {item.productName}
                          {item.variantName ? ` (${item.variantName})` : ''}
                        </td>
                        <td className="py-3 text-center">{item.quantity}</td>
                        <td className="py-3 text-right">${(Number(item.unitPrice)).toFixed(2)}</td>
                        <td className="py-3 text-right">${(Number(item.totalPrice)).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Totals */}
            <div className="text-sm space-y-2 mb-6">
              <div className="flex justify-between"><span className="text-[#5F5D59]">{ct.subtotal}</span><span>${order.subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="text-[#5F5D59]">{ct.shipping}</span><span>{order.shippingCost === 0 ? ct.free : `$${order.shippingCost.toFixed(2)}`}</span></div>
              <div className="flex justify-between"><span className="text-[#5F5D59]">{ct.tax}</span><span>${order.tax.toFixed(2)}</span></div>
              {order.discount > 0 && (
                <div className="flex justify-between text-[#E11D48]"><span>{ct.discount}</span><span>-${order.discount.toFixed(2)}</span></div>
              )}
              <div className="flex justify-between font-bold text-base border-t border-[#EEE] pt-2">
                <span>{ct.total}</span><span>${order.total.toFixed(2)}</span>
              </div>
            </div>

            {/* Info grid */}
            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              <div className="flex items-start gap-3 p-4 bg-[#FAFAFA] rounded-lg">
                <Package size={18} className="text-[#5F5D59] mt-0.5" />
                <div>
                  <p className="font-medium">Shipping Address</p>
                  <p className="text-[#5F5D59]">{order.shippingAddress || '—'}, {order.shippingCity || '—'}{order.shippingCountry ? `, ${order.shippingCountry}` : ''}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-[#FAFAFA] rounded-lg">
                <Truck size={18} className="text-[#5F5D59] mt-0.5" />
                <div>
                  <p className="font-medium">Payment & Status</p>
                  <p className="text-[#5F5D59]">
                    {order.paymentMethod === 'cash_on_delivery' ? 'Cash on Delivery' : 'Online'} · {order.paymentStatus || order.status}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 mt-8 pt-6 border-t border-[#EEE]">
            <Link
              href="/icare/shop"
              className={`flex-1 px-6 py-3 border border-black rounded-full text-center hover:bg-[#FAFAFA] transition-colors ${CONTROL_FOCUS_CLASS}`}
            >
              {ct.continueShopping}
            </Link>
            <Link
              href={`/icare/track-order?orderNumber=${order.orderNumber}`}
              className={`flex-1 px-6 py-3 bg-black text-white rounded-full text-center hover:bg-[#333] transition-colors ${CONTROL_FOCUS_CLASS}`}
            >
              Track Your Order
            </Link>
          </div>

          {/* Email sent confirmation message */}
          <p className="text-center text-sm text-[#5F5D59] mt-6">
            A confirmation email has been sent to your email address.
          </p>
        </motion.div>
      </div>
    </div>
  );
};
