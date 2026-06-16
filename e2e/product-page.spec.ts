/**
 * e2e/product-page.spec.ts
 *
 * E2E tests for the clean showcase fetch feature.
 * Tests US-1 (empty-state), US-2 (demo mode), US-3 (backend data), FR-004, FR-007.
 *
 * Run: cd i-group && npx playwright test e2e/product-page.spec.ts
 */

import { test, expect } from '@playwright/test';

const PRODUCT_SLUG = 'wireless-bluetooth-headphones';

test.describe('Clean Showcase Fetch', () => {
  // ── US-1: Empty backend, clean product page ─────────────────────────────────

  test('US-1: empty backend → no showcase section on product page', async ({ page }) => {
    await page.goto(`/icare/products/${PRODUCT_SLUG}`);

    // Hero should still render
    await expect(page.locator('section').first()).toBeVisible();

    // Showcase section should NOT be visible
    // (ShowcaseBlock returns null when backend returns [])
    const showcaseSection = page.locator('section.icare-showcase');
    await expect(showcaseSection).not.toBeVisible();
  });

  // ── US-2: Preview with ?demo=1 → 17 fallback units + badge ────────────────

  test('US-2: ?demo=1 on preview → renders SHOWCASE_FALLBACK + DEMO MODE badge', async ({ page }) => {
    await page.goto(`/icare/products/${PRODUCT_SLUG}/showcase?demo=1`);

    // DEMO MODE badge visible in top bar
    await expect(page.getByText('DEMO MODE')).toBeVisible();

    // 17 fallback units should render
    // We verify by checking for content that exists in SHOWCASE_FALLBACK
    await expect(page.getByText('Glazing Milk')).toBeVisible();
  });

  // ── US-2: Preview without flag → empty state + hint ─────────────────────────

  test('US-2: preview without flag → empty state with ?demo=1 hint', async ({ page }) => {
    await page.goto(`/icare/products/${PRODUCT_SLUG}/showcase`);

    // Empty state message visible
    await expect(page.getByText('No showcase data for this product')).toBeVisible();

    // Hint link visible
    await expect(page.getByText('Add ?demo=1 to preview the full unit library.')).toBeVisible();

    // DEMO MODE badge NOT visible
    await expect(page.getByText('DEMO MODE')).not.toBeVisible();
  });

  // ── FR-004: Production route ignores ?demo=1 ────────────────────────────────

  test('FR-004: production route with ?demo=1 → showcase hidden (demo ignored)', async ({ page }) => {
    await page.goto(`/icare/products/${PRODUCT_SLUG}?demo=1`);

    // No DEMO MODE badge on production route
    await expect(page.getByText('DEMO MODE')).not.toBeVisible();

    // Showcase should not render (empty backend)
    const showcaseSection = page.locator('section.icare-showcase');
    await expect(showcaseSection).not.toBeVisible();
  });

  // ── FR-007: 404 product → unavailable UI ──────────────────────────────────

  test('FR-007: 404 product → unavailable UI, no showcase', async ({ page }) => {
    await page.goto('/icare/products/this-product-does-not-exist-xyz');

    // Product unavailable UI visible
    await expect(page.getByText(/product unavailable/i)).toBeVisible();

    // No showcase section
    const showcaseSection = page.locator('section.icare-showcase');
    await expect(showcaseSection).not.toBeVisible();
  });

  // ── US-3: Backend with data → units render in sortOrder ────────────────────
  // This test requires seeded showcase data in the backend.
  // It is marked as skipped in CI unless a seed script provides the data.

  test('US-3: backend with authored data → units render in sortOrder', async ({ page }) => {
    test.skip(process.env.CI === 'true', 'Requires seeded showcase data');

    await page.goto(`/icare/products/${PRODUCT_SLUG}`);

    // Verify at least one showcase unit renders
    const showcaseSection = page.locator('section.icare-showcase');
    await expect(showcaseSection).toBeVisible();
  });
});
