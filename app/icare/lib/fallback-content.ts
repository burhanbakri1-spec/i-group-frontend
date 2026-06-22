/**
 * fallback-content.ts — Offline-first mirror of the BE SettingsService defaults.
 *
 * The backend (e-commerce-backend) ships a settings registry
 * (SettingsService → PUBLIC_DEFAULTS + GENERAL_SAFE_KEYS) that exposes
 * ~120 keys in the `general` group, plus keys in `footer`, `contact`,
 * and `shipping` groups. When the admin hasn't overridden a key, BE
 * returns its registered default value.
 *
 * Key naming matches BE convention: snake_case (`home_hero_headline`).
 * Image values are absolute URLs — the FE passes them to
 * `<img src>` unchanged. Text values are the English defaults.
 *
 * Source of truth: e-commerce-backend/src/modules/settings/settings.service.ts
 *
 * Adding a new key here AND in the BE registry keeps both layers in sync.
 */

export const FALLBACK_CONTENT = {
  // ── Marketing / brand ──
  site_name: 'iCare Beauty',
  og_image:
    'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=400',
  announcement_text: 'FREE SHIPPING AVAILABLE',
  store_locator_tagline: 'find icare near you',
  store_locator_no_results: 'no locations found in this area.',

  // ── Home hero ──
  home_hero_headline: 'the barrier butter.',
  home_hero_image:
    'https://images.unsplash.com/photo-1593231945511-9e141a85b017?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1600',
  home_hero_subtitle: '',
  home_hero_badge: '',
  home_hero_description: '',
  home_hero_cta: 'SHOP NOW',

  // ── Home sections ──
  home_trending_title: 'trending essentials',
  home_marquee_text:
    'Free shipping available • Cruelty-Free • Dermatologist Tested • Vegan • High Performance Skincare •',
  product_showcase_empty: 'no featured products are available yet',

  // ── Commitment section ──
  home_commitment_headline:
    "From consciously-sourced ingredients to packaging made with post-consumer recycled materials, we're committed to MINDFUL SKINCARE.",
  home_commitment_cta: 'OUR FOOTPRINT',
  home_commitment_image:
    'https://images.unsplash.com/photo-1603189777895-1dcbe39ec57e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200',

  // ── Promo ──
  home_promo_badge: 'New Arrival',
  home_promo_headline: 'chilly little flush',
  home_promo_description:
    'Warm up your cheeks with Pocket Blush. A touch of creamy, long-wearing color that mimics the flush you get after stepping in from the cold.',
  home_promo_cta_label: 'POCKET BLUSH',
  home_promo_image:
    'https://images.unsplash.com/photo-1653784097013-786a8965ea3b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200',

  // ── Philosophy ──
  home_philosophy_headline: 'one of everything really good',
  home_philosophy_text:
    'At icare, our philosophy is to make one of everything really good. To us, that means a collection of intentional, high-performance essentials you reach for everyday. The ones you love, rely on, and always come back to for ultimate barrier nourishment, tint, and glow.',
  home_philosophy_cta: 'SHOP ICARE',
  home_philosophy_image:
    'https://images.unsplash.com/photo-1638609927040-8a7e97cd9d6a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1920',

  // ── Social grid ──
  home_social_grid_heading: 'icare + you',
  home_social_grid_cta: 'FIND US ON SOCIAL',
  home_social_grid_image_1:
    'https://images.unsplash.com/photo-1679517354322-20fe85050b9d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
  home_social_grid_image_2:
    'https://images.unsplash.com/photo-1739980737820-b6bb1a9b8456?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
  home_social_grid_image_3:
    'https://images.unsplash.com/photo-1635631414456-6a9dc5051a3d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
  home_social_grid_image_4:
    'https://images.unsplash.com/photo-1627384113972-f4c0392fe5aa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',

  // ── About ──
  about_hero_headline: 'A new PHILOSOPHY on SKINCARE.',
  about_hero_cta: 'SHOP NOW',
  about_hero_image:
    'https://images.unsplash.com/photo-1713425886063-4a49da507ada?q=80&w=2000',
  home_intentional_title: 'intentional skincare',
  home_intentional_text: 'icare is a line of curated skincare essentials.',
  home_intentional_image:
    'https://images.unsplash.com/photo-1644011047934-b00d5aa404d4?q=80&w=1200',
  home_foundation_label: 'The Foundation',
  home_foundation_title: 'one of everything really good.',
  home_foundation_text_1:
    'Founded on the belief that beauty is about essentials.',
  home_foundation_text_2:
    'Every icare product is developed with intent.',
  home_foundation_image:
    'https://images.unsplash.com/photo-1638609927040-8a7e97cd9d6a?q=80&w=1200',
  about_values_image:
    'https://images.unsplash.com/photo-1642080668102-dc8f5ce8e752?q=80&w=1200',
  home_team_label: 'Meet the team',
  home_team_title: 'our crew.',
  home_team_description: 'A diverse group of experts.',
  about_team_member_1_name: 'sarah jenkins',
  about_team_member_1_title: 'creative director',
  about_team_member_1_image:
    'https://images.unsplash.com/photo-1702261347927-11207f77e751?q=80&w=800',
  about_team_member_2_name: 'dr. amira fahad',
  about_team_member_2_title: 'lead dermatologist',
  about_team_member_2_image:
    'https://images.unsplash.com/photo-1763692108454-6cfa2b0af5c1?q=80&w=800',
  about_team_member_3_name: 'elena rodriguez',
  about_team_member_3_title: 'product development',
  about_team_member_3_image:
    'https://images.unsplash.com/photo-1631214565164-dd0b7fba0295?q=80&w=800',
  home_founder_note_heading: 'A NOTE FROM OUR FOUNDER',
  home_founder_letter:
    'My journey towards healthier skin inspired me.',
  about_founder_signature_image:
    'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=800',

  // ── Auth ──
  auth_login_image:
    'https://images.unsplash.com/photo-1729952620303-4dc47fb5d93a?q=80&w=1200&auto=format&fit=crop',
  auth_login_tagline: "It's time to invest in your SKIN.",
  auth_heading_login: 'Login',
  auth_heading_signup: 'Sign up',
  auth_heading_account: 'Account',
  auth_signed_in_as: 'signed in as',
  auth_sign_out: 'SIGN OUT',
  auth_placeholder_name: 'Name',
  auth_placeholder_email: 'Email',
  auth_placeholder_password: 'Password',
  auth_placeholder_phone: 'Phone (optional)',
  auth_submit_login: 'SIGN IN',
  auth_submit_signup: 'CREATE ACCOUNT',
  auth_toggle_to_register: "Don't have an account? Sign up!",
  auth_toggle_to_login: 'Already have an account? Sign in!',

  // ── Search ──
  search_drawer_title: 'search',
  search_placeholder: 'Type here',
  search_no_results: 'No results found',
  search_collections_heading: 'Collections',
  search_products_heading: 'Products',
  search_brands_heading: 'Brands',
  search_collections_unavailable: 'collections unavailable',

  // ── Cart ──
  cart_shipping_disclaimer: 'Shipping & taxes calculated at checkout',
  free_shipping_unlocked_text: 'Free standard shipping unlocked ✓',
  cart_bag_label: 'YOUR BAG',
  cart_drawer_empty: 'Your bag is currently empty.',
  cart_continue_shopping: 'Continue Shopping',
  cart_checkout_label: 'Checkout',

  // ── Checkout ──
  checkout_heading: 'CHECKOUT',
  checkout_shipping_heading: 'Shipping Information',
  checkout_payment_heading: 'Payment Method',
  checkout_place_order: 'PLACE ORDER',
  checkout_card_label: 'Credit / Debit Card',
  checkout_paypal_label: 'PayPal',
  checkout_cod_label: 'Cash on Delivery',
  checkout_review_heading: 'Review Your Order',
  checkout_terms_text:
    "By clicking 'Place Order', you agree to our terms and conditions.",
  checkout_confirmed_heading: 'Order Confirmed!',
  checkout_confirmed_message: 'Thank you for your purchase.',
  checkout_nav_back: 'Back',
  checkout_nav_continue: 'Continue',
  checkout_submitting_text: 'Placing order...',
  checkout_back_to_shop: 'Back to Shop',

  // ── Wishlist ──
  wishlist_empty: 'Your wishlist is empty',
  wishlist_empty_subtext: 'Start adding products you love.',
  wishlist_recommendations_title: 'You Might Also Like',

  // ── Footer ──
  newsletter_text: 'Join us on the icare to an effortless glow.',
  newsletter_subtitle:
    'Glaze your inbox with tips, tricks & exclusive content.',
  copyright_text: '© iCare 2026',
  country_region: 'Country / Region',
  email_placeholder: 'Email Address',
  subscribe_btn: 'SUBSCRIBE',
  privacy_notice: 'By signing up, you agree to our Privacy Policy*.',
  columns_title_navigate: 'NAVIGATE',
  columns_title_social: 'SOCIAL',
  columns_title_official: 'OFFICIAL',
  columns_title_support: 'SUPPORT',
  support_subtext: 'Drop us a note anytime.',
  cookie_link: 'Cookie Preferences',
  link_shop: 'Shop',
  link_story: 'Our Story',
  link_vlog: 'Vlog',
  link_find_us: 'Where to Find Us',
  link_privacy: 'Privacy',
  link_terms: 'Terms',
  link_accessibility: 'Accessibility',
  link_faq: 'FAQ',
  link_contact: 'Contact',
  support_hours: "We're here Monday-Friday 9am - 5pm.",

  // ── Contact ──
  contact_email: 'hello@icare.com',
  contact_email_label: 'email',
  contact_wholesale_email: 'wholesale@icare.com',
  contact_wholesale_label: 'wholesale',
  contact_hero_heading: 'get in touch',
  contact_hero_image:
    'https://images.unsplash.com/photo-1729952620303-4dc47fb5d93a?q=80&w=2000',
  contact_info_title: "we're here to help.",
  contact_support_info: 'Our team is available Monday-Friday 9am-5pm.',
  contact_faq_title: 'frequently asked questions',
  contact_faq_text: 'Chances are, your question has been answered.',
  contact_faq_cta: 'visit faq',

  // ── FAQ page ──
  faq_hero_title: 'Frequently Asked Questions',
  faq_hero_image:
    'https://images.unsplash.com/photo-1768483018807-bd0b9ab86539?q=80&w=2000',

  // ── Vlog page ──
  vlog_hero_title: 'PRODUCT STORIES',
  vlog_hero_image:
    'https://images.unsplash.com/photo-1590439471364-192aa70c47b53?q=80&w=2000',

  // ── Product ──
  product_add_to_bag: 'add to bag',
  product_buy_now: 'BUY NOW',
  product_sold_out: 'sold out',
  product_afterpay_text: 'or 4 interest-free payments with Afterpay',
  product_no_reviews: 'No reviews yet',
  product_details_fallback: 'Product details are unavailable from the backend.',
  product_unavailable_headline: 'We could not find this iCare product.',
  product_unavailable_desc:
    'It may have been removed, unpublished, or temporarily unavailable.',
  product_unavailable_cta: 'back to shop',
  product_select_option: 'select option:',
  product_rating_label: 'AVERAGE RATING',

  // ── Review ──
  review_verified_label: 'Verified Buyer',
  review_filter_button: 'FILTERS',
  review_sort_recent: 'MOST RECENT',
  review_show_more: 'SHOW MORE',
  review_show_less: 'SHOW LESS',
  review_helpful_question: 'Was this helpful?',
  review_hydration_question: 'How hydrated did your skin feel?',
  review_write_button: 'Write a review',
  review_sort_highest: 'HIGHEST RATED',
  review_sort_lowest: 'LOWEST RATED',
  review_sort_helpful: 'MOST HELPFUL',
  review_load_more: 'Load more reviews',
  review_filter_stars: 'Stars',

  // ── Shop ──
  shop_empty_all: 'No products are available yet.',
  shop_empty_filtered: 'No products found in this selection.',
  shop_back_to_all: 'back to all products',
  shop_show_more: 'show more',
  shop_active_filters: 'active filters:',
  shop_clear_all: 'clear all',
  shop_sort_label: 'sort:',
} as const;

