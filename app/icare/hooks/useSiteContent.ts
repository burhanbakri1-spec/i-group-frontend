import { useMemo } from 'react';
import { Language } from '../translations';
import { useShop } from '../context/ShopContext';
import {
  ShippingPageContent,
  ShippingPageContentByLanguage,
} from '../types';
import { parseShippingPageContent } from '../lib/settings';
import { normalizeSocialLinksResponse } from '../lib/social-links';
import { CONTENT_FIELD_TO_KEY } from '../lib/fallback-content';

const EMPTY_SHIPPING_PAGE_CONTENT: ShippingPageContent = {
  title: '',
  subtitle: '',
  shippingHeading: '',
  freeShippingTitle: '',
  freeShippingDescription: '',
  expressTitle: '',
  expressDescription: '',
  internationalTitle: '',
  internationalDescription: '',
  processingTitle: '',
  processingDescription: '',
  returnsTitle: '',
  returnPolicyTitle: '',
  returnPolicyDescription: '',
  howToReturnTitle: '',
  returnSteps: ['', '', '', ''],
  conditionsTitle: '',
  conditions: ['', '', '', ''],
  trackingTitle: '',
  trackingDescription: '',
  faqsTitle: '',
  faqs: [
    { question: '', answer: '' },
    { question: '', answer: '' },
    { question: '', answer: '' },
    { question: '', answer: '' },
  ],
  ctaTitle: '',
  ctaDescription: '',
  ctaButton: '',
};

const mergeArray = <T,>(value: T[] | undefined, fallback: T[]) => (
  fallback.map((entry, index) => (value?.[index] ?? entry))
);

const resolveShippingPageContent = (
  content: ShippingPageContentByLanguage | null,
  lang: Language,
): ShippingPageContent => {
  const fallback = EMPTY_SHIPPING_PAGE_CONTENT;
  // Active locale wins; fall back to en (the primary locale) when the active
  // locale slice is absent. Never cascade to the non-primary locale — serving
  // Arabic shipping text to an English user (or vice-versa) is worse than
  // showing the empty defaults.
  const overrides: Partial<ShippingPageContent> = lang === 'en'
    ? (content?.en ?? {})
    : (content?.[lang] ?? content?.en ?? {});

  return {
    ...fallback,
    ...overrides,
    returnSteps: mergeArray(overrides.returnSteps, fallback.returnSteps),
    conditions: mergeArray(overrides.conditions, fallback.conditions),
    faqs: mergeArray(overrides.faqs, fallback.faqs),
  };
};

/**
 * Frontend-only literals with no BE registry key. Single source, no fallbacks.
 */
const FE_LITERALS = {
  reviewHydrationLow: 'Not very hydrated',
  reviewHydrationHigh: 'Super hydrated',
  productShowcaseLoading: '',
  storeLocatorMapImage: '',
  metaDescription: '',
  siteDescription: '',
  siteUrl: '',
  freeShippingThreshold: 45,
  defaultShippingCost: 0,
  checkoutTaxRate: 0,
  shippingRates: '[]',
  enableWishlist: true,
  enableProductReviews: true,
  enableGuestCheckout: true,
  defaultCountry: 'US',
  currencyCode: 'USD',
  itemsPerPage: 12,
} as const;

