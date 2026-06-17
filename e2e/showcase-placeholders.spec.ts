import { test, expect } from '@playwright/test';

/**
 * e2e/showcase-placeholders.spec.ts
 *
 * Scenarios:
 * 1. Product with 0 backend units → ShowcaseBlock section absent (spec 001 regression)
 * 2. Product with 3 fully-authored units → all render, no placeholders visible
 * 3. Product with 1 partial hero_gallery (1 image) → 1 unit renders with 1 ImagePlaceholder
 *
 * Run: cd i-group && npx playwright test e2e/showcase-placeholders.spec.ts
 */

const imagePlaceholder = '[role="img"][aria-label="Image placeholder"]';
const textPlaceholder = '[role="status"][aria-label="Content placeholder"]';
const showcaseSection = 'section.py-12.md\\:py-16';

test.describe('Showcase placeholders E2E', () => {
  test('product with 0 backend units hides ShowcaseBlock section', async ({ page }) => {
    // Assumes a seeded product with no showcase rows, or backend mock.
    await page.goto('/icare/products/no-showcase');
    await expect(page.locator(showcaseSection)).toHaveCount(0);
  });

  test('fully-authored product renders 3 units with no placeholders', async ({ page }) => {
    // Assumes a seeded product with 3 fully authored showcase rows.
    await page.goto('/icare/products/full-showcase');
    await expect(page.locator(showcaseSection)).toHaveCount(1);
    const unitSections = page.locator(`${showcaseSection} > div > section, ${showcaseSection} > div > div`);
    await expect(unitSections).toHaveCount(3);
    await expect(page.locator(imagePlaceholder)).toHaveCount(0);
    await expect(page.locator(textPlaceholder)).toHaveCount(0);
  });

  test('partial hero_gallery renders 1 unit with 1 ImagePlaceholder', async ({ page }) => {
    // Assumes a seeded product with a single-image hero_gallery.
    await page.goto('/icare/products/partial-showcase');
    await expect(page.locator(showcaseSection)).toHaveCount(1);
    await expect(page.locator(imagePlaceholder).first()).toBeVisible();
  });
});
