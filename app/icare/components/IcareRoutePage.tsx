'use client';

import React from 'react';
import { AboutPage } from './AboutPage';
import { AccountPage } from './AccountPage';
import { CheckoutPage } from './CheckoutPage';
import { ContactPage } from './ContactPage';
import { FAQPage } from './FAQPage';
import { Home } from './Home';
import { PrivacyPolicy, TermsOfService, AccessibilityStatement } from './LegalPages';
import { ShippingPage } from './ShippingPage';
import { ShopPage } from './ShopPage';
import { StoreLocator } from './StoreLocator';
import { VlogPage } from './VlogPage';
import { WishlistPage } from './WishlistPage';
import { IcarePageKey } from '../lib/routes';
import { useIcareShell } from './IcareShell';

export const IcareRoutePage = ({ page }: { page: IcarePageKey }) => {
  const { lang, navigateToPage, navigateToProduct } = useIcareShell();

  switch (page) {
    case 'story':
      return <AboutPage onNavigate={navigateToPage} lang={lang} />;
    case 'shop':
      return <ShopPage lang={lang} onProductSelect={navigateToProduct} />;
    case 'account':
      return <AccountPage onNavigate={navigateToPage} lang={lang} />;
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
      return <CheckoutPage lang={lang} onNavigate={navigateToPage} />;
    case 'wishlist':
      return <WishlistPage lang={lang} onProductSelect={navigateToProduct} onNavigate={navigateToPage} />;
    case 'shipping':
      return <ShippingPage lang={lang} />;
    case 'home':
    default:
      return <Home onNavigate={navigateToPage} lang={lang} onProductSelect={navigateToProduct} />;
  }
};