export const useSiteContent = (lang: Language) => {
  if (process.env.NODE_ENV !== 'production' && !lang) {
    console.warn('useSiteContent called without lang');
  }

  const { settings, socialLinks: contextSocialLinks, content, contentByLocale } = useShop();

  return useMemo(() => {
    const g = settings?.general || {};
    const s = settings?.shipping || {};
    const shippingPageContent = resolveShippingPageContent(
      parseShippingPageContent(g.shipping_page_content ?? s.shipping_page_content),
      lang,
    );

    const socialLinks = normalizeSocialLinksResponse(contextSocialLinks);

    // Pick the active locale's merged content, falling back to en when the
    // AR slice is missing/empty for a key. contentByLocale holds both slices
    // merged with FALLBACK_CONTENT, so every key resolves to a string.
    const activeContent = contentByLocale?.[lang] ?? content;
    const fallbackContent = contentByLocale?.en ?? content;
    const read = (field: string): string => {
      const key = CONTENT_FIELD_TO_KEY[field];
      const val = activeContent[key] ?? fallbackContent[key] ?? '';
      return val;
    };

    return {
      // ── Brand ──
      siteName: read('siteName'),
      metaTitle: g.meta_title || read('siteName'),
      metaDescription: g.meta_description || FE_LITERALS.metaDescription,
      siteDescription: g.site_description || FE_LITERALS.siteDescription,
      siteUrl: g.site_url || FE_LITERALS.siteUrl,
      ogImage: read('ogImage'),

      // ── Announcement ──
      announcementText: read('announcementText'),
      freeShippingThreshold: FE_LITERALS.freeShippingThreshold,
      cartShippingUnlockedText: read('cartShippingUnlockedText'),

      // ── Home Hero ──
      heroHeadline: read('heroHeadline'),
      heroImage: read('heroImage'),
      heroSubtitle: read('heroSubtitle'),
      heroBadge: read('heroBadge'),
      heroDescription: read('heroDescription'),
      heroCta: read('heroCta'),

      // ── Home Sections ──
      trendingTitle: read('trendingTitle'),
      marqueeText: read('marqueeText'),
      promoBadge: read('promoBadge'),
      promoHeadline: read('promoHeadline'),
      promoDescription: read('promoDescription'),
      promoCtaLabel: read('promoCtaLabel'),
      promoImage: read('promoImage'),
      philosophyHeadline: read('philosophyHeadline'),
      philosophyText: read('philosophyText'),
      philosophyCta: read('philosophyCta'),
      philosophyImage: read('philosophyImage'),
      commitmentHeadline: read('commitmentHeadline'),
      commitmentCta: read('commitmentCta'),
      commitmentImage: read('commitmentImage'),
      socialGridHeading: read('socialGridHeading'),
      socialGridCta: read('socialGridCta'),
      socialGridImage1: read('socialGridImage1'),
      socialGridImage2: read('socialGridImage2'),
      socialGridImage3: read('socialGridImage3'),
      socialGridImage4: read('socialGridImage4'),
      productShowcaseLoading: FE_LITERALS.productShowcaseLoading,
      productShowcaseEmpty: read('productShowcaseEmpty'),

      // ── About Page ──
      aboutHeroHeadline: read('aboutHeroHeadline'),
      aboutHeroCta: read('aboutHeroCta'),
      aboutHeroImage: read('aboutHeroImage'),
      aboutIntentionalTitle: read('aboutIntentionalTitle'),
      aboutIntentionalText: read('aboutIntentionalText'),
      aboutFoundationLabel: read('aboutFoundationLabel'),
      aboutFoundationTitle: read('aboutFoundationTitle'),
      aboutFoundationText1: read('aboutFoundationText1'),
      aboutFoundationText2: read('aboutFoundationText2'),
      aboutTeamMember1Name: read('aboutTeamMember1Name'),
      aboutTeamMember1Title: read('aboutTeamMember1Title'),
      aboutTeamMember1Image: read('aboutTeamMember1Image'),
      aboutTeamMember2Name: read('aboutTeamMember2Name'),
      aboutTeamMember2Title: read('aboutTeamMember2Title'),
      aboutTeamMember2Image: read('aboutTeamMember2Image'),
      aboutTeamMember3Name: read('aboutTeamMember3Name'),
      aboutTeamMember3Title: read('aboutTeamMember3Title'),
      aboutTeamMember3Image: read('aboutTeamMember3Image'),
      aboutFounderNoteHeading: read('aboutFounderNoteHeading'),
      aboutFounderLetter: read('aboutFounderLetter'),
      aboutTeamLabel: read('aboutTeamLabel'),
      aboutTeamTitle: read('aboutTeamTitle'),
      aboutTeamDescription: read('aboutTeamDescription'),
      aboutValuesImage: read('aboutValuesImage'),
      aboutFoundationImage: read('aboutFoundationImage'),
      aboutIntentionalImage: read('aboutIntentionalImage'),
      aboutFounderSignatureImage: read('aboutFounderSignatureImage'),

      // ── Shop ──
      shopEmptyAll: read('shopEmptyAll'),
      shopEmptyFiltered: read('shopEmptyFiltered'),
      shopBackToAll: read('shopBackToAll'),
      shopShowMore: read('shopShowMore'),
      shopActiveFilters: read('shopActiveFilters'),
      shopClearAll: read('shopClearAll'),
      shopSortLabel: read('shopSortLabel'),

      // ── Product (aliases for pre-wired components) ──
      productAddToBag: read('productAddToBag'),
      productBuyNow: read('productBuyNow'),
      reviewHydrationLow: FE_LITERALS.reviewHydrationLow,
      reviewHydrationHigh: FE_LITERALS.reviewHydrationHigh,

      // ── Checkout (alias) ──
      checkoutPaymentHeading: read('checkoutPaymentHeading'),
      productSoldOut: read('productSoldOut'),
      productAfterpayText: read('productAfterpayText'),
      productNoReviews: read('productNoReviews'),
      productDetailsFallback: read('productDetailsFallback'),
      productUnavailableHeadline: read('productUnavailableHeadline'),
      productUnavailableDesc: read('productUnavailableDesc'),
      productUnavailableCta: read('productUnavailableCta'),
      productSelectOption: read('productSelectOption'),
      productRatingLabel: read('productRatingLabel'),
      productBuyNowTemplate: read('productBuyNow'),

      // ── Cart ──
      cartEmptyDrawer: read('cartEmptyDrawer'),
      cartContinueShopping: read('cartContinueShopping'),
      cartShippingDisclaimer: read('cartShippingDisclaimer'),
      cartCheckoutLabel: read('cartCheckoutLabel'),
      cartBagLabel: read('cartBagLabel'),
      shippingPageContent,

      // ── Checkout ──
      checkoutHeading: read('checkoutHeading'),
      checkoutShippingHeading: read('checkoutShippingHeading'),
      checkoutPlaceOrder: read('checkoutPlaceOrder'),
      checkoutTaxRate: FE_LITERALS.checkoutTaxRate,
      shippingRates: FE_LITERALS.shippingRates,
      defaultShippingCost: FE_LITERALS.defaultShippingCost,
      checkoutCardLabel: read('checkoutCardLabel'),
      checkoutPaypalLabel: read('checkoutPaypalLabel'),
      checkoutCodLabel: read('checkoutCodLabel'),
      checkoutReviewHeading: read('checkoutReviewHeading'),
      checkoutTermsText: read('checkoutTermsText'),
      checkoutConfirmedHeading: read('checkoutConfirmedHeading'),
      checkoutConfirmedMessage: read('checkoutConfirmedMessage'),
      checkoutNavBack: read('checkoutNavBack'),
      checkoutNavContinue: read('checkoutNavContinue'),
      checkoutSubmittingText: read('checkoutSubmittingText'),
      checkoutBackToShop: read('checkoutBackToShop'),

      // ── Auth ──
      authHeadingLogin: read('authHeadingLogin'),
      authHeadingSignup: read('authHeadingSignup'),
      authHeadingAccount: read('authHeadingAccount'),
      authSignedInAs: read('authSignedInAs'),
      authSignOut: read('authSignOut'),
      authPlaceholderName: read('authPlaceholderName'),
      authPlaceholderEmail: read('authPlaceholderEmail'),
      authPlaceholderPassword: read('authPlaceholderPassword'),
      authPlaceholderPhone: read('authPlaceholderPhone'),
      authSubmitLogin: read('authSubmitLogin'),
      authSubmitSignup: read('authSubmitSignup'),
      authToggleToRegister: read('authToggleToRegister'),
      authToggleToLogin: read('authToggleToLogin'),
      authLoginImage: read('authLoginImage'),
      authLoginTagline: read('authLoginTagline'),

      // ── Search ──
      searchPlaceholder: read('searchPlaceholder'),
      searchDrawerTitle: read('searchDrawerTitle'),
      searchNoResults: read('searchNoResults'),
      searchNoResultsTemplate: read('searchNoResultsTemplate'),
      searchCollectionsHeading: read('searchCollectionsHeading'),
      searchProductsHeading: read('searchProductsHeading'),
      searchBrandsHeading: read('searchBrandsHeading'),
      searchCollectionsUnavailable: read('searchCollectionsUnavailable'),

      // ── Vlog ──
      vlogHeroImage: read('vlogHeroImage'),
      vlogHeroTitle: read('vlogHeroTitle'),

      // ── FAQ ──
      faqHeroImage: read('faqHeroImage'),
      faqHeroTitle: read('faqHeroTitle'),

      // ── Contact ──
      contactHeroImage: read('contactHeroImage'),
      contactHeroHeading: read('contactHeroHeading'),
      contactInfoTitle: read('contactInfoTitle'),
      contactSupportInfo: read('contactSupportInfo'),
      contactSupportHours: read('contactSupportHours'),
      contactEmail: read('contactEmail'),
      contactEmailLabel: read('contactEmailLabel'),
      contactWholesaleEmail: read('contactWholesaleEmail'),
      contactWholesaleLabel: read('contactWholesaleLabel'),
      contactFaqTitle: read('contactFaqTitle'),
      contactFaqText: read('contactFaqText'),
      contactFaqCta: read('contactFaqCta'),

      // ── Store Locator ──
      storeLocatorTagline: read('storeLocatorTagline'),
      storeLocatorMapImage: FE_LITERALS.storeLocatorMapImage,
      storeLocatorNoResults: read('storeLocatorNoResults'),

      // ── Wishlist ──
      wishlistEmpty: read('wishlistEmpty'),
      wishlistEmptySubtext: read('wishlistEmptySubtext'),
      wishlistRecommendationsTitle: read('wishlistRecommendationsTitle'),

      // ── Reviews ──
      reviewVerifiedLabel: read('reviewVerifiedLabel'),
      reviewFilterButton: read('reviewFilterButton'),
      reviewSortRecent: read('reviewSortRecent'),
      reviewShowMore: read('reviewShowMore'),
      reviewShowLess: read('reviewShowLess'),
      reviewHelpfulQuestion: read('reviewHelpfulQuestion'),
      reviewHydrationQuestion: read('reviewHydrationQuestion'),
      reviewWriteButton: read('reviewWriteButton'),
      reviewSortHighest: read('reviewSortHighest'),
      reviewSortLowest: read('reviewSortLowest'),
      reviewSortHelpful: read('reviewSortHelpful'),
      reviewLoadMore: read('reviewLoadMore'),
      reviewFilterStars: read('reviewFilterStars'),

      // ── Social ──
      socialLinks,

      // ── Footer ──
      footerNewsletterText: read('footerNewsletterText'),
      footerNewsletterSubtitle: read('footerNewsletterSubtitle'),
      footerEmailPlaceholder: read('footerEmailPlaceholder'),
      footerSubscribeBtn: read('footerSubscribeBtn'),
      footerPrivacyNotice: read('footerPrivacyNotice'),
      footerCopyright: read('footerCopyright') || `© iCare ${new Date().getFullYear()}`,
      footerCountryRegion: read('footerCountryRegion'),
      footerNavigateTitle: read('footerNavigateTitle'),
      footerSocialTitle: read('footerSocialTitle'),
      footerOfficialTitle: read('footerOfficialTitle'),
      footerSupportTitle: read('footerSupportTitle'),
      footerSupportSubtext: read('footerSupportSubtext'),
      footerCookieLink: read('footerCookieLink'),
      footerLinkShop: read('footerLinkShop'),
      footerLinkStory: read('footerLinkStory'),
      footerLinkVlog: read('footerLinkVlog'),
      footerLinkFindUs: read('footerLinkFindUs'),
      footerLinkPrivacy: read('footerLinkPrivacy'),
      footerLinkTerms: read('footerLinkTerms'),
      footerLinkAccessibility: read('footerLinkAccessibility'),
      footerLinkFaq: read('footerLinkFaq'),
      footerLinkContact: read('footerLinkContact'),

      // ── Features ──
      enableWishlist: FE_LITERALS.enableWishlist,
      enableProductReviews: FE_LITERALS.enableProductReviews,
      enableGuestCheckout: FE_LITERALS.enableGuestCheckout,
      defaultCountry: FE_LITERALS.defaultCountry,
      currencyCode: g.currency_code || FE_LITERALS.currencyCode,
      itemsPerPage: FE_LITERALS.itemsPerPage,
    };
  }, [settings, contextSocialLinks, content, contentByLocale, lang]);
};
