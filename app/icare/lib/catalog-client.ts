import { BackendCategory, BackendProduct, BackendVideo, BackendVideoCategory, FAQCategoryGroup, Product, ProductReview, ShowcaseUnit, VlogContentItem } from '../types';
import { icareApi, IcareApiError } from './api-client';
import {
  mapBackendFaqsToGroups,
  mapBackendProductToProduct,
  mapBackendProductToVlogItem,
  mapBackendReviewToProductReview,
  unwrapAdminListData,
  unwrapListData,
} from './mappers';

const FALLBACK_PRODUCT_IMAGE_FOR_VLOGS = 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&q=80&auto=format&fit=crop';
const IMAGE_BASE_URL = (process.env.NEXT_PUBLIC_IMAGE_BASE_URL || '').replace(/\/$/, '');
const IMAGE_PROXY_BASE_URL = '/api/icare';

const normalizeShowcaseImageUrl = (image?: string | null) => {
  if (!image?.trim()) return '';
  if (image.startsWith('http')) return image;
  if (image.startsWith('/')) return `${IMAGE_BASE_URL || IMAGE_PROXY_BASE_URL}${image}`;
  return image;
};

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

export const fetchCatalogProducts = async (categoryId?: number): Promise<Product[] | null> => {
  try {
    if (!icareApi.isConfigured()) {
      return null;
    }

    const query: Record<string, string | number | boolean> = { page: 1, limit: 100, active: true };
    if (categoryId !== undefined && categoryId > 0) query.category = categoryId;
    const payload = await icareApi.products.list(query);
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

export const fetchCategoryRoots = async () => {
  try {
    if (!icareApi.isConfigured()) return [];
    const payload = await icareApi.categories.roots();
    return unwrapListData(payload);
  } catch (error) {
    if (!(error instanceof IcareApiError && error.status === 0)) {
      console.error('Error fetching iCare category roots:', error);
    }
    return [];
  }
};

export const fetchCategoryChildren = async (slug: string) => {
  try {
    if (!icareApi.isConfigured()) return [];
    return await icareApi.categories.children(slug);
  } catch (error) {
    if (!(error instanceof IcareApiError && error.status === 0)) {
      console.error('Error fetching iCare category children:', error);
    }
    return [];
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
    const [categoryResult, faqResult] = await Promise.allSettled([
      icareApi.faq.categories({ page: 1, limit: 50, isActive: true }),
      icareApi.faq.list({ page: 1, limit: 100, isActive: true }),
    ]);

    if (faqResult.status === 'rejected') {
      if (!(faqResult.reason instanceof IcareApiError && faqResult.reason.status === 0)) {
        console.error('Error fetching iCare FAQ list:', faqResult.reason);
      }
      return null;
    }

    const categories = categoryResult.status === 'fulfilled' ? unwrapListData(categoryResult.value) : [];
    if (categoryResult.status === 'rejected' && !(categoryResult.reason instanceof IcareApiError && categoryResult.reason.status === 0)) {
      console.error('Error fetching iCare FAQ categories:', categoryResult.reason);
    }

    return mapBackendFaqsToGroups(unwrapListData(faqResult.value), categories);
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
    // Try real video endpoints first, fallback to product-based vlogs
    const categories = await icareApi.videoCategories.list({ isActive: true, page: 1, limit: 20 });
    const categoryData = unwrapListData(categories);

    if (categoryData.length > 0) {
      const allVideos = await Promise.all(
        categoryData.slice(0, 4).map(async (cat) => {
          const videos = await icareApi.videos.list({ categoryId: cat.id, isActive: true, page: 1, limit: 10 });
          return { category: cat, videos: unwrapListData(videos) as BackendVideo[] };
        })
      );

      // Flatten and map to VlogContentItem format
      const vlogItems: VlogContentItem[] = [];
      for (const group of allVideos) {
        for (const video of group.videos) {
          vlogItems.push({
            id: String(video.id),
            title: video.title,
            subtitle: group.category.name,
            image: video.thumbnailUrl || FALLBACK_PRODUCT_IMAGE_FOR_VLOGS,
            videoUrl: video.videoUrl || null,
            category: group.category.name.toLowerCase().includes('product') ? 'PRODUCTS' : 'TUTORIALS',
          });
        }
      }
      return vlogItems.length > 0 ? vlogItems.slice(0, limit) : null;
    }

    // Fallback: use product data as vlogs
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

export const fetchProductShowcase = async (slug: string): Promise<ShowcaseUnit[] | null> => {
  try {
    if (!icareApi.isConfigured()) return null;
    const units = await icareApi.products.showcase(slug);
    return units.map(u => ({
      id: u.id,
      image: normalizeShowcaseImageUrl(u.image),
      title: u.title,
      description: u.description ?? '',
      layout: u.layout ?? 'stacked',
    }));
  } catch (error) {
    if (!(error instanceof IcareApiError && error.status === 0)) {
      console.error('Error fetching product showcase:', error);
    }
    return null;
  }
};
