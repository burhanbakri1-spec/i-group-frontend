export interface StorefrontCompanyContext {
  id: string;
  slug: string;
  name: string;
  status: 'active';
  isDefault: boolean;
  domain: string;
  storefrontUrl: string;
  storefrontPath: string;
  settings: Record<string, unknown>;
}

const RESERVED_ROOT_SEGMENTS = new Set([
  'api', '_next', '.well-known', 'assets', 'fonts', 'icons', 'images', 'static',
  'uploads', 'public', 'favicon.ico', 'manifest.json', 'robots.txt', 'site.webmanifest',
  'sitemap.xml', 'sw.js', 'apple-touch-icon.png', 'ibio', 'idesign',
]);
const ACTIVE_COMPANY_KEY = 'igroup_active_storefront_company';

let cachedResolution: { key: string; promise: Promise<StorefrontCompanyContext> } | null = null;

export function storefrontSlugFromPath(pathname: string): string | null {
  const firstSegment = pathname.split('/').filter(Boolean)[0]?.toLowerCase() || '';
  if (!firstSegment || RESERVED_ROOT_SEGMENTS.has(firstSegment)) return null;
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(firstSegment) ? firstSegment : null;
}

function publishCompanyChange(nextCompanyId: string) {
  const previousCompanyId = window.localStorage.getItem(ACTIVE_COMPANY_KEY);
  if (previousCompanyId && previousCompanyId !== nextCompanyId) {
    window.dispatchEvent(new CustomEvent('igroup:storefront-changed', {
      detail: { previousCompanyId, companyId: nextCompanyId },
    }));
  }
  window.localStorage.setItem(ACTIVE_COMPANY_KEY, nextCompanyId);
}

export async function resolveCurrentStorefront(): Promise<StorefrontCompanyContext> {
  if (typeof window === 'undefined') {
    throw new Error('Storefront resolution requires a browser request context.');
  }

  const slug = storefrontSlugFromPath(window.location.pathname);
  if (!slug) throw new Error('Storefront company not found.');

  const configuredHost = process.env.NEXT_PUBLIC_STOREFRONT_HOST?.trim();
  const host = configuredHost || window.location.host;
  const key = `${host}${window.location.pathname}`;
  if (cachedResolution?.key === key) return cachedResolution.promise;

  const query = new URLSearchParams({ host, path: window.location.pathname });
  const promise = fetch(`/api/storefront/resolve?${query.toString()}`, { cache: 'no-store' })
    .then(async (response) => {
      const body = await response.json().catch(() => null) as StorefrontCompanyContext | { message?: string } | null;
      if (!response.ok || !body || !('id' in body) || body.status !== 'active') {
        throw new Error(body && 'message' in body && body.message
          ? body.message
          : 'Storefront company not found or inactive.');
      }
      if (body.slug !== slug || !window.location.pathname.startsWith(body.storefrontPath)) {
        throw new Error('Storefront company does not match the requested path.');
      }
      publishCompanyChange(body.id);
      return body;
    })
    .catch((error) => {
      if (cachedResolution?.key === key) cachedResolution = null;
      throw error;
    });

  cachedResolution = { key, promise };
  return promise;
}

export function resetStorefrontResolutionForTests() {
  cachedResolution = null;
}
