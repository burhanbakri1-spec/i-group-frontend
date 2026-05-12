/**
 * Shared type definitions for iCare application
 */

export interface Product {
  id: string;
  backendId?: number;
  slug?: string;
  variantId?: number | null;
  title?: string;
  name: string;
  price: string;
  originalPrice?: string;
  description?: string;
  image: string;
  images?: string[];
  galleryMedia?: ProductGalleryMedia[];
  rating?: string | undefined;
  reviews?: string;
  badge?: string;
  brand?: string;
  brandId?: number;
  category?: string;
  categoryId?: number;
  stock?: number;
  stockStatus?: string;
  main?: string;
  sub?: string;
  type?: string;
  rawPrice?: number;
  date?: string;
  variants?: ProductVariant[];
  backendProduct?: BackendProduct;
  cartLineId?: string;
  sourceProductId?: string;
}

export type ProductGalleryMediaType = 'IMAGE' | 'VIDEO';

export interface ProductGalleryMedia {
  url: string;
  mediaType: ProductGalleryMediaType;
  altText?: string | null;
  isPrimary?: boolean;
  sortOrder?: number;
}

export interface CartItem extends Product {
  cartItemId?: number;
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
}

export interface AppSettings {
  [group: string]: Record<string, string> | undefined;
  general?: Record<string, string>;
  social?: Record<string, string>;
  contact?: Record<string, string>;
  footer?: Record<string, string>;
}

export interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export interface PaginatedData<T> {
  data: T[];
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export type BackendNumeric = string | number;

export interface BackendCategory {
  id: number;
  slug: string;
  name: string;
  description?: string | null;
  image?: string | null;
  parentId?: number | null;
  isActive?: boolean;
  productCount?: number;
}

export interface BackendBrand {
  id: number;
  slug: string;
  name: string;
  description?: string | null;
  country?: string | null;
  logo?: string | null;
  website?: string | null;
  isActive?: boolean;
  productCount?: number;
}

export interface ProductVariant {
  id: number;
  name: string;
  sku?: string | null;
  colorCode?: string | null;
  image?: string | null;
  price?: BackendNumeric | null;
  salePrice?: BackendNumeric | null;
  stockQuantity?: number;
  stockStatus?: string;
  isActive?: boolean;
  isDefault?: boolean;
}

export interface BackendProductImage {
  imageUrl: string;
  altText?: string | null;
  sortOrder?: number;
  isPrimary?: boolean;
  mediaType?: string;
}

export interface BackendProduct {
  id: number;
  slug: string;
  name: string;
  sku?: string | null;
  shortDescription?: string | null;
  description?: string | null;
  howToUse?: string | null;
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
  size?: string | null;
  featuredImage?: string | null;
  videoUrl?: string | null;
  isFeatured?: boolean;
  isNew?: boolean;
  isBestseller?: boolean;
  ratingAverage?: BackendNumeric | null;
  ratingCount?: BackendNumeric | null;
  salesCount?: number;
  viewsCount?: number;
  createdAt?: string;
  brand?: BackendBrand | null;
  category?: BackendCategory | null;
  images?: BackendProductImage[];
  variants?: ProductVariant[];
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
  name: string;
  slug?: string;
  description?: string | null;
  isActive?: boolean;
  sortOrder?: number;
}

export interface BackendFaq {
  id: number;
  question: string;
  answer: string;
  categoryId?: number | null;
  isActive?: boolean;
  isFeatured?: boolean;
  sortOrder?: number;
  category?: Pick<BackendFaqCategory, 'id' | 'name' | 'slug'> | null;
}

export interface BackendVideo {
  id: number;
  title: string;
  slug: string;
  description?: string | null;
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
  name: string;
  slug: string;
  description?: string | null;
  isActive?: boolean;
  sortOrder?: number;
}

export interface BackendVlog {
  id: number;
  title: string;
  slug: string;
  description?: string | null;
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
  name?: string | null;
  title?: string | null;
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
  id: number;
  quantity: number;
  product: Pick<BackendProduct, 'id' | 'slug' | 'name' | 'price' | 'salePrice' | 'featuredImage'> & {
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
  id: number;
  email: string;
  name: string;
  phone?: string | null;
  avatar?: string | null;
  address?: string | null;
  city?: string | null;
  country?: string | null;
  isActive?: boolean;
}

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: AuthUser;
}

export interface OrderItemInput {
  productId: number;
  variantId?: number | null;
  quantity: number;
}

export interface CreateOrderInput {
  paymentMethod: 'cash_on_delivery' | 'online';
  paymentGateway?: 'paymob' | 'fawry' | 'bop' | 'lahza';
  shippingName: string;
  shippingEmail: string;
  shippingPhone: string;
  shippingAddress: string;
  shippingCity: string;
  shippingState?: string;
  shippingPostalCode?: string;
  shippingCountry?: string;
  billingSameAsShipping: boolean;
  notes?: string;
  guestEmail?: string;
  guestPhone?: string;
  items?: OrderItemInput[];
  addressId?: number;
  shippingLatitude?: number;
  shippingLongitude?: number;
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
  latitude: number;
  longitude: number;
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
  postalCode?: string;
  latitude: number;
  longitude: number;
  isDefault?: boolean;
}

export interface OrderSummaryItem {
  productId: number;
  variantId?: number | null;
  productName: string;
  variantName?: string | null;
  sku?: string | null;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface OrderSummary {
  items: OrderSummaryItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  discount: number;
  total: number;
}

export interface OrderListItem {
  id: number;
  orderNumber: string;
  status: string;
  paymentStatus?: string;
  total: number;
  itemCount: number;
  createdAt?: string;
}

export interface CreatedOrder {
  id: number;
  orderNumber: string;
  status: string;
  paymentMethod?: 'cash_on_delivery' | 'online';
  paymentStatus?: string;
  paymentGateway?: 'paymob' | 'fawry' | 'bop' | 'lahza';
  subtotal: number;
  shippingCost: number;
  tax: number;
  discount: number;
  total: number;
  shippingName?: string;
  shippingAddress?: string;
  shippingCity?: string;
  shippingCountry?: string;
  items?: Array<OrderSummaryItem & { id: number }>;
  statusHistory?: Array<{ status: string; comment?: string | null; createdAt: string }>;
  /** Gateway transaction reference — available after payment gateway processes the transaction. Null for COD orders. */
  transactionId?: string | null;
  createdAt?: string;
}

export interface BackendShowcaseUnit {
  id: number;
  productId: number;
  image: string;
  title: string;
  description?: string | null;
  sortOrder: number;
  layout?: string;
  isActive: boolean;
}

export interface ShowcaseUnit {
  id: number;
  image: string;
  title: string;
  description: string;
  layout?: string;
}
