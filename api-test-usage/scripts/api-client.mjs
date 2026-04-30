import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const DEFAULT_BASE_URL = 'https://backend.igroup.website/';
export const OUTPUT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'outputs');

export class ApiTestError extends Error {
  constructor(message, status, payload) {
    super(message);
    this.name = 'ApiTestError';
    this.status = status;
    this.payload = payload;
  }
}

export const normalizeBaseUrl = (value = process.env.ICARE_API_BASE_URL ?? DEFAULT_BASE_URL) => {
  return value.replace(/\/$/, '');
};

export const readJson = async (filePath, fallback = null) => {
  try {
    return JSON.parse(await readFile(filePath, 'utf8'));
  } catch {
    return fallback;
  }
};

export const writeJson = async (fileName, value) => {
  await mkdir(OUTPUT_DIR, { recursive: true });
  const outputPath = path.join(OUTPUT_DIR, fileName);
  await writeFile(outputPath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
  return outputPath;
};

export const writeMarkdown = async (fileName, markdown) => {
  await mkdir(OUTPUT_DIR, { recursive: true });
  const outputPath = path.join(OUTPUT_DIR, fileName);
  await writeFile(outputPath, markdown, 'utf8');
  return outputPath;
};

const parseBody = async (response) => {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
};

export const createApiClient = ({ baseUrl = normalizeBaseUrl(), recorder = null } = {}) => {
  const request = async (method, route, { token, query, body } = {}) => {
    const url = new URL(`${baseUrl}${route}`);
    Object.entries(query ?? {}).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') url.searchParams.set(key, String(value));
    });

    const startedAt = Date.now();
    const response = await fetch(url, {
      method,
      headers: {
        Accept: 'application/json',
        ...(body ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    const payload = await parseBody(response);
    const result = { method, route, url: url.toString(), status: response.status, ok: response.ok, durationMs: Date.now() - startedAt, payload };
    recorder?.record(result);
    return result;
  };

  return {
    baseUrl,
    get: (route, options) => request('GET', route, options),
    post: (route, options) => request('POST', route, options),
    put: (route, options) => request('PUT', route, options),
    delete: (route, options) => request('DELETE', route, options),
  };
};

export const createRecorder = () => {
  const requests = [];
  return {
    record: (entry) => requests.push(entry),
    entries: () => [...requests],
  };
};

export const makeResult = (name, status, details = {}) => ({ name, status, ...details });

export const statusEmoji = (status) => ({ PASS: '✅', FAIL: '❌', SKIP: '⏭️', EXPECTED_FAILURE: '🟨' }[status] ?? '•');

export const summarizeResults = (title, results) => {
  const counts = results.reduce((summary, item) => ({ ...summary, [item.status]: (summary[item.status] ?? 0) + 1 }), {});
  const rows = results.map((item) => `| ${statusEmoji(item.status)} ${item.status} | ${item.name} | ${item.message ?? ''} | ${item.route ?? ''} |`).join('\n');
  return `# ${title}\n\n## Summary\n\n${Object.entries(counts).map(([key, value]) => `- ${key}: ${value}`).join('\n')}\n\n## Results\n\n| Status | Check | Message | Route |\n|---|---|---|---|\n${rows}\n`;
};

export const getData = (payload) => payload?.data ?? payload;

export const getListItems = (payload) => {
  const data = getData(payload);
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  return [];
};

export const hasFailures = (results) => results.some((item) => item.status === 'FAIL');

export const envFlag = (name) => ['1', 'true', 'yes'].includes(String(process.env[name] ?? '').toLowerCase());
