/**
 * fallback-content.ts — Offline-first mirror of the BE ContentProvider defaults.
 *
 * The backend (e-commerce-backend) ships a ContentProvider registry
 * (ContentDefaultsService + LegacyContentService + HeroService) that exposes
 * ~120 keys. When the admin hasn't overridden a key, BE returns its
 * registered `defaultValue`. This file mirrors those defaults verbatim so
 * the storefront renders correctly even when the backend is unreachable,
 * timing out, or returning empty responses.
 *
 * Key naming matches BE convention: dotted (`home.hero.image`).
 * Image values are absolute URLs (Unsplash) — the FE passes them to
 * `<img src>` unchanged. Text values are the English defaults.
 *
 * Source of truth: e-commerce-backend/src/content/{content-defaults,legacy-content}.service.ts
 *                  + e-commerce-backend/src/modules/hero/hero.service.ts
 *
 * Adding a new key here AND in the BE registry keeps both layers in sync.
 */

export const FALLBACK_CONTENT = {
  // ── Marketing / brand ──
  'marketing.site.name': 'iCare Beauty',
  'marketing.site.logo.image':
    'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=400',
  'marketing.announcement.text': 'FREE SHIPPING AVAILABLE',
  'marketing.store.locator.tagline': 'find icare near you',
  'marketing.store.locator.no.results': 'no locations found in this area.',

  // ── Home hero ──
  'home.hero.headline': 'the barrier butter.',
  'home.hero.image':
    'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=2000',
  'home.hero.cta': 'discover barrier butter.',
  'home.hero.subtitle':
    'The butter that protects. The tint that flatters. The warmth that lasts.',
  'home.hero.announcement': 'NEW: Barrier Butter tinted edition',
  'home.hero.scroll.hint': 'scroll',
  'home.hero.image.mobile':
    'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=800',
  'home.hero.image.tablet':
    'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=1200',

  // ── Home sections ──
  'home.trending.title': 'trending essentials',
  'home.marquee.text':
    'Free shipping available • Cruelty-Free • Dermatologist Tested • Vegan • High Performance Skincare •',
  'home.showcase.empty': 'no featured products are available yet',
  'home.shop.image':
    'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=1920',
  'home.story.image':
    'https://images.unsplash.com/photo-1501876725168-00c445821c9e?q=80&w=1000',
  'home.ourstory.image':
    'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=800',
  'home.faq.image':
    'https://images.unsplash.com/photo-1768483018807-bd0b9ab86539?q=80&w=2000',

  // ── Commitment section ──
  'home.commitment.headline':
    "From consciously-sourced ingredients to packaging made with post-consumer recycled materials, we're committed to MINDFUL SKINCARE.",
  'home.commitment.cta': 'OUR FOOTPRINT',
  'home.commitment.image':
    'https://images.unsplash.com/photo-1603189777895-1dcbe39ec57e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200',
  'home.commitment.mission.title': 'mission',
  'home.commitment.mission.detail':
    'We formulate with intention, not trends. Every ingredient is chosen for efficacy, safety, and skin compatibility.',
  'home.commitment.mission.cta': 'our values',
  'home.commitment.philanthropy.title': 'philanthropy',
  'home.commitment.philanthropy.detail':
    'We partner with organizations that support women, mental health awareness, and environmental conservation.',
  'home.commitment.philanthropy.cta': 'our impact',
  'home.commitment.sustainability.title': 'sustainability',
  'home.commitment.sustainability.detail':
    'From recyclable packaging to lower-waste shipping, we are working to reduce our footprint at every step.',
  'home.commitment.sustainability.cta': 'our footprint',

  // ── Promo ──
  'home.promo.badge': 'New Arrival',
  'home.promo.headline': 'chilly little flush',
  'home.promo.description':
    'Warm up your cheeks with Pocket Blush. A touch of creamy, long-wearing color that mimics the flush you get after stepping in from the cold.',
  'home.promo.cta': 'POCKET BLUSH',
  'home.promo.image':
    'https://images.unsplash.com/photo-1653784097013-786a8965ea3b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200',

  // ── Philosophy ──
  'home.philosophy.headline': 'one of everything really good',
  'home.philosophy.text':
    'At icare, our philosophy is to make one of everything really good. To us, that means a collection of intentional, high-performance essentials you reach for everyday. The ones you love, rely on, and always come back to for ultimate barrier nourishment, tint, and glow.',
  'home.philosophy.cta': 'SHOP ICARE',
  'home.philosophy.image':
    'https://images.unsplash.com/photo-1638609927040-8a7e97cd9d6a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1920',

  // ── Social grid ──
  'home.social.heading': 'icare + you',
  'home.social.cta': 'FIND US ON SOCIAL',
  'home.social.image1':
    'https://images.unsplash.com/photo-1679517354322-20fe85050b9d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
  'home.social.image2':
    'https://images.unsplash.com/photo-1739980737820-b6bb1a9b8456?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
  'home.social.image3':
    'https://images.unsplash.com/photo-1635631414456-6a9dc5051a3d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
  'home.social.image4':
    'https://images.unsplash.com/photo-1627384113972-f4c0392fe5aa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',

  // ── About ──
  'about.hero.headline': 'A new PHILOSOPHY on SKINCARE.',
  'about.hero.cta': 'SHOP NOW',
  'about.hero.image':
    'https://images.unsplash.com/photo-1713425886063-4a49da507ada?q=80&w=2000',
  'about.intentional.title': 'intentional skincare',
  'about.intentional.text': 'icare is a line of curated skincare essentials.',
  'about.intentional.image':
    'https://images.unsplash.com/photo-1644011047934-b00d0aa404d4?q=80&w=1200',
  'about.foundation.label': 'The Foundation',
  'about.foundation.title': 'one of everything really good.',
  'about.foundation.text1':
    'Founded on the belief that beauty is about essentials.',
  'about.foundation.text2':
    'Every icare product is developed with intent.',
  'about.foundation.image':
    'https://images.unsplash.com/photo-1638609927040-8a7e97cd9d6a?q=80&w=1200',
  'about.values.image':
    'https://images.unsplash.com/photo-1642080668102-dc8f5ce8e752?q=80&w=1200',
  'about.team.label': 'Meet the team',
  'about.team.title': 'our crew.',
  'about.team.description': 'A diverse group of experts.',
  'about.team.member1.name': 'sarah jenkins',
  'about.team.member1.title': 'creative director',
  'about.team.member1.image':
    'https://images.unsplash.com/photo-1702261347927-11207f77e751?q=80&w=800',
  'about.team.member2.name': 'dr. amira fahad',
  'about.team.member2.title': 'lead dermatologist',
  'about.team.member2.image':
    'https://images.unsplash.com/photo-1763692108454-6cfa2b0af5c1?q=80&w=800',
  'about.team.member3.name': 'elena rodriguez',
  'about.team.member3.title': 'product development',
  'about.team.member3.image':
    'https://images.unsplash.com/photo-1631214565164-dd0b7fba0295?q=80&w=800',
  'about.founder.note.heading': 'A NOTE FROM OUR FOUNDER',
  'about.founder.letter':
    'My journey towards healthier skin inspired me.',
  'about.founder.signature.image':
    'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=800',

  // ── Auth ──
  'auth.login.image':
    'https://images.unsplash.com/photo-1729952620303-4dc47fb5d93a?q=80&w=1200&auto=format&fit=crop',
  'auth.login.tagline': "It's time to invest in your SKIN.",
  'auth.heading.login': 'Login',
  'auth.heading.signup': 'Sign up',
  'auth.heading.account': 'Account',
  'auth.signed.in.as': 'signed in as',
  'auth.sign.out': 'SIGN OUT',
  'auth.placeholder.name': 'Name',
  'auth.placeholder.email': 'Email',
  'auth.placeholder.password': 'Password',
  'auth.placeholder.phone': 'Phone (optional)',
  'auth.submit.login': 'SIGN IN',
  'auth.submit.signup': 'CREATE ACCOUNT',
  'auth.toggle.to.register': "Don't have an account? Sign up!",
  'auth.toggle.to.login': 'Already have an account? Sign in!',

  // ── Search ──
  'search.drawer.title': 'search',
  'search.placeholder': 'Type here',
  'search.no.results': 'No results found',
  'search.collections.heading': 'Collections',
  'search.products.heading': 'Products',
  'search.brands.heading': 'Brands',
  'search.collections.unavailable': 'collections unavailable',

  // ── Cart ──
  'cart.shipping.disclaimer': 'Shipping & taxes calculated at checkout',
  'cart.shipping.unlocked.text': 'Free standard shipping unlocked ✓',
  'cart.bag.label': 'YOUR BAG',
  'cart.empty.drawer': 'Your bag is currently empty.',
  'cart.continue.shopping': 'Continue Shopping',
  'cart.checkout.label': 'Checkout',

  // ── Checkout ──
  'checkout.heading': 'CHECKOUT',
  'checkout.shipping.heading': 'Shipping Information',
  'checkout.payment.heading': 'Payment Method',
  'checkout.place.order': 'PLACE ORDER',
  'checkout.card.label': 'Credit / Debit Card',
  'checkout.paypal.label': 'PayPal',
  'checkout.cod.label': 'Cash on Delivery',
  'checkout.review.heading': 'Review Your Order',
  'checkout.terms.text':
    "By clicking 'Place Order', you agree to our terms and conditions.",
  'checkout.confirmed.heading': 'Order Confirmed!',
  'checkout.confirmed.message': 'Thank you for your purchase.',
  'checkout.nav.back': 'Back',
  'checkout.nav.continue': 'Continue',
  'checkout.submitting.text': 'Placing order...',
  'checkout.back.to.shop': 'Back to Shop',

  // ── Wishlist ──
  'wishlist.empty': 'Your wishlist is empty',
  'wishlist.empty.subtext': 'Start adding products you love.',
  'wishlist.recommendations.title': 'You Might Also Like',

  // ── Footer ──
  'footer.newsletter.text': 'Join us on the icare to an effortless glow.',
  'footer.newsletter.subtitle':
    'Glaze your inbox with tips, tricks & exclusive content.',
  'footer.copyright': '© iCare 2026',
  'footer.country.region': 'Country / Region',
  'footer.email.placeholder': 'Email Address',
  'footer.subscribe.btn': 'SUBSCRIBE',
  'footer.privacy.notice': 'By signing up, you agree to our Privacy Policy*.',
  'footer.columns.title.navigate': 'NAVIGATE',
  'footer.columns.title.social': 'SOCIAL',
  'footer.columns.title.official': 'OFFICIAL',
  'footer.columns.title.support': 'SUPPORT',
  'footer.support.subtext': 'Drop us a note anytime.',
  'footer.cookie.link': 'Cookie Preferences',
  'footer.link.shop': 'Shop',
  'footer.link.story': 'Our Story',
  'footer.link.vlog': 'Vlog',
  'footer.link.find.us': 'Where to Find Us',
  'footer.link.privacy': 'Privacy',
  'footer.link.terms': 'Terms',
  'footer.link.accessibility': 'Accessibility',
  'footer.link.faq': 'FAQ',
  'footer.link.contact': 'Contact',
  'footer.support.hours': "We're here Monday-Friday 9am - 5pm.",

  // ── Contact ──
  'contact.email': 'hello@icare.com',
  'contact.email.label': 'email',
  'contact.wholesale.email': 'wholesale@icare.com',
  'contact.wholesale.label': 'wholesale',
  'contact.hero.heading': 'get in touch',
  'contact.hero.image':
    'https://images.unsplash.com/photo-1729952620303-4dc47fb5d93a?q=80&w=2000',
  'contact.info.title': "we're here to help.",
  'contact.support.info': 'Our team is available Monday-Friday 9am-5pm.',
  'contact.support.hours': "We're here Monday-Friday 9am - 5pm.",
  'contact.faq.title': 'frequently asked questions',
  'contact.faq.text': 'Chances are, your question has been answered.',
  'contact.faq.cta': 'visit faq',

  // ── FAQ page ──
  // `faq.hero.image` was deprecated → renamed to `home.faq.image` (already
  // declared above in the homepage block). Keep `faq.hero.title` /
  // `faq.hero.subtitle` — those keys ARE registered in the BE.
  'faq.hero.title': 'Frequently Asked Questions',
  'faq.hero.subtitle':
    'Answers to our most-asked questions about products, shipping, and care.',

  // ── Vlog page ──
  'vlog.hero.title': 'PRODUCT STORIES',
  'vlog.hero.image':
    'https://images.unsplash.com/photo-1590439471364-192aa70c47b53?q=80&w=2000',

  // ── Product ──
  'product.add.to.bag': 'add to bag',
  'product.buy.now': 'BUY NOW',
  'product.sold.out': 'sold out',
  'product.afterpay.text': 'or 4 interest-free payments with Afterpay',
  'product.no.reviews': 'No reviews yet',
  'product.details.fallback': 'Product details are unavailable from the backend.',
  'product.unavailable.headline': 'We could not find this iCare product.',
  'product.unavailable.desc':
    'It may have been removed, unpublished, or temporarily unavailable.',
  'product.unavailable.cta': 'back to shop',
  'product.select.option': 'select option:',
  'product.rating.label': 'AVERAGE RATING',

  // ── Review ──
  'review.verified.label': 'Verified Buyer',
  'review.filter.button': 'FILTERS',
  'review.sort.recent': 'MOST RECENT',
  'review.show.more': 'SHOW MORE',
  'review.show.less': 'SHOW LESS',
  'review.helpful.question': 'Was this helpful?',
  'review.hydration.question': 'How hydrated did your skin feel?',
  'review.write.button': 'Write a review',
  'review.sort.highest': 'HIGHEST RATED',
  'review.sort.lowest': 'LOWEST RATED',
  'review.sort.helpful': 'MOST HELPFUL',
  'review.load.more': 'Load more reviews',
  'review.filter.stars': 'Stars',

  // ── Shop ──
  'shop.empty.all': 'No products are available yet.',
  'shop.empty.filtered': 'No products found in this selection.',
  'shop.back.to.all': 'back to all products',
  'shop.show.more': 'show more',
  'shop.active.filters': 'active filters:',
  'shop.clear.all': 'clear all',
  'shop.sort.label': 'sort:',
} as const;

