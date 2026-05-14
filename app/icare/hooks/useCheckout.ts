'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useShop } from '../context/ShopContext';
import { useSiteContent } from './useSiteContent';
import { icareApi } from '../lib/api-client';
import { CreatedOrder, CreateOrderInput, OrderSummary, UserAddress } from '../types';
import { Language, checkoutTranslations } from '../translations';

// ────────────────────────────────────────────────────────────────────────────
// Analytics — lightweight event tracker (provider pluggable later)
// ────────────────────────────────────────────────────────────────────────────

declare global {
  interface Window {
    gtag?: (command: string, eventName: string, data: Record<string, unknown>) => void;
  }
}

export function trackEvent(name: string, data?: Record<string, unknown>) {
  try {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', name, data ?? {});
    }
    // Development logging
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[Analytics] ${name}`, data ?? {});
    }
  } catch {
    // Analytics must never break the checkout
  }
}

// ────────────────────────────────────────────────────────────────────────────
// SessionStorage persistence
// ────────────────────────────────────────────────────────────────────────────

const CHECKOUT_STORAGE_KEY = 'icare_checkout_state';

interface PersistedCheckoutState {
  step: number;
  paymentMethod: 'cod' | 'card' | 'paypal';
  shippingForm: ShippingFormData;
  mapLat: number | null;
  mapLng: number | null;
  selectedAddressId: number | null;
  appliedCoupon: string | null;
  timestamp: number;
}

function readCheckoutState(): PersistedCheckoutState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.sessionStorage.getItem(CHECKOUT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistedCheckoutState;
    // Expire after 60 minutes
    if (Date.now() - parsed.timestamp > 60 * 60 * 1000) {
      window.sessionStorage.removeItem(CHECKOUT_STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function writeCheckoutState(state: Partial<PersistedCheckoutState>) {
  if (typeof window === 'undefined') return;
  try {
    const existing = readCheckoutState() ?? {};
    const defaultState: PersistedCheckoutState = {
      step: 1,
      paymentMethod: 'cod',
      shippingForm: {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        region: '',
        postalCode: '',
        country: '',
        deliveryNotes: '',
      },
      mapLat: null,
      mapLng: null,
      selectedAddressId: null,
      appliedCoupon: null,
      timestamp: Date.now(),
    };
    const merged: PersistedCheckoutState = {
      ...defaultState,
      ...existing,
      ...state,
      timestamp: Date.now(),
    };
    window.sessionStorage.setItem(CHECKOUT_STORAGE_KEY, JSON.stringify(merged));
  } catch {
    // Storage full or unavailable — non-fatal
  }
}

export function clearCheckoutState() {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.removeItem(CHECKOUT_STORAGE_KEY);
  } catch {
    // Ignore
  }
}

// ────────────────────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────────────────────

export interface ShippingFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  region: string;
  postalCode: string;
  country: string;
  deliveryNotes: string;
}

export interface CheckoutState {
  step: number;
  paymentMethod: 'cod' | 'card' | 'paypal';
  orderComplete: boolean;
  order: CreatedOrder | null;
  orderSummary: OrderSummary | null;
  isSubmitting: boolean;
  checkoutError: string | null;
  summaryLoading: boolean;
  /** Single payment status enum — replaces verifyingPayment + paymentVerified booleans */
  paymentStatus: 'idle' | 'processing' | 'success' | 'failed' | 'not_applicable';
  shippingForm: ShippingFormData;
  mapLat: number | null;
  mapLng: number | null;
  savedAddresses: UserAddress[];
  selectedAddress: UserAddress | null;
  appliedCoupon: string | null;
  fallbackOrderSummary: OrderSummary;
  displayOrderSummary: OrderSummary;
  /** Checkout structural translations for the current language */
  ct: (typeof checkoutTranslations)[Language];
  /** Passthrough from ShopContext — needed by sub-components */
  cartItems: import('../types').CartItem[];
  isAuthenticated: boolean;
}

export interface CheckoutActions {
  goToStep: (step: number) => void;
  nextStep: () => void;
  previousStep: () => void;
  setPaymentMethod: (method: 'card' | 'paypal' | 'cod') => void;
  updateShippingField: (field: keyof ShippingFormData, value: string) => void;
  /** Update payment status after manual verification (e.g., callback page) */
  setPaymentStatus: (status: CheckoutState['paymentStatus']) => void;
  placeOrder: () => Promise<void>;
  handleLocationSelect: (lat: number, lng: number) => void;
  selectSavedAddress: (address: UserAddress) => void;
  applyCoupon: (code: string) => void;
  removeCoupon: () => void;
  dismissCheckoutError: () => void;
}

export type UseCheckoutReturn = CheckoutState & CheckoutActions;

// ────────────────────────────────────────────────────────────────────────────
// Default values
// ────────────────────────────────────────────────────────────────────────────

const DEFAULT_SHIPPING_FORM: ShippingFormData = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  region: '',
  postalCode: '',
  country: '',
  deliveryNotes: '',
};

// ────────────────────────────────────────────────────────────────────────────
// Hook
// ────────────────────────────────────────────────────────────────────────────

export function useCheckout(lang: Language): UseCheckoutReturn {
  const router = useRouter();
  const { cartItems, cartTotal, clearCart, accessToken, isAuthenticated, user } = useShop();
  const siteContent = useSiteContent();
  const {
    checkoutTaxRate,
    freeShippingThreshold,
    defaultShippingCost,
    currencyCode,
  } = siteContent;

  const ct = checkoutTranslations[lang];

  // ── Refs for cleanup ──

  // ── Hydrate persisted state on mount ──
  const persisted = useMemo(() => {
    if (typeof window === 'undefined') return null;
    return readCheckoutState();
  }, []);

  // ── State ──
  const [step, setStepRaw] = useState(persisted?.step ?? 1);
  const [paymentMethod, setPaymentMethodRaw] = useState<'cod' | 'card' | 'paypal'>(
    persisted?.paymentMethod ?? 'cod',
  );
  const [orderComplete, setOrderComplete] = useState(false);
  const [order, setOrder] = useState<CreatedOrder | null>(null);
  const [orderSummary, setOrderSummary] = useState<OrderSummary | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<CheckoutState['paymentStatus']>('idle');
  const [shippingForm, setShippingForm] = useState<ShippingFormData>(() => ({
    firstName: persisted?.shippingForm?.firstName ?? user?.name?.split(' ')[0] ?? '',
    lastName: persisted?.shippingForm?.lastName ?? user?.name?.split(' ').slice(1).join(' ') ?? '',
    email: persisted?.shippingForm?.email ?? user?.email ?? '',
    phone: persisted?.shippingForm?.phone ?? user?.phone ?? '',
    address: persisted?.shippingForm?.address ?? user?.address ?? '',
    city: persisted?.shippingForm?.city ?? user?.city ?? '',
    region: persisted?.shippingForm?.region ?? '',
    postalCode: persisted?.shippingForm?.postalCode ?? '',
    country: persisted?.shippingForm?.country ?? user?.country ?? '',
    deliveryNotes: persisted?.shippingForm?.deliveryNotes ?? '',
  }));
  const [mapLat, setMapLat] = useState<number | null>(persisted?.mapLat ?? null);
  const [mapLng, setMapLng] = useState<number | null>(persisted?.mapLng ?? null);
  const [savedAddresses, setSavedAddresses] = useState<UserAddress[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<UserAddress | null>(null);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(persisted?.appliedCoupon ?? null);

  // ── Persist to sessionStorage on key state changes (debounced 500ms) ──
  const storageTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevStorageSnapshotRef = useRef<string>('');

  useEffect(() => {
    if (storageTimerRef.current) clearTimeout(storageTimerRef.current);
    storageTimerRef.current = setTimeout(() => {
      const snapshot = JSON.stringify({
        step,
        paymentMethod,
        shippingForm,
        mapLat,
        mapLng,
        selectedAddressId: selectedAddress?.id ?? null,
        appliedCoupon,
      });
      if (snapshot !== prevStorageSnapshotRef.current) {
        writeCheckoutState({
          step,
          paymentMethod,
          shippingForm,
          mapLat,
          mapLng,
          selectedAddressId: selectedAddress?.id ?? null,
          appliedCoupon,
        });
        prevStorageSnapshotRef.current = snapshot;
      }
    }, 500);
    return () => {
      if (storageTimerRef.current) {
        clearTimeout(storageTimerRef.current);
        storageTimerRef.current = null;
      }
    };
  }, [step, paymentMethod, shippingForm, mapLat, mapLng, selectedAddress?.id, appliedCoupon]);

  // ── Fire analytics on mount ──
  useEffect(() => {
    trackEvent('checkout_started', {
      itemCount: cartItems.length,
      cartTotal,
    });
    return () => {
      // Cleanup on unmount
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Fire analytics on step change ──
  const prevStepRef = useRef(step);
  useEffect(() => {
    const prevStep = prevStepRef.current;
    if (step !== prevStep) {
      trackEvent('checkout_step_viewed', { step });
      if (step > prevStep) {
        trackEvent('checkout_step_completed', { fromStep: prevStep, toStep: step });
      }
    }
    prevStepRef.current = step;
  }, [step]);

  // ── Restore last completed order from sessionStorage on mount ──
  useEffect(() => {
    let cancelled = false;

    try {
      const lastOrderNumber = window.sessionStorage.getItem('lastOrderNumber');
      if (lastOrderNumber && isAuthenticated) {
        const token = accessToken ?? undefined;
        if (token) {
          icareApi.orders.detail(token, lastOrderNumber).then((foundOrder) => {
            if (!cancelled) {
              setOrder(foundOrder);
              setOrderComplete(true);
              setPaymentStatus(
                foundOrder.paymentMethod === 'cash_on_delivery' ? 'not_applicable' : 'success',
              );
              // Navigate to persistent confirmation page
              router.replace(`/icare/orders/${foundOrder.orderNumber}/confirmed`);
            }
          }).catch(() => {
            // Order may have expired or token changed — clear stale data
            try { window.sessionStorage.removeItem('lastOrderNumber'); } catch { /* ignore */ }
          });
        }
      }
    } catch {
      // sessionStorage unavailable
    }

    return () => { cancelled = true; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Compute fallback order summary ──
  const fallbackOrderSummary = useMemo<OrderSummary>(() => {
    const shipping = cartTotal >= freeShippingThreshold ? 0 : defaultShippingCost;
    const tax = cartTotal * checkoutTaxRate;
    const discount = 0;
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
      discount,
      total: cartTotal + shipping + tax - discount,
    };
  }, [cartItems, cartTotal, checkoutTaxRate, freeShippingThreshold, defaultShippingCost]);

  const displayOrderSummary = orderSummary ?? fallbackOrderSummary;

  // ── Load order summary ──
  useEffect(() => {
    if (!isAuthenticated || !accessToken || !icareApi.isConfigured() || cartItems.length === 0) {
      setOrderSummary(null);
      setSummaryLoading(false);
      return;
    }

    let cancelled = false;
    const loadOrderSummary = async () => {
      setSummaryLoading(true);
      try {
        const summary = await icareApi.orders.summary(accessToken);
        if (!cancelled) {
          setOrderSummary(summary);
        }
      } catch (error) {
        if (!cancelled) {
          console.error('Failed to load order summary', error);
          setOrderSummary(null);
          setCheckoutError(error instanceof Error ? error.message : 'Unable to refresh order summary.');
        }
      } finally {
        if (!cancelled) {
          setSummaryLoading(false);
        }
      }
    };

    loadOrderSummary();
    return () => {
      cancelled = true;
    };
  }, [accessToken, cartItems.length, isAuthenticated]);

  // ── Load saved addresses ──
  useEffect(() => {
    if (!user?.id || !accessToken) return;
    let cancelled = false;

    icareApi.addresses
      .list(accessToken)
      .then((addresses) => {
        if (!cancelled) {
          setSavedAddresses(addresses);
          // Restore selected address from persistence
          if (persisted?.selectedAddressId) {
            const found = addresses.find((a) => a.id === persisted.selectedAddressId);
            if (found) setSelectedAddress(found);
          }
        }
      })
      .catch((error) => {
        if (!cancelled) {
          console.error('Failed to load saved addresses', error);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [user?.id, accessToken]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Shipping form update ──
  const updateShippingField = useCallback(
    (field: keyof ShippingFormData, value: string) => {
      setShippingForm((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );

  // ── Location handlers ──
  const handleLocationSelect = useCallback((lat: number, lng: number) => {
    setMapLat(lat);
    setMapLng(lng);
    setSelectedAddress(null);
  }, []);

  const selectSavedAddress = useCallback((address: UserAddress) => {
    setSelectedAddress(address);
    setMapLat(address.latitude);
    setMapLng(address.longitude);
  }, []);

  // ── Coupon handlers ──
  const applyCoupon = useCallback((code: string) => {
    const trimmed = code.trim();
    if (!trimmed) return;
    setAppliedCoupon(trimmed);
    // Discount calculation handled by backend; couponCode is passed with the order
  }, []);

  const removeCoupon = useCallback(() => {
    setAppliedCoupon(null);
  }, []);

  // ── Step navigation ──
  const goToStep = useCallback((targetStep: number) => {
    setStepRaw(targetStep);
    setCheckoutError(null);
  }, []);

  const nextStep = useCallback(() => {
    setStepRaw((prev) => {
      const next = Math.min(prev + 1, 3);
      if (prev === 2) {
        trackEvent('payment_info_submitted', { method: paymentMethod });
      }
      return next;
    });
    setCheckoutError(null);
  }, [paymentMethod]);

  const previousStep = useCallback(() => {
    setStepRaw((prev) => Math.max(prev - 1, 1));
    setCheckoutError(null);
  }, []);

  // ── Payment method ──
  const setPaymentMethod = useCallback((method: 'cod' | 'card' | 'paypal') => {
    setPaymentMethodRaw(method);
    // Only COD is active; card and paypal are disabled at the component level
    trackEvent('payment_method_selected', { method });
  }, []);

  // ── Build order input ──
  const buildOrderInput = useCallback((): CreateOrderInput => {
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
      shippingState: shippingForm.region || '',
      shippingPostalCode: shippingForm.postalCode,
      shippingCountry: shippingForm.country,
      billingSameAsShipping: true,
      notes: shippingForm.deliveryNotes?.trim() || undefined,
    };

    // Add location data
    if (selectedAddress?.id) {
      baseOrder.addressId = selectedAddress.id;
    }
    if (mapLat !== null && mapLng !== null) {
      baseOrder.shippingLatitude = mapLat;
      baseOrder.shippingLongitude = mapLng;
    }

    // Attach coupon code if present
    if (appliedCoupon) {
      baseOrder.couponCode = appliedCoupon;
    }

    return baseOrder;
  }, [shippingForm, paymentMethod, selectedAddress?.id, mapLat, mapLng, appliedCoupon]);

  // ── Validation ──
  const validateCheckout = useCallback(() => {
    if (!icareApi.isConfigured())
      return ct.apiNotConfigured;
    if (cartItems.length === 0)
      return ct.emptyCartError;
    if (
      !shippingForm.firstName ||
      !shippingForm.email ||
      !shippingForm.phone ||
      !shippingForm.address ||
      !shippingForm.city
    ) {
      return ct.incompleteFieldsError;
    }
    return null;
  }, [cartItems.length, shippingForm, ct]);

  // ── Place order ──
  const placeOrder = useCallback(async () => {
    if (!isAuthenticated) {
      setCheckoutError(ct.signInRequired);
      return;
    }

    const validationError = validateCheckout();
    if (validationError) {
      setCheckoutError(validationError);
      return;
    }

    setIsSubmitting(true);
    setCheckoutError(null);
    try {
      const orderInput = buildOrderInput();

      if (process.env.NODE_ENV !== 'production') {
        console.log('[Checkout] Order payload:', JSON.stringify(orderInput, null, 2));
      }

      const createdOrder = await icareApi.orders.create(orderInput, accessToken ?? undefined);
      setOrder(createdOrder);
      setOrderComplete(true);

      // Persist order number for confirmation page restoration
      try {
        window.sessionStorage.setItem('lastOrderNumber', createdOrder.orderNumber);
      } catch {
        // sessionStorage may be unavailable — non-fatal
      }

      // Navigate to persistent confirmation page
      router.replace(`/icare/orders/${createdOrder.orderNumber}/confirmed`);

      // Fire purchase completed
      trackEvent('purchase_completed', {
        orderNumber: createdOrder.orderNumber,
        total: createdOrder.total,
        itemCount: createdOrder.items?.length ?? cartItems.length,
      });

      // Gate: only COD is currently selectable; card/paypal are frontend-disabled.
      // When online payments are re-enabled, the gateway redirect below activates automatically.
      const isOnlinePayment = paymentMethod === 'card' || paymentMethod === 'paypal';

      // ── Payment gateway redirect flow (gated — online payments currently disabled) ──
      if (isOnlinePayment) {
        const paymentUrl = createdOrder.paymentUrl;
        if (paymentUrl) {
          // Save current order state to sessionStorage before redirect
          const orderState = {
            orderNumber: createdOrder.orderNumber,
            orderId: createdOrder.id,
            transactionId: createdOrder.transactionId,
            paymentMethod,
            paymentGateway: createdOrder.paymentGateway,
          };
          writeCheckoutState({ ...orderState } as any);
          // Redirect to payment gateway
          window.location.href = paymentUrl;
          return; // Don't clear cart or update state — user is leaving the page
        } else {
          // No payment URL — gateway unavailable
          setPaymentStatus('failed');
          setCheckoutError(
            ct.gatewayUnavailable ||
              'Payment gateway unavailable. Your order is placed but payment was not initiated.',
          );
          console.error(
            '[Checkout] Payment gateway unavailable: no paymentUrl in order response',
            {
              orderNumber: createdOrder.orderNumber,
              paymentMethod,
              paymentGateway: createdOrder.paymentGateway,
            },
          );
          // Do NOT clear cart — user may retry
        }
      } else {
        // ── COD: clear cart immediately ──
        clearCart();
        setPaymentStatus('not_applicable');
      }

      // Clear persisted checkout state for non-redirect flows
      clearCheckoutState();
    } catch (error) {
      console.error('[CheckoutPage] Order creation failed:', error);

      // Passthrough raw error — no cooking, no wrappers
      const errorMessage =
        (error instanceof Error && error.message) ||
        (typeof error === 'string' && error) ||
        ct.orderFailedError;
      setCheckoutError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }, [
    isAuthenticated,
    validateCheckout,
    buildOrderInput,
    accessToken,
    clearCart,
    paymentMethod,
    cartItems.length,
    ct,
    router,
  ]);

  // ── Dismiss error ──
  const dismissCheckoutError = useCallback(() => {
    setCheckoutError(null);
  }, []);

  return {
    // State
    step,
    paymentMethod,
    orderComplete,
    order,
    orderSummary,
    isSubmitting,
    checkoutError,
    summaryLoading,
    paymentStatus,
    shippingForm,
    mapLat,
    mapLng,
    savedAddresses,
    selectedAddress,
    appliedCoupon,
    fallbackOrderSummary,
    displayOrderSummary,
    ct,
    cartItems,
    isAuthenticated,
    // Actions
    goToStep,
    nextStep,
    previousStep,
    setPaymentMethod,
    updateShippingField,
    setPaymentStatus,
    placeOrder,
    handleLocationSelect,
    selectSavedAddress,
    applyCoupon,
    removeCoupon,
    dismissCheckoutError,
  };
}
