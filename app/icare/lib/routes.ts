import { Product } from '../types';

export type IcarePageKey =
  | 'home'
  | 'shop'
  | 'wishlist'
  | 'checkout'
  | 'account'
  | 'story'
  | 'faq'
  | 'contact'
  | 'vlog'
  | 'find-us'
  | 'privacy'
  | 'terms'
  | 'accessibility'
  | 'shipping';

export const ICARE_PAGE_PATHS: Record<IcarePageKey, string> = {
  home: '/icare',
  shop: '/icare/shop',
  wishlist: '/icare/wishlist',
  checkout: '/icare/checkout',
  account: '/icare/account',
  story: '/icare/story',
  faq: '/icare/faq',
  contact: '/icare/contact',
  vlog: '/icare/vlog',
  'find-us': '/icare/find-us',
  privacy: '/icare/privacy',
  terms: '/icare/terms',
  accessibility: '/icare/accessibility',
  shipping: '/icare/shipping',
};

export const getIcarePagePath = (page: string) => {
  return ICARE_PAGE_PATHS[page as IcarePageKey] ?? ICARE_PAGE_PATHS.home;
};

export const getIcareProductPath = (product: Pick<Product, 'slug'>) => {
  const slug = product.slug?.trim();
  return slug ? `/icare/products/${encodeURIComponent(slug)}` : null;
};
