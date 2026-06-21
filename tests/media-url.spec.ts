/**
 * tests/media-url.spec.ts
 *
 * Tests for the canonical URL resolver in app/icare/lib/media-url.ts.
 * Covers the 22 numbered acceptance criteria from the M-Cluster 1 spec.
 *
 * Run: cd i-group && npx vitest run tests/media-url.spec.ts
 */

import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';

type MediaUrlModule = typeof import('../app/icare/lib/media-url');

const loadMediaUrl = async (imageBaseUrl: string | null): Promise<MediaUrlModule> => {
  if (imageBaseUrl === null) {
    vi.stubEnv('NEXT_PUBLIC_IMAGE_BASE_URL', '');
  } else {
    vi.stubEnv('NEXT_PUBLIC_IMAGE_BASE_URL', imageBaseUrl);
  }
  vi.resetModules();
  return import('../app/icare/lib/media-url');
};

describe('media-url canonical resolver', () => {
  describe('with IMAGE_BASE_URL unset (default /api/icare)', () => {
    let mod: MediaUrlModule;

    beforeAll(async () => {
      mod = await loadMediaUrl(null);
    });

    afterAll(() => {
      vi.unstubAllEnvs();
    });

    describe('falsy and empty inputs', () => {
      it('AC1: returns "" for undefined', () => {
        expect(mod.resolveMediaUrl(undefined)).toBe('');
      });

      it('AC2: returns "" for null', () => {
        expect(mod.resolveMediaUrl(null)).toBe('');
      });

      it('AC3: returns "" for empty string', () => {
        expect(mod.resolveMediaUrl('')).toBe('');
      });

      it('AC4: returns "" for whitespace-only string', () => {
        expect(mod.resolveMediaUrl('   ')).toBe('');
      });
    });

    describe('passthrough cases', () => {
      it('AC5: https URL passes through unchanged', () => {
        expect(mod.resolveMediaUrl('https://cdn.example.com/x.png')).toBe('https://cdn.example.com/x.png');
      });

      it('AC6: http URL passes through unchanged', () => {
        expect(mod.resolveMediaUrl('http://cdn.example.com/x.png')).toBe('http://cdn.example.com/x.png');
      });

      it('AC7: protocol-relative URL passes through unchanged', () => {
        expect(mod.resolveMediaUrl('//cdn.example.com/x.png')).toBe('//cdn.example.com/x.png');
      });

      it('AC8: /uploads/ passes through (next.config rewrite proxies it)', () => {
        expect(mod.resolveMediaUrl('/uploads/x.png')).toBe('/uploads/x.png');
      });

      it('AC9: /public/uploads/ passes through (next.config rewrite proxies it)', () => {
        expect(mod.resolveMediaUrl('/public/uploads/x.png')).toBe('/public/uploads/x.png');
      });

      it('AC10: /api/icare/uploads/ passes through (already prefixed)', () => {
        expect(mod.resolveMediaUrl('/api/icare/uploads/x.png')).toBe('/api/icare/uploads/x.png');
      });

      it('AC13: data:image/ URL passes through unchanged', () => {
        expect(mod.resolveMediaUrl('data:image/png;base64,iVBORw0KGgo'))
          .toBe('data:image/png;base64,iVBORw0KGgo');
      });
    });

    describe('prefix cases (backend returned unproxied path)', () => {
      it('AC11: /products/x.png is prefixed with /api/icare', () => {
        expect(mod.resolveMediaUrl('/products/x.png')).toBe('/api/icare/products/x.png');
      });

      it('AC12: bare basename x.png is prefixed with /api/icare (bug fix)', () => {
        expect(mod.resolveMediaUrl('x.png')).toBe('/api/icare/x.png');
      });
    });

    describe('security rejections', () => {
      it('AC14: rejects non-image data URI', () => {
        expect(mod.resolveMediaUrl('data:javascript:alert(1)')).toBe('');
      });

      it('AC15: rejects javascript: scheme', () => {
        expect(mod.resolveMediaUrl('javascript:alert(1)')).toBe('');
      });

      it('AC16: rejects vbscript: scheme', () => {
        expect(mod.resolveMediaUrl('vbscript:msgbox(1)')).toBe('');
      });
    });

    describe('resolveMany helper', () => {
      it('AC17: filters out empty results, keeps resolved ones', () => {
        expect(mod.resolveMany([null, '/uploads/a.png', '', '/public/uploads/b.png']))
          .toEqual(['/uploads/a.png', '/public/uploads/b.png']);
      });
    });

    describe('resolveOrFallback helper', () => {
      it('AC18: returns fallback when value resolves to empty', () => {
        expect(mod.resolveOrFallback(undefined, '/fallback.png')).toBe('/fallback.png');
      });

      it('AC19: returns resolved value when value is valid', () => {
        expect(mod.resolveOrFallback('/uploads/a.png', '/fallback.png')).toBe('/uploads/a.png');
      });
    });

    describe('isSafeImageUrl type guard', () => {
      it('AC20: returns false for empty string', () => {
        expect(mod.isSafeImageUrl('')).toBe(false);
      });

      it('AC21: returns false for null', () => {
        expect(mod.isSafeImageUrl(null)).toBe(false);
      });

      it('AC22: returns true for /a.png', () => {
        expect(mod.isSafeImageUrl('/a.png')).toBe(true);
      });
    });

    describe('module surface', () => {
      it('AC23: exports resolveMediaUrl, resolveMany, resolveOrFallback, resolveMediaUrlRaw, isSafeImageUrl', () => {
        expect(typeof mod.resolveMediaUrl).toBe('function');
        expect(typeof mod.resolveMany).toBe('function');
        expect(typeof mod.resolveOrFallback).toBe('function');
        expect(typeof mod.resolveMediaUrlRaw).toBe('function');
        expect(typeof mod.isSafeImageUrl).toBe('function');
      });
    });
  });

  describe('with IMAGE_BASE_URL set to a custom host', () => {
    let mod: MediaUrlModule;

    beforeAll(async () => {
      mod = await loadMediaUrl('https://cdn.example.com');
    });

    afterAll(() => {
      vi.unstubAllEnvs();
    });

    it('uses IMAGE_BASE_URL for unproxied relative paths instead of /api/icare', () => {
      expect(mod.resolveMediaUrl('/products/x.png')).toBe('https://cdn.example.com/products/x.png');
    });

    it('uses IMAGE_BASE_URL for bare basenames', () => {
      expect(mod.resolveMediaUrl('x.png')).toBe('https://cdn.example.com/x.png');
    });

    it('strips trailing slash from IMAGE_BASE_URL', async () => {
      const mod2 = await loadMediaUrl('https://cdn.example.com/');
      expect(mod2.resolveMediaUrl('/products/x.png')).toBe('https://cdn.example.com/products/x.png');
    });

    it('absolute URLs still pass through unchanged (no double-prefix)', () => {
      expect(mod.resolveMediaUrl('https://other.example.com/y.png')).toBe('https://other.example.com/y.png');
    });

    it('proxied root-relative paths still pass through (no IMAGE_BASE_URL prefix)', () => {
      expect(mod.resolveMediaUrl('/uploads/y.png')).toBe('/uploads/y.png');
    });
  });
});
