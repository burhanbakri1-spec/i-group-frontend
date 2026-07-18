/**
 * Shared type definitions for iCare application
 */

import type {
  ApplicationStepsPayload,
  ContentDirection,
  KitContentsPayload,
  PresentationTheme,
  ProductPresentationUnitType,
  ResultsStudyPayload,
  RoutineStepsPayload,
  SimpleMediaTextPayload,
} from './product-presentation-units';

import type {
  BaseUnit,
  NormalizedShowcaseUnit,
  ShowcaseResponse,
  ShowcaseUnit,
  ShowcaseUnitType,
} from './showcase-units';

export type {
  ApplicationStepsPayload,
  ContentDirection,
  KitContentsPayload,
  PresentationTheme,
  ProductPresentationUnit,
  ProductPresentationUnitType,
  ResultsStudyPayload,
  RoutineStepsPayload,
  SimpleMediaTextPayload,
} from './product-presentation-units';

export type {
  BaseUnit,
  NormalizedShowcaseUnit,
  ShowcaseResponse,
  ShowcaseUnit,
  ShowcaseUnitType,
} from './showcase-units';

export interface Product {
  id: string;
  backendId?: string | number;
  slug?: string;
  variantId?: string | number | null;
  title?: string;
  name: string;
  price: string;
  originalPrice?: string;
  description?: string;
  /** @deprecated Use `primaryImage` instead. Mirrors `primaryImage` for backwards compatibility. */
  image: string;
  /** Card-dedicated primary image URL — the main photo shown in product cards. Always populated (falls back to first gallery image). */
  primaryImage: string;
  /** Card-dedicated secondary image URL — the hover-state photo shown in product cards. */
  secondaryImage?: string;
  images?: string[];
  galleryMedia?: ProductGalleryMedia[];
  /** Card-dedicated selling price (formatted USD). Used by product card price line. */
  cardPrice?: string;
  /** Card-dedicated discounted price (formatted USD). Shown as "original price" when lower than cardPrice. */
  cardSalePrice?: string;
  /** Card-dedicated cost price (formatted USD). Internal — not rendered in customer-facing card. */
  cardCostPrice?: string;
  rating?: string | undefined;
  reviews?: string;
  label?: string;
  brand?: string;
  brandId?: string | number;
  category?: string;
  categoryId?: string | number;
  stock?: number;
  stockStatus?: string;
  size?: string | null;
  main?: string;
  sub?: string;
  type?: string;
  rawPrice?: number;
  date?: string;
  variants?: ProductVariant[];
  /** Color options managed at the product level. */
  colors?: ProductColor[];
  backendProduct?: BackendProduct;
  cartLineId?: string;
  sourceProductId?: string;
}

export type ProductGalleryMediaType = 'IMAGE' | 'VIDEO';

export interface ProductGalleryMedia {
  url: string;
  mediaType: ProductGalleryMediaType;
  altText?: string | null;
  /** @deprecated Card primary/hover is driven by Product.primaryImage / Product.secondaryImage. The gallery is ordered by sortOrder. */
  isPrimary?: boolean;
  sortOrder?: number;
}

export interface CartItem extends Product {
  cartItemId?: string | number;
  quantity: number;
}

export interface WishlistItem extends Product {
  addedAt?: Date;
}

export interface Brand {
  name: string;
  country: string;
  products?: Product[];
}

export interface Category {
  name: string;
  subcategories?: string[];
  products?: Product[];
}

export interface Review {
  name: string;
  verified: boolean;
  age: string;
  concern: string;
  rating: number;
  text: string;
  date?: string;
}

export interface ProductReview {
  id?: number;
  name: string;
  verified: boolean;
  age: string;
  concern: string;
  skinType: string;
  favorites: string;
  rating: number;
  time: string;
  title: string;
  content: string;
  hydration: number;
}

export interface FAQCategoryGroup {
  id: string;
  name: string;
  items: Array<{ q: string; a: string }>;
}

export interface VlogContentItem {
  id: string;
  title: string;
  subtitle: string;  // description/details
  image: string;
  thumbnailType?: 'image' | 'video' | 'fallback';
  videoPreviewUrl?: string | null;
  videoUrl?: string | null;
}

export interface FilterOptions {
  brands?: string[];
  categories?: string[];
  priceRange?: [number, number];
  rating?: number;
}

