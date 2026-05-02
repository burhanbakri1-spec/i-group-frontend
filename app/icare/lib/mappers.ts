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
  ProductReview,
  ProductVariant,
  VlogContentItem,
} from '../types';

type NumericInput = string | number | null | undefined;

const normalizeFilterName = (value?: string | null) => value?.trim().toLowerCase() ?? '';

// Fallback placeholder image for products without images
const FALLBACK_PRODUCT_IMAGE = 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&q=80&auto=format&fit=crop';

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

const getUniqueProductImages = (product: BackendProduct, variant?: ProductVariant | null) => {
  const backendImages = [
    variant?.image,
    product.featuredImage,
    product.images?.find((image) => image.isPrimary)?.imageUrl,
    ...(product.images?.map((image) => image.imageUrl) ?? []),
  ];

  // Convert relative paths to absolute URLs
  const normalizedImages = backendImages.map(image => {
    if (!image?.trim()) return null;
    if (image.startsWith('http')) return image;
    if (image.startsWith('/')) return `https://backend.igroup.website${image}`;
    return image;
  });

  const uniqueImages = normalizedImages
    .filter((image): image is string => Boolean(image?.trim()))
    .filter((image, index, images) => images.indexOf(image) === index);

  // Return fallback image if no images are available
  return uniqueImages.length > 0 ? uniqueImages : [FALLBACK_PRODUCT_IMAGE];
};

export const mapBackendProductToProduct = (product: BackendProduct, selectedVariant?: ProductVariant | null): Product => {
  const variant = selectedVariant ?? getDefaultVariant(product);
  const displayPrice = getVariantDisplayPrice(product, variant);
  const productPrice = coerceNumber(product.price);
  const salePrice = coerceNumber(product.salePrice);
  const originalPrice = salePrice !== null && productPrice !== null && salePrice < productPrice ? formatUsdPrice(productPrice) : undefined;
  const ratingAverage = coerceNumber(product.ratingAverage);
  const ratingCount = coerceNumber(product.ratingCount);
  const backendImages = getUniqueProductImages(product, variant);
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
    title: product.category?.name ?? product.brand?.name ?? 'icare',
    name: product.name,
    price: formatUsdPrice(displayPrice),
    originalPrice,
    description: product.shortDescription ?? product.description ?? undefined,
    image: primaryImage,
    images: backendImages,
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

export const unwrapListData = <T>(payload: T[] | { data: T[] }) => {
  if (Array.isArray(payload)) return payload;
  return Array.isArray(payload.data) ? payload.data : [];
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

export const mapBackendFaqsToGroups = (faqs: BackendFaq[], categories: BackendFaqCategory[]): FAQCategoryGroup[] => {
  const activeCategories = categories
    .filter((category) => category.isActive !== false)
    .sort((first, second) => (first.sortOrder ?? 0) - (second.sortOrder ?? 0));

  const categoryGroups = activeCategories.map((category) => ({
    id: category.slug || String(category.id),
    name: category.name,
    items: faqs
      .filter((faq) => faq.isActive !== false && faq.categoryId === category.id)
      .sort((first, second) => (first.sortOrder ?? 0) - (second.sortOrder ?? 0))
      .map((faq) => ({ q: faq.question, a: faq.answer })),
  }));

  const uncategorizedItems = faqs
    .filter((faq) => faq.isActive !== false && !faq.categoryId)
    .sort((first, second) => (first.sortOrder ?? 0) - (second.sortOrder ?? 0))
    .map((faq) => ({ q: faq.question, a: faq.answer }));

  return [
    ...categoryGroups.filter((group) => group.items.length > 0),
    ...(uncategorizedItems.length > 0 ? [{ id: 'general', name: 'GENERAL', items: uncategorizedItems }] : []),
  ];
};

export const mapBackendProductToVlogItem = (product: BackendProduct): VlogContentItem => ({
  id: String(product.id),
  title: product.name,
  subtitle: product.shortDescription || product.description || product.brand?.name || 'Product story',
  image: getUniqueProductImages(product)[0] ?? '',
  videoUrl: product.videoUrl,
  category: product.videoUrl ? 'TUTORIALS' : 'PRODUCTS',
});
