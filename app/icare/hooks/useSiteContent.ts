import { useMemo } from 'react';
import { Language } from '../translations';
import { useShop } from '../context/ShopContext';
import {
  ShippingPageContent,
  ShippingPageContentByLanguage,
} from '../types';
import { parseShippingPageContent } from '../lib/settings';
import { normalizeSocialLinksResponse } from '../lib/social-links';

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

const resolveSetting = (...values: Array<string | undefined>) => values.find((value) => typeof value === 'string' && value.trim().length > 0);

const parseSettingNumber = (value: string | undefined) => Number(value);

const mergeArray = <T,>(value: T[] | undefined, fallback: T[]) => (
  fallback.map((entry, index) => (value?.[index] ?? entry))
);

const resolveShippingPageContent = (
  content: ShippingPageContentByLanguage | null,
  lang: Language,
): ShippingPageContent => {
  const fallback = EMPTY_SHIPPING_PAGE_CONTENT;
  const overrides: Partial<ShippingPageContent> = content?.[lang] ?? content?.en ?? content?.ar ?? {};

  return {
    ...fallback,
    ...overrides,
    returnSteps: mergeArray(overrides.returnSteps, fallback.returnSteps),
    conditions: mergeArray(overrides.conditions, fallback.conditions),
    faqs: mergeArray(overrides.faqs, fallback.faqs),
  };
};

