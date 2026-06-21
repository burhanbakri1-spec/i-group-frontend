// Take screenshots + measure key elements
import { chromium } from '../node_modules/playwright/index.mjs';
import fs from 'node:fs';

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const out = './scripts/screens';
fs.mkdirSync(out, { recursive: true });

for (const url of ['http://localhost:3000/icare', 'http://localhost:3000/icare/shop']) {
  for (let i = 0; i < 2; i++) {
    const page = await context.newPage();
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);
    const file = `${out}/${url.split('/').pop() || 'home'}-${i + 1}.png`;
    await page.screenshot({ path: file, fullPage: false });

    const geom = await page.evaluate(() => {
      const ann = document.querySelector('[data-icare-announcement]');
      const shell = document.querySelector('.icare-header-shell');
      const header = document.querySelector('header');
      const main = document.querySelector('main');
      const hero = document.querySelector('.icare-page-hero');
      const r = (el) => el ? (() => { const b = el.getBoundingClientRect(); const s = getComputedStyle(el); return { top: b.top, height: b.height, position: s.position, transform: s.transform.slice(0, 50) }; })() : null;
      return {
        ann: r(ann),
        shell: r(shell),
        header: r(header),
        main: r(main),
        hero: r(hero),
        cssVar: getComputedStyle(document.documentElement).getPropertyValue('--icare-header-top'),
      };
    });
    console.log(`\n[${url} #${i + 1}]`);
    console.log(JSON.stringify(geom, null, 2));
    await page.close();
  }
}

await browser.close();
