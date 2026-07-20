import { describe, expect, it } from 'vitest';
import { FALLBACK_CONTENT } from '../app/icare/lib/fallback-content';
import { mergeWithFallback, CONTENT_IMAGE_KEYS } from '../app/icare/lib/content-client';

describe('FALLBACK_CONTENT', () => {
  it('contains no hardcoded Unsplash image URLs', () => {
    for (const [key, value] of Object.entries(FALLBACK_CONTENT)) {
      if (typeof value === 'string' && value.startsWith('https://images.unsplash.com')) {
        throw new Error(`Fallback key "${key}" still contains hardcoded Unsplash URL: ${value}`);
      }
    }
  });

  it('contains no hardcoded iCare branded marketing text', () => {
    for (const [key, value] of Object.entries(FALLBACK_CONTENT)) {
      if (typeof value === 'string' && value.length > 0) {
        const lower = value.toLowerCase();
        if (lower.includes('icare') || lower.includes('i care')) {
          // Allow generic product/review/shop keys (the product_unavailable_headline
          // already had 'iCare' removed, but keep the carve-out for safety).
          if (!key.startsWith('product_unavailable') && !key.startsWith('review_') && !key.startsWith('product_') && !key.startsWith('shop_')) {
            throw new Error(`Fallback key "${key}" contains branded text: "${value}"`);
          }
        }
      }
    }
  });

  it('allows only empty or generic-non-branded fallback values', () => {
    const allowedGenericPrefixes = [
      'auth_', 'search_', 'cart_', 'checkout_', 'wishlist_',
      'product_', 'review_', 'shop_', 'free_',
    ];
    for (const [key, value] of Object.entries(FALLBACK_CONTENT)) {
      expect(typeof value).toBe('string');
      if (value !== '') {
        const isGeneric = allowedGenericPrefixes.some((p) => key.startsWith(p));
        expect(isGeneric).toBe(true,
          `Key "${key}" has non-empty fallback "${value}" but is not a generic UI label`);
      }
    }
  });
});

describe('CONTENT_IMAGE_KEYS', () => {
  it('all image keys exist in FALLBACK_CONTENT', () => {
    for (const key of CONTENT_IMAGE_KEYS) {
      expect(FALLBACK_CONTENT).toHaveProperty(key);
    }
  });
});

describe('mergeWithFallback', () => {
  it('returns API values when present', () => {
    const result = mergeWithFallback({ home_hero_headline: 'the barrier butter.' }, 'en');
    expect(result.home_hero_headline).toBe('the barrier butter.');
  });

  it('returns empty string for missing keys', () => {
    const result = mergeWithFallback({}, 'en');
    expect(result.home_hero_headline).toBe('');
  });

  it('returns empty string for null locale slice', () => {
    const result = mergeWithFallback(null, 'en');
    expect(result.home_hero_headline).toBe('');
  });
});
