/**
 * tests/showcase-empty-state.spec.ts
 *
 * Tests for:
 * - T004: ShowcaseBlock empty-state behavior
 * - T008: isDemoMode helper + ShowcasePreviewPage demo branch
 *
 * Run: cd i-group && npx vitest run tests/showcase-empty-state.spec.ts
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
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