export interface ShopContextType {
  cartItems: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
  wishlistItems: WishlistItem[];
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (id: string) => void;
  isInWishlist: (id: string) => boolean;
  user: AuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  authError: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, phone?: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshCart: () => Promise<void>;
  settings: AppSettings | null;
  socialLinks: unknown;
  content: Record<string, string>;
  contentByLocale: { en: Record<string, string>; ar: Record<string, string> };
  contentVersion: string;
}

export interface AppSettings {
  [group: string]: Record<string, string> | undefined;
  general?: Record<string, string>;
  social?: Record<string, string>;
  contact?: Record<string, string>;
  footer?: Record<string, string>;
  shipping?: Record<string, string>;
}

export interface ShippingPageFaqContent {
  question: string;
  answer: string;
}

export interface ShippingPageContent {
  title: string;
  subtitle: string;
  shippingHeading: string;
  freeShippingTitle: string;
  freeShippingDescription: string;
  expressTitle: string;
  expressDescription: string;
  internationalTitle: string;
  internationalDescription: string;
  processingTitle: string;
  processingDescription: string;
  returnsTitle: string;
  returnPolicyTitle: string;
  returnPolicyDescription: string;
  howToReturnTitle: string;
  returnSteps: string[];
  conditionsTitle: string;
  conditions: string[];
  trackingTitle: string;
  trackingDescription: string;
  faqsTitle: string;
  faqs: ShippingPageFaqContent[];
  ctaTitle: string;
  ctaDescription: string;
  ctaButton: string;
}

export interface ShippingPageContentByLanguage {
  en?: Partial<ShippingPageContent>;
  ar?: Partial<ShippingPageContent>;
}

export interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
  errors?: string[];  // validation errors on failure
}

export interface PaginatedData<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export type BackendNumeric = string | number;

/**
 * Translatable text fields come back from the BE as either a plain string
 * (typically the English fallback) or a localized object `{ en, ar }`.
 * Use `pickLocalized` from `lib/localized.ts` to read these values —
 * never call `.trim()` / render them directly. Centralizing the read path
 * makes the "object is not a valid React child" / "x?.trim is not a
 * function" bugs structurally impossible to reintroduce.
 */
export type LocalizedText = string | { en?: string | null; ar?: string | null };

export interface BackendCategory {
  id: string | number;
  slug: string;
  name: LocalizedText;
  description?: LocalizedText | null;
  image?: string | null;
  parentId?: string | number | null;
  isActive?: boolean;
  productCount?: number;
}

export interface BackendBrand {
  id: string | number;
  slug: string;
  name: LocalizedText;
  description?: LocalizedText | null;
  country?: string | null;
  logo?: string | null;
  website?: string | null;
  isActive?: boolean;
  productCount?: number;
}

export interface ProductColor {
  id: number;
  name: LocalizedText;
  hexCode: string;
  image?: string | null;
  isActive?: boolean;
  sortOrder?: number;
}

export interface ProductVariantColor {
  id: number;
  colorId: number;
  stockQuantity: number;
  stockStatus: string;
  image?: string | null;
  sku?: string | null;
  sortOrder?: number;
  isActive?: boolean;
  color?: ProductColor | null;
}

export interface ProductVariant {
  id: string | number;
  name: LocalizedText;
  sku?: string | null;
  colorCode?: string | null;
  image?: string | null;
  size?: string | null;
  price?: BackendNumeric | null;
  salePrice?: BackendNumeric | null;
  stockQuantity?: number;
  stockStatus?: string;
  isActive?: boolean;
  isDefault?: boolean;
  /** Per-color stock and image data, populated when colors are managed at the variant level. */
  variantColors?: ProductVariantColor[];
}

export interface BackendProductImage {
  imageUrl: string;
  altText?: string | null;
  sortOrder?: number;
  /** @deprecated Ignored by the shop frontend. Card primary is driven by Product.primaryImage. */
  isPrimary?: boolean;
  mediaType?: string;
}

