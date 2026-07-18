import { describe, expect, it } from 'vitest';
import { buildProductMetadata } from '../app/icare/lib/product-metadata';
import type { BackendProduct } from '../app/icare/types';

const product: BackendProduct = {
  id: 'product-1', slug: 'serum', name: { en: 'Serum', ar: 'سيروم' },
  shortDescription: { en: 'English summary', ar: 'وصف عربي' },
  price: 10, primaryImage: 'https://cdn.example.com/serum.webp',
  seo: {
    title: { en: 'Serum SEO', ar: 'سيروم للعناية' },
    description: { en: 'SEO description', ar: 'وصف محركات البحث' },
    canonicalUrl: 'https://icare.example.com/icare/products/serum',
  },
};

describe('iCare product metadata', () => {
  it('uses the requested locale and configured canonical/social image', () => {
    const metadata = buildProductMetadata(product, 'ar');
    expect(metadata.title).toBe('سيروم للعناية');
    expect(metadata.description).toBe('وصف محركات البحث');
    expect(metadata.alternates?.canonical).toBe('https://icare.example.com/icare/products/serum');
    expect(metadata.openGraph?.images).toEqual(['https://cdn.example.com/serum.webp']);
  });

  it('falls back safely and ignores malformed URLs', () => {
    const metadata = buildProductMetadata({ ...product, seo: { canonicalUrl: 'javascript:bad' }, primaryImage: '/relative.jpg' }, 'en');
    expect(metadata.title).toBe('Serum');
    expect(metadata.description).toBe('English summary');
    expect(metadata.alternates).toBeUndefined();
    expect(metadata.openGraph?.images).toBeUndefined();
  });

  it('returns empty metadata for missing products', () => {
    expect(buildProductMetadata(null, 'en')).toEqual({});
  });
});
