import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createApiClient, envFlag, hasFailures, makeResult, normalizeBaseUrl, readJson, summarizeResults, writeJson, writeMarkdown } from './api-client.mjs';
import { expectedFailure, passIfOkEnvelope } from './assert-envelope.mjs';

const fixturePath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'fixtures', 'safe-user.example.json');

export const getExampleCredentials = async () => {
  const fixture = await readJson(fixturePath, {});
  return {
    name: fixture.name ?? 'iCare Disposable Test User',
    email: process.env.ICARE_TEST_EMAIL ?? fixture.email ?? 'icare.test.user@example.com',
    password: process.env.ICARE_TEST_PASSWORD ?? fixture.password ?? 'ExamplePass123!',
    phone: fixture.phone ?? '+201000000001',
  };
};

const extractSession = (payload) => payload?.data ?? null;

export const establishSession = async ({ baseUrl = normalizeBaseUrl(), client = createApiClient({ baseUrl }), results = [] } = {}) => {
  const credentials = await getExampleCredentials();
  const loginResponse = await client.post('/api/v1/auth/login', { body: { email: credentials.email, password: credentials.password } });
  if (loginResponse.ok && loginResponse.payload?.success === true) {
    results.push(makeResult('Example credential login', 'PASS', { route: loginResponse.route, message: 'Authenticated with provided/example credentials.' }));
    return extractSession(loginResponse.payload);
  }

  results.push(makeResult('Example credential login', 'EXPECTED_FAILURE', { route: loginResponse.route, message: `Example credentials are not seeded (HTTP ${loginResponse.status}).` }));

  if (!envFlag('API_TEST_ALLOW_REGISTER')) {
    results.push(makeResult('Disposable register', 'SKIP', { route: '/api/v1/auth/register', message: 'Skipped because API_TEST_ALLOW_REGISTER is not true.' }));
    return null;
  }

  const uniqueEmail = `icare.safe.${Date.now()}@example.com`;
  const registerResponse = await client.post('/api/v1/auth/register', {
    body: { name: credentials.name, email: uniqueEmail, password: credentials.password, phone: credentials.phone },
  });
  results.push(passIfOkEnvelope('Disposable register', registerResponse));
  return registerResponse.ok ? extractSession(registerResponse.payload) : null;
};

export const testAuthSafe = async ({ baseUrl = normalizeBaseUrl() } = {}) => {
  const client = createApiClient({ baseUrl });
  const results = [];

  const invalidLogin = await client.post('/api/v1/auth/login', { body: { email: 'not-a-real-user@example.com', password: 'WrongPassword123!' } });
  results.push(expectedFailure('Invalid login rejects safely', invalidLogin, [400, 401, 404]));

  const session = await establishSession({ baseUrl, client, results });
  if (session?.accessToken) {
    results.push(passIfOkEnvelope('Get current user', await client.get('/api/v1/auth/me', { token: session.accessToken })));
    if (session.refreshToken) {
      results.push(passIfOkEnvelope('Refresh token', await client.post('/api/v1/auth/refresh', { token: session.refreshToken })));
    } else {
      results.push(makeResult('Refresh token', 'SKIP', { route: '/api/v1/auth/refresh', message: 'No refreshToken in session payload.' }));
    }
    results.push(passIfOkEnvelope('Logout', await client.post('/api/v1/auth/logout', { token: session.accessToken })));
  } else {
    results.push(makeResult('me/profile refresh logout', 'SKIP', { message: 'No authenticated session established.' }));
  }

  const report = { baseUrl, generatedAt: new Date().toISOString(), authenticated: Boolean(session?.accessToken), results };
  await writeJson('auth-safe-report.json', report);
  await writeMarkdown('auth-safe-report.md', summarizeResults('Auth Safe Live Test Report', results));
  return { ...report, session };
};

if (import.meta.url === `file://${process.argv[1]}`) {
  const report = await testAuthSafe();
  console.log(JSON.stringify(report.results, null, 2));
  if (hasFailures(report.results)) process.exitCode = 1;
}
