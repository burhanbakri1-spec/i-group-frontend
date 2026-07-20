import {
  AdminListData,
  BackendBrand,
  BackendCart,
  BackendCartItem,
  BackendCategory,
  BackendFaq,
  BackendFaqCategory,
  BackendProduct,
  BackendProductReview,
  CartItem,
  FAQCategoryGroup,
  Product,
  ProductGalleryMedia,
  ProductGalleryMediaType,
  ProductReview,
  ProductVariant,
} from '../types';
import { resolveMediaUrl } from './media-url';
import { Language } from '../translations';
import { pickLocalized, pickLocalizedTrimmed } from './localized';

type NumericInput = string | number | null | undefined;

/** Module-level default currency code, updated when tenant settings load. */
let defaultCurrencyCode: string | null = null;

export const setDefaultCurrencyCode = (code: string | null | undefined): void => {
  defaultCurrencyCode = code ?? null;
};

export const getDefaultCurrencyCode = (): string | null => defaultCurrencyCode;

const normalizeFilterName = (value?: string | null) => value?.trim().toLowerCase() ?? '';


export const coerceNumber = (value: NumericInput) => {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value === 'string') {
    const trimmedValue = value.trim();
    if (!trimmedValue) return null;
    const numericValue = Number(trimmedValue);
    return Number.isFinite(numericValue) ? numericValue : null;
  }
  return null;
};

export const getFirstValidNumber = (...values: NumericInput[]) => values.map(coerceNumber).find((value) => value !== null) ?? 0;

export const getCurrencySymbol = (currencyCode?: string | null): string => {
  switch (currencyCode?.toUpperCase()) {
    case 'ILS': return '₪';
    case 'USD': return '$';
    case 'EUR': return '€';
    case 'GBP': return '£';
    case 'JOD': return 'د.ا';
    case 'EGP': return 'E£';
    default: return currencyCode ? `${currencyCode} ` : '$';
  }
};

export const formatPrice = (price: NumericInput, currencyCode?: string | null): string => {
  const symbol = getCurrencySymbol(currencyCode);
  return `${symbol}${getFirstValidNumber(price).toFixed(2)}`;
};

/** @deprecated Use formatPrice(price, currencyCode) instead. */
export const formatUsdPrice = (price: NumericInput) => `$${getFirstValidNumber(price).toFixed(2)}`;

export const getDefaultVariant = (product: BackendProduct) => {
  return product.variants?.find((variant) => variant.isDefault && variant.isActive !== false)
    ?? product.variants?.find((variant) => variant.isActive !== false)
    ?? product.variants?.[0]
    ?? null;
};

export const isPurchasableStock = (stockStatus?: string, stock?: number) => {
  if (stockStatus === 'out_of_stock') return false;
  if (typeof stock === 'number' && stock <= 0) return false;
  return true;
};

const getProductLabel = (product: BackendProduct, lang: Language = 'en') => {
  // Admin-set label has highest priority
  if (product.label) return pickLocalized(product.label, lang);

  // Check default variant-level sale first
  const defaultVariant = getDefaultVariant(product);
  if (defaultVariant) {
    const vSalePrice = coerceNumber(defaultVariant.salePrice);
    const vPrice = coerceNumber(defaultVariant.price);
    if (vSalePrice !== null && vPrice !== null && vSalePrice < vPrice) return 'sale';
  }

  // Check product-level sale (fallback)
  const pSalePrice = coerceNumber(product.salePrice);
  const pPrice = coerceNumber(product.price);
  if (pSalePrice !== null && pPrice !== null && pSalePrice < pPrice) return 'sale';
  if (product.isNew) return 'new';
  if (product.isBestseller) return 'bestseller';
  if (product.isFeatured) return 'featured';
  return undefined;
};

export const normalizeProductMediaUrl = (mediaUrl?: string | null): string =>
  resolveMediaUrl(mediaUrl);

