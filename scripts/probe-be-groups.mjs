// Check what other settings groups exist + which have any of the FE's needed keys
import fs from 'node:fs';
const BE = 'https://backend.igroup.website';

const groups = [
  'content', 'marketing', 'home', 'hero', 'about', 'shop', 'product',
  'cart', 'checkout', 'auth', 'search', 'vlog', 'faq', 'contact',
  'store-locator', 'wishlist', 'review', 'social', 'footer', 'shipping',
  'general', 'pages', 'i18n', 'translations',
];

const flatten = (obj, prefix = '') => {
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) Object.assign(out, flatten(v, key));
    else out[key] = v;
  }
  return out;
};

// Load FE expected keys
const src = fs.readFileSync('./app/icare/lib/fallback-content.ts', 'utf8');
const want = new Set(
  [...src.matchAll(/^\s*['"]([a-z][a-z0-9_]*\.[a-z0-9_.]+)['"]:/gim)].map((m) => m[1])
);
console.log(`FE wants ${want.size} keys\n`);

const hits = {};
for (const g of groups) {
  try {
    const r = await fetch(`${BE}/api/v1/settings?group=${g}`, {
      headers: { Accept: 'application/json' },
    });
    if (r.status !== 200) {
      console.log(`${r.status}  group=${g}`);
      continue;
    }
    const body = await r.json();
    const settings = body?.data?.settings ?? {};
    const flat = flatten(settings);
    const matched = Object.keys(flat).filter((k) => want.has(k));
    if (matched.length) {
      console.log(`200  group=${g}  →  ${matched.length} FE keys present (${settings ? Object.keys(settings).length : 0} groups, ${Object.keys(flat).length} flat keys)`);
      for (const k of matched.slice(0, 8)) console.log(`     ✓ ${k}`);
      hits[g] = matched;
    } else {
      console.log(`200  group=${g}  →  0 FE keys match (${Object.keys(flat).length} flat keys: ${Object.keys(flat).slice(0,3).join(', ')}…)`);
    }
  } catch (e) {
    console.log(`ERR  group=${g}  ${e.message}`);
  }
}
console.log(`\nGroups containing any FE key: ${Object.keys(hits).join(', ') || '(none)'}`);
