/**
 * All-route smoke test — spec 005 (C-12 / SC-07).
 *
 * Visits every /icare/* route in EN + AR and asserts zero console
 * errors and zero warnings mentioning a missing registry key.
 */
import { test, expect } from '@playwright/test';

const ICARE_ROUTES = [
  '/icare',
  '/icare/shop',
  '/icare/products',
  '/icare/cart',
  '/icare/checkout',
  '/icare/account',
  '/icare/contact',
  '/icare/about',
  '/icare/shipping',
  '/icare/wishlist',
  '/icare/vlog',
  '/icare/track-order',
];

const LOCALES = ['en', 'ar'] as const;

for (const locale of LOCALES) {
  for (const route of ICARE_ROUTES) {
    test(`no console errors on ${route} (${locale})`, async ({ page }) => {
      const errors: string[] = [];
      page.on('console', (msg) => {
        const type = msg.type();
        const text = msg.text();
        if (type === 'error') errors.push(text);
        if (type === 'warning' && /missing key/i.test(text)) {
          errors.push(`[warning] ${text}`);
        }
      });
      page.on('pageerror', (err) => errors.push(`[pageerror] ${err.message}`));
      await page.goto(`${route}?lang=${locale}`, { waitUntil: 'networkidle' });
      expect(errors, `console errors on ${route} (${locale}):\n${errors.join('\n')}`).toEqual([]);
    });
  }
}