export const useSiteContent = (lang: Language = 'en') => {
  const { settings, socialLinks: contextSocialLinks } = useShop();

  return useMemo(() => {
    const g = settings?.general || {};
    const c = settings?.contact || {};
    const f = settings?.footer || {};
    const s = settings?.shipping || {};
    const shippingPageContent = resolveShippingPageContent(
      parseShippingPageContent(resolveSetting(s.shipping_page_content, g.shipping_page_content)),
      lang,
    );

    // Compute social links directly from dedicated context state (no fallbacks)
    const socialLinks = normalizeSocialLinksResponse(contextSocialLinks);

    return {
      // ── Brand ──
      siteName: g.site_name,
      metaTitle: g.meta_title || g.site_name,
      metaDescription: g.meta_description || g.site_description,
      siteDescription: g.site_description,
      siteUrl: g.site_url,
      ogImage: g.og_image,

      // ── Announcement ──
      announcementText: resolveSetting(s.announcement_text, g.announcement_text) ?? '',
      freeShippingThreshold: parseSettingNumber(resolveSetting(s.free_shipping_threshold, g.free_shipping_threshold)),
      cartShippingUnlockedText: resolveSetting(s.free_shipping_unlocked_text, g.free_shipping_unlocked_text) ?? '',

      // ── Home Hero ──
      heroHeadline: g.home_hero_headline,
      heroImage: g.home_hero_image,

      // ── Home Sections ──
      trendingTitle: g.home_trending_title,
      marqueeText: g.home_marquee_text,
      promoBadge: g.home_promo_badge,
      promoHeadline: g.home_promo_headline,
      promoDescription: g.home_promo_description,
      promoCtaLabel: g.home_promo_cta_label,
      promoImage: g.home_promo_image,
      philosophyHeadline: g.home_philosophy_headline,
      philosophyText: g.home_philosophy_text,
      philosophyCta: g.home_philosophy_cta,
      philosophyImage: g.home_philosophy_image,
      commitmentHeadline: g.home_commitment_headline,
      commitmentCta: g.home_commitment_cta,
      commitmentImage: g.home_commitment_image,
      socialGridHeading: g.home_social_grid_heading,
      socialGridCta: g.home_social_grid_cta,
      socialGridImage1: g.home_social_grid_image_1,
      socialGridImage2: g.home_social_grid_image_2,
      socialGridImage3: g.home_social_grid_image_3,
      socialGridImage4: g.home_social_grid_image_4,
      productShowcaseLoading: g.product_showcase_loading,
      productShowcaseEmpty: g.product_showcase_empty,

      // ── About Page ──
      aboutHeroHeadline: g.about_hero_headline,
      aboutHeroCta: g.about_hero_cta,
      aboutHeroImage: g.about_hero_image,
      aboutIntentionalTitle: g.home_intentional_title,
      aboutIntentionalText: g.home_intentional_text,
      aboutFoundationLabel: g.home_foundation_label,
      aboutFoundationTitle: g.home_foundation_title,
      aboutFoundationText1: g.home_foundation_text_1,
      aboutFoundationText2: g.home_foundation_text_2,
      aboutTeamMember1Name: g.about_team_member_1_name,
      aboutTeamMember1Title: g.about_team_member_1_title,
      aboutTeamMember1Image: g.about_team_member_1_image,
      aboutTeamMember2Name: g.about_team_member_2_name,
      aboutTeamMember2Title: g.about_team_member_2_title,
      aboutTeamMember2Image: g.about_team_member_2_image,
      aboutTeamMember3Name: g.about_team_member_3_name,
      aboutTeamMember3Title: g.about_team_member_3_title,
      aboutTeamMember3Image: g.about_team_member_3_image,
      aboutFounderNoteHeading: g.home_founder_note_heading,
      aboutFounderLetter: g.home_founder_letter,
      aboutTeamLabel: g.home_team_label,
      aboutTeamTitle: g.home_team_title,
      aboutTeamDescription: g.home_team_description,
      aboutValuesImage: g.about_values_image,
      aboutFoundationImage: g.about_foundation_image,
      aboutIntentionalImage: g.about_intentional_image,
      aboutFounderSignatureImage: g.about_founder_signature_image,

      // ── Shop ──
      shopEmptyAll: g.shop_empty_all,
      shopEmptyFiltered: g.shop_empty_filtered,
      shopBackToAll: g.shop_back_to_all,
      shopShowMore: g.shop_show_more,
      shopActiveFilters: g.shop_active_filters,
      shopClearAll: g.shop_clear_all,
      shopSortLabel: g.shop_sort_label,

      // ── Product (aliases for pre-wired components) ──
      productAddToBag: g.product_add_to_bag,
      productBuyNow: g.product_buy_now,
      reviewHydrationLow: 'Not very hydrated',
      reviewHydrationHigh: 'Super hydrated',

      // ── Checkout (alias) ──
      checkoutPaymentHeading: g.checkout_payment_heading,
      productSoldOut: g.product_sold_out,
      productAfterpayText: g.product_afterpay_text,
      productNoReviews: g.product_no_reviews,
      productDetailsFallback: g.product_details_fallback,
      productUnavailableHeadline: g.product_unavailable_headline,
      productUnavailableDesc: g.product_unavailable_desc,
      productUnavailableCta: g.product_unavailable_cta,
      productSelectOption: g.product_select_option,
      productRatingLabel: g.product_rating_label,
      productBuyNowTemplate: g.product_buy_now,

      // ── Cart ──
      cartEmptyDrawer: g.cart_drawer_empty,
      cartContinueShopping: g.cart_continue_shopping,
      cartShippingDisclaimer: resolveSetting(s.cart_shipping_disclaimer, g.cart_shipping_disclaimer) ?? '',
      cartCheckoutLabel: g.cart_checkout_label,
      cartBagLabel: g.cart_bag_label,
      shippingPageContent,

      // ── Checkout ──
      checkoutHeading: g.checkout_heading,
      checkoutShippingHeading: g.checkout_shipping_heading,
      checkoutPlaceOrder: g.checkout_place_order,
      checkoutTaxRate: Number(g.tax_rate ?? '0'),
      shippingRates: g.shipping_rates ?? '[]',
      defaultShippingCost: parseSettingNumber(resolveSetting(s.default_shipping_cost, g.default_shipping_cost)),
      checkoutCardLabel: g.checkout_card_label,
      checkoutPaypalLabel: g.checkout_paypal_label,
      checkoutCodLabel: g.checkout_cod_label,
      checkoutReviewHeading: g.checkout_review_heading,
      checkoutTermsText: g.checkout_terms_text,
      checkoutConfirmedHeading: g.checkout_confirmed_heading,
      checkoutConfirmedMessage: g.checkout_confirmed_message,
      checkoutNavBack: g.checkout_nav_back,
      checkoutNavContinue: g.checkout_nav_continue,
      checkoutSubmittingText: g.checkout_submitting_text,
      checkoutBackToShop: g.checkout_back_to_shop,

      // ── Auth ──
      authHeadingLogin: g.auth_heading_login,
      authHeadingSignup: g.auth_heading_signup,
      authHeadingAccount: g.auth_heading_account,
      authSignedInAs: g.auth_signed_in_as,
      authSignOut: g.auth_sign_out,
      authPlaceholderName: g.auth_placeholder_name,
      authPlaceholderEmail: g.auth_placeholder_email,
      authPlaceholderPassword: g.auth_placeholder_password,
      authPlaceholderPhone: g.auth_placeholder_phone,
      authSubmitLogin: g.auth_submit_login,
      authSubmitSignup: g.auth_submit_signup,
      authToggleToRegister: g.auth_toggle_to_register,
      authToggleToLogin: g.auth_toggle_to_login,
      authLoginImage: g.auth_login_image,
      authLoginTagline: g.auth_login_tagline,

      // ── Search ──
      searchPlaceholder: g.search_placeholder,
      searchDrawerTitle: g.search_drawer_title,
      searchNoResults: g.search_no_results,
      searchNoResultsTemplate: g.search_no_results,
      searchCollectionsHeading: g.search_collections_heading,
      searchProductsHeading: g.search_products_heading,
      searchBrandsHeading: g.search_brands_heading,
      searchCollectionsUnavailable: g.search_collections_unavailable,

      // ── Vlog ──
      vlogHeroImage: g.vlog_hero_image,
      vlogHeroTitle: g.vlog_hero_title,

      // ── FAQ ──
      faqHeroImage: g.faq_hero_image,
      faqHeroTitle: g.faq_hero_title,

      // ── Contact ──
      contactHeroImage: g.contact_hero_image,
      contactHeroHeading: c.contact_hero_heading,
      contactInfoTitle: c.contact_info_title,
      contactSupportInfo: c.contact_support_info,
      contactSupportHours: c.support_hours,
      contactEmail: c.contact_email,
      contactEmailLabel: c.contact_email_label,
      contactWholesaleEmail: c.contact_wholesale_email,
      contactWholesaleLabel: c.contact_wholesale_label,
      contactFaqTitle: c.contact_faq_title,
      contactFaqText: c.contact_faq_text,
      contactFaqCta: c.contact_faq_cta,

      // ── Store Locator ──
      storeLocatorTagline: g.store_locator_tagline,
      storeLocatorMapImage: g.store_locator_map_image,
      storeLocatorNoResults: g.store_locator_no_results,

      // ── Wishlist ──
      wishlistEmpty: g.wishlist_empty,
      wishlistEmptySubtext: g.wishlist_empty_subtext,
      wishlistRecommendationsTitle: g.wishlist_recommendations_title,

      // ── Reviews ──
      reviewVerifiedLabel: g.review_verified_label,
      reviewFilterButton: g.review_filter_button,
      reviewSortRecent: g.review_sort_recent,
      reviewShowMore: g.review_show_more,
      reviewShowLess: g.review_show_less,
      reviewHelpfulQuestion: g.review_helpful_question,
      reviewHydrationQuestion: g.review_hydration_question,
      reviewWriteButton: g.review_write_button,
      reviewSortHighest: g.review_sort_highest,
      reviewSortLowest: g.review_sort_lowest,
      reviewSortHelpful: g.review_sort_helpful,
      reviewLoadMore: g.review_load_more,
      reviewFilterStars: g.review_filter_stars,

      // ── Social ──
      socialLinks: socialLinks,

      // ── Footer ──
      footerNewsletterText: f.newsletter_text,
      footerNewsletterSubtitle: f.newsletter_subtitle,
      footerEmailPlaceholder: f.email_placeholder,
      footerSubscribeBtn: f.subscribe_btn,
      footerPrivacyNotice: f.privacy_notice,
      footerCopyright: f.copyright_text || `© iCare ${new Date().getFullYear()}`,
      footerCountryRegion: f.country_region,
      footerNavigateTitle: f.columns_title_navigate,
      footerSocialTitle: f.columns_title_social,
      footerOfficialTitle: f.columns_title_official,
      footerSupportTitle: f.columns_title_support,
      footerSupportSubtext: f.support_subtext,
      footerCookieLink: f.cookie_link,
      footerLinkShop: f.link_shop,
      footerLinkStory: f.link_story,
      footerLinkVlog: f.link_vlog,
      footerLinkFindUs: f.link_find_us,
      footerLinkPrivacy: f.link_privacy,
      footerLinkTerms: f.link_terms,
      footerLinkAccessibility: f.link_accessibility,
      footerLinkFaq: f.link_faq,
      footerLinkContact: f.link_contact,

      // ── Features ──
      enableWishlist: g.enable_wishlist !== 'false',
      enableProductReviews: g.enable_product_reviews !== 'false',
      enableGuestCheckout: g.enable_guest_checkout !== 'false',
      defaultCountry: g.default_country,
      currencyCode: g.currency_code && g.currency_code !== 'NaN' ? g.currency_code : 'USD',
      itemsPerPage: Number(g.items_per_page ?? '12'),
    };
  }, [settings, contextSocialLinks, lang]);
};