const normalizeProductMediaType = (mediaType?: string | null): ProductGalleryMediaType => (
  mediaType?.toUpperCase() === 'VIDEO' ? 'VIDEO' : 'IMAGE'
);

/**
 * Sort gallery images purely by sortOrder then original index.
 * The legacy `isPrimary` field is ignored — the card primary is now
 * driven solely by `Product.primaryImage` (admin-set), and the gallery
 * is a sortOrder-ordered list of media items.
 */
const sortProductImagesByBackendPriority = (images: BackendProduct['images'] = []) => images
  .map((image, originalIndex) => ({ image, originalIndex }))
  .sort((first, second) => {
    const firstSortOrder = first.image.sortOrder ?? Number.MAX_SAFE_INTEGER;
    const secondSortOrder = second.image.sortOrder ?? Number.MAX_SAFE_INTEGER;
    if (firstSortOrder !== secondSortOrder) return firstSortOrder - secondSortOrder;

    return first.originalIndex - second.originalIndex;
  })
  .map(({ image }) => image);

const dedupeGalleryMedia = (media: ProductGalleryMedia[]) => {
  const seenUrls = new Set<string>();

  return media.filter((item) => {
    const normalizedUrl = normalizeProductMediaUrl(item.url);
    if (!normalizedUrl || seenUrls.has(normalizedUrl)) return false;
    seenUrls.add(normalizedUrl);
    return true;
  });
};

const mapVariantImagesToGalleryMedia = (product: BackendProduct, lang: Language, selectedVariant?: ProductVariant | null): ProductGalleryMedia[] => {
  const variants = product.variants ?? [];
  // Canonical per-(variant×color) image for the default variant: pick
  // the first active `variantColors` row that carries an image. This
  // matches the storefront contract that the product card surfaces the
  // image of the default color of the default variant.
  const defaultColorImage = selectedVariant?.variantColors
    ?.filter((row) => row.isActive !== false)
    .find((row) => row.image)?.image ?? null;
  const selectedVariantMedia = defaultColorImage ? [{
    url: normalizeProductMediaUrl(defaultColorImage),
    mediaType: 'IMAGE' as const,
    altText: selectedVariant ? pickLocalized(selectedVariant.name, lang) : null,
  }] : selectedVariant?.image ? [{
    url: normalizeProductMediaUrl(selectedVariant.image),
    mediaType: 'IMAGE' as const,
    altText: pickLocalized(selectedVariant.name, lang),
  }] : [];
  const remainingVariantMedia = variants
    .filter((variant) => variant.id !== selectedVariant?.id && variant.image)
    .map<ProductGalleryMedia>((variant) => ({
      url: normalizeProductMediaUrl(variant.image),
      mediaType: 'IMAGE',
      altText: pickLocalized(variant.name, lang),
    }));

  return [...selectedVariantMedia, ...remainingVariantMedia];
};

export const mapBackendProductGalleryMedia = (product: BackendProduct, lang: Language = 'en', variant?: ProductVariant | null): ProductGalleryMedia[] => {
  const sortedBackendImages = sortProductImagesByBackendPriority(product.images);
  const backendMedia = sortedBackendImages.map<ProductGalleryMedia>((image) => ({
    url: normalizeProductMediaUrl(image.imageUrl),
    mediaType: normalizeProductMediaType(image.mediaType),
    altText: image.altText,
    sortOrder: image.sortOrder,
  }));
  const variantMedia = mapVariantImagesToGalleryMedia(product, lang, variant);

  // Gallery is the ordered union of variant media (first, for color/variant context)
  // and the backend gallery images sorted by sortOrder.
  // `product.primaryImage` and `product.secondaryImage` are NOT prepended here —
  // those are card-display fields and the gallery is independent.
  return dedupeGalleryMedia([
    ...variantMedia,
    ...backendMedia,
  ]);
};

