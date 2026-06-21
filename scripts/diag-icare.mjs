// Headless Playwright probe — runs against already-running dev server.
// Uses the local playwright module from the i-group project.

import { chromium } from '../node_modules/playwright/index.mjs';

const ROUNDS = 3; // run each page N times to expose flakiness
const TARGETS = [
  { url: 'http://localhost:3000/', label: 'home' },
  { url: 'http://localhost:3000/shop', label: 'shop' },
];

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });

const summary = [];

for (const target of TARGETS) {
  for (let round = 1; round <= ROUNDS; round++) {
    console.log(`\n========== ${target.label} :: ${target.url} (round ${round}) ==========`);
    const page = await context.newPage();

    const consoleMsgs = [];
    page.on('console', (m) => consoleMsgs.push({ type: m.type(), text: m.text() }));
    page.on('pageerror', (e) => consoleMsgs.push({ type: 'pageerror', text: String(e) }));

    const imageReqs = [];
    page.on('response', async (resp) => {
      const url = resp.url();
      if (/\.(png|jpe?g|webp|gif|svg|avif)(\?|$)/i.test(url) || (resp.headers()['content-type'] || '').startsWith('image/')) {
        imageReqs.push({ url, status: resp.status(), from: resp.request().resourceType() });
      }
    });
    page.on('requestfailed', (req) => {
      if (/\.(png|jpe?g|webp|gif|svg|avif)(\?|$)/i.test(req.url())) {
        imageReqs.push({ url: req.url(), status: 'FAILED', failure: req.failure()?.errorText });
      }
    });

    try {
      await page.goto(target.url, { waitUntil: 'networkidle', timeout: 30000 });
    } catch (e) {
      console.log('goto error:', e.message);
    }
    await page.waitForTimeout(1500);

    // ---- header geometry
    const headerGeom = await page.evaluate(() => {
      const candidates = ['header', '[data-testid="header"]', 'nav', '.header'];
      for (const sel of candidates) {
        const el = document.querySelector(sel);
        if (el) {
          const r = el.getBoundingClientRect();
          const cs = getComputedStyle(el);
          return {
            selector: sel,
            top: r.top, left: r.left, width: r.width, height: r.height,
            position: cs.position, zIndex: cs.zIndex, transform: cs.transform,
            visible: r.width > 0 && r.height > 0,
            html: el.outerHTML.slice(0, 220),
          };
        }
      }
      return null;
    });
    console.log('Header geom:', JSON.stringify(headerGeom, null, 2));

    // ---- logo detection
    const logos = await page.evaluate(() => {
      const out = [];
      const imgs = document.querySelectorAll('header img, nav img, [class*="logo" i] img, img[class*="logo" i]');
      for (const im of imgs) {
        out.push({
          src: im.currentSrc || im.src,
          alt: im.alt,
          complete: im.complete,
          naturalWidth: im.naturalWidth,
          naturalHeight: im.naturalHeight,
          classes: im.className,
        });
      }
      // also SVGs that may be the logo
      const svgs = document.querySelectorAll('header svg, nav svg, [class*="logo" i] svg');
      for (const s of svgs) {
        const r = s.getBoundingClientRect();
        out.push({
          svg: true,
          width: r.width,
          height: r.height,
          visible: r.width > 0 && r.height > 0,
          parent: s.parentElement?.className || '',
        });
      }
      return out;
    });
    console.log('Logo candidates:', JSON.stringify(logos, null, 2));

    // ---- image DOM state
    const dom = await page.$$eval('img', (els) =>
      els.slice(0, 25).map((el) => ({
        src: (el.currentSrc || el.src || '').slice(0, 180),
        alt: el.alt,
        complete: el.complete,
        naturalWidth: el.naturalWidth,
        loading: el.loading,
      })),
    );
    const broken = dom.filter((d) => d.complete && d.naturalWidth === 0);
    console.log(`Images in DOM: ${dom.length}, broken (complete but 0x0): ${broken.length}`);
    for (const d of broken) console.log('  BROKEN:', d.src);

    // ---- network results
    const failedImgs = imageReqs.filter((r) => r.status === 'FAILED' || r.status >= 400);
    console.log(`Image network responses: ${imageReqs.length}, failed: ${failedImgs.length}`);
    for (const r of failedImgs.slice(0, 10)) console.log(`  ${r.status} ${r.url}`);

    // ---- console error/warn summary
    const errs = consoleMsgs.filter((m) => m.type === 'error' || m.type === 'pageerror' || m.type === 'warning');
    console.log(`Console errors+warnings: ${errs.length}`);
    for (const m of errs.slice(0, 12)) console.log(`  [${m.type}] ${m.text.slice(0, 240)}`);

    summary.push({
      target: target.label, round,
      headerTop: headerGeom?.top, headerPos: headerGeom?.position,
      logos: logos.length, brokenImages: broken.length, failedImgs: failedImgs.length, errs: errs.length,
    });

    await page.close();
  }
}

console.log('\n=========== SUMMARY ===========');
console.table(summary);
await browser.close();
