'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'motion/react';
import { Header } from './Header';
import { AnnouncementBar } from './AnnouncementBar';
import { MobileMenu } from './MobileMenu';
import { Cart } from './Cart';
import { SearchDrawer } from './SearchDrawer';
import { Footer } from './Footer';
import { ShopProvider } from '../context/ShopContext';
import { Language } from '../translations';
import { Product } from '../types';
import { getIcarePagePath, getIcareProductPath } from '../lib/routes';
import { hasIcareStandardHero } from '../lib/hero-routes';
import { pickLocalized } from '../lib/localized';

interface IcareShellContextValue {
  lang: Language;
  navigateToPage: (page: string) => void;
  navigateToProduct: (product: Product) => void;
}

const IcareShellContext = createContext<IcareShellContextValue | null>(null);

export const useIcareShell = () => {
  const context = useContext(IcareShellContext);
  if (!context) {
    throw new Error('useIcareShell must be used inside IcareShell');
  }
  return context;
};

const PageTransition = ({
  children,
  lockTop,
  pageKey,
}: {
  children: React.ReactNode;
  lockTop: boolean;
  pageKey: string;
}) => {
  const yOffset = lockTop ? 0 : 16;

  return (
    <motion.div
      key={pageKey}
      initial={{ opacity: 0, y: yOffset }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: lockTop ? 0 : -12 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
};

const ANNOUNCEMENT_VAR = '--icare-announcement-bottom';
const HEADER_TOP_VAR = '--icare-header-top';
const HERO_TOP_VAR = '--icare-hero-top';

const syncLayoutOffsets = () => {
  const root = document.documentElement;
  const scrollY = window.scrollY;

  const bar = document.querySelector<HTMLElement>('[data-icare-announcement]');
  let announcementBottom = '0px';
  if (bar) {
    announcementBottom = `${bar.getBoundingClientRect().bottom + scrollY}px`;
  }
  if (root.style.getPropertyValue(ANNOUNCEMENT_VAR) !== announcementBottom) {
    root.style.setProperty(ANNOUNCEMENT_VAR, announcementBottom);
  }

  const hero = document.querySelector<HTMLElement>('[data-icare-hero]');
  let headerTop = announcementBottom;

  if (hero) {
    const heroTop = `${hero.getBoundingClientRect().top + scrollY}px`;
    root.style.setProperty(HERO_TOP_VAR, heroTop);
    headerTop = heroTop;
  } else {
    root.style.removeProperty(HERO_TOP_VAR);
    if (bar) {
      const stackGap =
        getComputedStyle(root).getPropertyValue('--icare-hero-stack-gap').trim() || '0.625rem';
      headerTop = `calc(${announcementBottom} + ${stackGap})`;
    }
  }

  if (root.style.getPropertyValue(HEADER_TOP_VAR) !== headerTop) {
    root.style.setProperty(HEADER_TOP_VAR, headerTop);
  }
};

export const IcareShell = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [lang, setLang] = useState<Language>('en');
  const [languageReady, setLanguageReady] = useState(false);
  const hasStandardHero = hasIcareStandardHero(pathname);

  const toggleLanguage = useCallback(() => {
    setLang((currentLang) => {
      const next = currentLang === 'en' ? 'ar' : 'en';
      document.cookie = `icare_lang=${next}; Path=/icare; Max-Age=31536000; SameSite=Lax`;
      window.setTimeout(() => router.refresh(), 0);
      return next;
    });
  }, [router]);

  useEffect(() => {
    if (/(?:^|; )icare_lang=ar(?:;|$)/.test(document.cookie)) setLang('ar');
    setLanguageReady(true);
  }, []);

  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
    if (languageReady) document.cookie = `icare_lang=${lang}; Path=/icare; Max-Age=31536000; SameSite=Lax`;
  }, [lang, languageReady]);

  // Keep the fixed header pinned to the hero top (or announcement + gap when
  // no hero). Re-measure on resize, route change, and hero/bar layout shifts.
  useEffect(() => {
    syncLayoutOffsets();

    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', syncLayoutOffsets);
      return () => window.removeEventListener('resize', syncLayoutOffsets);
    }

    const ro = new ResizeObserver(() => syncLayoutOffsets());
    const bar = document.querySelector<HTMLElement>('[data-icare-announcement]');
    const hero = document.querySelector<HTMLElement>('[data-icare-hero]');
    if (bar) ro.observe(bar);
    if (hero) ro.observe(hero);
    ro.observe(document.body);

    return () => {
      ro.disconnect();
    };
  }, [lang, pathname]);

  const navigateToPath = useCallback((path: string) => {
    router.push(path);
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [router]);

  const contextValue = useMemo<IcareShellContextValue>(() => ({
    lang,
    navigateToPage: (page: string) => navigateToPath(getIcarePagePath(page)),
    navigateToProduct: (product: Product) => navigateToPath(getIcareProductPath(product) ?? getIcarePagePath('shop')),
  }), [lang, navigateToPath]);

  const navigateFromShell = (page: string, options?: { categorySlug?: string }) => {
    setIsMenuOpen(false);
    const path = getIcarePagePath(page);
    const slug = options?.categorySlug;
    if (slug) {
      navigateToPath(`${path}?category=${encodeURIComponent(slug)}`);
    } else {
      navigateToPath(path);
    }
  };

  const handleProductSelect = (product: Product) => {
    setIsMenuOpen(false);
    setIsSearchOpen(false);
    navigateToPath(getIcareProductPath(product) ?? getIcarePagePath('shop'));
  };

  const [categorySlugByName, setCategorySlugByName] = useState<Record<string, string>>({});

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { fetchCategoryRoots } = await import('../lib/catalog-client');
        const roots = await fetchCategoryRoots();
        if (cancelled) return;
        const map: Record<string, string> = {};
        for (const r of roots ?? []) map[pickLocalized(r.name, lang).toLowerCase()] = r.slug;
        setCategorySlugByName(map);
      } catch {}
    })();
    return () => { cancelled = true; };
  }, [lang]);

  const handleCategorySelect = (name: string) => {
    setIsSearchOpen(false);
    const slug = categorySlugByName[name.toLowerCase()];
    if (slug) {
      router.push(`/icare/shop?category=${encodeURIComponent(slug)}`);
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    } else {
      router.push('/icare/shop');
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }
  };

  return (
    <ShopProvider>
      <IcareShellContext.Provider value={contextValue}>
        <div className={`icare-shell ${lang === 'ar' ? 'font-arabic' : ''}`}>
          <AnnouncementBar />

          <Header
            onOpenCart={() => setIsCartOpen(true)}
            onOpenSearch={() => setIsSearchOpen(true)}
            onNavigate={navigateFromShell}
            onProductSelect={handleProductSelect}
            onOpenMenu={() => setIsMenuOpen(true)}
            isDrawerOpen={isCartOpen || isSearchOpen || isMenuOpen}
            lang={lang}
            onToggleLang={toggleLanguage}
          />

          <MobileMenu
            isOpen={isMenuOpen}
            onClose={() => setIsMenuOpen(false)}
            onNavigate={navigateFromShell}
            onProductSelect={handleProductSelect}
            onOpenCart={() => setIsCartOpen(true)}
            lang={lang}
            onToggleLang={toggleLanguage}
          />

          <main className={hasStandardHero ? '' : 'icare-main--offset'}>
            <AnimatePresence>
              <PageTransition lockTop={hasStandardHero} pageKey={pathname}>{children}</PageTransition>
            </AnimatePresence>
          </main>

          <Footer lang={lang} onNavigate={navigateFromShell} />

          <Cart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} lang={lang} onNavigate={navigateFromShell} />
          <SearchDrawer isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} lang={lang} onProductSelect={handleProductSelect} onCategorySelect={handleCategorySelect} />
        </div>
      </IcareShellContext.Provider>
    </ShopProvider>
  );
};
