// Capture the 404 URLs to identify which images are failing.
import { chromium } from '../node_modules/playwright/index.mjs';

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });

for (const url of ['http://localhost:3000/icare', 'http://localhost:3000/icare/shop']) {
  const page = await context.newPage();
  const failures = [];
  page.on('response', (resp) => {
    if (resp.status() >= 400) failures.push({ status: resp.status(), url: resp.url() });
  });
  page.on('requestfailed', (req) => failures.push({ status: 'FAIL', url: req.url(), err: req.failure()?.errorText }));
  await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 }).catch(() => {});
  await page.waitForTimeout(1500);
  console.log(`\n=== ${url} ===  failures: ${failures.length}`);
  for (const f of failures.slice(0, 30)) {
    console.log(`  ${f.status} ${f.url.slice(0, 200)}`);
  }
  await page.close();
}

await browser.close();
