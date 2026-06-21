// Pull the full /api/v1/settings?group=content response, list its shape,
// and diff it against the FE's requested content keys.
import fs from 'node:fs';
const BE = 'https://backend.igroup.website';

const r = await fetch(BE + '/api/v1/settings?group=content', {
  headers: { Accept: 'application/json' },
});
const body = await r.json();
const settings = body?.data?.settings ?? {};
const groups = Object.keys(settings);

console.log('HTTP', r.status);
console.log('Top-level groups:', groups.length);
for (const g of groups) {
  const inner = settings[g];
  if (inner && typeof inner === 'object') {
    const sub = Object.keys(inner);
    console.log(`  ${g} (${sub.length}): ${sub.slice(0, 8).join(', ')}${sub.length > 8 ? '…' : ''}`);
  } else {
    console.log(`  ${g}: ${typeof inner}`);
  }
}

// FE wants dotted keys: marketing.site.name, home.hero.image, etc.
// Flatten the BE response with the same dotted convention.
const flatten = (obj, prefix = '') => {
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      Object.assign(out, flatten(v, key));
    } else {
      out[key] = v;
    }
  }
  return out;
};
const flat = flatten(settings);
const flatKeys = Object.keys(flat);
console.log(`\nFlattened dotted keys: ${flatKeys.length}`);
console.log('Sample flat keys:');
for (const k of flatKeys.slice(0, 30)) console.log(`  ${k} = ${JSON.stringify(flat[k]).slice(0, 60)}`);

// Load the FE's expected keys
const fbPath = './app/icare/lib/fallback-content.ts';
const src = fs.readFileSync(fbPath, 'utf8');
const wantMatches = [...src.matchAll(/^\s*['"]([a-z][a-z0-9_]*\.[a-z0-9_.]+)['"]:/gim)].map((m) => m[1]);
const want = new Set(wantMatches);
console.log(`\nFE expects ${want.size} dotted content keys`);

// Cross-check
const have = new Set(flatKeys);
const present = [...want].filter((k) => have.has(k));
const missing = [...want].filter((k) => !have.has(k));
const extra = flatKeys.filter((k) => !want.has(k));
console.log(`\nPresent in BE: ${present.length}`);
console.log(`Missing from BE: ${missing.length}`);
if (missing.length) console.log('  Missing:', missing.slice(0, 20).join(', '));
console.log(`\nIn BE but not requested by FE (sample):`);
for (const k of extra.slice(0, 30)) console.log(`  ${k}`);
