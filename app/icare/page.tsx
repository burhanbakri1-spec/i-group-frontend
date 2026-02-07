'use client';

import React, { useState, useEffect } from 'react';
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
import { translations, Language } from './translations';
import { ProductPage } from './components/ProductPage';
import { CheckoutPage } from './components/CheckoutPage';
import { WishlistPage } from './components/WishlistPage';
import { ShippingPage } from './components/ShippingPage';
import { ShopProvider } from './context/ShopContext';
import './icare.css';

export default function ICarePage() {
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [lang, setLang] = useState<Language>('en');

  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  const toggleLang = () => setLang(l => l === 'en' ? 'ar' : 'en');

  const handleProductSelect = (product: any) => {
    setSelectedProduct(product);
    setCurrentPage('product');
    window.scrollTo(0, 0);
  };

  const renderPage = () => {
    if (currentPage === 'product' && selectedProduct) {
      return (
        <ProductPage 
          product={selectedProduct} 
          onBack={() => setCurrentPage('shop')} 
          lang={lang} 
        />
      );
    }

    switch (currentPage) {
      case 'story':
        return <AboutPage onNavigate={setCurrentPage} lang={lang} />;
      case 'shop':
        return <ShopPage lang={lang} onProductSelect={handleProductSelect} />;
      case 'account':
        return <AccountPage onNavigate={setCurrentPage} lang={lang} />;
      case 'find-us':
        return <StoreLocator lang={lang} />;
      case 'vlog':
        return <VlogPage lang={lang} />;
      case 'privacy':
        return <PrivacyPolicy lang={lang} />;
      case 'terms':
        return <TermsOfService lang={lang} />;
      case 'accessibility':
        return <AccessibilityStatement lang={lang} />;
      case 'faq':
        return <FAQPage lang={lang} />;
      case 'contact':
        return <ContactPage lang={lang} />;
      case 'checkout':
        return <CheckoutPage lang={lang} onNavigate={setCurrentPage} />;
      case 'wishlist':
        return <WishlistPage lang={lang} onProductSelect={handleProductSelect} />;
      case 'shipping':
        return <ShippingPage lang={lang} />;
      default:
        return <Home onNavigate={setCurrentPage} lang={lang} onProductSelect={handleProductSelect} />;
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
          {renderPage()}
        </main>

        <Footer lang={lang} onNavigate={(page) => { setCurrentPage(page); window.scrollTo(0, 0); }} />

        <Cart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} lang={lang} onNavigate={setCurrentPage} />
        <SearchDrawer isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} lang={lang} />
      </div>
    </ShopProvider>
  );
}
