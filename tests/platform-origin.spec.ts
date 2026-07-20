import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('platformApiOrigin', () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it('uses PLATFORM_API_BASE_URL when set', async () => {
    vi.stubEnv('PLATFORM_API_BASE_URL', 'https://api-staging.igroup.website');
    const { platformApiOrigin } = await import('../app/icare/lib/platform-origin');
    expect(platformApiOrigin()).toBe('https://api-staging.igroup.website');
  });

  it('falls back to ICARE_API_BASE_URL when PLATFORM_API_BASE_URL is not set', async () => {
    vi.stubEnv('ICARE_API_BASE_URL', 'https://api-staging.igroup.website');
    const { platformApiOrigin } = await import('../app/icare/lib/platform-origin');
    expect(platformApiOrigin()).toBe('https://api-staging.igroup.website');
  });

  it('prefers PLATFORM_API_BASE_URL over ICARE_API_BASE_URL', async () => {
    vi.stubEnv('PLATFORM_API_BASE_URL', 'https://platform.example.com');
    vi.stubEnv('ICARE_API_BASE_URL', 'https://icare.example.com');
    const { platformApiOrigin } = await import('../app/icare/lib/platform-origin');
    expect(platformApiOrigin()).toBe('https://platform.example.com');
  });

  it('uses localhost fallback when no env vars are set', async () => {
    const { platformApiOrigin } = await import('../app/icare/lib/platform-origin');
    expect(platformApiOrigin()).toBe('http://localhost:54321');
  });

  it('strips trailing slash from the origin', async () => {
    vi.stubEnv('PLATFORM_API_BASE_URL', 'https://api-staging.igroup.website/');
    const { platformApiOrigin } = await import('../app/icare/lib/platform-origin');
    expect(platformApiOrigin()).toBe('https://api-staging.igroup.website');
  });

  it('does not contain sslip.io or backend.igroup.website', async () => {
    const { platformApiOrigin } = await import('../app/icare/lib/platform-origin');
    const origin = platformApiOrigin();
    expect(origin).not.toContain('sslip.io');
    expect(origin).not.toContain('backend.igroup.website');
  });
});

describe('storefrontHost', () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it('uses NEXT_PUBLIC_STOREFRONT_HOST when set', async () => {
    vi.stubEnv('NEXT_PUBLIC_STOREFRONT_HOST', 'staging.igroup.website');
    const { storefrontHost } = await import('../app/icare/lib/platform-origin');
    expect(storefrontHost()).toBe('staging.igroup.website');
  });

  it('falls back to igroup.website', async () => {
    const { storefrontHost } = await import('../app/icare/lib/platform-origin');
    expect(storefrontHost()).toBe('igroup.website');
  });
});
