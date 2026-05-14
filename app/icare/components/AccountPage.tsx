import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Language } from '../translations';
import { useShop } from '../context/ShopContext';
import { useSiteContent } from '../hooks/useSiteContent';
import { icareApi, IcareApiError } from '../lib/api-client';
import type { OrderListItem, CreatedOrder } from '../types';

interface AccountPageProps {
  onNavigate?: (page: string) => void;
  lang?: Language;
}

const CONTROL_FOCUS_CLASS = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E11D48]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#F2F1ED]';
const INPUT_FOCUS_CLASS = 'focus-visible:outline-none focus-visible:border-black focus-visible:ring-2 focus-visible:ring-[#E11D48]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#F2F1ED]';
const ACCOUNT_INPUT_CLASS = `w-full bg-white border border-[#8A867E] rounded-[12px] px-6 py-4 text-[14px] text-[#5C5A56] placeholder:text-[#666] transition-[border-color,box-shadow] duration-200 ${INPUT_FOCUS_CLASS}`;
const SHORT_TWEEN = { duration: 0.18, ease: 'easeOut' as const };

export const AccountPage: React.FC<AccountPageProps> = ({ onNavigate, lang }) => {
  const {
    authLoginImage,
    authLoginTagline,
    authHeadingLogin,
    authHeadingSignup,
    authHeadingAccount,
    authSignedInAs,
    authSignOut,
    authPlaceholderName,
    authPlaceholderEmail,
    authPlaceholderPassword,
    authPlaceholderPhone,
    authSubmitLogin,
    authSubmitSignup,
    authToggleToRegister,
    authToggleToLogin,
  } = useSiteContent();
  const loginImage = authLoginImage || "https://images.unsplash.com/photo-1729952620303-4dc47fb5d93a?q=80&w=1200&auto=format&fit=crop";
  const { user, isAuthenticated, accessToken, login, register, logout, authError } = useShop();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── Orders state ──
  const [orders, setOrders] = useState<OrderListItem[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const [expandedOrderNumber, setExpandedOrderNumber] = useState<string | null>(null);
  const [orderDetail, setOrderDetail] = useState<CreatedOrder | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [cancelStatus, setCancelStatus] = useState<Record<string, 'idle' | 'loading' | 'cancelled'>>({});
  const shouldReduceMotion = useReducedMotion();

  /** Fetch the user's order list on mount (or on access-token change). */
  const fetchOrders = useCallback(async () => {
    setOrdersLoading(true);
    setOrdersError(null);
    try {
      const result = await icareApi.orders.list(accessToken!);
      const list = Array.isArray(result) ? result : result.data ?? [];
      setOrders(list);
    } catch (err) {
      setOrdersError(err instanceof IcareApiError ? err.message : 'Unable to load your orders. Please try again.');
    } finally {
      setOrdersLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    if (isAuthenticated && accessToken) {
      fetchOrders();
    }
  }, [isAuthenticated, accessToken, fetchOrders]);

  /** Expand/toggle an order row — fetch detail on first expand. */
  const toggleOrder = async (order: OrderListItem) => {
    if (expandedOrderNumber === order.orderNumber) {
      setExpandedOrderNumber(null);
      setOrderDetail(null);
      return;
    }
    setExpandedOrderNumber(order.orderNumber);
    setDetailLoading(true);
    try {
      const detail = await icareApi.orders.detail(accessToken!, order.orderNumber);
      setOrderDetail(detail);
    } catch {
      setOrderDetail(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const statusBadgeClass = (status: string): string => {
    const s = status.toLowerCase();
    if (s === 'pending') return 'bg-amber-100 text-amber-800';
    if (s === 'confirmed' || s === 'processing') return 'bg-blue-100 text-blue-800';
    if (s === 'shipped' || s === 'delivered') return 'bg-green-100 text-green-800';
    if (s === 'cancelled' || s === 'canceled') return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-600';
  };

  const formatDate = (iso?: string) => {
    if (!iso) return '—';
    return new Intl.DateTimeFormat(lang === 'ar' ? 'ar-EG' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(iso));
  };

  const isCancellable = (status: string) => {
    const s = status.toLowerCase();
    return s === 'pending' || s === 'confirmed';
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setFormError(null);
    try {
      if (mode === 'register') {
        await register(name, email, password, phone);
      } else {
        await login(email, password);
      }
      onNavigate?.('shop');
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Authentication failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen md:h-screen bg-white p-4 md:p-6 lg:p-12 mb-12 md:mb-0 flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6 lg:gap-8 overflow-y-auto md:overflow-hidden">
      {/* Left Section: Image and Message */}
      <div className="md:w-1/2 relative h-[45vh] md:h-[80vh] w-full overflow-hidden rounded-[32px]">
        <ImageWithFallback 
          src={loginImage} 
          alt="Skin Investment" 
          className="w-full h-full object-cover"
        />
        {/* Overlay Text - Matching the image exactly */}
        <div className="absolute inset-0 flex items-center justify-center p-8 md:p-12 bg-black/10">
          <h2 className="text-white text-[28px] md:text-[36px] lg:text-[42px] font-medium leading-tight text-center md:text-left md:max-w-xl tracking-tight drop-shadow-lg">
            {authLoginTagline}
          </h2>
        </div>
      </div>

      {/* Right Section: Login Form */}
      <div className="md:w-1/2 bg-[#F2F1ED] flex items-center justify-center p-8 md:p-12 rounded-[32px] w-full h-auto md:h-[80vh]">
        <motion.div 
          initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 12 }}
          animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
          transition={SHORT_TWEEN}
          className="w-full max-w-[400px] flex flex-col items-center"
        >
          <h1 className="text-[36px] md:text-[48px] font-bold text-[#5C5A56] mb-12 lowercase">
            {isAuthenticated ? authHeadingAccount : mode === 'login' ? authHeadingLogin : authHeadingSignup}
          </h1>

          {isAuthenticated ? (
            <div className="w-full space-y-5 text-center">
              <div className="bg-white rounded-[16px] p-6 text-[#5C5A56]">
                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#5C5A56]/70 mb-2">{authSignedInAs}</p>
                <p className="text-[20px] font-bold">{user?.name}</p>
                <p className="text-[13px] text-[#5C5A56]/80">{user?.email}</p>
              </div>
              {authError && <p className="text-sm text-red-600">{authError}</p>}

              {/* ─── My Orders Section ─── */}
              <div className="w-full text-left bg-white rounded-[16px] overflow-hidden">
                <h3 className="px-5 pt-5 text-[11px] font-black uppercase tracking-[0.2em] text-[#5C5A56]/50">
                  {lang === 'ar' ? 'طلباتي' : 'My Orders'}
                </h3>

                {/* Loading */}
                {ordersLoading && (
                  <div className="flex items-center justify-center py-10">
                    <div className="w-6 h-6 border-2 border-[#5C5A56] border-t-transparent rounded-full animate-spin" />
                  </div>
                )}

                {/* Error */}
                {!ordersLoading && ordersError && (
                  <div className="px-5 py-8 text-center">
                    <p className="text-[13px] text-red-600 mb-3">{ordersError}</p>
                    <button
                      onClick={fetchOrders}
                      className={`text-[11px] font-black uppercase tracking-widest underline underline-offset-4 text-[#5C5A56] hover:text-black ${CONTROL_FOCUS_CLASS}`}
                    >
                      Retry
                    </button>
                  </div>
                )}

                {/* Empty */}
                {!ordersLoading && !ordersError && orders.length === 0 && (
                  <div className="px-5 py-10 text-center">
                    <p className="text-[13px] text-[#5C5A56]/75 mb-4">
                      You haven&apos;t placed any orders yet.
                    </p>
                    <button
                      onClick={() => onNavigate?.('shop')}
                      className={`text-[11px] font-black uppercase tracking-widest underline underline-offset-4 text-[#5C5A56] hover:text-black transition-colors ${CONTROL_FOCUS_CLASS}`}
                    >
                      Start shopping
                    </button>
                  </div>
                )}

                {/* Order list */}
                {!ordersLoading && !ordersError && orders.length > 0 && (
                  <div className="divide-y divide-black/5">
                    {orders.map((order) => {
                      const isExpanded = expandedOrderNumber === order.orderNumber;
                      const cancelState = cancelStatus[order.orderNumber] ?? 'idle';
                      return (
                        <div key={order.orderNumber}>
                          {/* Row header */}
                          <button
                            onClick={() => toggleOrder(order)}
                            className={`w-full flex items-center justify-between px-5 py-4 text-left hover:bg-[#F2F1ED]/50 transition-colors ${CONTROL_FOCUS_CLASS}`}
                          >
                            <div className="flex-1 min-w-0 pr-3">
                              <p className="text-[12px] font-extrabold uppercase tracking-[0.04em] text-[#5C5A56] truncate">
                                #{order.orderNumber}
                              </p>
                              <p className="text-[10px] text-[#5C5A56]/70 mt-0.5">
                                {formatDate(order.createdAt)}
                              </p>
                            </div>
                            <div className="flex items-center gap-3 flex-shrink-0">
                              <span className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full ${statusBadgeClass(order.status)}`}>
                                {order.status}
                              </span>
                              <span className="text-[11px] font-bold text-[#5C5A56] whitespace-nowrap">
                                USD {order.total.toFixed(0)}
                              </span>
                              <span className="text-[10px] text-[#5C5A56]/70 whitespace-nowrap">
                                {order.itemCount} {order.itemCount === 1 ? 'item' : 'items'}
                              </span>
                              <svg
                                className={`w-3 h-3 text-[#5C5A56]/70 transition-transform duration-200 motion-reduce:transition-none ${isExpanded ? 'rotate-180' : ''}`}
                                viewBox="0 0 12 12"
                                fill="none"
                              >
                                <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            </div>
                          </button>

                          {/* Expandable detail */}
                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={SHORT_TWEEN}
                                className="overflow-hidden"
                              >
                                <div className="px-5 pb-4 bg-[#F2F1ED]/30 rounded-b-[16px]">
                                  {detailLoading && (
                                    <div className="flex items-center justify-center py-6">
                                      <div className="w-5 h-5 border-2 border-[#5C5A56] border-t-transparent rounded-full animate-spin" />
                                    </div>
                                  )}

                                  {!detailLoading && orderDetail && orderDetail.orderNumber === order.orderNumber && (
                                    <div className="space-y-3 pt-2">
                                      {/* Items */}
                                      {orderDetail.items && orderDetail.items.length > 0 && (
                                        <div>
                                          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#5C5A56]/70 mb-2">Items</p>
                                          <ul className="space-y-1.5">
                                            {orderDetail.items.map((item) => (
                                              <li key={item.id} className="flex justify-between text-[11px] text-[#5C5A56]">
                                                <span className="truncate max-w-[180px]">
                                                  {item.productName}
                                                  {item.variantName ? ` (${item.variantName})` : ''}
                                                </span>
                                                <span className="font-bold ml-2 whitespace-nowrap">x{item.quantity}</span>
                                              </li>
                                            ))}
                                          </ul>
                                        </div>
                                      )}

                                      {/* Totals */}
                                      <div className="border-t border-black/5 pt-2 space-y-1">
                                        <div className="flex justify-between text-[11px] text-[#5C5A56]/75">
                                          <span>Subtotal</span>
                                          <span>USD {orderDetail.subtotal.toFixed(0)}</span>
                                        </div>
                                        <div className="flex justify-between text-[11px] text-[#5C5A56]/75">
                                          <span>Shipping</span>
                                          <span>USD {orderDetail.shippingCost.toFixed(0)}</span>
                                        </div>
                                        {orderDetail.tax > 0 && (
                                          <div className="flex justify-between text-[11px] text-[#5C5A56]/75">
                                            <span>Tax</span>
                                            <span>USD {orderDetail.tax.toFixed(0)}</span>
                                          </div>
                                        )}
                                        {orderDetail.discount > 0 && (
                                          <div className="flex justify-between text-[11px] text-[#5C5A56]/75">
                                            <span>Discount</span>
                                            <span>-USD {orderDetail.discount.toFixed(0)}</span>
                                          </div>
                                        )}
                                        <div className="flex justify-between text-[12px] font-bold text-[#5C5A56] pt-1 border-t border-black/5">
                                          <span>Total</span>
                                          <span>USD {orderDetail.total.toFixed(0)}</span>
                                        </div>
                                      </div>

                                      {/* Status timeline */}
                                      {orderDetail.statusHistory && orderDetail.statusHistory.length > 0 && (
                                        <div>
                                          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#5C5A56]/70 mb-1.5">Status Timeline</p>
                                          {orderDetail.statusHistory.map((entry, idx) => {
                                            const s = entry.status.toLowerCase();
                                            const dotColor =
                                              s === 'cancelled' || s === 'canceled' ? 'bg-red-400' :
                                              s === 'delivered' || s === 'shipped' ? 'bg-green-400' :
                                              'bg-[#5C5A56]';
                                            return (
                                              <div key={idx} className="flex items-start gap-2 pb-1.5">
                                                <div className={`w-2 h-2 rounded-full mt-1 flex-shrink-0 ${dotColor}`} />
                                                <div>
                                                  <p className="text-[11px] font-bold text-[#5C5A56]">{entry.status}</p>
                                                  <p className="text-[9px] text-[#5C5A56]/70">{formatDate(entry.createdAt)}</p>
                                                  {entry.comment && (
                                                    <p className="text-[10px] text-[#5C5A56]/75 italic">{entry.comment}</p>
                                                  )}
                                                </div>
                                              </div>
                                            );
                                          })}
                                        </div>
                                      )}

                                      {/* Cancel button */}
                                      {isCancellable(order.status) && cancelState !== 'cancelled' && (
                                        <button
                                          disabled={cancelState === 'loading'}
                                          onClick={async () => {
                                            setCancelStatus((prev) => ({ ...prev, [order.orderNumber]: 'loading' }));
                                            try {
                                              await icareApi.orders.cancel(order.orderNumber, accessToken!);
                                              setCancelStatus((prev) => ({ ...prev, [order.orderNumber]: 'cancelled' }));
                                            } catch (err) {
                                              setCancelStatus((prev) => ({ ...prev, [order.orderNumber]: 'idle' }));
                                              setOrdersError(err instanceof IcareApiError ? err.message : 'Failed to cancel order. Please try again.');
                                            }
                                          }}
                                          className={`w-full mt-2 py-2 border border-red-300 text-red-600 rounded-[10px] text-[10px] font-black uppercase tracking-[0.1em] hover:bg-red-50 transition-colors active:scale-[0.98] motion-reduce:active:scale-100 disabled:opacity-50 disabled:cursor-not-allowed ${CONTROL_FOCUS_CLASS}`}
                                        >
                                          {cancelState === 'loading' ? 'Cancelling…' : 'Cancel Order'}
                                        </button>
                                      )}

                                      {cancelState === 'cancelled' && (
                                        <p className="text-center text-[11px] text-red-600 font-bold mt-2">
                                          Cancellation request submitted.
                                        </p>
                                      )}
                                    </div>
                                  )}

                                  {!detailLoading && !orderDetail && (
                                    <p className="text-center text-[11px] text-[#5C5A56]/75 py-4">
                                      Could not load order details.
                                    </p>
                                  )}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <button
                onClick={() => logout()}
                className={`border border-[#5C5A56] text-[#5C5A56] px-14 py-3 rounded-full text-[11px] font-black uppercase tracking-[0.2em] hover:bg-black hover:text-white transition-colors duration-200 active:scale-[0.98] motion-reduce:active:scale-100 ${CONTROL_FOCUS_CLASS}`}
              >
                {authSignOut}
              </button>
            </div>
          ) : (
            <form className="w-full space-y-4 flex flex-col items-center" onSubmit={handleSubmit}>
              {mode === 'register' && (
                <div className="w-full">
                  <input
                    type="text"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder={authPlaceholderName}
                    className={ACCOUNT_INPUT_CLASS}
                  />
                </div>
              )}
              <div className="w-full">
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder={authPlaceholderEmail}
                  className={ACCOUNT_INPUT_CLASS}
                />
              </div>
              
              <div className="w-full">
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder={authPlaceholderPassword}
                  className={ACCOUNT_INPUT_CLASS}
                />
              </div>

              {mode === 'register' && (
                <div className="w-full">
                  <input
                    type="tel"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    placeholder={authPlaceholderPhone}
                    className={ACCOUNT_INPUT_CLASS}
                  />
                </div>
              )}

              {(formError || authError) && <p className="text-sm text-red-600">{formError ?? authError}</p>}

              <button disabled={isSubmitting} className={`mt-8 border border-[#5C5A56] text-[#5C5A56] px-14 py-3 rounded-full text-[11px] font-black uppercase tracking-[0.2em] hover:bg-black hover:text-white transition-colors duration-200 active:scale-[0.98] motion-reduce:active:scale-100 disabled:opacity-50 flex items-center gap-2 ${CONTROL_FOCUS_CLASS}`}>
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-[#5C5A56] border-t-transparent rounded-full animate-spin" />
                    PLEASE WAIT
                  </>
                ) : mode === 'login' ? authSubmitLogin : authSubmitSignup}
              </button>
            </form>
          )}

          {!isAuthenticated && <div className="mt-8 flex flex-col items-center gap-3">
            <div className="text-[12px] text-[#5F5D59] font-medium">
              {mode === 'login' ? authToggleToRegister : authToggleToLogin}{' '}
              <button onClick={() => setMode(mode === 'login' ? 'register' : 'login')} className={`underline underline-offset-4 hover:text-black transition-colors ${CONTROL_FOCUS_CLASS}`}>
                {mode === 'login' ? 'Sign up!' : 'Sign in!'}
              </button>
            </div>
          </div>}
        </motion.div>
      </div>
    </div>
  );
};
