// Probe BE for the real content endpoint via Node fetch.
const BE = 'https://backend.igroup.website';

const candidates = [
  '/api/v1/content?keys=marketing.site.name',
  '/api/v1/content?keys=marketing.site.name&lang=en',
  '/api/v1/contents?keys=marketing.site.name',
  '/api/v1/cms/content?keys=marketing.site.name',
  '/api/v1/cms-keys?keys=marketing.site.name',
  '/api/v1/site-content?keys=marketing.site.name',
  '/api/v1/settings?group=content',
  '/api/v1/settings/content/keys',
  '/api/v1/content-keys?keys=marketing.site.name',
  '/api/v1/content/registry?keys=marketing.site.name',
  '/api/v1/registry/keys?keys=marketing.site.name',
];

for (const path of candidates) {
  try {
    const r = await fetch(BE + path, { headers: { Accept: 'application/json' } });
    const text = await r.text();
    const body = text.length > 200 ? text.slice(0, 200) + '…' : text;
    console.log(`${r.status}  ${path}\n     ${body}\n`);
  } catch (e) {
    console.log(`ERR  ${path}  ${e.message}`);
  }
}
