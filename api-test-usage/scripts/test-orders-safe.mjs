import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createApiClient, envFlag, getListItems, hasFailures, makeResult, normalizeBaseUrl, readJson, summarizeResults, writeJson, writeMarkdown } from './api-client.mjs';
import { passIfOkEnvelope } from './assert-envelope.mjs';
import { establishSession } from './test-auth-safe.mjs';

const addressPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'fixtures', 'checkout-address.example.json');

export const testOrdersSafe = async ({ baseUrl = normalizeBaseUrl() } = {}) => {
  const client = createApiClient({ baseUrl });
  const results = [];
  const session = await establishSession({ baseUrl, client, results });
  if (!session?.accessToken) {
    results.push(makeResult('Orders safe flow', 'SKIP', { message: 'No authenticated session; order account endpoints require JWT.' }));
    const report = { baseUrl, generatedAt: new Date().toISOString(), results };
    await writeJson('orders-safe-report.json', report);
    await writeMarkdown('orders-safe-report.md', summarizeResults('Orders Safe Live Test Report', results));
    return report;
  }

  results.push(passIfOkEnvelope('Order summary', await client.get('/api/v1/orders/summary', { token: session.accessToken })));
  const listResponse = await client.get('/api/v1/orders', { token: session.accessToken, query: { page: 1, limit: 10 } });
  results.push(passIfOkEnvelope('Orders list', listResponse));
  const firstOrderNumber = getListItems(listResponse.payload).find((order) => order?.orderNumber)?.orderNumber ?? null;
  if (firstOrderNumber) {
    results.push(passIfOkEnvelope('Order detail', await client.get(`/api/v1/orders/${firstOrderNumber}`, { token: session.accessToken })));
  } else {
    results.push(makeResult('Order detail', 'SKIP', { message: 'No existing order discovered for this user.' }));
  }

  if (!envFlag('API_TEST_ALLOW_ORDER_CREATE')) {
    results.push(makeResult('Order creation', 'SKIP', { route: '/api/v1/orders', message: 'Skipped because API_TEST_ALLOW_ORDER_CREATE is not true.' }));
  } else {
    const address = await readJson(addressPath, {});
    const createResponse = await client.post('/api/v1/orders', { token: session.accessToken, body: address });
    results.push(passIfOkEnvelope('Order creation', createResponse));
    const createdOrderNumber = createResponse.payload?.data?.orderNumber;
    if (createdOrderNumber && envFlag('API_TEST_ALLOW_ORDER_CANCEL')) {
      results.push(passIfOkEnvelope('Order cancel', await client.post(`/api/v1/orders/${createdOrderNumber}/cancel`, { token: session.accessToken })));
    } else {
      results.push(makeResult('Order cancel', 'SKIP', { message: 'Skipped unless an order is created and API_TEST_ALLOW_ORDER_CANCEL=true.' }));
    }
  }

  const report = { baseUrl, generatedAt: new Date().toISOString(), results };
  await writeJson('orders-safe-report.json', report);
  await writeMarkdown('orders-safe-report.md', summarizeResults('Orders Safe Live Test Report', results));
  return report;
};

if (import.meta.url === `file://${process.argv[1]}`) {
  const report = await testOrdersSafe();
  console.log(JSON.stringify(report.results, null, 2));
  if (hasFailures(report.results)) process.exitCode = 1;
}
