// Verify home page didn't regress + image loading
import { chromium } from '../node_modules/playwright/index.mjs';
import fs from 'node:fs';

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const out = './scripts/screens';

for (const path of ['/icare', '/icare/shop', '/icare/story', '/icare/contact']) {
  const page = await context.newPage();
  const failed = [];
  const imgs = [];
  page.on('response', (r) => {
    if (r.status() >= 400) failed.push({ url: r.url().slice(0, 120), status: r.status() });
    if (/\.(png|jpe?g|webp|gif|svg|avif)(\?|$)/i.test(r.url())) imgs.push({ url: r.url().slice(0, 100), status: r.status() });
  });
  await page.goto('http://localhost:3000' + path, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  const logo = await page.evaluate(() => {
    const im = document.querySelector('header img');
    if (!im) return null;
    return { filter: getComputedStyle(im).filter, complete: im.complete, naturalWidth: im.naturalWidth };
  });
  const brokenImgs = await page.$$eval('img', (els) => els.filter((el) => el.complete && el.naturalWidth === 0).length);
  console.log(`\n[${path}]`);
  console.log(`  logo: ${JSON.stringify(logo)}`);
  console.log(`  image reqs: ${imgs.length}, broken: ${brokenImgs}, 4xx: ${failed.length}`);
  if (failed.length) for (const f of failed.slice(0, 4)) console.log(`    4xx: ${f.status} ${f.url}`);
  await page.screenshot({ path: `${out}/after${path.replace(/\//g, '-')}.png` });
  await page.close();
}

await browser.close();
