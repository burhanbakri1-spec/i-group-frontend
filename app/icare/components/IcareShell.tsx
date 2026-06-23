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

const syncAnnouncementOffset = () => {
  const bar = document.querySelector<HTMLElement>('[data-icare-announcement]');
  // Use document-space (not viewport-space) so the fixed header's top stays
  // stable as the user scrolls. offsetTop + offsetHeight is immune to scrollY.
  let nextValue = '0px';
  if (bar) {
    const documentBottom = bar.offsetTop + bar.offsetHeight;
    nextValue = `${documentBottom}px`;
  }
  const root = document.documentElement;
  if (root.style.getPropertyValue(ANNOUNCEMENT_VAR) !== nextValue) {
    root.style.setProperty(ANNOUNCEMENT_VAR, nextValue);
  }
};

export const IcareShell = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [lang, setLang] = useState<Language>('en');
  const hasStandardHero = hasIcareStandardHero(pathname);

  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  // Keep the fixed header / hero top offsets in lockstep with the actual
  // rendered announcement bar. Without this, the offset would be hard-coded
  // in CSS and desync whenever the bar wraps, is empty, or the language toggles.
  useEffect(() => {
    syncAnnouncementOffset();

    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', syncAnnouncementOffset);
      return () => window.removeEventListener('resize', syncAnnouncementOffset);
    }

    const ro = new ResizeObserver(() => syncAnnouncementOffset());
    const bar = document.querySelector<HTMLElement>('[data-icare-announcement]');
    if (bar) ro.observe(bar);
    // Also watch the document body so we catch the bar appearing/disappearing
    // (e.g. when the last slide is removed or language changes mid-session).
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
        for (const r of roots ?? []) map[r.name.toLowerCase()] = r.slug;
        setCategorySlugByName(map);
      } catch {}
    })();
    return () => { cancelled = true; };
  }, []);

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
        <div className={`min-h-screen overflow-x-hidden bg-[var(--rb-pure-white)] font-sans selection:bg-[#7B7872] selection:text-white text-[#67645E] ${lang === 'ar' ? 'font-arabic' : ''}`}>
          <AnnouncementBar />

          <Header
            onOpenCart={() => setIsCartOpen(true)}
            onOpenSearch={() => setIsSearchOpen(true)}
            onNavigate={navigateFromShell}
            onProductSelect={handleProductSelect}
            onOpenMenu={() => setIsMenuOpen(true)}
            isDrawerOpen={isCartOpen || isSearchOpen || isMenuOpen}
            lang={lang}
            onToggleLang={() => setLang((currentLang) => currentLang === 'en' ? 'ar' : 'en')}
          />

          <MobileMenu
            isOpen={isMenuOpen}
            onClose={() => setIsMenuOpen(false)}
            onNavigate={navigateFromShell}
            onProductSelect={handleProductSelect}
            onOpenCart={() => setIsCartOpen(true)}
            lang={lang}
            onToggleLang={() => setLang((currentLang) => currentLang === 'en' ? 'ar' : 'en')}
          />

          <main className={hasStandardHero ? '' : 'pt-24'}>
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
