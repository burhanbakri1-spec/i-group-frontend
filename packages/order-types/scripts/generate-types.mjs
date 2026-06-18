#!/usr/bin/env node
/**
 * T026 / C-17 — generate the order-types package from the BE's OpenAPI spec.
 *
 * Usage:
 *   # Default: fetch from http://localhost:3001/api-json
 *   node scripts/generate-types.mjs
 *
 *   # Custom URL:
 *   BE_OPENAPI_URL=http://staging.example.com/api-json node scripts/generate-types.mjs
 *
 * The script uses `openapi-typescript` to convert the BE OpenAPI spec
 * into a TypeScript module. The output replaces `src/order.generated.ts`.
 *
 * NOTE: openapi-typescript must be installed as a workspace dev dep:
 *   pnpm add -wDw openapi-typescript
 */
import { writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const BE_OPENAPI_URL =
  process.env.BE_OPENAPI_URL ?? 'http://localhost:3001/api-json';
const OUTPUT_PATH = resolve(__dirname, '../src/order.generated.ts');

async function main() {
  let openapiTS;
  try {
    openapiTS = await import('openapi-typescript');
  } catch {
    console.error(
      'openapi-typescript is not installed. Run `pnpm add -wDw openapi-typescript` and try again.',
    );
    process.exit(1);
  }

  console.log(`[order-types] Fetching OpenAPI spec from ${BE_OPENAPI_URL}`);
  const ast = await openapiTS.default(new URL(BE_OPENAPI_URL), {
    transform: (schema, _options) => {
      // The BE uses Decimal-as-string for money. Tell openapi-typescript
      // to treat those as `string` (not `number`) so FE code can compare
      // them with === and serialize without loss.
      if (schema.format === 'decimal') return { type: 'string' };
      return undefined;
    },
  });

  const dir = dirname(OUTPUT_PATH);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  writeFileSync(
    OUTPUT_PATH,
    `// AUTO-GENERATED — do not edit.\n// Regenerate: pnpm -w @i-group/order-types generate\n\n${ast}\n`,
  );
  console.log(`[order-types] Wrote ${OUTPUT_PATH}`);
}

main().catch((err) => {
  console.error('[order-types] Generate failed:', err);
  process.exit(1);
});
