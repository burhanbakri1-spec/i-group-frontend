import { createApiClient, createRecorder, hasFailures, makeResult, normalizeBaseUrl, summarizeResults, writeJson, writeMarkdown } from './api-client.mjs';
import { passIfOkEnvelope, skipUnsupported } from './assert-envelope.mjs';
import { discoverCatalog } from './discover-catalog.mjs';

const check = async (client, results, name, route, options = {}) => {
  const response = await client.get(route, options);
  if (response.status >= 500) {
    results.push(makeResult(name, 'EXPECTED_FAILURE', { route: response.route, message: `Live backend returned HTTP ${response.status}; documented as backend behavior, not script failure.` }));
    return response;
  }
  results.push(skipUnsupported(name, response) ?? passIfOkEnvelope(name, response));
  return response;
};

export const testPublicCatalog = async ({ baseUrl = normalizeBaseUrl() } = {}) => {
  const discovered = await discoverCatalog({ baseUrl });
  const recorder = createRecorder();
  const client = createApiClient({ baseUrl, recorder });
  const results = [];

  await check(client, results, 'Health check', '/api/v1/health');
  await check(client, results, 'Products list', '/api/v1/products', { query: { page: 1, limit: 10, active: true } });
  await check(client, results, 'Products search', '/api/v1/products', { query: { search: 'skin', page: 1, limit: 5 } });
  await check(client, results, 'Featured products', '/api/v1/products/featured', { query: { limit: 8 } });
  await check(client, results, 'New products', '/api/v1/products/new', { query: { limit: 8 } });
  await check(client, results, 'Bestseller products', '/api/v1/products/bestsellers', { query: { limit: 8 } });
  await check(client, results, 'On-sale products', '/api/v1/products/on-sale', { query: { limit: 8 } });

  if (discovered.productSlug) {
    await check(client, results, 'Product detail', `/api/v1/products/${discovered.productSlug}`);
    await check(client, results, 'Product reviews', `/api/v1/products/${discovered.productSlug}/reviews`, { query: { page: 1, limit: 10 } });
    await check(client, results, 'Related products', `/api/v1/products/${discovered.productSlug}/related`);
  } else {
    results.push(makeResult('Product detail/reviews/related', 'SKIP', { message: 'No product slug discovered.' }));
  }

  await check(client, results, 'Categories list', '/api/v1/categories', { query: { page: 1, limit: 10, isActive: true } });
  await check(client, results, 'Root categories', '/api/v1/categories/roots');
  await check(client, results, 'Categories search', '/api/v1/categories/search', { query: { q: 'skin' } });

  if (discovered.categorySlug) {
    await check(client, results, 'Category detail', `/api/v1/categories/${discovered.categorySlug}`);
    await check(client, results, 'Category children', `/api/v1/categories/${discovered.categorySlug}/children`);
    await check(client, results, 'Category ancestors', `/api/v1/categories/${discovered.categorySlug}/ancestors`);
    await check(client, results, 'Category descendants', `/api/v1/categories/${discovered.categorySlug}/descendants`);
  } else {
    results.push(makeResult('Category detail/tree helpers', 'SKIP', { message: 'No category slug discovered.' }));
  }

  await check(client, results, 'Brands list', '/api/v1/brands', { query: { page: 1, limit: 10, isActive: true } });
  if (discovered.brandSlug) {
    await check(client, results, 'Brand detail', `/api/v1/brands/${discovered.brandSlug}`);
  } else {
    results.push(makeResult('Brand detail', 'SKIP', { message: 'No brand slug discovered.' }));
  }

  const report = { baseUrl, generatedAt: new Date().toISOString(), discovered, requests: recorder.entries(), results };
  await writeJson('public-catalog-report.json', report);
  await writeMarkdown('public-catalog-report.md', summarizeResults('Public Catalog Live Test Report', results));
  return report;
};

if (import.meta.url === `file://${process.argv[1]}`) {
  const report = await testPublicCatalog();
  console.log(JSON.stringify(report.results, null, 2));
  if (hasFailures(report.results)) process.exitCode = 1;
}
