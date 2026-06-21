import {
  ApiEnvelope,
  AuthSession,
  AuthUser,
  AdminListData,
  BackendBrand,
  BackendCart,
  BackendCategory,
  BackendFaq,
  BackendFaqCategory,
  BackendProduct,
  BackendProductReview,
  BackendShowcaseUnit,
  BackendVideo,
  BackendVideoCategory,
  BackendVlog,
  BackendStore,
  SettingsGroupResponse,
  AllSettingsResponse,
  CreateAddressInput,
  CreateOrderInput,
  CreateReviewInput,
  CreatedOrder,
  OrderListItem,
  OrderSummary,
  PaginatedData,
  UserAddress,
} from '../types';

type QueryValue = string | number | boolean | null | undefined;

export class IcareApiError extends Error {
  public readonly errors?: string[];
  constructor(message: string, public readonly status: number, errors?: string[]) {
    super(message);
    this.name = 'IcareApiError';
    this.errors = errors;
  }
}

const DEFAULT_API_ERROR_MESSAGE = 'iCare API request failed.';

/**
 * The browser-side API base URL points to the Next.js API proxy route
 * which avoids CORS issues by proxying to the real backend server-side.
 *
 * The real backend URL is configured via ICARE_API_BASE_URL (server-only env)
 * and consumed by the proxy route at app/api/icare/[...path]/route.ts.
 *
 * If you need to bypass the proxy (e.g. server-side rendering or scripts),
 * set NEXT_PUBLIC_ICARE_API_URL to the real backend URL.
 */
const APPROVED_BACKEND_FALLBACK_URL = 'https://backend.igroup.website';
const BROWSER_API_BASE_URL = '/api/icare';

export const getIcareApprovedBackendFallbackUrl = () => APPROVED_BACKEND_FALLBACK_URL;

export const getIcareApiBaseUrl = () => {
  const envUrl = process.env.NEXT_PUBLIC_ICARE_API_URL;
  if (envUrl) {
    return envUrl.replace(/\/$/, '');
  }
  return BROWSER_API_BASE_URL;
};

const buildUrl = (path: string, query?: Record<string, QueryValue>) => {
  const baseUrl = getIcareApiBaseUrl();
  if (!baseUrl) {
    throw new IcareApiError('iCare API base URL is not configured.', 0);
  }

  const fullUrl = `${baseUrl}${path}`;
  const hasQuery = query && Object.entries(query).some(([, v]) => v !== undefined && v !== null && v !== '');
  if (!hasQuery) return fullUrl;

  // Build query string — works for both relative and absolute URLs
  const params = new URLSearchParams();
  Object.entries(query!).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.set(key, String(value));
    }
  });
  const qs = params.toString();
  return qs ? `${fullUrl}?${qs}` : fullUrl;
};

const parseResponseBody = async <T>(response: Response): Promise<ApiEnvelope<T> | null> => {
  const bodyText = await response.text();
  if (!bodyText) return null;

  try {
    return JSON.parse(bodyText) as ApiEnvelope<T>;
  } catch {
    if (!response.ok) {
      throw new IcareApiError(bodyText || DEFAULT_API_ERROR_MESSAGE, response.status);
    }
    throw new IcareApiError('iCare API returned an invalid response.', response.status);
  }
};

const isHtmlResponse = (body: string) => {
  const trimmed = body.trimStart();
  return trimmed.startsWith('<!DOCTYPE') || trimmed.startsWith('<html') || trimmed.startsWith('<?xml');
};