export const mapBackendProductToProduct = (product: BackendProduct, lang: Language = 'en', selectedVariant?: ProductVariant | null, currencyCode?: string | null): Product => {
  const activeCurrency = currencyCode ?? defaultCurrencyCode;
  const variant = selectedVariant ?? getDefaultVariant(product);

  // When a variant is explicitly selected, the variant's price is the source
  // of truth for what the user is about to buy. The product-level `primaryPrice` /
  // `primarySalePrice` are card-display overrides that the admin uses to make
  // a specific price appear on listings — they should NOT override the variant
  // the user has actively selected on the product page.
  const displayPrice = variant
    ? getFirstValidNumber(variant.salePrice, variant.price, product.primarySalePrice, product.primaryPrice, product.salePrice, product.price)
    : getFirstValidNumber(product.primarySalePrice, product.primaryPrice, product.salePrice, product.price);

  // Regular (non-sale) price follows the same priority: variant first when
  // selected, then product-level primary fields, then product base price.
  const regularPrice = variant
    ? getFirstValidNumber(variant.price, product.primaryPrice, product.price) ?? 0
    : getFirstValidNumber(product.primaryPrice, product.price) ?? 0;

  // Show original price only when the display (sale) price is lower than the regular price
  const originalPrice = regularPrice !== null && displayPrice < regularPrice
    ? formatPrice(regularPrice, activeCurrency)
    : undefined;
  const ratingAverage = coerceNumber(product.ratingAverage);
  const ratingCount = coerceNumber(product.ratingCount);
  const galleryMedia = mapBackendProductGalleryMedia(product, lang, variant);
  const backendImages = galleryMedia.filter((media) => media.mediaType === 'IMAGE').map((media) => media.url);
  const fallbackCardImage = backendImages[0] ?? '';
  const normalizedBackendPrimary = normalizeProductMediaUrl(product.primaryImage);
  // Card primary: admin-set Product.primaryImage if present, else first gallery image.
  // Card hover: admin-set Product.secondaryImage (no fallback — empty means no hover).
  const cardPrimaryImage = normalizedBackendPrimary || fallbackCardImage;
  const cardSecondaryImage = normalizeProductMediaUrl(product.secondaryImage) || undefined;
  // Localized text fields. The BE may send either a plain string (legacy / en
  // fallback) or a `{ en, ar }` object — `pickLocalized` handles both safely.
  // Defaulting `categoryName` to 'shop all' only when truly empty preserves
  // the existing "no category" UX.
  const productName = pickLocalized(product.name, lang);
  const shortDescription = pickLocalized(product.shortDescription, lang, '');
  const fullDescription = pickLocalized(product.description, lang, '');
  const categoryName = pickLocalizedTrimmed(product.category?.name, lang, 'shop all') || 'shop all';
  const brandName = pickLocalizedTrimmed(product.brand?.name, lang, '');
  const normalizedCategoryName = normalizeFilterName(categoryName);
  const normalizedBrandName = normalizeFilterName(brandName);

  return {
    id: String(product.id),
    backendId: product.id,
    slug: product.slug,
    variantId: variant?.id ?? null,
    title: productName,
    name: productName,
    price: formatPrice(displayPrice, activeCurrency),
    originalPrice,
    description: shortDescription || fullDescription || undefined,
    // `image` is the legacy field kept for backwards compatibility with
    // code that hasn't migrated to `primaryImage` yet. It mirrors `primaryImage`
    // so the storefront has a single source of truth.
    image: cardPrimaryImage,
    primaryImage: cardPrimaryImage,
    secondaryImage: cardSecondaryImage,
    cardPrice: formatPrice(getFirstValidNumber(product.primaryPrice, product.price), activeCurrency),
    cardSalePrice: product.primarySalePrice != null ? formatPrice(getFirstValidNumber(product.primarySalePrice), activeCurrency) : undefined,
    cardCostPrice: product.primaryCostPrice != null ? formatPrice(getFirstValidNumber(product.primaryCostPrice), activeCurrency) : undefined,
    images: backendImages,
    galleryMedia,
    rating: ratingAverage && ratingAverage > 0 ? ratingAverage.toFixed(1) : '0',
    reviews: ratingCount && ratingCount > 0 ? String(ratingCount) : '0',
    label: getProductLabel(product, lang),
    brand: brandName,
    brandId: product.brand?.id,
    category: categoryName,
    categoryId: product.category?.id,
    stock: variant?.stockQuantity ?? product.stockQuantity,
    stockStatus: variant?.stockStatus ?? product.stockStatus,
    size: pickLocalized(variant?.size ?? product.size, lang, null),
    main: normalizedCategoryName,
    sub: normalizedBrandName || normalizedCategoryName,
    type: normalizeFilterName(pickLocalized(variant?.name, lang) || pickLocalized(product.size, lang) || categoryName),
    rawPrice: displayPrice,
    date: product.createdAt,
    variants: product.variants,
    colors: product.colors,
    backendProduct: product,
  };
};

