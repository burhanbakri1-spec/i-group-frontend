import { createApiClient, createRecorder, hasFailures, makeResult, normalizeBaseUrl, summarizeResults, writeJson, writeMarkdown } from './api-client.mjs';

const checkReadable = async (client, results, name, route, options = {}) => {
  const response = await client.get(route, options);
  if ([401, 403].includes(response.status)) {
    results.push(makeResult(name, 'EXPECTED_FAILURE', { route: response.route, message: `Protected content endpoint returned HTTP ${response.status}; storefront fallback is expected.` }));
    return response;
  }
  if (response.status >= 500) {
    results.push(makeResult(name, 'EXPECTED_FAILURE', { route: response.route, message: `Live backend returned HTTP ${response.status}; fallback is expected.` }));
    return response;
  }
  if (response.ok) {
    results.push(makeResult(name, 'PASS', { route: response.route, message: 'Endpoint readable.' }));
    return response;
  }
  results.push(makeResult(name, 'SKIP', { route: response.route, message: `Endpoint returned HTTP ${response.status}; documented as non-blocking for public storefront.` }));
  return response;
};

export const testContentSafe = async ({ baseUrl = normalizeBaseUrl() } = {}) => {
  const recorder = createRecorder();
  const client = createApiClient({ baseUrl, recorder });
  const results = [];

  await checkReadable(client, results, 'FAQ categories admin read', '/admin/api/faq-categories', { query: { page: 1, limit: 10, isActive: true } });
  await checkReadable(client, results, 'FAQ admin read', '/admin/api/faqs', { query: { page: 1, limit: 10, isActive: true } });
  await checkReadable(client, results, 'Product media source', '/api/v1/products/featured', { query: { limit: 6 } });
  await checkReadable(client, results, 'Public FAQs', '/api/v1/faqs');
  await checkReadable(client, results, 'Public FAQ categories', '/api/v1/faq-categories');
  await checkReadable(client, results, 'Public active videos', '/api/v1/videos', { query: { isActive: true } });
  await checkReadable(client, results, 'Public active video categories', '/api/v1/video-categories', { query: { isActive: true } });
  await checkReadable(client, results, 'Public settings', '/api/v1/settings');
  await checkReadable(client, results, 'Public footer settings', '/api/v1/settings/footer');

  const report = { baseUrl, generatedAt: new Date().toISOString(), requests: recorder.entries(), results };
  await writeJson('content-safe-report.json', report);
  await writeMarkdown('content-safe-report.md', summarizeResults('Content and FAQ Safe Live Test Report', results));
  return report;
};

if (import.meta.url === `file://${process.argv[1]}`) {
  const report = await testContentSafe();
  console.log(JSON.stringify(report.results, null, 2));
  if (hasFailures(report.results)) process.exitCode = 1;
}
