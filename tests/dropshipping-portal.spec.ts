import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const client = readFileSync(resolve(process.cwd(), 'app/icare/dropshipping/client.tsx'), 'utf8');
const adapter = readFileSync(resolve(process.cwd(), 'app/api/icare/[...path]/platform-adapter.ts'), 'utf8');

describe('iCare dropshipper portal security', () => {
  it('does not send a company identifier from browser code', () => {
    expect(client).not.toMatch(/X-Company-Id|companyId|localStorage/);
  });
  it('resolves and injects tenant only in the server adapter', () => {
    expect(adapter).toContain("headers.set('X-Company-Id', companyId)");
    expect(adapter).toContain("path.startsWith('/dropshipping/')");
  });
  it('never sends browser-calculated profit', () => {
    expect(client).not.toMatch(/marketerProfit|profit\s*:/);
  });
  it('uses session-scoped authentication and clears it on logout', () => {
    expect(client).toContain('sessionStorage.setItem');
    expect(client).toContain('sessionStorage.removeItem');
  });
});
