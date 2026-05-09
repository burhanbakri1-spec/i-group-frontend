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

type NumericInput = string | number | null | undefined;

const normalizeFilterName = (value?: string | null) => value?.trim().toLowerCase() ?? '';


// Configurable image base URL — when empty, backend media is served through the Next.js proxy.
const IMAGE_BASE_URL = (process.env.NEXT_PUBLIC_IMAGE_BASE_URL || '').replace(/\/$/, '');
const IMAGE_PROXY_BASE_URL = '/api/icare';

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

const getFirstValidNumber = (...values: NumericInput[]) => values.map(coerceNumber).find((value) => value !== null) ?? 0;

export const formatUsdPrice = (price: NumericInput) => `$${getFirstValidNumber(price).toFixed(2)}`;

export const getVariantDisplayPrice = (product: BackendProduct, variant?: ProductVariant | null) => {
  return getFirstValidNumber(variant?.salePrice, variant?.price, product.salePrice, product.price);
};

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

const getProductBadge = (product: BackendProduct) => {
  const salePrice = coerceNumber(product.salePrice);
  const price = coerceNumber(product.price);
  if (salePrice !== null && price !== null && salePrice < price) return 'sale';
  if (product.isNew) return 'new';
  if (product.isBestseller) return 'bestseller';
  if (product.isFeatured) return 'featured';
  return undefined;
};

export const normalizeProductMediaUrl = (mediaUrl?: string | null) => {
  const trimmedUrl = mediaUrl?.trim();
  if (!trimmedUrl) return '';
  if (/^(https?:|data:|blob:)/i.test(trimmedUrl)) return trimmedUrl;

  const relativePath = trimmedUrl.startsWith('/') ? trimmedUrl : `/${trimmedUrl}`;
  return `${IMAGE_BASE_URL || IMAGE_PROXY_BASE_URL}${relativePath}`;
};

const normalizeProductMediaType = (mediaType?: string | null): ProductGalleryMediaType => (
  mediaType?.toUpperCase() === 'VIDEO' ? 'VIDEO' : 'IMAGE'
);

const sortProductImagesByBackendPriority = (images: BackendProduct['images'] = []) => images
  .map((image, originalIndex) => ({ image, originalIndex }))
  .sort((first, second) => {
    if (Boolean(first.image.isPrimary) !== Boolean(second.image.isPrimary)) {
      return first.image.isPrimary ? -1 : 1;
    }

    const firstSortOrder = first.image.sortOrder ?? Number.MAX_SAFE_INTEGER;
    const secondSortOrder = second.image.sortOrder ?? Number.MAX_SAFE_INTEGER;
    if (firstSortOrder !== secondSortOrder) return firstSortOrder - secondSortOrder;

    return first.originalIndex - second.originalIndex;
  })
  .map(({ image }) => image);

const dedupeGalleryMedia = (media: ProductGalleryMedia[]) => {
  const seenUrls = new Set<string>();

  return media.filter((item) => {
    if (!item.url || seenUrls.has(item.url)) return false;
    seenUrls.add(item.url);
    return true;
  });
};

export const mapBackendProductGalleryMedia = (product: BackendProduct, variant?: ProductVariant | null): ProductGalleryMedia[] => {
  const sortedBackendImages = sortProductImagesByBackendPriority(product.images);
  const hasBackendPrimary = sortedBackendImages.some((image) => image.isPrimary);
  const backendMedia = sortedBackendImages.map<ProductGalleryMedia>((image) => ({
    url: normalizeProductMediaUrl(image.imageUrl),
    mediaType: normalizeProductMediaType(image.mediaType),
    altText: image.altText,
    isPrimary: image.isPrimary,
    sortOrder: image.sortOrder,
  }));
  const primaryBackendMedia = hasBackendPrimary && backendMedia[0]?.isPrimary ? [backendMedia[0]] : [];
  const remainingBackendMedia = hasBackendPrimary ? backendMedia.slice(1) : backendMedia;

  const variantMedia = variant?.image ? [{
    url: normalizeProductMediaUrl(variant.image),
    mediaType: 'IMAGE' as const,
    altText: variant.name,
    isPrimary: true,
  }] : [];

  const featuredMedia = product.featuredImage ? [{
    url: normalizeProductMediaUrl(product.featuredImage),
    mediaType: 'IMAGE' as const,
    altText: product.name,
    isPrimary: !hasBackendPrimary,
  }] : [];

  return dedupeGalleryMedia([
    ...variantMedia,
    ...primaryBackendMedia,
    ...featuredMedia,
    ...remainingBackendMedia,
  ]);
};

