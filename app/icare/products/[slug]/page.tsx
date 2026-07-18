import type { Metadata } from 'next';
import { cookies, headers } from 'next/headers';
import { IcareProductRoutePage } from '../../components/IcareProductRoutePage';
import type { ApiEnvelope, BackendProduct } from '../../types';
import type { Language } from '../../translations';
import { buildProductMetadata } from '../../lib/product-metadata';

interface IcareProductPageProps {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ lang?: string }>;
}

export async function generateMetadata({ params, searchParams }: IcareProductPageProps): Promise<Metadata> {
  try {
    const [{ slug }, query, requestHeaders, cookieStore] = await Promise.all([
      params,
      searchParams || Promise.resolve({} as { lang?: string }),
      headers(),
      cookies(),
    ]);
    const lang: Language = (query.lang || cookieStore.get('icare_lang')?.value) === 'ar' ? 'ar' : 'en';
    const host = requestHeaders.get('x-forwarded-host') || requestHeaders.get('host');
    if (!host) return {};
    const protocol = requestHeaders.get('x-forwarded-proto') || (host.includes('localhost') ? 'http' : 'https');
    const encodedSlug = encodeURIComponent(decodeURIComponent(slug));
    const origin = `${protocol}://${host}`;
    const response = await fetch(`${origin}/api/icare/api/v1/products/${encodedSlug}`, { next: { revalidate: 300 } });
    if (!response.ok) return {};
    const envelope = await response.json() as ApiEnvelope<BackendProduct>;
    return buildProductMetadata(envelope?.data || null, lang, `${origin}/icare/products/${encodedSlug}`);
  } catch { return {}; }
}

export default async function IcareProductPage({ params }: IcareProductPageProps) {
  const { slug } = await params;
  return <IcareProductRoutePage slug={decodeURIComponent(slug)} />;
}
