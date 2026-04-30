import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { hasFailures, makeResult, summarizeResults, writeJson, writeMarkdown } from './api-client.mjs';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const apiClientPath = path.join(projectRoot, 'app', 'icare', 'lib', 'api-client.ts');
const appDir = path.join(projectRoot, 'app', 'icare');
const approvedBackendUrl = 'https://backend.igroup.website';

const listSourceFiles = async (dir) => {
  const entries = await readdir(dir, { withFileTypes: true });
  const nested = await Promise.all(entries.map(async (entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) return listSourceFiles(fullPath);
    if (/\.(ts|tsx|js|jsx)$/.test(entry.name)) return [fullPath];
    return [];
  }));
  return nested.flat();
};

export const verifyAppConfig = async () => {
  const results = [];
  const apiClient = await readFile(apiClientPath, 'utf8');
  const files = await listSourceFiles(appDir);
  const sourcePairs = await Promise.all(files.map(async (filePath) => [filePath, await readFile(filePath, 'utf8')]));
  const allSource = sourcePairs.map(([, source]) => source).join('\n');

  results.push(apiClient.includes('NEXT_PUBLIC_ICARE_API_URL')
    ? makeResult('Env override remains supported', 'PASS', { message: 'NEXT_PUBLIC_ICARE_API_URL is used by API client.' })
    : makeResult('Env override remains supported', 'FAIL', { message: 'NEXT_PUBLIC_ICARE_API_URL was not found.' }));

  results.push(apiClient.includes(approvedBackendUrl)
    ? makeResult('Approved backend fallback configured', 'PASS', { message: approvedBackendUrl })
    : makeResult('Approved backend fallback configured', 'FAIL', { message: `${approvedBackendUrl} was not found in API client.` }));

  results.push(apiClient.includes('/api/v1/products') && apiClient.includes('/api/v1/auth/login') && apiClient.includes('/api/v1/cart') && apiClient.includes('/api/v1/orders')
    ? makeResult('Core endpoint families present', 'PASS', { message: 'Products/auth/cart/orders are represented in frontend client.' })
    : makeResult('Core endpoint families present', 'FAIL', { message: 'One or more core endpoint families are absent.' }));

  const suspiciousSecrets = sourcePairs.filter(([filePath, source]) => {
    if (filePath.endsWith('api-client.ts')) return false;
    return /(password\s*[:=]\s*['"][^'"]{8,}|secret\s*[:=]\s*['"][^'"]+|token\s*[:=]\s*['"][A-Za-z0-9._-]{20,})/i.test(source);
  });
  results.push(suspiciousSecrets.length === 0
    ? makeResult('No obvious hardcoded frontend secrets', 'PASS')
    : makeResult('No obvious hardcoded frontend secrets', 'FAIL', { message: suspiciousSecrets.map(([filePath]) => path.relative(projectRoot, filePath)).join(', ') }));

  results.push(allSource.includes('icareApi')
    ? makeResult('Frontend API client is referenced', 'PASS', { message: 'icareApi usage found in app source.' })
    : makeResult('Frontend API client is referenced', 'FAIL', { message: 'No icareApi usage found in app source.' }));

  const report = { generatedAt: new Date().toISOString(), projectRoot, results };
  await writeJson('app-verification-report.json', report);
  await writeMarkdown('app-verification-report.md', summarizeResults('Frontend App API Configuration Verification', results));
  return report;
};

if (import.meta.url === `file://${process.argv[1]}`) {
  const report = await verifyAppConfig();
  console.log(JSON.stringify(report.results, null, 2));
  if (hasFailures(report.results)) process.exitCode = 1;
}
