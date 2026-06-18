#!/usr/bin/env node
/**
 * sync-content-types.mjs
 *
 * Regenerates `app/icare/lib/content-keys.d.ts` by parsing the BE source
 * files that register ContentProvider keys via
 * `ContentRegistryService.register(key, { type })`.
 *
 * Why file-parsing instead of a network call:
 *   - The BE has the authoritative registry (every NestJS module registers
 *     its keys in onModuleInit()).
 *   - The FE needs the type for compile-time safety on useContent(key).
 *   - File parsing is deterministic, no auth, no network, no CI flake.
 *   - It catches the case where a key is registered on the BE but the
 *     FE `content-keys.d.ts` is out of date (the brief's "single source
 *     of truth" requirement).
 *
 * Usage:
 *   npm run sync:content-types
 *
 * After running, commit the regenerated content-keys.d.ts so the type
 * narrows match the deployed registry.
 *
 * Sources parsed (relative to repo root):
 *   e-commerce-backend/src/content/content-defaults.service.ts
 *   e-commerce-backend/src/modules/hero/hero.service.ts
 *   e-commerce-backend/src/modules/pages/pages.service.ts
 */
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(__dirname, '..', '..');
const BE_SRC = resolve(REPO, 'e-commerce-backend/src');

const TYPE_PATH = resolve(
  REPO,
  'i-group/app/icare/lib/content-keys.d.ts',
);

const FILES = [
  'content/content-defaults.service.ts',
  'content/legacy-content.service.ts',
  'content/content-migrations.service.ts',
  'modules/hero/hero.service.ts',
];

/**
 * Parse a NestJS service file and extract every
 * `this.registry.register('key.X', { type: 'text'|'image', ... })` call.
 * Returns a Map<key, type>.
 *
 * Also handles the dynamic-loop pattern used by pages.service.ts:
 *   const bag: Record<string,string> = { 'k1': 'v1', 'k2': 'v2' };
 *   for (const [key, val] of Object.entries(bag)) {
 *     this.registry.register(key, { type: 'text', defaultValue: val, ... });
 *   }
 * In this case we pull literal keys out of the bag and treat each as text.
 */
async function parseKeys() {
  const keys = new Map();
  for (const rel of FILES) {
    const content = await readFile(resolve(BE_SRC, rel), 'utf8');

    // 1. Literal-key calls.
    const literalRe = /this\.registry\.register\(\s*'([^']+)'\s*,\s*\{/g;
    let m;
    while ((m = literalRe.exec(content))) {
      const key = m[1];
      const optionsStart = m.index + m[0].length;
      const optionsEnd = content.indexOf('}', optionsStart);
      if (optionsEnd === -1) continue;
      const optionsBody = content.slice(optionsStart, optionsEnd);
      const typeMatch = optionsBody.match(/type\s*:\s*'(text|image)'/);
      if (typeMatch) {
        keys.set(key, typeMatch[1]);
      }
    }

    // 2. Dynamic-loop calls: `this.registry.register(KEY_VAR, { ... })` where
    // KEY_VAR is fed from a `Record<string,string>` bag iterated in a
    // `for (const [key, val] of Object.entries(BAG_VAR))` loop. All
    // dynamic-loop registrations in the codebase are type 'text'.
    //
    // Multiple loops can share a key variable name; resolve each
    // register call against the nearest preceding `for...of` loop in
    // the same scope.
    const dynRe = /this\.registry\.register\(\s*([A-Za-z_][A-Za-z0-9_]*)\s*,\s*\{/g;
    while ((m = dynRe.exec(content))) {
      const callPos = m.index;
      const keyVar = m[1];
      // Scan backward from the call for the nearest `for...of` loop that
      // uses `keyVar`. Limit the search to the 4KB before the call so
      // unrelated earlier loops aren't picked up.
      const before = content.slice(Math.max(0, callPos - 4096), callPos);
      const loopRe = new RegExp(
        String.raw`for\s*\(\s*const\s*\[\s*${keyVar}\s*,[^\]]+\]\s*of\s*Object\.entries\(\s*([A-Za-z_][A-Za-z0-9_]*)\s*\)\s*\)\s*\{`,
        'g',
      );
      let bestLoop = null;
      let lm;
      while ((lm = loopRe.exec(before))) {
        bestLoop = lm;
      }
      if (!bestLoop) continue;
      const bagVar = bestLoop[1];
      // Pull the bag literal: `const bagVar: Record<string, string> = { ... };`
      const bagRe = new RegExp(
        String.raw`(?:const|let|var)\s+${bagVar}\s*:\s*Record<string,\s*string>\s*=\s*\{([\s\S]*?)\}\s*;`,
        'm',
      );
      const bagMatch = bagRe.exec(content);
      if (!bagMatch) continue;
      const keyRe = /'([^']+)'\s*:/g;
      let km;
      while ((km = keyRe.exec(bagMatch[1]))) {
        if (!keys.has(km[1])) {
          keys.set(km[1], 'text');
        }
      }
    }
  }
  return keys;
}

function renderKey(key, type) {
  if (type === 'text') {
    return `  '${key}': { type: 'text'; locales: ['en', 'ar'] };`;
  }
  return `  '${key}': { type: 'image' };`;
}

function groupByPrefix(items) {
  const groups = new Map();
  for (const item of items) {
    const prefix = item.key.split('.')[0];
    if (!groups.has(prefix)) groups.set(prefix, []);
    groups.get(prefix).push(item);
  }
  return Array.from(groups.entries()).sort(([a], [b]) => a.localeCompare(b));
}

function buildBody(items) {
  const grouped = groupByPrefix(items);
  const blocks = [];
  for (const [prefix, group] of grouped) {
    const sorted = group.sort((a, b) => a.key.localeCompare(b.key));
    blocks.push(`  // ${prefix}`);
    for (const item of sorted) blocks.push(renderKey(item.key, item.type));
    blocks.push('');
  }
  return blocks.join('\n').trimEnd() + '\n';
}

async function main() {
  const keys = await parseKeys();
  if (keys.size === 0) {
    throw new Error(
      `[sync] No keys parsed from ${FILES.length} source files. ` +
        'Did the file paths change or the register() call shape drift?',
    );
  }

  const header =
    '// Auto-generated by scripts/sync-content-types.mjs. DO NOT EDIT BY HAND.\n' +
    `// Sources: ${FILES.map((f) => 'e-commerce-backend/src/' + f).join(', ')}\n` +
    '// Mirrors ContentRegistryService.register() calls in NestJS modules.\n' +
    '// Run `npm run sync:content-types` to regenerate after adding keys.\n' +
    'export interface ContentKeys {\n';
  const body = buildBody(Array.from(keys, ([key, type]) => ({ key, type })));
  const footer = '}\n';

  await writeFile(TYPE_PATH, header + body + footer, 'utf8');
  console.log(`[sync] Wrote ${keys.size} keys to ${TYPE_PATH}`);
  // Sanity floor: a healthy BE registers ~150 keys. Warn loudly if we
  // parse a much smaller number so deployment drift (e.g. ContentDefaults
  // not on the build) is caught at sync time, not at runtime.
  const MIN_EXPECTED = 100;
  if (keys.size < MIN_EXPECTED) {
    console.warn(
      `[sync] WARNING: only ${keys.size} keys parsed (expected >= ${MIN_EXPECTED}). ` +
        'Check whether ContentDefaultsService is up to date.',
    );
  }
}

main().catch((err) => {
  console.error(err.message ?? err);
  process.exit(1);
});
