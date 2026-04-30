import { hasFailures, summarizeResults, writeJson, writeMarkdown } from './api-client.mjs';
import { testPublicCatalog } from './test-public-catalog.mjs';
import { testAuthSafe } from './test-auth-safe.mjs';
import { testCartSafe } from './test-cart-safe.mjs';
import { testOrdersSafe } from './test-orders-safe.mjs';
import { verifyAppConfig } from './verify-app-config.mjs';
import { testContentSafe } from './test-content-safe.mjs';

const flatten = (reports) => reports.flatMap((report) => report.results.map((result) => ({ ...result, suite: report.suite })));

const runSuite = async (suite, run) => {
  try {
    const report = await run();
    return { suite, ...report };
  } catch (error) {
    return { suite, generatedAt: new Date().toISOString(), results: [{ name: suite, status: 'FAIL', message: error.stack ?? error.message }] };
  }
};

const reports = [];
reports.push(await runSuite('public-catalog', () => testPublicCatalog()));
reports.push(await runSuite('auth-safe', () => testAuthSafe()));
reports.push(await runSuite('cart-safe', () => testCartSafe()));
reports.push(await runSuite('orders-safe', () => testOrdersSafe()));
reports.push(await runSuite('content-safe', () => testContentSafe()));
reports.push(await runSuite('app-config', () => verifyAppConfig()));

const results = flatten(reports);
const aggregate = { generatedAt: new Date().toISOString(), reports, results };
await writeJson('run-all-safe-report.json', aggregate);
await writeMarkdown('run-all-safe-report.md', summarizeResults('Run All Safe API Verification', results));

console.log(JSON.stringify(results.map(({ suite, name, status, message }) => ({ suite, name, status, message })), null, 2));
if (hasFailures(results)) process.exitCode = 1;
