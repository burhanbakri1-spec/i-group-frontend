/**
 * tests/showcase-hydration.spec.ts
 *
 * Tests for:
 * - Zod schema loosening (hero_gallery.images min 1)
 * - Hydration fallback when only top-level image is set
 * - Skipped units do not emit console warnings
 *
 * Run: cd i-group && npx vitest run tests/showcase-hydration.spec.ts
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchProductShowcase } from '../app/icare/lib/catalog-client';
import * as apiClient from '../app/icare/lib/api-client';

const makeBackendUnit = (overrides: Partial<BackendShowcaseUnit> = {}): BackendShowcaseUnit => ({
  id: 1,
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

  it('completely invalid payload is silently skipped (no warn)', async () => {
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
    expect(localWarn).not.toHaveBeenCalled();
    localWarn.mockRestore();
    localError.mockRestore();
  });

  it('network error returns null without throwing', async () => {
    vi.spyOn(apiClient.icareApi, 'isConfigured').mockReturnValue(true);
    vi.spyOn(apiClient.icareApi.products, 'showcase').mockRejectedValue(new Error('network failure'));

    await expect(fetchProductShowcase('slug-e')).resolves.toBeNull();
  });

  it('unknown type is silently skipped (no warn)', async () => {
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
    expect(localWarn).not.toHaveBeenCalled();
    localWarn.mockRestore();
    localError.mockRestore();
  });

  it('multiple skipped units do not emit any warnings', async () => {
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
    expect(calls).toHaveLength(0);
    localWarn.mockRestore();
    localError.mockRestore();
  });
});
