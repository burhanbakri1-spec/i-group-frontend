// Extended probe: header geometry, logo state, hydration warnings
// across /icare and /icare/shop with multiple reloads.

import { chromium } from '../node_modules/playwright/index.mjs';

const TARGETS = [
  { url: 'http://localhost:3000/icare', label: 'icare-home' },
  { url: 'http://localhost:3000/icare/shop', label: 'icare-shop' },
];
const ROUNDS = 3;

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 1280, height: 900 },
  storageState: undefined, // fresh each run
});

for (const target of TARGETS) {
  for (let round = 1; round <= ROUNDS; round++) {
    const page = await context.newPage();
    const consoleMsgs = [];
    page.on('console', (m) => consoleMsgs.push({ type: m.type(), text: m.text() }));
    page.on('pageerror', (e) => consoleMsgs.push({ type: 'pageerror', text: String(e) }));

    await page.goto(target.url, { waitUntil: 'networkidle', timeout: 30000 }).catch(() => {});
    await page.waitForTimeout(1200);

    // Scroll a bit to trigger header hide/show
    await page.evaluate(() => window.scrollTo(0, 200));
    await page.waitForTimeout(400);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(400);

    const headerInfo = await page.evaluate(() => {
      const header = document.querySelector('header');
      if (!header) return null;
      const r = header.getBoundingClientRect();
      const cs = getComputedStyle(header);
      const logo = header.querySelector('img[src*="icare-logo"], img[alt*="brand" i], img[alt*="logo" i]') || header.querySelector('img');
      const lr = logo ? logo.getBoundingClientRect() : null;
      const parent = header.parentElement; // motion.div
      const pr = parent ? parent.getBoundingClientRect() : null;
      const ps = parent ? getComputedStyle(parent) : null;
      return {
        headerTop: r.top,
        headerVisible: r.width > 0 && r.height > 0,
        headerOpacity: cs.opacity,
        headerTransform: cs.transform,
        headerPosition: cs.position,
        headerDisplay: cs.display,
        shellTop: pr?.top,
        shellTransform: ps?.transform,
        shellOpacity: ps?.opacity,
        shellPointerEvents: ps?.pointerEvents,
        logoSrc: logo?.getAttribute('src'),
        logoComplete: logo?.complete,
        logoNatW: logo?.naturalWidth,
        logoNatH: logo?.naturalHeight,
        logoRect: lr ? { top: lr.top, width: lr.width, height: lr.height, opacity: getComputedStyle(logo).opacity } : null,
      };
    });

    const hydrationErrs = consoleMsgs.filter((m) =>
      /hydrat/i.test(m.text) || /didn.t match/i.test(m.text) || /Hydration/i.test(m.text));
    const otherErrs = consoleMsgs.filter((m) => m.type === 'error' || m.type === 'pageerror');

    console.log(`\n[${target.label} r${round}] header=`,
      JSON.stringify({
        headerTop: headerInfo?.headerTop,
        shellTop: headerInfo?.shellTop,
        shellTransform: headerInfo?.shellTransform,
        shellOpacity: headerInfo?.shellOpacity,
        logoNatW: headerInfo?.logoNatW,
        logoComplete: headerInfo?.logoComplete,
        logoRect: headerInfo?.logoRect,
      }));
    console.log(`  hydration errors: ${hydrationErrs.length}, other errors: ${otherErrs.length}`);
    for (const m of hydrationErrs) console.log(`  [${m.type}] ${m.text.slice(0, 200)}`);
    for (const m of otherErrs.slice(0, 4)) console.log(`  [${m.type}] ${m.text.slice(0, 200)}`);

    await page.close();
  }
}

await browser.close();
