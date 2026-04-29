'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Header } from './components/Header';
import { Home } from './components/Home';
import { AboutPage } from './components/AboutPage';
import { ShopPage } from './components/ShopPage';
import { AccountPage } from './components/AccountPage';
import { StoreLocator } from './components/StoreLocator';
import { VlogPage } from './components/VlogPage';
import { PrivacyPolicy, TermsOfService, AccessibilityStatement } from './components/LegalPages';
import { FAQPage } from './components/FAQPage';
import { ContactPage } from './components/ContactPage';
import { Cart } from './components/Cart';
import { SearchDrawer } from './components/SearchDrawer';
import { MobileMenu } from './components/MobileMenu';
import { Footer } from './components/Footer';
import { Language } from './translations';
import { ProductPage } from './components/ProductPage';
import { CheckoutPage } from './components/CheckoutPage';
import { WishlistPage } from './components/WishlistPage';
import { ShippingPage } from './components/ShippingPage';
import { ShopProvider } from './context/ShopContext';
import { Product } from './types';
import './icare.css';

// Page Transition Wrapper Component
const PageTransition = ({ children, pageKey }: { children: React.ReactNode; pageKey: string }) => (
  <motion.div
    key={pageKey}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ 
      duration: 0.5, 
      ease: [0.22, 1, 0.36, 1]
    }}
  >
    {children}
  </motion.div>
);

export default function ICarePage() {
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [lang, setLang] = useState<Language>('en');

  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  const toggleLang = () => setLang(l => l === 'en' ? 'ar' : 'en');

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    setCurrentPage('product');
    window.scrollTo(0, 0);
  };

  const renderPage = () => {
    if (currentPage === 'product' && selectedProduct) {
      return (
        <PageTransition pageKey={`product-${selectedProduct.id}`}>
          <ProductPage 
            product={selectedProduct} 
            onBack={() => setCurrentPage('shop')} 
            lang={lang} 
          />
        </PageTransition>
      );
    }

    switch (currentPage) {
      case 'story':
        return <PageTransition pageKey="story"><AboutPage onNavigate={setCurrentPage} lang={lang} /></PageTransition>;
      case 'shop':
        return <PageTransition pageKey="shop"><ShopPage lang={lang} onProductSelect={handleProductSelect} /></PageTransition>;
      case 'account':
        return <PageTransition pageKey="account"><AccountPage onNavigate={setCurrentPage} lang={lang} /></PageTransition>;
      case 'find-us':
        return <PageTransition pageKey="find-us"><StoreLocator lang={lang} /></PageTransition>;
      case 'vlog':
        return <PageTransition pageKey="vlog"><VlogPage lang={lang} /></PageTransition>;
      case 'privacy':
        return <PageTransition pageKey="privacy"><PrivacyPolicy lang={lang} /></PageTransition>;
      case 'terms':
        return <PageTransition pageKey="terms"><TermsOfService lang={lang} /></PageTransition>;
      case 'accessibility':
        return <PageTransition pageKey="accessibility"><AccessibilityStatement lang={lang} /></PageTransition>;
      case 'faq':
        return <PageTransition pageKey="faq"><FAQPage lang={lang} /></PageTransition>;
      case 'contact':
        return <PageTransition pageKey="contact"><ContactPage lang={lang} /></PageTransition>;
      case 'checkout':
        return <PageTransition pageKey="checkout"><CheckoutPage lang={lang} onNavigate={setCurrentPage} /></PageTransition>;
      case 'wishlist':
        return <PageTransition pageKey="wishlist"><WishlistPage lang={lang} onProductSelect={handleProductSelect} /></PageTransition>;
      case 'shipping':
        return <PageTransition pageKey="shipping"><ShippingPage lang={lang} /></PageTransition>;
      default:
        return <PageTransition pageKey="home"><Home onNavigate={setCurrentPage} lang={lang} onProductSelect={handleProductSelect} /></PageTransition>;
    }
  };

  return (
    <ShopProvider>
      <div className={`min-h-screen bg-[#FFFFFF] font-sans selection:bg-black selection:text-white text-[#444] ${lang === 'ar' ? 'font-arabic' : ''}`}>
        <Header 
          onOpenCart={() => setIsCartOpen(true)} 
          onOpenSearch={() => setIsSearchOpen(true)}
          onNavigate={(page) => { setCurrentPage(page); window.scrollTo(0, 0); }}
          onOpenMenu={() => setIsMenuOpen(true)}
          isDrawerOpen={isCartOpen || isSearchOpen || isMenuOpen}
          lang={lang}
          onToggleLang={toggleLang}
        />

        <MobileMenu 
          isOpen={isMenuOpen} 
          onClose={() => setIsMenuOpen(false)} 
          onNavigate={(page) => { setCurrentPage(page); setIsMenuOpen(false); window.scrollTo(0, 0); }}
          onOpenCart={() => setIsCartOpen(true)}
          onOpenSearch={() => setIsSearchOpen(true)}
          lang={lang}
          onToggleLang={toggleLang}
        />

        <main className="pt-[120px]">
          <AnimatePresence mode="wait">
            {renderPage()}
          </AnimatePresence>
        </main>

        <Footer lang={lang} onNavigate={(page) => { setCurrentPage(page); window.scrollTo(0, 0); }} />

        <Cart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} lang={lang} onNavigate={setCurrentPage} />
        <SearchDrawer isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} lang={lang} />
      </div>
    </ShopProvider>
  );
}