export type FallbackContentKey = keyof typeof FALLBACK_CONTENT;

/**
 * Map FE camelCase field name (as returned by useSiteContent) → BE snake_case key.
 * Used to look up the right value from the settings/general response.
 */
export const CONTENT_FIELD_TO_KEY: Record<string, FallbackContentKey> = {
  // Brand
  siteName: 'site_name',
  ogImage: 'og_image',
  // Announcement
  announcementText: 'announcement_text',
  cartShippingUnlockedText: 'free_shipping_unlocked_text',
  // Home hero
  heroHeadline: 'home_hero_headline',
  heroImage: 'home_hero_image',
  heroSubtitle: 'home_hero_subtitle',
  heroBadge: 'home_hero_badge',
  heroDescription: 'home_hero_description',
  heroCta: 'home_hero_cta',
  // Home sections
  trendingTitle: 'home_trending_title',
  marqueeText: 'home_marquee_text',
  productShowcaseEmpty: 'product_showcase_empty',
  promoBadge: 'home_promo_badge',
  promoHeadline: 'home_promo_headline',
  promoDescription: 'home_promo_description',
  promoCtaLabel: 'home_promo_cta_label',
  promoImage: 'home_promo_image',
  philosophyHeadline: 'home_philosophy_headline',
  philosophyText: 'home_philosophy_text',
  philosophyCta: 'home_philosophy_cta',
  philosophyImage: 'home_philosophy_image',
  commitmentHeadline: 'home_commitment_headline',
  commitmentCta: 'home_commitment_cta',
  commitmentImage: 'home_commitment_image',
  socialGridHeading: 'home_social_grid_heading',
  socialGridCta: 'home_social_grid_cta',
  socialGridImage1: 'home_social_grid_image_1',
  socialGridImage2: 'home_social_grid_image_2',
  socialGridImage3: 'home_social_grid_image_3',
  socialGridImage4: 'home_social_grid_image_4',
  // About
  aboutHeroHeadline: 'about_hero_headline',
  aboutHeroCta: 'about_hero_cta',
  aboutHeroImage: 'about_hero_image',
  aboutIntentionalTitle: 'home_intentional_title',
  aboutIntentionalText: 'home_intentional_text',
  aboutIntentionalImage: 'home_intentional_image',
  aboutFoundationLabel: 'home_foundation_label',
  aboutFoundationTitle: 'home_foundation_title',
  aboutFoundationText1: 'home_foundation_text_1',
  aboutFoundationText2: 'home_foundation_text_2',
  aboutFoundationImage: 'home_foundation_image',
  aboutValuesImage: 'about_values_image',
  aboutTeamLabel: 'home_team_label',
  aboutTeamTitle: 'home_team_title',
  aboutTeamDescription: 'home_team_description',
  aboutTeamMember1Name: 'about_team_member_1_name',
  aboutTeamMember1Title: 'about_team_member_1_title',
  aboutTeamMember1Image: 'about_team_member_1_image',
  aboutTeamMember2Name: 'about_team_member_2_name',
  aboutTeamMember2Title: 'about_team_member_2_title',
  aboutTeamMember2Image: 'about_team_member_2_image',
  aboutTeamMember3Name: 'about_team_member_3_name',
  aboutTeamMember3Title: 'about_team_member_3_title',
  aboutTeamMember3Image: 'about_team_member_3_image',
  aboutFounderNoteHeading: 'home_founder_note_heading',
  aboutFounderLetter: 'home_founder_letter',
  aboutFounderSignatureImage: 'about_founder_signature_image',
  // Shop
  shopEmptyAll: 'shop_empty_all',
  shopEmptyFiltered: 'shop_empty_filtered',
  shopBackToAll: 'shop_back_to_all',
  shopShowMore: 'shop_show_more',
  shopActiveFilters: 'shop_active_filters',
  shopClearAll: 'shop_clear_all',
  shopSortLabel: 'shop_sort_label',
  // Product
  productAddToBag: 'product_add_to_bag',
  productBuyNow: 'product_buy_now',
  productSoldOut: 'product_sold_out',
  productAfterpayText: 'product_afterpay_text',
  productNoReviews: 'product_no_reviews',
  productDetailsFallback: 'product_details_fallback',
  productUnavailableHeadline: 'product_unavailable_headline',
  productUnavailableDesc: 'product_unavailable_desc',
  productUnavailableCta: 'product_unavailable_cta',
  productSelectOption: 'product_select_option',
  productRatingLabel: 'product_rating_label',
  // Cart
  cartEmptyDrawer: 'cart_drawer_empty',
  cartContinueShopping: 'cart_continue_shopping',
  cartShippingDisclaimer: 'cart_shipping_disclaimer',
  cartCheckoutLabel: 'cart_checkout_label',
  cartBagLabel: 'cart_bag_label',
  // Checkout
  checkoutHeading: 'checkout_heading',
  checkoutShippingHeading: 'checkout_shipping_heading',
  checkoutPaymentHeading: 'checkout_payment_heading',
  checkoutPlaceOrder: 'checkout_place_order',
  checkoutCardLabel: 'checkout_card_label',
  checkoutPaypalLabel: 'checkout_paypal_label',
  checkoutCodLabel: 'checkout_cod_label',
  checkoutReviewHeading: 'checkout_review_heading',
  checkoutTermsText: 'checkout_terms_text',
  checkoutConfirmedHeading: 'checkout_confirmed_heading',
  checkoutConfirmedMessage: 'checkout_confirmed_message',
  checkoutNavBack: 'checkout_nav_back',
  checkoutNavContinue: 'checkout_nav_continue',
  checkoutSubmittingText: 'checkout_submitting_text',
  checkoutBackToShop: 'checkout_back_to_shop',
  // Auth
  authHeadingLogin: 'auth_heading_login',
  authHeadingSignup: 'auth_heading_signup',
  authHeadingAccount: 'auth_heading_account',
  authSignedInAs: 'auth_signed_in_as',
  authSignOut: 'auth_sign_out',
  authPlaceholderName: 'auth_placeholder_name',
  authPlaceholderEmail: 'auth_placeholder_email',
  authPlaceholderPassword: 'auth_placeholder_password',
  authPlaceholderPhone: 'auth_placeholder_phone',
  authSubmitLogin: 'auth_submit_login',
  authSubmitSignup: 'auth_submit_signup',
  authToggleToRegister: 'auth_toggle_to_register',
  authToggleToLogin: 'auth_toggle_to_login',
  authLoginImage: 'auth_login_image',
  authLoginTagline: 'auth_login_tagline',
  // Search
  searchPlaceholder: 'search_placeholder',
  searchDrawerTitle: 'search_drawer_title',
  searchNoResults: 'search_no_results',
  searchNoResultsTemplate: 'search_no_results',
  searchCollectionsHeading: 'search_collections_heading',
  searchProductsHeading: 'search_products_heading',
  searchBrandsHeading: 'search_brands_heading',
  searchCollectionsUnavailable: 'search_collections_unavailable',
  // Vlog
  vlogHeroImage: 'vlog_hero_image',
  vlogHeroTitle: 'vlog_hero_title',
  // FAQ
  faqHeroImage: 'faq_hero_image',
  faqHeroTitle: 'faq_hero_title',
  // Contact
  contactHeroImage: 'contact_hero_image',
  contactHeroHeading: 'contact_hero_heading',
  contactInfoTitle: 'contact_info_title',
  contactSupportInfo: 'contact_support_info',
  contactSupportHours: 'support_hours',
  contactEmail: 'contact_email',
  contactEmailLabel: 'contact_email_label',
  contactWholesaleEmail: 'contact_wholesale_email',
  contactWholesaleLabel: 'contact_wholesale_label',
  contactFaqTitle: 'contact_faq_title',
  contactFaqText: 'contact_faq_text',
  contactFaqCta: 'contact_faq_cta',
  // Store locator
  storeLocatorTagline: 'store_locator_tagline',
  storeLocatorNoResults: 'store_locator_no_results',
  // Wishlist
  wishlistEmpty: 'wishlist_empty',
  wishlistEmptySubtext: 'wishlist_empty_subtext',
  wishlistRecommendationsTitle: 'wishlist_recommendations_title',
  // Reviews
  reviewVerifiedLabel: 'review_verified_label',
  reviewFilterButton: 'review_filter_button',
  reviewSortRecent: 'review_sort_recent',
  reviewShowMore: 'review_show_more',
  reviewShowLess: 'review_show_less',
  reviewHelpfulQuestion: 'review_helpful_question',
  reviewHydrationQuestion: 'review_hydration_question',
  reviewWriteButton: 'review_write_button',
  reviewSortHighest: 'review_sort_highest',
  reviewSortLowest: 'review_sort_lowest',
  reviewSortHelpful: 'review_sort_helpful',
  reviewLoadMore: 'review_load_more',
  reviewFilterStars: 'review_filter_stars',
  // Footer
  footerNewsletterText: 'newsletter_text',
  footerNewsletterSubtitle: 'newsletter_subtitle',
  footerEmailPlaceholder: 'email_placeholder',
  footerSubscribeBtn: 'subscribe_btn',
  footerPrivacyNotice: 'privacy_notice',
  footerCopyright: 'copyright_text',
  footerCountryRegion: 'country_region',
  footerNavigateTitle: 'columns_title_navigate',
  footerSocialTitle: 'columns_title_social',
  footerOfficialTitle: 'columns_title_official',
  footerSupportTitle: 'columns_title_support',
  footerSupportSubtext: 'support_subtext',
  footerCookieLink: 'cookie_link',
  footerLinkShop: 'link_shop',
  footerLinkStory: 'link_story',
  footerLinkVlog: 'link_vlog',
  footerLinkFindUs: 'link_find_us',
  footerLinkPrivacy: 'link_privacy',
  footerLinkTerms: 'link_terms',
  footerLinkAccessibility: 'link_accessibility',
  footerLinkFaq: 'link_faq',
  footerLinkContact: 'link_contact',
};

