const STANDARD_HERO_PATHS = new Set([
  '/icare',
  '/icare/shop',
  '/icare/story',
  '/icare/contact',
  '/icare/faq',
  '/icare/vlog',
]);

export const hasIcareStandardHero = (pathname: string | null | undefined) => {
  if (!pathname) return false;
  const normalizedPathname = pathname.length > 1 ? pathname.replace(/\/$/, '') : pathname;
  return STANDARD_HERO_PATHS.has(normalizedPathname);
};
