import type { Metadata } from 'next';
import type { BackendProduct } from '../types';
import type { Language } from '../translations';
import { pickLocalized } from './localized';

const validHttpUrl = (value?: string | null) => {
  if (!value) return undefined;
  try {
    const url = new URL(value);
    return ['http:', 'https:'].includes(url.protocol) ? url.toString() : undefined;
  } catch { return undefined; }
};

export function buildProductMetadata(product: BackendProduct | null, lang: Language, fallbackCanonical?: string): Metadata {
  if (!product) return {};
  const name = pickLocalized(product.name, lang, 'iCare Beauty');
  const description = pickLocalized(product.seo?.description, lang)
    || pickLocalized(product.shortDescription, lang)
    || pickLocalized(product.description, lang);
  const title = pickLocalized(product.seo?.title, lang) || name;
  const canonical = validHttpUrl(product.seo?.canonicalUrl) || validHttpUrl(fallbackCanonical);
  const socialImage = validHttpUrl(product.primaryImage);
  return {
    title,
    ...(description ? { description } : {}),
    ...(canonical ? { alternates: { canonical } } : {}),
    openGraph: {
      title,
      ...(description ? { description } : {}),
      ...(canonical ? { url: canonical } : {}),
      ...(socialImage ? { images: [socialImage] } : {}),
    },
  };
}
