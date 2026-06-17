/**
 * tests/showcase-empty-state.spec.ts
 *
 * Tests for:
 * - T004: ShowcaseBlock empty-state behavior
 * - T008: isDemoMode helper + ShowcasePreviewPage demo branch
 *
 * Run: cd i-group && npx vitest run tests/showcase-empty-state.spec.ts
 */

import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';
import { isDemoMode } from '../app/icare/lib/showcase/demo-mode';

// ─── isDemoMode tests ─────────────────────────────────────────────────────────

describe('isDemoMode', () => {
  it('returns true for ?demo=1', () => {
    expect(isDemoMode(new URLSearchParams('demo=1'))).toBe(true);
  });

  it('returns false for ?demo=0', () => {
    expect(isDemoMode(new URLSearchParams('demo=0'))).toBe(false);
  });

  it('returns false for ?demo (no value)', () => {
    expect(isDemoMode(new URLSearchParams('demo'))).toBe(false);
  });

  it('returns false for ?demo=true', () => {
    expect(isDemoMode(new URLSearchParams('demo=true'))).toBe(false);
  });

  it('returns false when no demo param', () => {
    expect(isDemoMode(new URLSearchParams(''))).toBe(false);
  });
});

// ─── ShowcaseBlock empty-state regression tests ─────────────────────────────

describe('ShowcaseBlock empty-state regression', () => {
  it('returns null when units is null', async () => {
    const { ShowcaseBlock } = await import('../app/icare/components/showcase/ShowcaseBlock');
    const { container } = render(
      React.createElement(ShowcaseBlock, { slug: 'test-slug', units: null, lang: 'en' }),
    );
    expect(container.firstChild).toBeNull();
  });

  it('returns null when units is []', async () => {
    const { ShowcaseBlock } = await import('../app/icare/components/showcase/ShowcaseBlock');
    const { container } = render(
      React.createElement(ShowcaseBlock, { slug: 'test-slug', units: [], lang: 'en' }),
    );
    expect(container.firstChild).toBeNull();
  });

  it('returns null when all units are isActive=false', async () => {
    const { ShowcaseBlock } = await import('../app/icare/components/showcase/ShowcaseBlock');
    const inactiveUnit = {
      id: '1',
      type: 'hero_gallery' as const,
      sortOrder: 0,
      isActive: false,
      direction: 'ltr' as const,
      theme: 'light' as const,
      payload: {
        images: [{ url: 'https://placehold.co/1x1', alt: 'inactive' }],
      } as unknown as import('../app/icare/types/showcase-units').HeroGalleryPayload,
    } as unknown as import('../app/icare/types/showcase-units').ShowcaseUnit;
    const { container } = render(
      React.createElement(ShowcaseBlock, { slug: 'test-slug', units: [inactiveUnit], lang: 'en' }),
    );
    expect(container.firstChild).toBeNull();
  });
});

// ─── SHOWCASE_FALLBACK presence check ──────────────────────────────────────────

describe('SHOWCASE_FALLBACK', () => {
  it('exports 17 unit types', async () => {
    const { SHOWCASE_FALLBACK } = await import('../app/icare/lib/showcase/fallback');
    expect(SHOWCASE_FALLBACK).toHaveLength(17);
  });

  it('each unit has a valid type', async () => {
    const { SHOWCASE_FALLBACK } = await import('../app/icare/lib/showcase/fallback');
    const validTypes = [
      'hero_gallery', 'benefits_grid', 'application_steps', 'key_ingredients',
      'value_props_grid', 'visual_application', 'ingredient_spotlight', 'results_study',
      'routine_map', 'reviews', 'comparison_chart', 'kit_contents', 'results_carousel',
      'shade_selector', 'lifestyle_carousel', 'research_ingredients', 'sustainability',
    ];
    for (const unit of SHOWCASE_FALLBACK) {
      expect(validTypes).toContain(unit.type);
    }
  });
});
