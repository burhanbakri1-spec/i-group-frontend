import { createApiClient, getData, hasFailures, makeResult, normalizeBaseUrl, summarizeResults, writeJson, writeMarkdown } from './api-client.mjs';
import { passIfOkEnvelope } from './assert-envelope.mjs';
import { discoverCatalog } from './discover-catalog.mjs';
import { establishSession } from './test-auth-safe.mjs';

const getFirstCartItemId = (payload) => {
  const cart = getData(payload);
  return cart?.items?.[0]?.id ?? null;
};

export const testCartSafe = async ({ baseUrl = normalizeBaseUrl() } = {}) => {
  const client = createApiClient({ baseUrl });
  const results = [];
  const session = await establishSession({ baseUrl, client, results });
  if (!session?.accessToken) {
    results.push(makeResult('Cart safe flow', 'SKIP', { message: 'No authenticated session; cart endpoints require JWT.' }));
    const report = { baseUrl, generatedAt: new Date().toISOString(), results };
    await writeJson('cart-safe-report.json', report);
    await writeMarkdown('cart-safe-report.md', summarizeResults('Cart Safe Live Test Report', results));
    return report;
  }

  const discovered = await discoverCatalog({ baseUrl });
  const candidate = discovered.cartCandidate;
  results.push(passIfOkEnvelope('Get cart', await client.get('/api/v1/cart', { token: session.accessToken })));
  if (!candidate?.productId) {
    results.push(makeResult('Add/update/remove cart item', 'SKIP', { message: 'No product candidate discovered.' }));
  } else {
    const addResponse = await client.post('/api/v1/cart', {
      token: session.accessToken,
      body: { productId: candidate.productId, variantId: candidate.variantId, quantity: 1 },
    });
    results.push(passIfOkEnvelope('Add cart item', addResponse));
    const cartItemId = getFirstCartItemId(addResponse.payload);
    if (cartItemId) {
      results.push(passIfOkEnvelope('Update cart item quantity', await client.put(`/api/v1/cart/${cartItemId}`, { token: session.accessToken, body: { quantity: 1 } })));
      results.push(passIfOkEnvelope('Sync cart prices', await client.post('/api/v1/cart/sync-prices', { token: session.accessToken })));
      results.push(passIfOkEnvelope('Remove cart item', await client.delete(`/api/v1/cart/${cartItemId}`, { token: session.accessToken })));
    } else {
      results.push(makeResult('Update/sync/remove cart item', 'SKIP', { message: 'Add response did not expose a cart item id.' }));
    }
  }

  const report = { baseUrl, generatedAt: new Date().toISOString(), discovered, results };
  await writeJson('cart-safe-report.json', report);
  await writeMarkdown('cart-safe-report.md', summarizeResults('Cart Safe Live Test Report', results));
  return report;
};

if (import.meta.url === `file://${process.argv[1]}`) {
  const report = await testCartSafe();
  console.log(JSON.stringify(report.results, null, 2));
  if (hasFailures(report.results)) process.exitCode = 1;
}