export interface BackendProduct {
  id: string | number;
  slug: string;
  name: LocalizedText;
  sku?: string | null;
  shortDescription?: LocalizedText | null;
  description?: LocalizedText | null;
  howToUse?: LocalizedText | null;
  ingredients?: string[];
  benefits?: string[];
  skinTypes?: string[];
  concerns?: string[];
  price: BackendNumeric;
  priceCurrency?: string;
  salePrice?: BackendNumeric | null;
  salePriceCurrency?: string | null;
  stockQuantity?: number;
  stockStatus?: string;
  size?: LocalizedText | null;
  primaryImage?: string | null;
  secondaryImage?: string | null;
  primaryPrice?: BackendNumeric | null;
  primarySalePrice?: BackendNumeric | null;
  primaryCostPrice?: BackendNumeric | null;
  videoUrl?: string | null;
  isFeatured?: boolean;
  isNew?: boolean;
  isBestseller?: boolean;
  label?: LocalizedText | null;
  ratingAverage?: BackendNumeric | null;
  ratingCount?: BackendNumeric | null;
  salesCount?: number;
  viewsCount?: number;
  createdAt?: string;
  brand?: BackendBrand | null;
  category?: BackendCategory | null;
  images?: BackendProductImage[];
  variants?: ProductVariant[];
  /** Color options managed at the product level (per-product color palette). */
  colors?: ProductColor[];
  reviews?: BackendProductReviewsSummary;
}

export interface BackendProductReview {
  id?: number;
  rating: BackendNumeric;
  title?: string | null;
  comment?: string | null;
  ageRange?: string | null;
  skinType?: string | null;
  skinConcerns?: string[] | string | null;
  favoriteFeatures?: string[] | string | null;
  hydrationRating?: BackendNumeric | null;
  isVerified?: boolean;
  helpfulCount?: number;
  createdAt?: string;
  user?: {
    id?: number;
    name?: string | null;
    avatar?: string | null;
  } | null;
}

export interface CreateReviewInput {
  rating: number;
  title?: string;
  comment?: string;
  ageRange?: string;
  skinType?: string;
  skinConcerns?: string[];
  favoriteFeatures?: string[];
  hydrationRating?: number;
}

export interface BackendProductReviewsSummary {
  summary?: {
    average?: BackendNumeric | null;
    count?: BackendNumeric | null;
    distribution?: Record<string, number>;
  };
  recent?: BackendProductReview[];
}

export interface BackendFaqCategory {
  id: number;
  name: LocalizedText;
  slug?: string;
  description?: LocalizedText | null;
  isActive?: boolean;
  sortOrder?: number;
}

export interface BackendFaq {
  id: number;
  question: LocalizedText;
  answer: LocalizedText;
  categoryId?: number | null;
  isActive?: boolean;
  isFeatured?: boolean;
  sortOrder?: number;
  category?: Pick<BackendFaqCategory, 'id' | 'name' | 'slug'> | null;
}

export interface BackendVideo {
  id: number;
  title: LocalizedText;
  slug: string;
  description?: LocalizedText | null;
  videoUrl: string;
  thumbnailUrl?: string | null;
  duration?: number | null;
  categoryId?: number | null;
  isFeatured?: boolean;
  viewsCount?: number;
  likesCount?: number;
  sortOrder?: number;
  isActive?: boolean;
  category?: Pick<BackendVideoCategory, 'id' | 'name' | 'slug'> | null;
}

export interface BackendVideoCategory {
  id: number;
  name: LocalizedText;
  slug: string;
  description?: LocalizedText | null;
  isActive?: boolean;
  sortOrder?: number;
}

export interface BackendVlog {
  id: number;
  title: LocalizedText;
  slug: string;
  description?: LocalizedText | null;
  videoUrl: string;
  thumbnailUrl?: string | null;
  isFeatured?: boolean;
  isActive?: boolean;
  sortOrder?: number;
  createdAt: string;
  updatedAt: string;
}

export interface SettingsGroupResponse {
  group: string;
  settings: Record<string, string>;
}

export interface AllSettingsResponse {
  settings?: Record<string, Record<string, string>>;
  groups?: Record<string, Record<string, string>> | SettingsGroupResponse[];
}

export interface BackendStore {
  id?: string | number;
  name?: LocalizedText | null;
  title?: LocalizedText | null;
  address?: string | null;
  city?: string | null;
  country?: string | null;
  phone?: string | null;
  email?: string | null;
  latitude?: string | number | null;
  longitude?: string | number | null;
  lat?: string | number | null;
  lng?: string | number | null;
  openingHours?: string | string[] | null;
  hours?: string | string[] | null;
  isActive?: boolean | string | number | null;
}

