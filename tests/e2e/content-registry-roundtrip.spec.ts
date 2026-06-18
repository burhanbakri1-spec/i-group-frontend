/**
 * Content registry roundtrip — spec 005 (C-11 / SC-06).
 *
 * Login as admin → edit `home.hero.headline` → reload iCare home →
 * assert the new headline is visible within 60s (revalidation interval).
 */
import { test, expect } from '@playwright/test';

const TEST_VALUE = `TEST_HEADLINE_${Date.now()}`;

test.describe('Content registry roundtrip', () => {
  test('admin edit reflects on FE within 60s', async ({ page, context }) => {
    // Login as admin
    await page.goto('/admin/login');
    await page.fill('input[name="email"]', process.env.ADMIN_EMAIL || 'admin@example.com');
    await page.fill('input[name="password"]', process.env.ADMIN_PASSWORD || 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/admin/);

    // Navigate to registry
    await page.goto('/admin/content/registry');
    await page.waitForLoadState('networkidle');

    // Search for the key
    await page.fill('input[type="search"]', 'home.hero.headline');
    // Click the row to open the edit modal
    await page.click('text=home.hero.headline');
    // Wait for modal
    const enField = page.locator('[data-testid="text-en"], textarea[name="en"], input[name="en"]').first();
    await enField.fill(TEST_VALUE);
    // Save
    await page.click('button:has-text("Save"), button[type="submit"]');
    await page.waitForTimeout(2000);

    // Navigate to FE home
    const fePage = await context.newPage();
    await fePage.goto('/icare');
    // Wait up to 60s for revalidation
    await expect(fePage.locator('h1')).toContainText(TEST_VALUE, { timeout: 60_000 });
  });
});