const mapBackendCartItem = (item: BackendCartItem, lang: Language = 'en'): CartItem => {
  const product: BackendProduct = {
    id: item.product.id,
    slug: item.product.slug,
    name: item.product.name,
    price: item.product.price,
    salePrice: item.product.salePrice,
    primaryImage: item.variant?.image || item.product.primaryImage,
    variants: item.variant ? [item.variant] : [],
  };

  return {
    ...mapBackendProductToProduct(product, lang, item.variant),
    id: String(item.id),
    cartItemId: item.id,
    backendId: item.product.id,
    variantId: item.variant?.id ?? null,
    quantity: item.quantity,
  };
};

export const mapBackendCartToCartItems = (cart: BackendCart, lang: Language = 'en'): CartItem[] => {
  return cart.items.map((item) => mapBackendCartItem(item, lang));
};

const isRecord = (value: unknown): value is Record<string, unknown> => (
  Boolean(value) && typeof value === 'object' && !Array.isArray(value)
);

export const unwrapListData = <T>(payload: T[] | { data?: T[] | { data?: T[] } } | null | undefined): T[] => {
  if (Array.isArray(payload)) return payload;
  if (!isRecord(payload)) return [];
  if (Array.isArray(payload.data)) return payload.data;
  if (isRecord(payload.data) && Array.isArray(payload.data.data)) return payload.data.data;
  return [];
};

export const unwrapAdminListData = <T>(payload: T[] | AdminListData<T>) => {
  if (Array.isArray(payload)) return payload;
  return payload.data ?? payload.items ?? payload.records ?? [];
};

export const mapCategoryNames = (categories: BackendCategory[], lang: Language = 'en') => categories.map((category) => normalizeFilterName(pickLocalizedTrimmed(category.name, lang)));

export const mapBrandNames = (brands: BackendBrand[], lang: Language = 'en') => brands.map((brand) => normalizeFilterName(pickLocalizedTrimmed(brand.name, lang)));

const formatListValue = (value: string[] | string | null | undefined, fallback: string) => {
  if (Array.isArray(value)) return value.join(', ');
  return value || fallback;
};

export const mapBackendReviewToProductReview = (review: BackendProductReview): ProductReview => ({
  id: review.id,
  name: review.user?.name || 'Verified customer',
  verified: review.isVerified ?? false,
  age: review.ageRange || 'Not specified',
  concern: formatListValue(review.skinConcerns, 'Not specified'),
  skinType: review.skinType || 'Not specified',
  favorites: formatListValue(review.favoriteFeatures, 'Product experience'),
  rating: coerceNumber(review.rating) ?? 0,
  time: review.createdAt ? new Date(review.createdAt).toLocaleDateString() : 'recently',
  title: review.title || 'Product review',
  content: review.comment || '',
  hydration: coerceNumber(review.hydrationRating) ?? 75,
});

