import { useMemo } from 'react';
import { useShop } from '../context/ShopContext';
import { normalizeSocialPlatform } from '../lib/social-links';

export const useSiteContent = () => {
  const { settings, socialLinks: contextSocialLinks } = useShop();

  return useMemo(() => {
    const g = settings?.general || {};
    const c = settings?.contact || {};
    const f = settings?.footer || {};

    // Compute social links directly from dedicated context state (no fallbacks)
    const socialLinks = Object.entries(contextSocialLinks || {})
      .filter(([, url]) => url && url !== '#' && url !== '')
      .map(([platform, url]) => ({
        platform: normalizeSocialPlatform(platform),
        url: url as string,
      }));

    return {
      // ── Brand ──
      siteName: g.site_name || 'iCare Beauty',
      siteTagline: g.site_tagline || 'A NEW ERA OF COZINESS',
      metaTitle: g.meta_title || g.site_name || 'iCare Beauty',
      metaDescription: g.meta_description || g.site_description || 'iCare Beauty skincare essentials.',
      siteDescription: g.site_description || 'iCare Beauty skincare essentials.',
      siteUrl: g.site_url || '',
      ogImage: g.og_image || '',

      // ── Announcement ──
      announcementText: g.announcement_text || 'FREE US SHIPPING ON ORDERS OVER $45',
      freeShippingThreshold: Number(g.free_shipping_threshold || '45'),

      // ── Home Hero ──
      heroHeadline: g.home_hero_headline || 'the barrier butter.',
      heroSubtitle: g.home_hero_subtitle || 'A NEW ERA OF COZINESS',
      heroBadge: g.home_hero_badge || 'LIMITED EDITION',
      heroDescription: g.home_hero_description || 'The intensive moisture balm your skin deserves.',
      heroImage: g.home_hero_image || 'https://images.unsplash.com/photo-1593231945511-9e141a85b017?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiZWF1dGlmdWwlMjBjYXVjYXNpYW4lMjB3b21hbiUyMHNraW5jYXJlJTIwYWVzdGhldGljJTIwY3JlYW0lMjBiYWNrZ3JvdW5kJTIwbWluaW1hbHxlbnwxfHx8fDE3Njk3MDk2Njl8MA&ixlib=rb-4.1.0&q=80&w=1600',
      heroCta: g.home_hero_cta || 'SHOP NOW',

      // ── Home Sections ──
      trendingTitle: g.home_trending_title || 'trending essentials',
      marqueeText: g.home_marquee_text || 'Free shipping on orders over $45 • Cruelty-Free • Dermatologist Tested • Vegan • High Performance Skincare •',
      promoBadge: g.home_promo_badge || 'New Arrival',
      promoHeadline: g.home_promo_headline || 'chilly little flush',
      promoDescription: g.home_promo_description || 'Warm up your cheeks with Pocket Blush. A touch of creamy, long-wearing color that mimics the flush you get after stepping in from the cold.',
      promoCtaLabel: g.home_promo_cta_label || 'POCKET BLUSH',
      promoImage: g.home_promo_image || 'https://images.unsplash.com/photo-1653784097013-786a8965ea3b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200',
      philosophyHeadline: g.home_philosophy_headline || 'one of everything really good',
      philosophyText: g.home_philosophy_text || 'At icare, our philosophy is to make one of everything really good. To us, that means a collection of intentional, high-performance essentials you reach for everyday. The ones you love, rely on, and always come back to for ultimate barrier nourishment, tint, and glow.',
      philosophyCta: g.home_philosophy_cta || 'SHOP ICARE',
      philosophyImage: g.home_philosophy_image || 'https://images.unsplash.com/photo-1638609927040-8a7e97cd9d6a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1920',
      commitmentHeadline: g.home_commitment_headline || '',
      commitmentCta: g.home_commitment_cta || 'OUR FOOTPRINT',
      commitmentImage: g.home_commitment_image || 'https://images.unsplash.com/photo-1603189777895-1dcbe39ec57e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200',
      socialGridHeading: g.home_social_grid_heading || 'icare + you',
      socialGridCta: g.home_social_grid_cta || 'FIND US ON SOCIAL',
      socialGridImage1: g.home_social_grid_image_1 || 'https://images.unsplash.com/photo-1679517354322-20fe85050b9d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
      socialGridImage2: g.home_social_grid_image_2 || 'https://images.unsplash.com/photo-1739980737820-b6bb1a9b8456?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
      socialGridImage3: g.home_social_grid_image_3 || 'https://images.unsplash.com/photo-1635631414456-6a9dc5051a3d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
      socialGridImage4: g.home_social_grid_image_4 || 'https://images.unsplash.com/photo-1627384113972-f4c0392fe5aa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
      productShowcaseLoading: g.product_showcase_loading || 'loading featured products',
      productShowcaseEmpty: g.product_showcase_empty || 'no featured products are available yet',

      // ── About Page ──
      aboutHeroHeadline: g.about_hero_headline || 'A new PHILOSOPHY on SKINCARE.',
      aboutHeroCta: g.about_hero_cta || 'SHOP NOW',
      aboutHeroImage: g.about_hero_image || '',
      aboutIntentionalTitle: g.home_intentional_title || 'intentional skincare',
      aboutIntentionalText: g.home_intentional_text || 'icare is a line of curated skincare essentials.',
      aboutFoundationLabel: g.home_foundation_label || 'The Foundation',
      aboutFoundationTitle: g.home_foundation_title || 'one of everything really good.',
      aboutFoundationText1: g.home_foundation_text_1 || 'Founded on the belief that beauty is about essentials.',
      aboutFoundationText2: g.home_foundation_text_2 || 'Every icare product is developed with intent.',
      aboutTeamMember1Name: g.about_team_member_1_name || 'sarah jenkins',
      aboutTeamMember1Title: g.about_team_member_1_title || 'creative director',
      aboutTeamMember1Image: g.about_team_member_1_image || '',
      aboutTeamMember2Name: g.about_team_member_2_name || 'dr. amira fahad',
      aboutTeamMember2Title: g.about_team_member_2_title || 'lead dermatologist',
      aboutTeamMember2Image: g.about_team_member_2_image || '',
      aboutTeamMember3Name: g.about_team_member_3_name || 'elena rodriguez',
      aboutTeamMember3Title: g.about_team_member_3_title || 'product development',
      aboutTeamMember3Image: g.about_team_member_3_image || '',
      aboutFounderNoteHeading: g.home_founder_note_heading || 'A NOTE FROM OUR FOUNDER',
      aboutFounderLetter: g.home_founder_letter || 'My journey towards healthier skin inspired me.',
      aboutTeamLabel: g.home_team_label || 'Meet the team',
      aboutTeamTitle: g.home_team_title || 'our crew.',
      aboutTeamDescription: g.home_team_description || 'A diverse group of experts.',
      aboutValuesImage: g.about_values_image || '',
      aboutFoundationImage: g.about_foundation_image || '',
      aboutIntentionalImage: g.about_intentional_image || '',
      aboutFounderSignatureImage: g.about_founder_signature_image || '',

      // ── Shop ──
      shopHeroImage: g.shop_hero_image || '',
      shopEmptyAll: g.shop_empty_all || 'No products are available yet.',
      shopEmptyFiltered: g.shop_empty_filtered || 'No products found in this selection.',
      shopBackToAll: g.shop_back_to_all || 'back to all products',
      shopShowMore: g.shop_show_more || 'show more',
      shopActiveFilters: g.shop_active_filters || 'active filters:',
      shopClearAll: g.shop_clear_all || 'clear all',
      shopSortLabel: g.shop_sort_label || 'sort:',

      // ── Product (aliases for pre-wired components) ──
      productAddToBag: (g.product_add_to_bag || 'add to bag'),
      productBuyNow: (g.product_buy_now || 'BUY NOW'),
      reviewHydrationLow: 'Not very hydrated',
      reviewHydrationHigh: 'Super hydrated',

      // ── Search (alias) ──
      searchNoResults: (g.search_no_results || 'No results found'),

      // ── Checkout (alias) ──
      checkoutPaymentHeading: (g.checkout_payment_heading || 'Payment Method'),
      productSoldOut: g.product_sold_out || 'sold out',
      productAfterpayText: g.product_afterpay_text || 'or 4 interest-free payments with Afterpay',
      productNoReviews: g.product_no_reviews || 'No reviews yet',
      productDetailsFallback: g.product_details_fallback || 'Product details are unavailable from the backend.',
      productUnavailableHeadline: g.product_unavailable_headline || 'We could not find this iCare product.',
      productUnavailableDesc: g.product_unavailable_desc || 'It may have been removed, unpublished, or temporarily unavailable.',
      productUnavailableCta: g.product_unavailable_cta || 'back to shop',
      productQuickAdd: g.product_quick_add || 'Quick Add',
      productDefaultImage: g.default_product_image || '',
      productSelectOption: g.product_select_option || 'select option:',
      productRatingLabel: g.product_rating_label || 'AVERAGE RATING',
      productBuyNowTemplate: g.product_buy_now || 'BUY NOW',

      // ── Cart ──
      cartEmpty: g.cart_empty || 'Your bag is empty',
      cartEmptyDrawer: g.cart_drawer_empty || 'Your bag is currently empty.',
      cartContinueShopping: g.cart_continue_shopping || 'Continue Shopping',
      cartShippingDisclaimer: g.cart_shipping_disclaimer || 'Shipping & taxes calculated at checkout',
      cartCheckoutLabel: g.cart_checkout_label || 'Checkout',
      cartBagLabel: g.cart_bag_label || 'YOUR BAG',

      // ── Checkout ──
      checkoutHeading: g.checkout_heading || 'CHECKOUT',
      checkoutShippingHeading: g.checkout_shipping_heading || 'Shipping Information',
      checkoutPlaceOrder: g.checkout_place_order || 'PLACE ORDER',
      checkoutTaxRate: Number(g.tax_rate || '0'),
      shippingRates: g.shipping_rates || '[]',
      defaultShippingCost: Number(g.default_shipping_cost || '0'),
      checkoutCardLabel: g.checkout_card_label || 'Credit / Debit Card',
      checkoutPaypalLabel: g.checkout_paypal_label || 'PayPal',
      checkoutCodLabel: g.checkout_cod_label || 'Cash on Delivery',
      checkoutReviewHeading: g.checkout_review_heading || 'Review Your Order',
      checkoutTermsText: g.checkout_terms_text || "By clicking 'Place Order', you agree to our terms and conditions.",
      checkoutConfirmedHeading: g.checkout_confirmed_heading || 'Order Confirmed!',
      checkoutConfirmedMessage: g.checkout_confirmed_message || 'Thank you for your purchase.',
      checkoutNavBack: g.checkout_nav_back || 'Back',
      checkoutNavContinue: g.checkout_nav_continue || 'Continue',
      checkoutSubmittingText: g.checkout_submitting_text || 'Placing order...',
      checkoutBackToShop: g.checkout_back_to_shop || 'Back to Shop',

      // ── Auth ──
      authHeadingLogin: g.auth_heading_login || 'Login',
      authHeadingSignup: g.auth_heading_signup || 'Sign up',
      authHeadingAccount: g.auth_heading_account || 'Account',
      authSignedInAs: g.auth_signed_in_as || 'signed in as',
      authSignOut: g.auth_sign_out || 'SIGN OUT',
      authPlaceholderName: g.auth_placeholder_name || 'Name',
      authPlaceholderEmail: g.auth_placeholder_email || 'Email',
      authPlaceholderPassword: g.auth_placeholder_password || 'Password',
      authPlaceholderPhone: g.auth_placeholder_phone || 'Phone (optional)',
      authSubmitLogin: g.auth_submit_login || 'SIGN IN',
      authSubmitSignup: g.auth_submit_signup || 'CREATE ACCOUNT',
      authForgotPassword: g.auth_forgot_password || 'Forgot your password?',
      authToggleToRegister: g.auth_toggle_to_register || "Don't have an account? Sign up!",
      authToggleToLogin: g.auth_toggle_to_login || 'Already have an account? Sign in!',
      authLoginImage: g.auth_login_image || '',
      authLoginTagline: g.auth_login_tagline || "It's time to invest in your SKIN.",

      // ── Search ──
      searchPlaceholder: g.search_placeholder || 'Type here',
      searchDrawerTitle: g.search_drawer_title || 'search',
      searchNoResultsTemplate: g.search_no_results || 'No results found',
      searchCollectionsHeading: g.search_collections_heading || 'Collections',
      searchProductsHeading: g.search_products_heading || 'Products',
      searchBrandsHeading: g.search_brands_heading || 'Brands',
      searchCollectionsUnavailable: g.search_collections_unavailable || 'collections unavailable',

      // ── FAQ ──
      faqHeroImage: g.faq_hero_image || '',
      faqLoading: g.faq_loading || 'Loading FAQ...',
      faqUnavailable: g.faq_unavailable || 'FAQ unavailable',
      faqEmptyHeading: g.faq_empty_heading || 'FAQ unavailable',
      faqEmptyDescription: g.faq_empty_description || 'Questions will appear here when the backend provides them.',

      // ── Vlog ──
      vlogHeroImage: g.vlog_hero_image || '',
      vlogHeroTitle: g.vlog_hero_title || 'PRODUCT STORIES',
      vlogFilterLabel: g.vlog_filter_label || 'FILTER BY:',
      vlogLoading: g.vlog_loading || 'Loading stories...',
      vlogEmptyHeading: g.vlog_empty_heading || 'Vlog content unavailable',
      vlogEmptyDescription: g.vlog_empty_description || 'Product media will appear here when the backend provides it.',

      // ── Contact ──
      contactHeroImage: g.contact_hero_image || '',
      contactHeroHeading: c.contact_hero_heading || 'get in touch',
      contactInfoTitle: c.contact_info_title || "we're here to help.",
      contactSupportInfo: c.contact_support_info || 'Our team is available M-F 9am-5pm PT.',
      contactSupportHours: c.support_hours || "We're here M-F 9am - 5pm PST.",
      contactEmail: c.contact_email || 'hello@icare.com',
      contactEmailLabel: c.contact_email_label || 'email',
      contactWholesaleEmail: c.contact_wholesale_email || 'wholesale@icare.com',
      contactWholesaleLabel: c.contact_wholesale_label || 'wholesale',
      contactFaqTitle: c.contact_faq_title || 'frequently asked questions',
      contactFaqText: c.contact_faq_text || 'Chances are, your question has been answered.',
      contactFaqCta: c.contact_faq_cta || 'visit faq',
      contactFormNameLabel: c.contact_form_name_label || 'Full Name',
      contactFormEmailLabel: c.contact_form_email_label || 'Email',
      contactFormTopicLabel: c.contact_form_topic_label || "What's on your mind?",
      contactFormTopicPlaceholder: c.contact_form_topic_placeholder || 'Select a topic',
      contactFormOptionOrder: c.contact_form_option_order || 'Order Status',
      contactFormOptionProduct: c.contact_form_option_product || 'Product Inquiry',
      contactFormOptionPress: c.contact_form_option_press || 'Press & Media',
      contactFormMessageLabel: c.contact_form_message_label || 'Message',
      contactFormSubmit: c.contact_form_submit || 'send inquiry',

      // ── Store Locator ──
      storeLocatorTagline: g.store_locator_tagline || 'find icare near you',
      storeLocatorMapImage: g.store_locator_map_image || '',
      storeLocatorNoResults: g.store_locator_no_results || 'no locations found in this area.',

      // ── Wishlist ──
      wishlistEmpty: g.wishlist_empty || 'Your wishlist is empty',
      wishlistEmptySubtext: g.wishlist_empty_subtext || 'Start adding products you love.',
      wishlistRecommendationsTitle: g.wishlist_recommendations_title || 'You Might Also Like',

      // ── Reviews ──
      reviewVerifiedLabel: g.review_verified_label || 'Verified Buyer',
      reviewDefaultName: g.review_default_name || 'Verified customer',
      reviewFilterButton: g.review_filter_button || 'FILTERS',
      reviewSortRecent: g.review_sort_recent || 'MOST RECENT',
      reviewShowMore: g.review_show_more || 'SHOW MORE',
      reviewShowLess: g.review_show_less || 'SHOW LESS',
      reviewHelpfulQuestion: g.review_helpful_question || 'Was this helpful?',
      reviewHydrationQuestion: g.review_hydration_question || 'How hydrated did your skin feel?',

      // ── Misc ──
      shippingStandardTime: g.shipping_standard_time || '5-7 business days',
      shippingExpressTime: g.shipping_express_time || '2-3 days',
      returnPolicyDays: g.return_policy_days || '30 days',

      // ── Social ──
      socialLinks: socialLinks,

      // ── Footer ──
      footerNewsletterText: f.newsletter_text || 'Join us on the icare to an effortless glow.',
      footerNewsletterSubtitle: f.newsletter_subtitle || 'Glaze your inbox with tips, tricks & exclusive content.',
      footerEmailPlaceholder: f.email_placeholder || 'Email Address',
      footerSubscribeBtn: f.subscribe_btn || 'SUBSCRIBE',
      footerPrivacyNotice: f.privacy_notice || 'By signing up, you agree to our Privacy Policy*.',
      footerCopyright: f.copyright_text || `© iCare ${new Date().getFullYear()}`,
      footerCountryRegion: f.country_region || 'Country/Region: Saudi Arabia (SAR ﷼)',
      footerNavigateTitle: f.columns_title_navigate || 'NAVIGATE',
      footerSocialTitle: f.columns_title_social || 'SOCIAL',
      footerOfficialTitle: f.columns_title_official || 'OFFICIAL',
      footerSupportTitle: f.columns_title_support || 'SUPPORT',
      footerSupportSubtext: f.support_subtext || 'Drop us a note anytime.',
      footerDnsLink: f.dns_link || 'Do Not Sell or Share My Personal Information',
      footerCookieLink: f.cookie_link || 'Cookie Preferences',
      footerLinkShop: f.link_shop || 'Shop',
      footerLinkStory: f.link_story || 'Our Story',
      footerLinkVlog: f.link_vlog || 'Vlog',
      footerLinkFindUs: f.link_find_us || 'Where to Find Us',
      footerLinkPrivacy: f.link_privacy || 'Privacy',
      footerLinkTerms: f.link_terms || 'Terms',
      footerLinkAccessibility: f.link_accessibility || 'Accessibility',
      footerLinkFaq: f.link_faq || 'FAQ',
      footerLinkContact: f.link_contact || 'Contact',

      // ── Features ──
      enableWishlist: g.enable_wishlist !== 'false',
      enableProductReviews: g.enable_product_reviews !== 'false',
      enableGuestCheckout: g.enable_guest_checkout !== 'false',
      defaultCountry: g.default_country || 'Egypt',
      currencyCode: g.currency_code || 'USD',
      itemsPerPage: Number(g.items_per_page || '12'),
    };
  }, [settings]);
};
