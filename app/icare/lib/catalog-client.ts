import { BackendProduct, FAQCategoryGroup, Product, ProductReview, VlogContentItem } from '../types';
import { icareApi, IcareApiError } from './api-client';
import {
  mapBackendFaqsToGroups,
  mapBackendProductToProduct,
  mapBackendProductToVlogItem,
  mapBackendReviewToProductReview,
  unwrapAdminListData,
  unwrapListData,
} from './mappers';

const dedupeBackendProducts = (products: BackendProduct[]) => {
  const seenProductKeys = new Set<string>();

  return products.filter((product) => {
    const productKey = product.id ? `id:${product.id}` : `slug:${product.slug}`;
    if (seenProductKeys.has(productKey)) return false;
    seenProductKeys.add(productKey);
    return true;
  });
};

const fetchCatalogShortcutProducts = async () => {
  const shortcutResults = await Promise.allSettled([
    icareApi.products.featured(60),
    icareApi.products.onSale(60),
    icareApi.products.new(60),
    icareApi.products.bestsellers(60),
  ]);

  return shortcutResults.flatMap((result) => result.status === 'fulfilled' ? result.value : []);
};

export const fetchCatalogProducts = async (): Promise<Product[] | null> => {
  try {
    if (!icareApi.isConfigured()) {
      return null;
    }

    const payload = await icareApi.products.list({ page: 1, limit: 60, active: true });
    const primaryProducts = unwrapListData(payload);
    const backendProducts = primaryProducts.length > 0 ? primaryProducts : await fetchCatalogShortcutProducts();

    return dedupeBackendProducts(backendProducts).map((product) => mapBackendProductToProduct(product));
  } catch (error) {
    // Suppress offline network noise; components render backend-empty states.
    if (!(error instanceof IcareApiError && error.status === 0)) {
      console.error('Error fetching iCare products:', error);
    }
    return null;
  }
};

export const fetchProductBySlug = async (slug: string): Promise<Product | null> => {
  try {
    if (!icareApi.isConfigured()) return null;
    const product = await icareApi.products.detail(slug);
    return mapBackendProductToProduct(product);
  } catch (error) {
    // Suppress offline and not-found network noise; route components render unavailable states.
    if (!(error instanceof IcareApiError && (error.status === 0 || error.status === 404))) {
      console.error('Error fetching iCare product detail:', error);
    }
    return null;
  }
};

type ProductShortcut = 'featured' | 'new' | 'bestsellers' | 'onSale';

const productShortcutLoaders = {
  featured: icareApi.products.featured,
  new: icareApi.products.new,
  bestsellers: icareApi.products.bestsellers,
  onSale: icareApi.products.onSale,
};

export const fetchProductShortcut = async (shortcut: ProductShortcut, limit = 8): Promise<Product[] | null> => {
  try {
    if (!icareApi.isConfigured()) return null;
    const products = await productShortcutLoaders[shortcut](limit);
    return products.map((product) => mapBackendProductToProduct(product));
  } catch (error) {
    // Suppress offline network noise; components render backend-empty states.
    if (!(error instanceof IcareApiError && error.status === 0)) {
      console.error(`Error fetching iCare ${shortcut} products:`, error);
    }
    return null;
  }
};

export const fetchRelatedProducts = async (slug: string, limit = 8): Promise<Product[] | null> => {
  try {
    if (!icareApi.isConfigured()) return null;
    const products = await icareApi.products.related(slug);
    return products.slice(0, limit).map((product) => mapBackendProductToProduct(product));
  } catch (error) {
    // Suppress offline network noise; components render backend-empty states.
    if (!(error instanceof IcareApiError && error.status === 0)) {
      console.error('Error fetching iCare related products:', error);
    }
    return null;
  }
};

export const fetchProductReviews = async (slug: string, limit = 10): Promise<ProductReview[] | null> => {
  try {
    if (!icareApi.isConfigured()) return null;
    const payload = await icareApi.products.reviews(slug, { page: 1, limit });
    return unwrapListData(payload).map((review) => mapBackendReviewToProductReview(review));
  } catch (error) {
    // Suppress offline network noise; components render backend-empty states.
    if (!(error instanceof IcareApiError && error.status === 0)) {
      console.error('Error fetching iCare product reviews:', error);
    }
    return null;
  }
};

export const fetchFaqGroups = async (): Promise<FAQCategoryGroup[] | null> => {
  try {
    if (!icareApi.isConfigured()) return null;
    const [categoryPayload, faqPayload] = await Promise.all([
      icareApi.faq.categories({ page: 1, limit: 50, isActive: true }),
      icareApi.faq.list({ page: 1, limit: 100, isActive: true }),
    ]);
    const groups = mapBackendFaqsToGroups(unwrapAdminListData(faqPayload), unwrapAdminListData(categoryPayload));
    return groups.length > 0 ? groups : null;
  } catch (error) {
    // Suppress offline network noise; components render backend-empty states.
    if (!(error instanceof IcareApiError && error.status === 0)) {
      console.error('Error fetching iCare FAQ content:', error);
    }
    return null;
  }
};

export const fetchProductMediaVlogs = async (limit = 6): Promise<VlogContentItem[] | null> => {
  try {
    if (!icareApi.isConfigured()) return null;
    const products = await icareApi.products.featured(limit);
    const mediaItems = products.map((product) => mapBackendProductToVlogItem(product));
    return mediaItems.length > 0 ? mediaItems : null;
  } catch (error) {
    // Suppress offline network noise; components render backend-empty states.
    if (!(error instanceof IcareApiError && error.status === 0)) {
      console.error('Error fetching iCare product media:', error);
    }
    return null;
  }
};
