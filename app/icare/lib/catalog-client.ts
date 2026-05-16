import { BackendProduct, BackendVlog, FAQCategoryGroup, Product, ProductReview, ShowcaseUnit, VlogContentItem } from '../types';
import { icareApi, IcareApiError } from './api-client';
import { cachedFetch } from './cache-middleware';
import {
  mapBackendFaqsToGroups,
  mapBackendProductToProduct,
  mapBackendReviewToProductReview,
  unwrapListData,
} from './mappers';

const IMAGE_BASE_URL = (process.env.NEXT_PUBLIC_IMAGE_BASE_URL || '').replace(/\/$/, '');
const IMAGE_PROXY_BASE_URL = '/api/icare';
const VIDEO_FILE_PATTERN = /\.(mp4|webm|ogv|ogg|mov|m4v)(?:$|[?#])/i;
const CATALOG_PRODUCT_LIMIT = 100;
const CATALOG_SHORTCUT_PRODUCT_LIMIT = 60;

type BackendProductWithVisibility = BackendProduct & { isActive?: boolean };

const normalizeShowcaseImageUrl = (image?: string | null) => {
  if (!image?.trim()) return '';
  if (image.startsWith('http')) return image;
  if (image.startsWith('/')) return `${IMAGE_BASE_URL || IMAGE_PROXY_BASE_URL}${image}`;
  return image;
};

const isDirectVideoUrl = (url: string) => VIDEO_FILE_PATTERN.test(url);

const getYouTubeVideoId = (url: URL) => {
  if (url.hostname.includes('youtu.be')) return url.pathname.split('/').filter(Boolean)[0] ?? '';
  if (url.hostname.includes('youtube.com')) {
    return url.searchParams.get('v')
      || url.pathname.match(/\/(?:embed|shorts)\/([^/?#]+)/)?.[1]
      || '';
  }
  return '';
};

const getVimeoVideoId = (url: URL) => {
  if (!url.hostname.includes('vimeo.com')) return '';
  return url.pathname.split('/').filter(Boolean).find((segment) => /^\d+$/.test(segment)) ?? '';
};

const getHostedVideoThumbnail = (videoUrl?: string | null) => {
  if (!videoUrl?.trim()) return '';

  try {
    const parsedUrl = new URL(videoUrl);
    const youTubeId = getYouTubeVideoId(parsedUrl);
    if (youTubeId) return `https://img.youtube.com/vi/${youTubeId}/hqdefault.jpg`;

    const vimeoId = getVimeoVideoId(parsedUrl);
    if (vimeoId) return `https://vumbnail.com/${vimeoId}.jpg`;
  } catch {
    return '';
  }

  return '';
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

const isVisibleBackendProduct = (product: BackendProduct) => (
  (product as BackendProductWithVisibility).isActive !== false
);

const getVisibleBackendProducts = (products: BackendProduct[]) => products.filter(isVisibleBackendProduct);

const fetchVisibleProductList = async (query: Record<string, string | number | boolean>) => {
  const payload = await icareApi.products.list(query);
  return getVisibleBackendProducts(unwrapListData(payload));
};

const fetchCatalogShortcutProducts = async () => {
  const shortcutResults = await Promise.allSettled([
    icareApi.products.featured(CATALOG_SHORTCUT_PRODUCT_LIMIT),
    icareApi.products.onSale(CATALOG_SHORTCUT_PRODUCT_LIMIT),
    icareApi.products.new(CATALOG_SHORTCUT_PRODUCT_LIMIT),
    icareApi.products.bestsellers(CATALOG_SHORTCUT_PRODUCT_LIMIT),
  ]);

  return getVisibleBackendProducts(shortcutResults.flatMap((result) => result.status === 'fulfilled' ? result.value : []));
};

const fetchActiveProductBySlug = async (slug: string) => {
  const products = await fetchVisibleProductList({ page: 1, limit: CATALOG_PRODUCT_LIMIT });
  const normalizedSlug = slug.trim().toLowerCase();

  return products.find((product) => product.slug?.trim().toLowerCase() === normalizedSlug) ?? null;
};

export const fetchCatalogProducts = async (categoryId?: number): Promise<Product[] | null> => {
  try {
    if (!icareApi.isConfigured()) {
      return null;
    }

    const query: Record<string, string | number | boolean> = { page: 1, limit: CATALOG_PRODUCT_LIMIT };
    if (categoryId !== undefined && categoryId > 0) query.category = categoryId;
    const keyQuery = { page: 1, limit: CATALOG_PRODUCT_LIMIT, ...(categoryId !== undefined && categoryId > 0 ? { category: categoryId } : {}) };

    return await cachedFetch('/api/v1/catalog-products', async () => {
      const primaryProducts = await fetchVisibleProductList(query);
      const shortcutProducts = primaryProducts.length > 0 ? [] : await fetchCatalogShortcutProducts();
      const fallbackProducts = primaryProducts.length > 0 || shortcutProducts.length > 0
        ? []
        : await fetchVisibleProductList({ page: 1, limit: CATALOG_PRODUCT_LIMIT });
      const backendProducts = primaryProducts.length > 0
        ? primaryProducts
        : [...shortcutProducts, ...fallbackProducts];

      return dedupeBackendProducts(backendProducts).map((product) => mapBackendProductToProduct(product));
    }, { tier: 'list', query: keyQuery });
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
    const payload = await cachedFetch('/api/v1/categories/roots', () => icareApi.categories.roots(), { tier: 'reference' });
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
    return await cachedFetch(`/api/v1/categories/${slug}/children`, () => icareApi.categories.children(slug), { tier: 'reference' });
  } catch (error) {
    if (!(error instanceof IcareApiError && error.status === 0)) {
      console.error('Error fetching iCare category children:', error);
    }
    return [];
  }
};

export const fetchProductBySlug = async (slug: string): Promise<Product | null> => {
  if (!icareApi.isConfigured()) return null;

  try {
    return await cachedFetch(`/api/v1/products/${slug}`, async () => {
      try {
        const product = await icareApi.products.detail(slug);
        if (product) return mapBackendProductToProduct(product);
      } catch (detailError) {
        if (!(detailError instanceof IcareApiError && (detailError.status === 0 || detailError.status === 404))) {
          console.error('Error fetching iCare product detail; falling back to active product list:', detailError);
        }
      }
      const fallbackProduct = await fetchActiveProductBySlug(slug);
      return fallbackProduct ? mapBackendProductToProduct(fallbackProduct) : null;
    }, { tier: 'list' });
  } catch (fallbackError) {
    if (!(fallbackError instanceof IcareApiError && fallbackError.status === 0)) {
      console.error('Error fetching iCare product detail fallback:', fallbackError);
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
    return await cachedFetch(`/api/v1/products/${shortcut}`, async () => {
      const products = await productShortcutLoaders[shortcut](limit);
      return products.map((product) => mapBackendProductToProduct(product));
    }, { tier: 'list', query: { limit } });
  } catch (error) {
    if (!(error instanceof IcareApiError && error.status === 0)) {
      console.error(`Error fetching iCare ${shortcut} products:`, error);
    }
    return null;
  }
};

export const fetchRelatedProducts = async (slug: string, limit = 8): Promise<Product[] | null> => {
  try {
    if (!icareApi.isConfigured()) return null;
    return await cachedFetch(`/api/v1/products/${slug}/related`, async () => {
      const products = await icareApi.products.related(slug);
      return products.slice(0, limit).map((product) => mapBackendProductToProduct(product));
    }, { tier: 'list' });
  } catch (error) {
    if (!(error instanceof IcareApiError && error.status === 0)) {
      console.error('Error fetching iCare related products:', error);
    }
    return null;
  }
};

export const fetchProductReviews = async (slug: string, limit = 10): Promise<ProductReview[] | null> => {
  try {
    if (!icareApi.isConfigured()) return null;
    return await cachedFetch(`/api/v1/products/${slug}/reviews`, async () => {
      const payload = await icareApi.products.reviews(slug, { page: 1, limit });
      return unwrapListData(payload).map((review) => mapBackendReviewToProductReview(review));
    }, { tier: 'list', query: { limit } });
  } catch (error) {
    if (!(error instanceof IcareApiError && error.status === 0)) {
      console.error('Error fetching iCare product reviews:', error);
    }
    return null;
  }
};

export const fetchFaqGroups = async (): Promise<FAQCategoryGroup[] | null> => {
  try {
    if (!icareApi.isConfigured()) return null;
    return await cachedFetch('/api/v1/faq-groups', async () => {
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
    }, { tier: 'reference' });
  } catch (error) {
    if (!(error instanceof IcareApiError && error.status === 0)) {
      console.error('Error fetching iCare FAQ content:', error);
    }
    return null;
  }
};

export async function fetchProductMediaVlogs(limit = 12): Promise<VlogContentItem[]> {
  try {
    if (!icareApi.isConfigured()) return [];
    return await cachedFetch('/api/v1/vlogs', async () => {
      const result = await icareApi.vlogs.list({ isActive: true, page: 1, limit });
      const vlogs = unwrapListData(result);

      return vlogs.map((vlog: BackendVlog) => {
        const normalizedThumbnail = normalizeShowcaseImageUrl(vlog.thumbnailUrl);
        const normalizedVideoUrl = normalizeShowcaseImageUrl(vlog.videoUrl);
        const hostedThumbnail = normalizedThumbnail ? '' : getHostedVideoThumbnail(normalizedVideoUrl);
        const videoPreviewUrl = !normalizedThumbnail && !hostedThumbnail && isDirectVideoUrl(normalizedVideoUrl) ? normalizedVideoUrl : null;
        const image = normalizedThumbnail || hostedThumbnail;

        return {
          id: String(vlog.id),
          title: vlog.title || 'Vlog',
          subtitle: vlog.description || '',
          image,
          thumbnailType: image ? 'image' : videoPreviewUrl ? 'video' : 'fallback',
          videoPreviewUrl,
          videoUrl: normalizedVideoUrl || null,
        };
      });
    }, { tier: 'list', query: { limit } });
  } catch (error) {
    if (!(error instanceof IcareApiError && error.status === 0)) {
      console.error('Error fetching iCare vlogs:', error);
    }
    return [];
  }
}

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