export interface AdminListData<T> {
  data?: T[];
  items?: T[];
  records?: T[];
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

export interface BackendCartItem {
  id: string | number;
  quantity: number;
  product: Pick<BackendProduct, 'id' | 'slug' | 'name' | 'price' | 'salePrice' | 'primaryImage'> & {
    deletedAt?: string | null;
    isActive?: boolean;
  };
  variant?: ProductVariant | null;
}

export interface BackendCart {
  items: BackendCartItem[];
  summary: {
    itemCount: number;
    totalQuantity: number;
    subtotal: number;
  };
}

export interface AuthUser {
  id: string | number;
  email: string;
  name: string;
  phone?: string | null;
  avatar?: string | null;
  dateOfBirth?: string | null;
  gender?: string | null;
  address?: string | null;
  city?: string | null;
  country?: string | null;
  isActive?: boolean;
  emailVerifiedAt?: string | null;
  createdAt?: string;
}

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: AuthUser;
}

export interface OrderItemInput {
  productId: string | number;
  variantId?: string | number | null;
  quantity: number;
}

export interface CreateOrderInput {
  paymentMethod: 'cash_on_delivery' | 'online';
  paymentGateway?: 'paymob' | 'fawry' | 'bop' | 'lahza' | 'paypal';
  shippingName: string;
  shippingEmail: string;
  shippingPhone: string;
  shippingAddress: string;
  shippingCity: string;
  shippingState?: string;
  shippingPostalCode?: string;
  shippingCountry?: string;
  billingSameAsShipping?: boolean;
  notes?: string;
  // NOTE: couponCode is stored with the order but discount calculation is not yet implemented.
  // The code will be stored and visible in admin but will not affect the order total.
  couponCode?: string;
  guestEmail?: string;
  guestPhone?: string;
  items?: OrderItemInput[];
  addressId?: number;
}

export interface UserAddress {
  id: number;
  userId: number;
  label: string;
  street: string;
  building?: string | null;
  apartment?: string | null;
  area?: string | null;
  city: string;
  governorate?: string | null;
  country: string;
  postalCode?: string | null;
  latitude: number | null;
  longitude: number | null;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAddressInput {
  label?: string;
  street: string;
  building?: string;
  apartment?: string;
  area?: string;
  city: string;
  governorate?: string;
  latitude: number;
  longitude: number;
  isDefault?: boolean;
  country?: string;
}

export interface OrderSummaryItem {
  productId: string | number;
  variantId?: string | number | null;
  productName: string;
  variantName?: string | null;
  sku?: string | null;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface OrderDetailItem extends OrderSummaryItem {
  id: number;
}

export interface OrderSummary {
  items: OrderSummaryItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  discount: number;
  total: number;
  itemCount: number;
  totalQuantity: number;
}

export interface OrderListItem {
  id: string | number;
  orderNumber: string;
  status: string;
  paymentStatus?: string;
  total: number;
  itemCount: number;
  createdAt?: string;
}

export interface CreatedOrder {
  id: string | number;
  orderNumber: string;
  status: string;
  paymentMethod?: 'cash_on_delivery' | 'online';
  paymentStatus?: string;
  paymentGateway?: 'paymob' | 'fawry' | 'bop' | 'lahza' | 'paypal';
  subtotal: number;
  shippingCost: number;
  tax: number;
  discount: number;
  total: number;
  shippingName?: string;
  shippingEmail?: string;
  shippingAddress?: string;
  shippingCity?: string;
  shippingState?: string;
  shippingPostalCode?: string;
  shippingCountry?: string;
  statusHistory?: Array<{ status: string; comment?: string | null; createdAt: string }>;
  items?: OrderDetailItem[];
  guestEmail?: string | null;
  guestPhone?: string | null;
  guestSessionToken?: string | null;
  /** Gateway transaction reference — available after payment gateway processes the transaction. Null for COD orders. */
  transactionId?: string | null;
  /** Redirect URL for payment gateway — when present, the frontend must redirect the user to this URL for payment completion. Absent for COD orders. */
  paymentUrl?: string | null;
  trackingNumber?: string | null;
  carrier?: string | null;
  shippedAt?: string | null;
  deliveredAt?: string | null;
  cancelledAt?: string | null;
  createdAt?: string;
}



export type ShowcaseUnitPayload =
  | KitContentsPayload
  | ApplicationStepsPayload
  | ResultsStudyPayload
  | RoutineStepsPayload
  | SimpleMediaTextPayload
  | Record<string, unknown>
  | null;

export type ShowcaseTheme = PresentationTheme | string | Record<string, unknown> | null;

export interface BackendShowcaseUnit {
  id: number;
  type?: ShowcaseUnitType | string | null;
  payload?: ShowcaseUnitPayload | unknown;
  theme?: ShowcaseTheme;
  image?: string | null;
  title?: string | null;
  sortOrder: number;
  direction?: ContentDirection | string | null;
  isActive: boolean;
}
