import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  resetStorefrontResolutionForTests,
  resolveCurrentStorefront,
  storefrontSlugFromPath,
} from '../app/lib/storefront-context';

describe('storefront tenant resolution', () => {
  beforeEach(() => {
    resetStorefrontResolutionForTests();
    window.localStorage.clear();
    window.sessionStorage.clear();
    vi.restoreAllMocks();
  });

  it('extracts generic company slugs from root and nested storefront paths', () => {
    expect(storefrontSlugFromPath('/icare')).toBe('icare');
    expect(storefrontSlugFromPath('/icare/products')).toBe('icare');
    expect(storefrontSlugFromPath('/ifit/products')).toBe('ifit');
  });

  it('does not treat application or static routes as company slugs', () => {
    expect(storefrontSlugFromPath('/api/icare/products')).toBeNull();
    expect(storefrontSlugFromPath('/_next/static/chunk.js')).toBeNull();
    expect(storefrontSlugFromPath('/images/logo.png')).toBeNull();
    expect(storefrontSlugFromPath('/assets/app.css')).toBeNull();
    expect(storefrontSlugFromPath('/fonts/site.woff2')).toBeNull();
    expect(storefrontSlugFromPath('/.well-known/security.txt')).toBeNull();
  });

  it('uses the validated company and publishes tenant changes', async () => {
    window.history.replaceState({}, '', '/icare/products');
    window.localStorage.setItem('igroup_active_storefront_company', 'ifit');
    window.localStorage.setItem('icare_guest_cart', '[{"id":1}]');
    const changeListener = vi.fn();
    window.addEventListener('igroup:storefront-changed', changeListener, { once: true });
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({
      id: 'icare', slug: 'icare', name: 'iCare', status: 'active', isDefault: false,
      domain: '', storefrontUrl: 'https://igroup.website/icare', storefrontPath: '/icare', settings: {},
    }), { status: 200, headers: { 'Content-Type': 'application/json' } }));

    await expect(resolveCurrentStorefront()).resolves.toMatchObject({ id: 'icare' });
    expect(fetchMock.mock.calls[0][0].toString()).toContain('path=%2Ficare%2Fproducts');
    expect(changeListener).toHaveBeenCalledOnce();
    expect(window.localStorage.getItem('igroup_active_storefront_company')).toBe('icare');
  });

  it('fails closed when the platform rejects an unknown storefront', async () => {
    window.history.replaceState({}, '', '/unknown-company');
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(
      JSON.stringify({ message: 'Storefront company not found or inactive.' }),
      { status: 404, headers: { 'Content-Type': 'application/json' } },
    ));
    await expect(resolveCurrentStorefront()).rejects.toThrow('not found or inactive');
  });

  it('adds the resolved company to centralized storefront API requests', async () => {
    window.history.replaceState({}, '', '/icare/shop');
    const fetchMock = vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(new Response(JSON.stringify({
        id: 'icare', slug: 'icare', name: 'iCare', status: 'active', isDefault: false,
        domain: '', storefrontUrl: 'https://igroup.website/icare', storefrontPath: '/icare', settings: {},
      }), { status: 200, headers: { 'Content-Type': 'application/json' } }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ success: true, data: [] }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }));
    const { icareApi } = await import('../app/icare/lib/api-client');

    await expect(icareApi.products.list()).resolves.toEqual([]);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    const requestInit = fetchMock.mock.calls[1][1] as RequestInit;
    expect(requestInit.headers).toMatchObject({ 'X-Company-Id': 'icare' });
  });
});
