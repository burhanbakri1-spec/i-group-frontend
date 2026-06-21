// Verify the fixes:
//  1. /shop → /icare/shop redirect
//  2. Logo on /icare/shop is now inverted (brightness(0) invert(1)) → visible on dark hero
//  3. Header no longer hides on small scroll deltas
//  4. Content client: no more 404 spam after first page load
import { chromium } from '../node_modules/playwright/index.mjs';
import fs from 'node:fs';

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const out = './scripts/screens';
fs.mkdirSync(out, { recursive: true });

// 1. /shop redirect
const page0 = await context.newPage();
const resp = await page0.goto('http://localhost:3000/shop', { waitUntil: 'networkidle' });
console.log(`\n[1] /shop → status=${resp.status()}, finalURL=${page0.url()}`);
await page0.close();

// 2. Logo on /icare/shop
const page1 = await context.newPage();
const failures1 = [];
page1.on('response', (r) => { if (r.status() >= 400) failures1.push({ url: r.url(), status: r.status() }); });
await page1.goto('http://localhost:3000/icare/shop', { waitUntil: 'networkidle' });
await page1.waitForTimeout(1500);
const logo1 = await page1.evaluate(() => {
  const im = document.querySelector('header img');
  if (!im) return null;
  return { src: im.currentSrc, filter: getComputedStyle(im).filter, naturalWidth: im.naturalWidth, complete: im.complete };
});
console.log(`\n[2] /icare/shop logo: ${JSON.stringify(logo1)}`);
console.log(`    4xx responses on first load: ${failures1.length}`);
await page1.screenshot({ path: `${out}/after-shop.png` });
await page1.close();

// 3. Header stability under scroll
const page2 = await context.newPage();
const failures2 = [];
page2.on('response', (r) => { if (r.status() >= 400) failures2.push({ url: r.url(), status: r.status() }); });
await page2.goto('http://localhost:3000/icare/shop', { waitUntil: 'networkidle' });
await page2.waitForTimeout(1500);

const samples = [];
const measure = async (label) => {
  const m = await page2.evaluate(() => {
    const shell = document.querySelector('.icare-header-shell');
    const logo = document.querySelector('header img');
    const r = shell ? shell.getBoundingClientRect() : null;
    const tr = shell ? getComputedStyle(shell).transform : null;
    const lr = logo ? logo.getBoundingClientRect() : null;
    return { shellTop: r?.top, shellTransform: tr, logoTop: lr?.top };
  });
  samples.push({ label, ...m });
};

await measure('at-rest');
await page2.evaluate(() => window.scrollTo({ top: 100, behavior: 'instant' }));
await page2.waitForTimeout(300);
await measure('after-scroll-100');
await page2.evaluate(() => window.scrollTo({ top: 250, behavior: 'instant' }));
await page2.waitForTimeout(500);
await measure('after-scroll-250');
await page2.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
await page2.waitForTimeout(500);
await measure('back-to-top');
await page2.screenshot({ path: `${out}/after-scroll.png` });
console.log('\n[3] Header samples:');
for (const s of samples) console.log(`   ${s.label}: shellTop=${s.shellTop?.toFixed(1)} transform=${s.shellTransform?.slice(0, 40)} logoTop=${s.logoTop?.toFixed(1)}`);
console.log(`    4xx responses on second load: ${failures2.length} (should be 0 — endpoint memoized)`);
await page2.close();

await browser.close();
