'use client';

import React from 'react';
import { Language, checkoutTranslations } from '../../translations';
import { CartItem, OrderSummary } from '../../types';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { useShop } from '../../context/ShopContext';
import { icareApi } from '../../lib/api-client';

interface CheckoutOrderSummaryProps {
  lang: Language;
  cartItems: CartItem[];
  displayOrderSummary: OrderSummary;
  summaryLoading: boolean;
  currencyCode?: string;
  appliedCoupon: string | null;
  applyCoupon: (code: string) => void;
  couponRemove: () => void;
}

export const CheckoutOrderSummary: React.FC<CheckoutOrderSummaryProps> = ({
  lang,
  cartItems,
  displayOrderSummary,
  summaryLoading,
  currencyCode,
  appliedCoupon,
  applyCoupon,
  couponRemove,
}) => {
  const { accessToken } = useShop();
  const ct = checkoutTranslations[lang];
  const currency = currencyCode || 'USD';
  const [couponInput, setCouponInput] = React.useState('');
  const [couponLoading, setCouponLoading] = React.useState(false);
  const [couponError, setCouponError] = React.useState<string | null>(null);

  const handleCouponApply = async () => {
    const code = couponInput.trim();
    if (!code) return;

    // Prevent applying if same coupon is already applied
    if (appliedCoupon && appliedCoupon.toUpperCase() === code.toUpperCase()) {
      setCouponError(ct.couponAlreadyApplied);
      return;
    }

    if (!accessToken) {
      setCouponError(ct.signInRequired);
      return;
    }

    setCouponLoading(true);
    setCouponError(null);

    try {
      const result = await icareApi.cart.applyCoupon(accessToken, code);

      if (result.valid) {
        setCouponInput('');
        setCouponError(null);
        applyCoupon(code.toUpperCase());
      } else {
        setCouponError(result.message || ct.couponInvalid);
      }
    } catch (error) {
      setCouponError(
        error instanceof Error ? error.message : ct.couponInvalid,
      );
    } finally {
      setCouponLoading(false);
    }
  };

  const handleCouponKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !couponLoading) handleCouponApply();
  };

  const handleRemoveCoupon = () => {
    setCouponError(null);
    couponRemove();
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm sticky top-24">
      <h3 className="text-xl font-light mb-6">{ct.orderSummary}</h3>

      {/* Cart items */}
      <div className="space-y-4 mb-6">
        {cartItems.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-4 pb-4 border-b border-[#EEE]"
          >
            <div className="w-20 h-20 bg-[#F5F5F5] rounded overflow-hidden">
              <ImageWithFallback
                src={item.image}
                alt={item.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1">
              <p className="font-medium text-sm">{item.title}</p>
              <p className="text-xs text-[#5F5D59]">
                {ct.qtyLabel}: {item.quantity}
              </p>
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
            <span className="text-[#5F5D59]">{ct.subtotal}</span>
            <span>
              {currency} {displayOrderSummary.subtotal.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#5F5D59]">{ct.shipping}</span>
            <span
              className={
                displayOrderSummary.shipping === 0 ? 'text-green-600' : ''
              }
            >
              {displayOrderSummary.shipping === 0
                ? ct.free
                : `${currency} ${displayOrderSummary.shipping.toFixed(2)}`}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#5F5D59]">{ct.tax}</span>
            <span>
              {currency} {displayOrderSummary.tax.toFixed(2)}
            </span>
          </div>
          {displayOrderSummary.discount > 0 && (
            <div className="flex justify-between">
              <span className="text-[#5F5D59]">{ct.discount}</span>
              <span>
                -{currency} {displayOrderSummary.discount.toFixed(2)}
              </span>
            </div>
          )}
          <div className="flex justify-between font-medium text-lg pt-3 border-t border-[#EEE]">
            <span>{ct.total}</span>
            <span>
              {currency} {displayOrderSummary.total.toFixed(2)}
            </span>
          </div>
        </div>
      )}

      {/* Coupon input */}
      <div className="mt-6 pt-4 border-t border-[#EEE]">
        {appliedCoupon ? (
          <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-3 py-2">
            <div>
              <p className="text-xs text-green-700 font-medium">
                {ct.couponApplied}
              </p>
              <p className="text-sm font-semibold text-green-800">
                {appliedCoupon}
              </p>
            </div>
            <button
              onClick={handleRemoveCoupon}
              disabled={couponLoading}
              className="text-xs text-red-600 hover:text-red-700 underline"
            >
              {ct.couponRemove}
            </button>
          </div>
        ) : (
          <div>
            <div className="flex gap-2">
              <input
                type="text"
                value={couponInput}
                onChange={(e) => {
                  setCouponInput(e.target.value);
                  if (couponError) setCouponError(null);
                }}
                onKeyDown={handleCouponKeyDown}
                placeholder={ct.couponPlaceholder}
                disabled={couponLoading}
                className="flex-1 px-3 py-2 border border-[#DDD] rounded text-sm text-[#222] placeholder:text-[#999] focus:outline-none focus:border-black disabled:opacity-50"
              />
              <button
                onClick={handleCouponApply}
                disabled={!couponInput.trim() || couponLoading}
                className="px-4 py-2 bg-black text-white text-xs rounded hover:bg-[#333] disabled:opacity-40 transition-colors whitespace-nowrap"
              >
                {couponLoading ? (
                  <span className="inline-flex items-center gap-1">
                    <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin motion-reduce:animate-none" />
                    ...
                  </span>
                ) : (
                  ct.couponApply
                )}
              </button>
            </div>
            {couponError && (
              <p className="mt-2 text-xs text-red-600">{couponError}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