const parseEnvelope = async <T>(response: Response): Promise<T> => {
  // Read raw body once so we can pass it through unwrapped on error
  const bodyText = await response.text();
  let envelope: ApiEnvelope<T> | null = null;
  try {
    envelope = bodyText ? (JSON.parse(bodyText) as ApiEnvelope<T>) : null;
  } catch {
    // Invalid JSON — will throw with raw body below if !ok
  }

  if (!response.ok || envelope?.success === false) {
    // The Next.js dev/proxy layer returns full HTML error pages on
    // crashes — dumping that body into a typed IcareApiError message
    // spams the console. Detect HTML and substitute a clean message;
    // the original status is preserved for downstream handling.
    const message = bodyText
      ? isHtmlResponse(bodyText)
        ? `Backend unavailable (HTTP ${response.status})`
        : bodyText
      : response.statusText || DEFAULT_API_ERROR_MESSAGE;
    throw new IcareApiError(message, response.status);
  }
  if (!envelope) {
    throw new IcareApiError('iCare API returned an empty response.', response.status);
  }
  return envelope.data;
};

const request = async <T>(
  path: string,
  options: RequestInit & { token?: string; query?: Record<string, QueryValue> } = {},
): Promise<T> => {
  const { token, query, headers, ...init } = options;
  const hasBody = init.body !== undefined && init.body !== null;
  try {
    const response = await fetch(buildUrl(path, query), {
      ...init,
      headers: {
        ...(hasBody ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
    });
    return parseEnvelope<T>(response);
  } catch (error) {
    // Convert browser network failures into the same typed API error components use for empty states.
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new IcareApiError('Content is temporarily unavailable. Please try again later.', 0);
    }
    throw error;
  }
};

export const icareApi = {
  isConfigured: () => Boolean(getIcareApiBaseUrl()),

  products: {
    list: (query?: Record<string, QueryValue>) =>
      request<PaginatedData<BackendProduct> | BackendProduct[]>('/api/v1/products', { query }),
    featured: (limit = 8) => request<BackendProduct[]>('/api/v1/products/featured', { query: { limit } }),
    new: (limit = 8) => request<BackendProduct[]>('/api/v1/products/new', { query: { limit } }),
    bestsellers: (limit = 8) => request<BackendProduct[]>('/api/v1/products/bestsellers', { query: { limit } }),
    onSale: (limit = 8) => request<BackendProduct[]>('/api/v1/products/on-sale', { query: { limit } }),
    detail: (slug: string) => request<BackendProduct>(`/api/v1/products/${slug}`),
    reviews: (slug: string, query?: Record<string, QueryValue>) =>
      request<PaginatedData<BackendProductReview> | BackendProductReview[]>(`/api/v1/products/${slug}/reviews`, { query }),
    related: (slug: string) => request<BackendProduct[]>(`/api/v1/products/${slug}/related`),
    showcase: (slug: string) => request<BackendShowcaseUnit[]>(`/api/v1/products/${slug}/showcase`),
    submitReview: (slug: string, review: CreateReviewInput, token?: string) =>
      request<BackendProductReview>(`/api/v1/products/${slug}/reviews`, {
        method: 'POST',
        token,
        body: JSON.stringify(review),
      }),
  },

  reviews: {
    helpful: (reviewId: number, token?: string) =>
      request<{ helpfulCount: number }>(`/api/v1/reviews/${reviewId}/helpful`, {
        method: 'POST',
        token,
        body: JSON.stringify({}),
      }),
  },

  categories: {
    list: (query?: Record<string, QueryValue>) =>
      request<PaginatedData<BackendCategory> | BackendCategory[]>('/api/v1/categories', { query }),
    roots: () => request<PaginatedData<BackendCategory> | BackendCategory[]>('/api/v1/categories/roots'),
    search: (query: string) => request<BackendCategory[]>('/api/v1/categories/search', { query: { q: query } }),
    detail: (slug: string) => request<BackendCategory>(`/api/v1/categories/${slug}`),
    children: (slug: string) => request<BackendCategory[]>(`/api/v1/categories/${slug}/children`),
  },

  brands: {
    list: (query?: Record<string, QueryValue>) =>
      request<PaginatedData<BackendBrand> | BackendBrand[]>('/api/v1/brands', { query }),
    // NOTE: wired but unused as of May 2026
    detail: (slug: string) => request<BackendBrand>(`/api/v1/brands/${slug}`),
  },

  faq: {
    categories: (query?: Record<string, QueryValue>) =>
      request<PaginatedData<BackendFaqCategory> | BackendFaqCategory[]>('/api/v1/faq-categories', { query }),
    list: (query?: Record<string, QueryValue>) =>
      request<PaginatedData<BackendFaq> | BackendFaq[]>('/api/v1/faqs', { query }),
    byCategory: (categoryId: number, query?: Record<string, QueryValue>) =>
      request<PaginatedData<BackendFaq> | BackendFaq[]>('/api/v1/faqs', {
        query: { ...query, categoryId },
      }),
  },

  auth: {
    login: (email: string, password: string) =>
      request<AuthSession>('/api/v1/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),
    register: (name: string, email: string, password: string, phone?: string) =>
      request<AuthSession>('/api/v1/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password, phone: phone || undefined }),
      }),
    refresh: (refreshToken: string) => request<AuthSession>('/api/v1/auth/refresh', { method: 'POST', token: refreshToken }),
    // NOTE: wired but unused as of May 2026
    me: (token: string) => request<AuthUser>('/api/v1/auth/me', { token }),
    logout: (token: string) => request<{ message: string }>('/api/v1/auth/logout', { method: 'POST', token }),
  },

  cart: {
    get: (token: string) => request<BackendCart>('/api/v1/cart', { token }),
    add: (token: string, productId: number, variantId: number | null | undefined, quantity: number) =>
      request<BackendCart>('/api/v1/cart', {
        method: 'POST',
        token,
        body: JSON.stringify({ productId, variantId: variantId ?? null, quantity }),
      }),
    update: (token: string, cartItemId: number, quantity: number) =>
      request<BackendCart>(`/api/v1/cart/${cartItemId}`, {
        method: 'PUT',
        token,
        body: JSON.stringify({ quantity }),
      }),
    remove: (token: string, cartItemId: number) =>
      request<BackendCart>(`/api/v1/cart/${cartItemId}`, { method: 'DELETE', token }),
    clear: (token: string) => request<BackendCart>('/api/v1/cart/clear', { method: 'POST', token }),
    syncPrices: (token: string) => request<BackendCart>('/api/v1/cart/sync-prices', { method: 'POST', token }),
    applyCoupon: (token: string, code: string) =>
      request<{ valid: boolean; couponName?: string; discount?: number; discountType?: string; message?: string }>(
        '/api/v1/cart/apply-coupon',
        { method: 'POST', token, body: JSON.stringify({ code }) },
      ),
  },

  videos: {
    list: (query?: Record<string, QueryValue>) =>
      request<PaginatedData<BackendVideo> | BackendVideo[]>('/api/v1/videos', { query }),
    // NOTE: wired but unused as of May 2026
    featured: (limit?: number) =>
      request<BackendVideo[]>('/api/v1/videos/featured', { query: { limit } }),
    // NOTE: wired but unused as of May 2026
    detail: (id: number) =>
      request<BackendVideo>(`/api/v1/videos/${id}`),
  },

  videoCategories: {
    list: (query?: Record<string, QueryValue>) =>
      request<PaginatedData<BackendVideoCategory> | BackendVideoCategory[]>('/api/v1/video-categories', { query }),
    // NOTE: wired but unused as of May 2026
    detail: (id: number) =>
      request<BackendVideoCategory>(`/api/v1/video-categories/${id}`),
  },

  vlogs: {
    list: (query?: { isActive?: boolean; isFeatured?: boolean; search?: string; page?: number; limit?: number }) =>
      request<PaginatedData<BackendVlog> | BackendVlog[]>('/api/v1/vlogs', { query }),
    featured: (query?: { limit?: number }) =>
      request<BackendVlog[]>('/api/v1/vlogs/featured', { query }),
    detail: (id: number | string) =>
      request<BackendVlog>(`/api/v1/vlogs/${id}`),
  },

  settings: {
    // NOTE: wired but unused as of May 2026
    group: (group: string) =>
      request<SettingsGroupResponse>(`/api/v1/settings/${group}`),
    all: () =>
      request<AllSettingsResponse>('/api/v1/settings'),
  },

  announcements: {
    // NOTE: wired but unused as of May 2026
    active: () =>
      request<Record<string, unknown>[]>('/api/v1/announcements'),
  },

  stores: {
    list: (query?: Record<string, QueryValue>) =>
      request<PaginatedData<BackendStore> | BackendStore[]>('/api/v1/stores', { query }),
  },

  pages: {
    // NOTE: wired but unused as of May 2026
    list: (query?: Record<string, QueryValue>) =>
      request<PaginatedData<Record<string, unknown>> | Record<string, unknown>[]>('/api/v1/pages', { query }),
    // NOTE: wired but unused as of May 2026
    bySlug: (slug: string) =>
      request<Record<string, unknown>>(`/api/v1/pages/${slug}`),
  },

  orders: {
    summary: (token: string) => request<OrderSummary>('/api/v1/orders/summary', { token }),
    create: (order: CreateOrderInput, token?: string) =>
      request<CreatedOrder>('/api/v1/orders', {
        method: 'POST',
        token,
        body: JSON.stringify(order),
      }),
    list: (token: string, query?: Record<string, QueryValue>) =>
      request<PaginatedData<OrderListItem> | OrderListItem[]>('/api/v1/orders', { token, query }),
    detail: (token: string, orderNumber: string) => request<CreatedOrder>(`/api/v1/orders/${orderNumber}`, { token }),
    /**
     * Cancel a cancellable order (status = 'pending' or 'processing').
     * Backend restores stock and records cancellation in statusHistory.
     * Requires authentication (access token).
     */
    cancel: (orderNumber: string, token: string) =>
      request<{ message: string }>(
        `/api/v1/orders/${orderNumber}/cancel`,
        { method: 'POST', token },
      ),
    /**
     * Track an order by order number — no authentication required.
     * Returns status, tracking number, carrier, and status timeline.
     */
    track: (orderNumber: string) =>
      request<{
        orderNumber: string;
        status: string;
        shippingName?: string;
        shippingCity?: string;
        trackingNumber?: string | null;
        carrier?: string | null;
        shippedAt?: string | null;
        deliveredAt?: string | null;
        statusHistory?: Array<{ status: string; comment?: string | null; createdAt: string }>;
      }>(`/api/v1/orders/${orderNumber}/track`, { method: 'POST' }),
  },

  addresses: {
    list: async (token?: string) => {
      const options: { token?: string } = {};
      if (token) options.token = token;
      return request<UserAddress[]>('/api/v1/addresses', options);
    },
    create: async (input: CreateAddressInput, token?: string) => {
      const options: RequestInit & { token?: string } = {
        method: 'POST',
        body: JSON.stringify(input),
      };
      if (token) options.token = token;
      return request<UserAddress>('/api/v1/addresses', options);
    },
    delete: async (id: number, token?: string) => {
      const options: RequestInit & { token?: string } = { method: 'DELETE' };
      if (token) options.token = token;
      return request<{ message: string }>(`/api/v1/addresses/${id}`, options);
    },
  },

  payment: {
    /**
     * Verify a payment transaction via the payment gateway.
     * Requires authentication (JWT token) — the endpoint is protected.
     */
    verify: (transactionId: string, token: string) =>
      request<{ transactionId: string; status: string; amount: number; currency: string; gateway: string; verifiedAt: string }>(
        '/api/v1/payment/verify',
        { method: 'POST', token, body: JSON.stringify({ transactionId }) },
      ),
  },

  social: {
    links: () => request<Record<string, string>>('/api/v1/social-links'),
  },
};
