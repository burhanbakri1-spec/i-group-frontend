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

  const navigateToPath = useCallback((path: string) => {
    router.push(path);
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [router]);

  const contextValue = useMemo<IcareShellContextValue>(() => ({
    lang,
    navigateToPage: (page: string) => navigateToPath(getIcarePagePath(page)),
    navigateToProduct: (product: Product) => navigateToPath(getIcareProductPath(product) ?? getIcarePagePath('shop')),
  }), [lang, navigateToPath]);

  const navigateFromShell = (page: string) => {
    setIsMenuOpen(false);
    navigateToPath(getIcarePagePath(page));
  };

  const handleProductSelect = (product: Product) => {
    setIsMenuOpen(false);
    setIsSearchOpen(false);
    navigateToPath(getIcareProductPath(product) ?? getIcarePagePath('shop'));
  };

  return (
    <ShopProvider>
      <IcareShellContext.Provider value={contextValue}>
        <div className={`min-h-screen bg-[var(--rb-pure-white)] font-sans selection:bg-[#7B7872] selection:text-white text-[#67645E] ${lang === 'ar' ? 'font-arabic' : ''}`}>
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
            onOpenSearch={() => setIsSearchOpen(true)}
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
          <SearchDrawer isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} lang={lang} onProductSelect={handleProductSelect} />
        </div>
      </IcareShellContext.Provider>
    </ShopProvider>
  );
};