export const mapBackendProductToProduct = (product: BackendProduct, selectedVariant?: ProductVariant | null): Product => {
  const variant = selectedVariant ?? getDefaultVariant(product);
  const displayPrice = getVariantDisplayPrice(product, variant);
  const productPrice = coerceNumber(product.price);
  const salePrice = coerceNumber(product.salePrice);
  const originalPrice = salePrice !== null && productPrice !== null && salePrice < productPrice ? formatUsdPrice(productPrice) : undefined;
  const ratingAverage = coerceNumber(product.ratingAverage);
  const ratingCount = coerceNumber(product.ratingCount);
  const galleryMedia = mapBackendProductGalleryMedia(product, variant);
  const backendImages = galleryMedia.filter((media) => media.mediaType === 'IMAGE').map((media) => media.url);
  const primaryImage = backendImages[0] ?? '';
  const categoryName = product.category?.name?.trim() || 'shop all';
  const brandName = product.brand?.name?.trim();
  const normalizedCategoryName = normalizeFilterName(categoryName);
  const normalizedBrandName = normalizeFilterName(brandName);

  return {
    id: String(product.id),
    backendId: product.id,
    slug: product.slug,
    variantId: variant?.id ?? null,
    title: product.name,
    name: product.name,
    price: formatUsdPrice(displayPrice),
    originalPrice,
    description: product.shortDescription ?? product.description ?? undefined,
    image: primaryImage,
    images: backendImages,
    galleryMedia,
    rating: ratingAverage && ratingAverage > 0 ? ratingAverage.toFixed(1) : '0',
    reviews: ratingCount && ratingCount > 0 ? String(ratingCount) : '0',
    badge: getProductBadge(product),
    brand: brandName,
    brandId: product.brand?.id,
    category: categoryName,
    categoryId: product.category?.id,
    stock: variant?.stockQuantity ?? product.stockQuantity,
    stockStatus: variant?.stockStatus ?? product.stockStatus,
    main: normalizedCategoryName,
    sub: normalizedBrandName || normalizedCategoryName,
    type: normalizeFilterName(variant?.name ?? product.size ?? categoryName),
    rawPrice: displayPrice,
    date: product.createdAt,
    variants: product.variants,
    backendProduct: product,
  };
};

const mapBackendCartItem = (item: BackendCartItem): CartItem => {
  const product: BackendProduct = {
    id: item.product.id,
    slug: item.product.slug,
    name: item.product.name,
    price: item.product.price,
    salePrice: item.product.salePrice,
    featuredImage: item.variant?.image || item.product.featuredImage,
    variants: item.variant ? [item.variant] : [],
  };

  return {
    ...mapBackendProductToProduct(product, item.variant),
    id: String(item.id),
    cartItemId: item.id,
    backendId: item.product.id,
    variantId: item.variant?.id ?? null,
    quantity: item.quantity,
  };
};

export const mapBackendCartToCartItems = (cart: BackendCart): CartItem[] => {
  return cart.items.map(mapBackendCartItem);
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

export const mapCategoryNames = (categories: BackendCategory[]) => categories.map((category) => normalizeFilterName(category.name));

export const mapBrandNames = (brands: BackendBrand[]) => brands.map((brand) => normalizeFilterName(brand.name));

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

const getFaqGroupName = (faq: BackendFaq) => faq.category?.name || (getFaqGroupKey(faq) === GENERAL_FAQ_GROUP_ID ? GENERAL_FAQ_GROUP_NAME : `CATEGORY ${getFaqGroupKey(faq)}`);

const mapFaqItems = (faqs: BackendFaq[]) => faqs
  .filter((faq) => faq.isActive !== false)
  .sort(sortBySortOrder)
  .map((faq) => ({ q: faq.question, a: faq.answer }));

const mapFaqsWithExplicitCategories = (faqs: BackendFaq[], categories: BackendFaqCategory[]) => {
  const activeCategories = categories
    .filter((category) => category.isActive !== false)
    .sort(sortBySortOrder);

  const categoryIds = new Set<number>();
  const categoryGroups = activeCategories.flatMap((category) => {
    if (categoryIds.has(category.id)) return [];
    categoryIds.add(category.id);

    const items = mapFaqItems(faqs.filter((faq) => faq.categoryId === category.id || faq.category?.id === category.id));
    if (items.length === 0) return [];

    return [{
      id: category.slug || String(category.id),
      name: category.name,
      items,
    }];
  });

  const uncategorizedItems = mapFaqItems(faqs.filter((faq) => !faq.categoryId && !faq.category));
  return [
    ...categoryGroups,
    ...(uncategorizedItems.length > 0 ? [{ id: GENERAL_FAQ_GROUP_ID, name: GENERAL_FAQ_GROUP_NAME, items: uncategorizedItems }] : []),
  ];
};

const mapFaqsWithEmbeddedCategories = (faqs: BackendFaq[]) => {
  const groupedFaqs = new Map<string, { id: string; name: string; sortOrder: number; faqs: BackendFaq[] }>();

  faqs
    .filter((faq) => faq.isActive !== false)
    .sort(sortBySortOrder)
    .forEach((faq) => {
      const key = getFaqGroupKey(faq);
      const existingGroup = groupedFaqs.get(key);
      const group = existingGroup ?? {
        id: getFaqGroupId(faq),
        name: getFaqGroupName(faq),
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
      items: mapFaqItems(group.faqs),
    }));
};

export const mapBackendFaqsToGroups = (faqs: BackendFaq[], categories: BackendFaqCategory[]): FAQCategoryGroup[] => {
  return categories.length > 0 ? mapFaqsWithExplicitCategories(faqs, categories) : mapFaqsWithEmbeddedCategories(faqs);
};