export type FallbackContentKey = keyof typeof FALLBACK_CONTENT;

/**
 * Map FE camelCase field name (as returned by useSiteContent) → BE dotted key.
 * Used to look up the right value from the batch ContentProvider response.
 */
export const CONTENT_FIELD_TO_KEY: Record<string, FallbackContentKey> = {
  // Brand
  siteName: 'marketing.site.name',
  ogImage: 'marketing.site.logo.image',
  // Announcement
  announcementText: 'marketing.announcement.text',
  cartShippingUnlockedText: 'cart.shipping.unlocked.text',
  // Home hero
  heroHeadline: 'home.hero.headline',
  heroImage: 'home.hero.image',
  // Home sections
  trendingTitle: 'home.trending.title',
  marqueeText: 'home.marquee.text',
  productShowcaseEmpty: 'home.showcase.empty',
  promoBadge: 'home.promo.badge',
  promoHeadline: 'home.promo.headline',
  promoDescription: 'home.promo.description',
  promoCtaLabel: 'home.promo.cta',
  promoImage: 'home.promo.image',
  philosophyHeadline: 'home.philosophy.headline',
  philosophyText: 'home.philosophy.text',
  philosophyCta: 'home.philosophy.cta',
  philosophyImage: 'home.philosophy.image',
  commitmentHeadline: 'home.commitment.headline',
  commitmentCta: 'home.commitment.cta',
  commitmentImage: 'home.commitment.image',
  socialGridHeading: 'home.social.heading',
  socialGridCta: 'home.social.cta',
  socialGridImage1: 'home.social.image1',
  socialGridImage2: 'home.social.image2',
  socialGridImage3: 'home.social.image3',
  socialGridImage4: 'home.social.image4',
  // About
  aboutHeroHeadline: 'about.hero.headline',
  aboutHeroCta: 'about.hero.cta',
  aboutHeroImage: 'about.hero.image',
  aboutIntentionalTitle: 'about.intentional.title',
  aboutIntentionalText: 'about.intentional.text',
  aboutIntentionalImage: 'about.intentional.image',
  aboutFoundationLabel: 'about.foundation.label',
  aboutFoundationTitle: 'about.foundation.title',
  aboutFoundationText1: 'about.foundation.text1',
  aboutFoundationText2: 'about.foundation.text2',
  aboutFoundationImage: 'about.foundation.image',
  aboutValuesImage: 'about.values.image',
  aboutTeamLabel: 'about.team.label',
  aboutTeamTitle: 'about.team.title',
  aboutTeamDescription: 'about.team.description',
  aboutTeamMember1Name: 'about.team.member1.name',
  aboutTeamMember1Title: 'about.team.member1.title',
  aboutTeamMember1Image: 'about.team.member1.image',
  aboutTeamMember2Name: 'about.team.member2.name',
  aboutTeamMember2Title: 'about.team.member2.title',
  aboutTeamMember2Image: 'about.team.member2.image',
  aboutTeamMember3Name: 'about.team.member3.name',
  aboutTeamMember3Title: 'about.team.member3.title',
  aboutTeamMember3Image: 'about.team.member3.image',
  aboutFounderNoteHeading: 'about.founder.note.heading',
  aboutFounderLetter: 'about.founder.letter',
  aboutFounderSignatureImage: 'about.founder.signature.image',
  // Shop
  shopEmptyAll: 'shop.empty.all',
  shopEmptyFiltered: 'shop.empty.filtered',
  shopBackToAll: 'shop.back.to.all',
  shopShowMore: 'shop.show.more',
  shopActiveFilters: 'shop.active.filters',
  shopClearAll: 'shop.clear.all',
  shopSortLabel: 'shop.sort.label',
  // Product
  productAddToBag: 'product.add.to.bag',
  productBuyNow: 'product.buy.now',
  productSoldOut: 'product.sold.out',
  productAfterpayText: 'product.afterpay.text',
  productNoReviews: 'product.no.reviews',
  productDetailsFallback: 'product.details.fallback',
  productUnavailableHeadline: 'product.unavailable.headline',
  productUnavailableDesc: 'product.unavailable.desc',
  productUnavailableCta: 'product.unavailable.cta',
  productSelectOption: 'product.select.option',
  productRatingLabel: 'product.rating.label',
  // Cart
  cartEmptyDrawer: 'cart.empty.drawer',
  cartContinueShopping: 'cart.continue.shopping',
  cartShippingDisclaimer: 'cart.shipping.disclaimer',
  cartCheckoutLabel: 'cart.checkout.label',
  cartBagLabel: 'cart.bag.label',
  // Checkout
  checkoutHeading: 'checkout.heading',
  checkoutShippingHeading: 'checkout.shipping.heading',
  checkoutPaymentHeading: 'checkout.payment.heading',
  checkoutPlaceOrder: 'checkout.place.order',
  checkoutCardLabel: 'checkout.card.label',
  checkoutPaypalLabel: 'checkout.paypal.label',
  checkoutCodLabel: 'checkout.cod.label',
  checkoutReviewHeading: 'checkout.review.heading',
  checkoutTermsText: 'checkout.terms.text',
  checkoutConfirmedHeading: 'checkout.confirmed.heading',
  checkoutConfirmedMessage: 'checkout.confirmed.message',
  checkoutNavBack: 'checkout.nav.back',
  checkoutNavContinue: 'checkout.nav.continue',
  checkoutSubmittingText: 'checkout.submitting.text',
  checkoutBackToShop: 'checkout.back.to.shop',
  // Auth
  authHeadingLogin: 'auth.heading.login',
  authHeadingSignup: 'auth.heading.signup',
  authHeadingAccount: 'auth.heading.account',
  authSignedInAs: 'auth.signed.in.as',
  authSignOut: 'auth.sign.out',
  authPlaceholderName: 'auth.placeholder.name',
  authPlaceholderEmail: 'auth.placeholder.email',
  authPlaceholderPassword: 'auth.placeholder.password',
  authPlaceholderPhone: 'auth.placeholder.phone',
  authSubmitLogin: 'auth.submit.login',
  authSubmitSignup: 'auth.submit.signup',
  authToggleToRegister: 'auth.toggle.to.register',
  authToggleToLogin: 'auth.toggle.to.login',
  authLoginImage: 'auth.login.image',
  authLoginTagline: 'auth.login.tagline',
  // Search
  searchPlaceholder: 'search.placeholder',
  searchDrawerTitle: 'search.drawer.title',
  searchNoResults: 'search.no.results',
  searchNoResultsTemplate: 'search.no.results',
  searchCollectionsHeading: 'search.collections.heading',
  searchProductsHeading: 'search.products.heading',
  searchBrandsHeading: 'search.brands.heading',
  searchCollectionsUnavailable: 'search.collections.unavailable',
  // Vlog
  vlogHeroImage: 'vlog.hero.image',
  vlogHeroTitle: 'vlog.hero.title',
  // FAQ
  faqHeroImage: 'home.faq.image',
  faqHeroTitle: 'faq.hero.title',
  // Contact
  contactHeroImage: 'contact.hero.image',
  contactHeroHeading: 'contact.hero.heading',
  contactInfoTitle: 'contact.info.title',
  contactSupportInfo: 'contact.support.info',
  contactSupportHours: 'contact.support.hours',
  contactEmail: 'contact.email',
  contactEmailLabel: 'contact.email.label',
  contactWholesaleEmail: 'contact.wholesale.email',
  contactWholesaleLabel: 'contact.wholesale.label',
  contactFaqTitle: 'contact.faq.title',
  contactFaqText: 'contact.faq.text',
  contactFaqCta: 'contact.faq.cta',
  // Store locator
  storeLocatorTagline: 'marketing.store.locator.tagline',
  storeLocatorNoResults: 'marketing.store.locator.no.results',
  // Wishlist
  wishlistEmpty: 'wishlist.empty',
  wishlistEmptySubtext: 'wishlist.empty.subtext',
  wishlistRecommendationsTitle: 'wishlist.recommendations.title',
  // Reviews
  reviewVerifiedLabel: 'review.verified.label',
  reviewFilterButton: 'review.filter.button',
  reviewSortRecent: 'review.sort.recent',
  reviewShowMore: 'review.show.more',
  reviewShowLess: 'review.show.less',
  reviewHelpfulQuestion: 'review.helpful.question',
  reviewHydrationQuestion: 'review.hydration.question',
  reviewWriteButton: 'review.write.button',
  reviewSortHighest: 'review.sort.highest',
  reviewSortLowest: 'review.sort.lowest',
  reviewSortHelpful: 'review.sort.helpful',
  reviewLoadMore: 'review.load.more',
  reviewFilterStars: 'review.filter.stars',
  // Footer
  footerNewsletterText: 'footer.newsletter.text',
  footerNewsletterSubtitle: 'footer.newsletter.subtitle',
  footerEmailPlaceholder: 'footer.email.placeholder',
  footerSubscribeBtn: 'footer.subscribe.btn',
  footerPrivacyNotice: 'footer.privacy.notice',
  footerCopyright: 'footer.copyright',
  footerCountryRegion: 'footer.country.region',
  footerNavigateTitle: 'footer.columns.title.navigate',
  footerSocialTitle: 'footer.columns.title.social',
  footerOfficialTitle: 'footer.columns.title.official',
  footerSupportTitle: 'footer.columns.title.support',
  footerSupportSubtext: 'footer.support.subtext',
  footerCookieLink: 'footer.cookie.link',
  footerLinkShop: 'footer.link.shop',
  footerLinkStory: 'footer.link.story',
  footerLinkVlog: 'footer.link.vlog',
  footerLinkFindUs: 'footer.link.find.us',
  footerLinkPrivacy: 'footer.link.privacy',
  footerLinkTerms: 'footer.link.terms',
  footerLinkAccessibility: 'footer.link.accessibility',
  footerLinkFaq: 'footer.link.faq',
  footerLinkContact: 'footer.link.contact',
};

/**
 * Fields NOT in the content registry (still served by /api/v1/settings/general).
 * Kept on the legacy settings path per spec 005 out-of-scope.
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
 * Hardcoded FE-only fallbacks for fields with no content registry entry.
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
