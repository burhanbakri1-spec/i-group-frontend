import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { getIcareApiBaseUrl } from '../app/icare/lib/env';

// We mutate process.env in tests; the lib types declare it as
// Readonly<Record<string, string | undefined>> so a one-shot cast is
// the simplest fix that does not require `any` in the assertions.
const env = process.env as { [key: string]: string | undefined };

describe('getIcareApiBaseUrl', () => {
  const originalEnv = { ...env };

  beforeEach(() => {
    delete env.NEXT_PUBLIC_ICARE_API_URL;
    delete env.NODE_ENV;
  });

  afterEach(() => {
    env.NEXT_PUBLIC_ICARE_API_URL = originalEnv.NEXT_PUBLIC_ICARE_API_URL;
    env.NODE_ENV = originalEnv.NODE_ENV;
  });

  it('returns the env value when set', () => {
    env.NEXT_PUBLIC_ICARE_API_URL = 'https://api.example.com';
    expect(getIcareApiBaseUrl()).toBe('https://api.example.com');
  });

  it('throws in production when env is missing', () => {
    env.NODE_ENV = 'production';
    expect(() => getIcareApiBaseUrl()).toThrow(/NEXT_PUBLIC_ICARE_API_URL is required/);
  });

  it('falls back to /api/icare in dev when env is missing', () => {
    env.NODE_ENV = 'development';
    expect(getIcareApiBaseUrl()).toBe('/api/icare');
  });

  it('falls back to /api/icare when env is unset and NODE_ENV is unset', () => {
    expect(getIcareApiBaseUrl()).toBe('/api/icare');
  });

  it('treats empty env as missing in production', () => {
    env.NODE_ENV = 'production';
    env.NEXT_PUBLIC_ICARE_API_URL = '';
    expect(() => getIcareApiBaseUrl()).toThrow(/NEXT_PUBLIC_ICARE_API_URL is required/);
  });
});
