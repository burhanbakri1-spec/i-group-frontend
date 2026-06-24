import { BackendProduct, BackendShowcaseUnit, BackendVlog, ContentDirection, CreateReviewInput, FAQCategoryGroup, Product, ProductReview, ShowcaseUnit, ShowcaseUnitType, VlogContentItem } from '../types';
import { z } from 'zod';
import { icareApi, IcareApiError } from './api-client';
import { cachedFetch, cacheMiddleware } from './cache-middleware';
import { resolveMediaUrl } from './media-url';
import {
  mapBackendFaqsToGroups,
  mapBackendProductToProduct,
  mapBackendReviewToProductReview,
  unwrapListData,
} from './mappers';

const VIDEO_FILE_PATTERN = /\.(mp4|webm|ogv|ogg|mov|m4v)(?:$|[?#])/i;
const CATALOG_PRODUCT_LIMIT = 100;
const CATALOG_SHORTCUT_PRODUCT_LIMIT = 60;

type BackendProductWithVisibility = BackendProduct & { isActive?: boolean };

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

export const fetchProductReviews = async (
  slug: string,
  limit = 10,
  options?: { page?: number; sortBy?: string; rating?: number },
): Promise<ProductReview[] | null> => {
  try {
    if (!icareApi.isConfigured()) return null;
    return await cachedFetch(`/api/v1/products/${slug}/reviews`, async () => {
      const payload = await icareApi.products.reviews(slug, {
        page: options?.page ?? 1,
        limit,
        sortBy: options?.sortBy,
        rating: options?.rating,
      });
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
        const normalizedThumbnail = resolveMediaUrl(vlog.thumbnailUrl);
        const normalizedVideoUrl = resolveMediaUrl(vlog.videoUrl);
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

/**
 * Fetch showcase units for a product slug.
 * Falls back gracefully — callers should use SHOWCASE_FALLBACK on null/empty.
 * REQ-C6-1, REQ-C6-2
 */
export const fetchProductShowcase = async (slug: string): Promise<import('../types/showcase-units').ShowcaseUnit[] | null> => {
  try {
    if (!icareApi.isConfigured()) return null;
    const units = await icareApi.products.showcase(slug);
    if (!Array.isArray(units) || units.length === 0) return null;

    // ─── Zod schema map: one validated payload schema per unit type ────────────
    const payloadSchemaFor = {
      hero_gallery: z.object({
        images: z.array(z.object({
          url: z.string().min(1),
          alt: z.string(),
          width: z.number().int().positive().optional(),
          height: z.number().int().positive().optional(),
        })).min(1),
        badges: z.array(z.string()).optional(),
        sizes: z.array(z.object({
          id: z.string(),
          label: z.string(),
          subtext: z.string().optional(),
          priceDelta: z.number().optional(),
        })).optional(),
        defaultSizeId: z.string().optional(),
        videoUrl: z.string().optional(),
        videoPoster: z.object({
          url: z.string().min(1),
          alt: z.string(),
          width: z.number().int().positive().optional(),
          height: z.number().int().positive().optional(),
        }).optional(),
      }),
      benefits_grid: z.object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        items: z.array(z.object({
          icon: z.string().optional(),
          text: z.string().min(1),
        })).min(2).max(6),
      }),
      application_steps: z.object({
        eyebrow: z.string().optional(),
        heading: z.object({
          eyebrow: z.string().optional(),
          kicker: z.string().optional(),
          title: z.string(),
          subtitle: z.string().optional(),
          description: z.string().optional(),
        }).optional(),
        steps: z.array(z.object({
          id: z.string(),
          stepNumber: z.number().int().min(1).optional(),
          title: z.string().min(1),
          description: z.string().optional(),
          image: z.object({
            url: z.string().min(1),
            alt: z.string(),
            width: z.number().int().positive().optional(),
            height: z.number().int().positive().optional(),
          }).optional(),
          duration: z.string().optional(),
        })).min(2).max(6),
        defaultActiveStepId: z.string().optional(),
      }),
      key_ingredients: z.object({
        heading: z.object({
          eyebrow: z.string().optional(),
          kicker: z.string().optional(),
          title: z.string(),
          subtitle: z.string().optional(),
          description: z.string().optional(),
        }).optional(),
        heroIngredients: z.array(z.object({
          name: z.string(),
          description: z.string(),
          image: z.object({
            url: z.string().min(1),
            alt: z.string(),
            width: z.number().int().positive().optional(),
            height: z.number().int().positive().optional(),
          }).optional(),
        })).min(1).max(3),
        alsoMadeWith: z.array(z.string()).default([]),
        fullListUrl: z.string().optional(),
        fullListText: z.string().optional(),
      }),
      value_props_grid: z.object({
        eyebrow: z.string().optional(),
        props: z.array(z.object({
          icon: z.object({
            url: z.string().min(1),
            alt: z.string(),
            width: z.number().int().positive().optional(),
            height: z.number().int().positive().optional(),
          }).optional(),
          label: z.string(),
        })).min(2).max(4),
      }),
      visual_application: z.object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        steps: z.array(z.object({
          number: z.number().int().min(1),
          title: z.string(),
          description: z.string().optional(),
          image: z.object({
            url: z.string().min(1),
            alt: z.string(),
            width: z.number().int().positive().optional(),
            height: z.number().int().positive().optional(),
          }).optional(),
        })).min(2).max(5),
      }),
      ingredient_spotlight: z.object({
        heading: z.object({
          eyebrow: z.string().optional(),
          kicker: z.string().optional(),
          title: z.string(),
          subtitle: z.string().optional(),
          description: z.string().optional(),
        }).optional(),
        heroImage: z.object({
          url: z.string().min(1),
          alt: z.string(),
          width: z.number().int().positive().optional(),
          height: z.number().int().positive().optional(),
        }),
        featuredIngredients: z.array(z.object({
          name: z.string(),
          description: z.string(),
          image: z.object({
            url: z.string().min(1),
            alt: z.string(),
            width: z.number().int().positive().optional(),
            height: z.number().int().positive().optional(),
          }).optional(),
        })).min(1).max(3),
        alsoMadeWith: z.array(z.string()).default([]),
      }),
      results_study: z.object({
        mode: z.enum(['tabs', 'timeline']),
        heroImages: z.array(z.object({
          url: z.string().min(1),
          alt: z.string(),
          width: z.number().int().positive().optional(),
          height: z.number().int().positive().optional(),
        })).optional(),
        heading: z.object({
          eyebrow: z.string().optional(),
          kicker: z.string().optional(),
          title: z.string(),
          subtitle: z.string().optional(),
          description: z.string().optional(),
        }).optional(),
        tabs: z.array(z.object({
          id: z.string(),
          label: z.string(),
          title: z.string().optional(),
          description: z.string().optional(),
          bullets: z.array(z.string()).default([]),
          metrics: z.array(z.object({
            id: z.string(),
            value: z.string(),
            label: z.string(),
            description: z.string().optional(),
          })).default([]),
          beforeAfter: z.object({
            before: z.object({
              url: z.string().min(1),
              alt: z.string(),
              width: z.number().int().positive().optional(),
              height: z.number().int().positive().optional(),
            }).optional(),
            after: z.object({
              url: z.string().min(1),
              alt: z.string(),
              width: z.number().int().positive().optional(),
              height: z.number().int().positive().optional(),
            }).optional(),
            caption: z.string().optional(),
          }).optional(),
          source: z.string().optional(),
          disclaimer: z.string().optional(),
        })).default([]),
        defaultTabId: z.string().optional(),
        source: z.string().optional(),
        disclaimer: z.string().optional(),
      }),
      routine_map: z.object({
        title: z.string(),
        subtitle: z.string().optional(),
        steps: z.array(z.object({
          id: z.string(),
          number: z.number().int().min(1),
          label: z.string(),
          productName: z.string(),
          productSubtitle: z.string().optional(),
          swatchImage: z.object({
            url: z.string().min(1),
            alt: z.string(),
            width: z.number().int().positive().optional(),
            height: z.number().int().positive().optional(),
          }).optional(),
          lifestyleImage: z.object({
            url: z.string().min(1),
            alt: z.string(),
            width: z.number().int().positive().optional(),
            height: z.number().int().positive().optional(),
          }),
          dayNight: z.enum(['day', 'night', 'both']).optional(),
        })).min(3).max(7),
      }),
      reviews: z.object({
        source: z.enum(['okendo', 'native']).default('native'),
        okendoId: z.string().optional(),
        productId: z.string().optional(),
        locale: z.string().default('en'),
        customRatingField: z.string().optional(),
        nativeReviews: z.array(z.object({
          id: z.string(),
          author: z.string(),
          rating: z.number().min(1).max(5),
          title: z.string().optional(),
          body: z.string(),
          date: z.string().optional(),
          skinType: z.string().optional(),
          verified: z.boolean().default(false),
        })).optional(),
        overallRating: z.number().min(0).max(5).optional(),
        totalReviews: z.number().int().min(0).optional(),
      }),
      comparison_chart: z.object({
        heading: z.string().optional(),
        products: z.array(z.object({
          id: z.string(),
          name: z.string(),
          shortName: z.string(),
          tagline: z.string(),
          image: z.object({
            url: z.string().min(1),
            alt: z.string(),
            width: z.number().int().positive().optional(),
            height: z.number().int().positive().optional(),
          }).optional(),
          fields: z.object({
            whatItIs: z.string(),
            bestFor: z.string(),
            whereItFits: z.string(),
            keyIngredients: z.string(),
          }),
          price: z.string().optional(),
          buyUrl: z.string().optional(),
        })).min(2).max(3),
      }),
      kit_contents: z.object({
        heading: z.object({
          eyebrow: z.string().optional(),
          kicker: z.string().optional(),
          title: z.string(),
          subtitle: z.string().optional(),
          description: z.string().optional(),
        }).optional(),
        products: z.array(z.object({
          slug: z.string(),
          name: z.string(),
          subtitle: z.string(),
          image: z.object({
            url: z.string().min(1),
            alt: z.string(),
            width: z.number().int().positive().optional(),
            height: z.number().int().positive().optional(),
          }),
          rating: z.number().min(0).max(5).optional(),
          reviewCount: z.number().int().min(0).optional(),
          price: z.string().optional(),
          buyLabel: z.string().optional(),
        })).min(2).max(8),
      }),
      results_carousel: z.object({
        heading: z.string(),
        subtitle: z.string().optional(),
        cards: z.array(z.object({
          id: z.string(),
          productName: z.string(),
          metricValue: z.string(),
          metricLabel: z.string(),
          image: z.object({
            url: z.string().min(1),
            alt: z.string(),
            width: z.number().int().positive().optional(),
            height: z.number().int().positive().optional(),
          }),
          creator: z.object({
            handle: z.string(),
            skinType: z.string().optional(),
          }).optional(),
        })).min(2).max(8),
      }),
      shade_selector: z.object({
        heading: z.string().optional(),
        shades: z.array(z.object({
          id: z.string(),
          name: z.string(),
          description: z.string(),
          hex: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
          image: z.object({
            url: z.string().min(1),
            alt: z.string(),
            width: z.number().int().positive().optional(),
            height: z.number().int().positive().optional(),
          }).optional(),
          isNew: z.boolean().default(false),
          isOutOfStock: z.boolean().default(false),
          group: z.enum(['limited_edition', 'core']),
        })).min(1),
        defaultShadeId: z.string().optional(),
      }),
      lifestyle_carousel: z.object({
        heading: z.string(),
        images: z.array(z.object({
          id: z.string(),
          image: z.object({
            url: z.string().min(1),
            alt: z.string(),
            width: z.number().int().positive().optional(),
            height: z.number().int().positive().optional(),
          }),
          caption: z.string().optional(),
        })).min(3).max(10),
      }),
      research_ingredients: z.object({
        heroImage: z.object({
          url: z.string().min(1),
          alt: z.string(),
          width: z.number().int().positive().optional(),
          height: z.number().int().positive().optional(),
        }),
        heading: z.object({
          eyebrow: z.string().optional(),
          kicker: z.string().optional(),
          title: z.string(),
          subtitle: z.string().optional(),
          description: z.string().optional(),
        }).optional(),
        ingredients: z.array(z.object({
          id: z.string(),
          name: z.string(),
          icon: z.object({
            url: z.string().min(1),
            alt: z.string(),
            width: z.number().int().positive().optional(),
            height: z.number().int().positive().optional(),
          }).optional(),
          description: z.string(),
          alsoMadeWith: z.array(z.string()).default([]),
        })).min(2).max(6),
      }),
      sustainability: z.object({
        title: z.string(),
        intro: z.string().optional(),
        specs: z.array(z.object({
          component: z.string(),
          detail: z.string(),
        })).min(2),
        recycleCta: z.object({
          label: z.string(),
          href: z.string().min(1),
        }).optional(),
        steps: z.array(z.string()).default([]),
        closingNote: z.string().optional(),
      }),
    } as const;

    const payloadTypeUnsafeScheme = z.object({
      url: z.string().min(1),
      alt: z.string(),
      width: z.number().int().positive().optional(),
      height: z.number().int().positive().optional(),
    });

    const unitTypeScheme = z.enum([
      'hero_gallery',
      'benefits_grid',
      'application_steps',
      'key_ingredients',
      'value_props_grid',
      'visual_application',
      'ingredient_spotlight',
      'results_study',
      'routine_map',
      'reviews',
      'comparison_chart',
      'kit_contents',
      'results_carousel',
      'shade_selector',
      'lifestyle_carousel',
      'research_ingredients',
      'sustainability',
    ]);

    /**
     * Hydrate a showcase unit's `payload` from its top-level `image` field
     * when the payload is missing the image location its type expects.
     *
     * The admin form writes the per-unit cover image to the top-level
     * `image` column (`ProductShowcase.image` in the backend), and the
     * showcase zod schemas require the image to live inside `payload`
     * (e.g. `payload.images[].url` for `hero_gallery`). When the admin
     * hasn't yet populated the per-type payload, this fallback lifts the
     * top-level image into the expected slot so the unit still renders.
     *
     * Returns `null` when no hydration is needed (payload already has the
     * expected image, or the type doesn't need one). The caller re-validates
     * after hydration and only uses the result if the schema now passes.
     */
    const hydratePayloadWithUnitImage = (
      type: string,
      payload: unknown,
      unitImage: string,
      unitTitle: string | null | undefined,
    ): Record<string, unknown> | null => {
      const urlObj = { url: unitImage, alt: unitTitle ?? 'Showcase image' };
      const p = (payload ?? {}) as Record<string, unknown>;

      switch (type) {
        case 'hero_gallery':
          if (!Array.isArray(p.images) || p.images.length === 0) {
            return { ...p, images: [urlObj] };
          }
          return null;
        case 'key_ingredients': {
          if (Array.isArray(p.heroIngredients) && p.heroIngredients.length > 0) return null;
          return {
            ...p,
            heroIngredients: [{ name: unitTitle ?? 'Featured', description: '', image: urlObj }],
          };
        }
        case 'application_steps':
        case 'visual_application': {
          if (Array.isArray(p.steps) && p.steps.length > 0) return null;
          return {
            ...p,
            steps: [{ id: 'step-1', title: unitTitle ?? 'Step 1', image: urlObj }],
          };
        }
        case 'value_props_grid': {
          if (Array.isArray(p.props) && p.props.length > 0) return null;
          return { ...p, props: [{ label: unitTitle ?? 'Value' }] };
        }
        case 'ingredient_spotlight':
        case 'research_ingredients': {
          if (p.heroImage) return null;
          return { ...p, heroImage: urlObj };
        }
        case 'results_study': {
          if (Array.isArray(p.heroImages) && p.heroImages.length > 0) return null;
          return { ...p, heroImages: [urlObj] };
        }
        case 'routine_map': {
          if (Array.isArray(p.steps) && p.steps.length > 0) return null;
          return {
            ...p,
            steps: [
              {
                id: 'step-1',
                number: 1,
                label: unitTitle ?? 'Step 1',
                productName: unitTitle ?? '',
                lifestyleImage: urlObj,
              },
            ],
          };
        }
        case 'comparison_chart':
        case 'kit_contents': {
          if (Array.isArray(p.products) && p.products.length > 0) return null;
          return {
            ...p,
            products: [
              {
                slug: '',
                name: unitTitle ?? '',
                shortName: unitTitle ?? '',
                tagline: '',
                image: urlObj,
                fields: { whatItIs: '', bestFor: '', whereItFits: '', keyIngredients: '' },
              },
            ],
          };
        }
        case 'results_carousel': {
          if (Array.isArray(p.cards) && p.cards.length > 0) return null;
          return {
            ...p,
            cards: [
              {
                id: 'card-1',
                productName: unitTitle ?? '',
                metricValue: '',
                metricLabel: '',
                image: urlObj,
              },
            ],
          };
        }
        case 'shade_selector': {
          if (Array.isArray(p.shades) && p.shades.length > 0) return null;
          return {
            ...p,
            shades: [
              {
                id: 'shade-1',
                name: unitTitle ?? 'Shade',
                description: '',
                image: urlObj,
                isNew: false,
                isOutOfStock: false,
                group: 'core',
              },
            ],
          };
        }
        case 'lifestyle_carousel': {
          if (Array.isArray(p.images) && p.images.length > 0) return null;
          return { ...p, images: [{ id: 'lc-1', image: urlObj }] };
        }
        case 'benefits_grid':
        case 'reviews':
        case 'sustainability':
          // These types do not require an image; pass through.
          return null;
        default:
          return null;
      }
    };

    const validatedUnits = [] as import('../types/showcase-units').ShowcaseUnit[];

    for (const unit of units as BackendShowcaseUnit[]) {
      const typeResult = unitTypeScheme.safeParse(unit.type);
      if (!typeResult.success) {
        continue;
      }

      const confirmedType = typeResult.data;
      const payloadSchema = payloadSchemaFor[confirmedType];
      if (!payloadSchema) {
        continue;
      }

      let payloadToValidate: unknown = unit.payload;
      let payloadResult: ReturnType<typeof payloadSchema['safeParse']>;
      try {
        payloadResult = payloadSchema.safeParse(payloadToValidate);
        if (!payloadResult.success && typeof unit.image === 'string' && unit.image.trim() !== '') {
          const hydrated = hydratePayloadWithUnitImage(
            confirmedType,
            unit.payload,
            unit.image.trim(),
            unit.title,
          );
          if (hydrated) {
            payloadToValidate = hydrated;
            payloadResult = payloadSchema.safeParse(payloadToValidate);
          }
        }
      } catch (parseError) {
        continue;
      }

      if (!payloadResult.success) {
        continue;
      }

      validatedUnits.push({
        id: String(unit.id),
        type: confirmedType,
        sortOrder: unit.sortOrder ?? 0,
        isActive: unit.isActive !== false,
        direction: unit.direction === 'rtl' ? 'rtl' : 'ltr',
        theme: unit.theme as 'light' | 'dark' | 'cream' | 'clinical' | 'brand' | undefined,
        payload: payloadResult.data,
      } as import('../types/showcase-units').ShowcaseUnit);
    }

    return validatedUnits.length > 0 ? validatedUnits : null;
  } catch (error) {
    if (!(error instanceof IcareApiError && error.status === 0)) {
      console.error('Error fetching product showcase:', error);
    }
    return null;
  }
};

export const submitProductReview = async (
  slug: string,
  review: CreateReviewInput,
  token?: string,
): Promise<ProductReview | null> => {
  try {
    if (!icareApi.isConfigured()) return null;
    const result = await icareApi.products.submitReview(slug, review, token);
    cacheMiddleware.invalidate(`/api/v1/products/${slug}/reviews`);
    return mapBackendReviewToProductReview(result);
  } catch (error) {
    if (!(error instanceof IcareApiError && error.status === 0)) {
      console.error('Error submitting iCare product review:', error);
    }
    throw error;
  }
};

export const voteReviewHelpful = async (
  reviewId: number,
  token?: string,
): Promise<number | null> => {
  try {
    if (!icareApi.isConfigured()) return null;
    const result = await icareApi.reviews.helpful(reviewId, token);
    return result.helpfulCount;
  } catch (error) {
    if (!(error instanceof IcareApiError && error.status === 0)) {
      console.error('Error voting review helpful:', error);
    }
    return null;
  }
};