const GENERAL_FAQ_GROUP_ID = 'general';
const GENERAL_FAQ_GROUP_NAME = 'GENERAL';

const sortBySortOrder = <T extends { sortOrder?: number }>(first: T, second: T) => (first.sortOrder ?? 0) - (second.sortOrder ?? 0);

const getFaqGroupKey = (faq: BackendFaq) => {
  if (faq.category?.id) return String(faq.category.id);
  if (faq.categoryId) return String(faq.categoryId);
  if (faq.category?.slug) return faq.category.slug;
  return GENERAL_FAQ_GROUP_ID;
};

const getFaqGroupId = (faq: BackendFaq) => faq.category?.slug || getFaqGroupKey(faq);

const getFaqGroupName = (faq: BackendFaq, lang: Language) => pickLocalized(faq.category?.name, lang) || (getFaqGroupKey(faq) === GENERAL_FAQ_GROUP_ID ? GENERAL_FAQ_GROUP_NAME : `CATEGORY ${getFaqGroupKey(faq)}`);

const mapFaqItems = (faqs: BackendFaq[], lang: Language) => faqs
  .filter((faq) => faq.isActive !== false)
  .sort(sortBySortOrder)
  .map((faq) => ({ q: pickLocalized(faq.question, lang), a: pickLocalized(faq.answer, lang) }));

const mapFaqsWithExplicitCategories = (faqs: BackendFaq[], categories: BackendFaqCategory[], lang: Language) => {
  const activeCategories = categories
    .filter((category) => category.isActive !== false)
    .sort(sortBySortOrder);

  const categoryIds = new Set<number>();
  const categoryGroups = activeCategories.flatMap((category) => {
    if (categoryIds.has(category.id)) return [];
    categoryIds.add(category.id);

    const items = mapFaqItems(faqs.filter((faq) => faq.categoryId === category.id || faq.category?.id === category.id), lang);
    if (items.length === 0) return [];

    return [{
      id: category.slug || String(category.id),
      name: pickLocalized(category.name, lang),
      items,
    }];
  });

  const uncategorizedItems = mapFaqItems(faqs.filter((faq) => !faq.categoryId && !faq.category), lang);
  return [
    ...categoryGroups,
    ...(uncategorizedItems.length > 0 ? [{ id: GENERAL_FAQ_GROUP_ID, name: GENERAL_FAQ_GROUP_NAME, items: uncategorizedItems }] : []),
  ];
};

const mapFaqsWithEmbeddedCategories = (faqs: BackendFaq[], lang: Language) => {
  const groupedFaqs = new Map<string, { id: string; name: string; sortOrder: number; faqs: BackendFaq[] }>();

  faqs
    .filter((faq) => faq.isActive !== false)
    .sort(sortBySortOrder)
    .forEach((faq) => {
      const key = getFaqGroupKey(faq);
      const existingGroup = groupedFaqs.get(key);
      const group = existingGroup ?? {
        id: getFaqGroupId(faq),
        name: getFaqGroupName(faq, lang),
        sortOrder: faq.sortOrder ?? 0,
        faqs: [],
      };

      group.sortOrder = Math.min(group.sortOrder, faq.sortOrder ?? group.sortOrder);
      group.faqs.push(faq);
      groupedFaqs.set(key, group);
    });

  return Array.from(groupedFaqs.values())
    .sort(sortBySortOrder)
    .map((group) => ({
      id: group.id,
      name: group.name,
      items: mapFaqItems(group.faqs, lang),
    }));
};

export const mapBackendFaqsToGroups = (faqs: BackendFaq[], categories: BackendFaqCategory[], lang: Language = 'en'): FAQCategoryGroup[] => {
  return categories.length > 0 ? mapFaqsWithExplicitCategories(faqs, categories, lang) : mapFaqsWithEmbeddedCategories(faqs, lang);
};