/**
 * tests/showcase-hydration.spec.ts
 *
 * Tests for:
 * - Zod schema loosening (hero_gallery.images min 1)
 * - Hydration fallback when only top-level image is set
 * - Structured skipped-unit logs include slug, unitId, type, reason
 *
 * Run: cd i-group && npx vitest run tests/showcase-hydration.spec.ts
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchProductShowcase } from '../app/icare/lib/catalog-client';
import * as apiClient from '../app/icare/lib/api-client';

const makeBackendUnit = (overrides: Partial<BackendShowcaseUnit> = {}): BackendShowcaseUnit => ({
  id: 1,
  productId: 1,
  type: 'hero_gallery',
  sortOrder: 0,
  isActive: true,
  direction: 'ltr',
  theme: 'light',
  title: 'Hero',
  image: 'https://cdn/cover.jpg',
  payload: {},
  ...overrides,
} as unknown as BackendShowcaseUnit);

// Minimal BackendShowcaseUnit shape used for these tests.
type BackendShowcaseUnit = {
  id: number;
  productId: number;
  type: string;
  sortOrder: number;
  isActive: boolean;
  direction: string;
  theme: string;
  title?: string;
  image?: string | null;
  payload: unknown;
};

describe('fetchProductShowcase hydration + Zod loosening', () => {
  const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns null when API is not configured', async () => {
    vi.spyOn(apiClient.icareApi, 'isConfigured').mockReturnValue(false);
    const result = await fetchProductShowcase('slug-a');
    expect(result).toBeNull();
  });

  it('returns null for empty units array', async () => {
    vi.spyOn(apiClient.icareApi, 'isConfigured').mockReturnValue(true);
    vi.spyOn(apiClient.icareApi.products, 'showcase').mockResolvedValue([]);
    const result = await fetchProductShowcase('slug-a');
    expect(result).toBeNull();
  });

  it('hero_gallery with 1 image passes Zod and returns 1 unit', async () => {
    vi.spyOn(apiClient.icareApi, 'isConfigured').mockReturnValue(true);
    vi.spyOn(apiClient.icareApi.products, 'showcase').mockResolvedValue([
      makeBackendUnit({
        id: 101,
        type: 'hero_gallery',
        title: 'Hero',
        image: 'https://cdn/cover.jpg',
        payload: {
          images: [{ url: 'https://cdn/cover.jpg', alt: 'Cover' }],
        },
      }),
    ]);

    const result = await fetchProductShowcase('slug-a');
    expect(result).toHaveLength(1);
    expect(result?.[0].type).toBe('hero_gallery');
    expect(result?.[0].payload).toMatchObject({
      images: [{ url: 'https://cdn/cover.jpg', alt: 'Cover' }],
    });
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('hydrates hero_gallery from top-level image when payload.images is missing', async () => {
    vi.spyOn(apiClient.icareApi, 'isConfigured').mockReturnValue(true);
    vi.spyOn(apiClient.icareApi.products, 'showcase').mockResolvedValue([
      makeBackendUnit({
        id: 102,
        type: 'hero_gallery',
        title: 'Hero',
        image: 'https://cdn/cover.jpg',
        payload: {},
      }),
    ]);

    const result = await fetchProductShowcase('slug-b');
    expect(result).toHaveLength(1);
    expect(result?.[0].payload).toMatchObject({
      images: [{ url: 'https://cdn/cover.jpg', alt: 'Hero' }],
    });
  });

  it('key_ingredients with empty heroIngredients + top-level image hydrates 1 hero ingredient', async () => {
    vi.spyOn(apiClient.icareApi, 'isConfigured').mockReturnValue(true);
    vi.spyOn(apiClient.icareApi.products, 'showcase').mockResolvedValue([
      makeBackendUnit({
        id: 103,
        type: 'key_ingredients',
        title: 'Key Ingredient',
        image: 'https://cdn/key.jpg',
        payload: {},
      }),
    ]);

    const result = await fetchProductShowcase('slug-c');
    expect(result).toHaveLength(1);
    expect(result?.[0].payload).toMatchObject({
      heroIngredients: [{ name: 'Key Ingredient', description: '', image: { url: 'https://cdn/key.jpg' } }],
      alsoMadeWith: [],
    });
  });

  it('completely invalid payload logs zod_invalid_payload reason and skips unit', async () => {
    const localWarn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const localError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    vi.spyOn(apiClient.icareApi, 'isConfigured').mockReturnValue(true);
    vi.spyOn(apiClient.icareApi.products, 'showcase').mockResolvedValue([
      makeBackendUnit({
        id: 104,
        type: 'hero_gallery',
        image: null,
        payload: { images: 'not-an-array' },
      }),
    ]);

    const result = await fetchProductShowcase('slug-d');
    expect(result).toBeNull();
    expect(localWarn).toHaveBeenCalledWith(
      '[fetchProductShowcase] Skipping unit',
      expect.objectContaining({
        slug: 'slug-d',
        unitId: 104,
        type: 'hero_gallery',
        reason: 'zod_invalid_payload',
      }),
    );
    localWarn.mockRestore();
    localError.mockRestore();
  });

  it('network error returns null without throwing', async () => {
    vi.spyOn(apiClient.icareApi, 'isConfigured').mockReturnValue(true);
    vi.spyOn(apiClient.icareApi.products, 'showcase').mockRejectedValue(new Error('network failure'));

    await expect(fetchProductShowcase('slug-e')).resolves.toBeNull();
  });

  it('unknown type logs unknown_type reason and skips unit', async () => {
    const localWarn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const localError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    vi.spyOn(apiClient.icareApi, 'isConfigured').mockReturnValue(true);
    vi.spyOn(apiClient.icareApi.products, 'showcase').mockResolvedValue([
      makeBackendUnit({
        id: 105,
        type: 'unknown_thing',
        image: null,
        payload: {},
      }),
    ]);

    const result = await fetchProductShowcase('slug-f');
    expect(result).toBeNull();
    expect(localWarn).toHaveBeenCalledWith(
      '[fetchProductShowcase] Skipping unit',
      expect.objectContaining({
        slug: 'slug-f',
        unitId: 105,
        type: 'unknown_thing',
        reason: 'unknown_type',
      }),
    );
    localWarn.mockRestore();
    localError.mockRestore();
  });

  it('propagates slug into every warn log', async () => {
    const localWarn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const localError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    vi.spyOn(apiClient.icareApi, 'isConfigured').mockReturnValue(true);
    vi.spyOn(apiClient.icareApi.products, 'showcase').mockResolvedValue([
      makeBackendUnit({
        id: 106,
        type: 'unknown_thing',
        image: null,
        payload: {},
      }),
      makeBackendUnit({
        id: 107,
        type: 'hero_gallery',
        image: null,
        payload: { images: 'not-an-array' },
      }),
    ]);

    await fetchProductShowcase('slug-g');
    const calls = localWarn.mock.calls.filter((call) => call[0] === '[fetchProductShowcase] Skipping unit');
    for (const call of calls) {
      expect(call[1]).toMatchObject({ slug: 'slug-g' });
    }
    localWarn.mockRestore();
    localError.mockRestore();
  });
});
