import { AppSettings } from '../types';
import { platformApiOrigin, storefrontHost } from './platform-origin';

const PLATFORM_API_BASE_URL = platformApiOrigin();
const STOREFRONT_HOST = storefrontHost();

const snakeCase = (key: string) =>
  key.replace(/[A-Z]/g, (character) => `_${character.toLowerCase()}`);

export const fetchServerSettings = async (): Promise<AppSettings | null> => {
  try {
    const resolver = new URL('/api/company/resolve-storefront', PLATFORM_API_BASE_URL);
    resolver.searchParams.set('host', STOREFRONT_HOST);
    resolver.searchParams.set('path', '/icare');
    const resolvedResponse = await fetch(resolver, { next: { revalidate: 300 } });
    if (!resolvedResponse.ok) return null;
    const company = await resolvedResponse.json() as {
      id?: string;
      name?: string;
      status?: string;
      settings?: Record<string, unknown>;
    };
    if (!company.id || company.status !== 'active') return null;

    const contextResponse = await fetch(new URL('/api/company/context', PLATFORM_API_BASE_URL), {
      headers: { 'X-Company-Id': company.id, Accept: 'application/json' },
      next: { revalidate: 300 },
    });
    if (!contextResponse.ok) return null;
    const context = await contextResponse.json() as {
      name?: string;
      settings?: Record<string, unknown>;
    };
    const general = Object.fromEntries(
      Object.entries(context.settings ?? {}).map(([key, value]) => [snakeCase(key), String(value ?? '')]),
    );
    general.site_name = context.name || company.name || '';
    return { general };
  } catch {
    return null;
  }
};