/**
 * Fields NOT in the settings registry (served by /api/v1/settings general
 * but with no content-specific override). These remain FE-only literals.
 */
export const LEGACY_SETTINGS_FIELDS = [
  'freeShippingThreshold',
  'defaultShippingCost',
  'checkoutTaxRate',
  'shippingRates',
  'enableWishlist',
  'enableProductReviews',
  'enableGuestCheckout',
  'defaultCountry',
  'currencyCode',
  'itemsPerPage',
  'metaTitle',
  'metaDescription',
  'siteDescription',
  'siteUrl',
  'ogImage',
  'productShowcaseLoading',
  'storeLocatorMapImage',
  'reviewHydrationLow',
  'reviewHydrationHigh',
  'productBuyNowTemplate',
] as const;

/**
 * Hardcoded FE-only fallbacks for fields with no settings registry entry.
 * These never change at runtime.
 */
export const HARDCODED_FALLBACKS: Record<string, string | number | boolean> = {
  reviewHydrationLow: 'Not very hydrated',
  reviewHydrationHigh: 'Super hydrated',
  productShowcaseLoading: '',
  storeLocatorMapImage: '',
  metaTitle: 'iCare Beauty',
  metaDescription: '',
  siteDescription: '',
  siteUrl: '',
  ogImage: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=400',
  productBuyNowTemplate: 'BUY NOW',
  // Legacy settings — sane defaults so the page renders without backend.
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
};
