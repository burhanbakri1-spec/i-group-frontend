// Deep probe: focus on the logo element and surrounding header
import { chromium } from '../node_modules/playwright/index.mjs';

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });

for (const url of ['http://localhost:3000/icare', 'http://localhost:3000/icare/shop']) {
  const page = await context.newPage();
  const logoResponses = [];
  page.on('response', (resp) => {
    if (/icare-logo/i.test(resp.url())) {
      logoResponses.push({ url: resp.url(), status: resp.status(), contentType: resp.headers()['content-type'] });
    }
  });
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);

  const data = await page.evaluate(() => {
    const headerImgs = Array.from(document.querySelectorAll('header img'));
    const imgs = headerImgs.map((im) => {
      const r = im.getBoundingClientRect();
      const cs = getComputedStyle(im);
      return {
        src: im.currentSrc || im.src,
        complete: im.complete,
        naturalWidth: im.naturalWidth,
        naturalHeight: im.naturalHeight,
        rect: { top: r.top, left: r.left, width: r.width, height: r.height },
        opacity: cs.opacity,
        filter: cs.filter,
        visibility: cs.visibility,
        display: cs.display,
        transform: cs.transform.slice(0, 50),
        parentTransform: im.parentElement ? getComputedStyle(im.parentElement).transform.slice(0, 50) : null,
        parentOpacity: im.parentElement ? getComputedStyle(im.parentElement).opacity : null,
        grandparentTransform: im.parentElement?.parentElement ? getComputedStyle(im.parentElement.parentElement).transform.slice(0, 50) : null,
      };
    });
    return imgs;
  });
  console.log(`\n[${url}] logo responses: ${logoResponses.length}`);
  for (const r of logoResponses) console.log(`  ${r.status} ${r.url} (${r.contentType})`);
  console.log('Header <img> elements:');
  for (const d of data) console.log(JSON.stringify(d, null, 2));
  await page.close();
}

await browser.close();
