import { useMemo } from 'react';
import { Language } from '../translations';
import { useShop } from '../context/ShopContext';
import {
  ShippingPageContent,
  ShippingPageContentByLanguage,
} from '../types';
import { parseShippingPageContent } from '../lib/settings';
import { normalizeSocialLinksResponse } from '../lib/social-links';
import { resolveMediaUrl } from '../lib/media-url';
import { useContent } from './useContent';

/**
 * useSiteContent — spec 005 (T056, FR-016) legacy shim.
 *
 * Each field delegates to `useContent(registryKey, {lang, fallback})` with
 * the legacy hardcoded literal as the fallback. This means:
 *   1. Registry is the single source of truth (read happens once per mount
 *      per key, in `useContent`).
 *   2. Fallback chain is identical to the pre-spec-005 behavior: CMS >
 *      settings > hardcoded literal.
 *   3. Components that haven't been migrated to `useContent` directly
 *      still work — the shim is the bridge.
 *
 * Number/JSON fields (freeShippingThreshold, socialLinks, etc.) remain on
 * the legacy snake_case Setting path because the registry is text-only.
 * These are flagged with `// out-of-scope: number/JSON` comments.
 *
 * spec 005 (FR-016): this shim is the bridge until all 30 components are
 * migrated to `useContent` directly. After that, a future spec can
 * delete this file when `audit:use-site-content` reports 0 importers.
 */
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

export const useSiteContent = (lang: Language) => {
  // The previous dev warning (`!lang`) was unreachable because `lang`
  // is typed `Language = 'en' | 'ar'` — both values are truthy strings.
  // Removed in CRIT-cleanup. If a future caller wants to detect a missing
  // arg, change the signature to `lang?: Language` first.

  const { settings, socialLinks: contextSocialLinks } = useShop();

  // spec 005 (T056) — All text/image fields delegate to useContent with
  // the legacy hardcoded literal as the fallback. The registry is the
  // single source of truth.
  // Home hero
  const { val: heroHeadline } = useContent('home.hero.headline', { lang, fallback: '' });
  const { val: heroImage } = useContent('home.hero.image', { lang, fallback: '' });
  // Home sections
  const { val: trendingTitle } = useContent('home.trending.title', { lang, fallback: 'trending essentials' });
  const { val: marqueeText } = useContent('home.marquee.text', { lang, fallback: '' });
  const { val: promoBadge } = useContent('home.promo.badge', { lang, fallback: 'New Arrival' });
  const { val: promoHeadline } = useContent('home.promo.headline', { lang, fallback: '' });
  const { val: promoDescription } = useContent('home.promo.description', { lang, fallback: '' });
  const { val: promoCtaLabel } = useContent('home.promo.cta', { lang, fallback: '' });
  const { val: promoImage } = useContent('home.promo.image', { lang, fallback: '' });
  const { val: philosophyHeadline } = useContent('home.philosophy.headline', { lang, fallback: '' });
  const { val: philosophyText } = useContent('home.philosophy.text', { lang, fallback: '' });
  const { val: philosophyCta } = useContent('home.philosophy.cta', { lang, fallback: '' });
  const { val: philosophyImage } = useContent('home.philosophy.image', { lang, fallback: '' });
  const { val: commitmentHeadline } = useContent('home.commitment.headline', { lang, fallback: '' });
  const { val: commitmentCta } = useContent('home.commitment.cta', { lang, fallback: '' });
  const { val: commitmentImage } = useContent('home.commitment.image', { lang, fallback: '' });
  const { val: socialGridHeading } = useContent('home.social.heading', { lang, fallback: 'icare + you' });
  const { val: socialGridCta } = useContent('home.social.cta', { lang, fallback: 'FIND US ON SOCIAL' });
  const { val: socialGridImage1 } = useContent('home.social.image1', { lang, fallback: '' });
  const { val: socialGridImage2 } = useContent('home.social.image2', { lang, fallback: '' });
  const { val: socialGridImage3 } = useContent('home.social.image3', { lang, fallback: '' });
  const { val: socialGridImage4 } = useContent('home.social.image4', { lang, fallback: '' });
  const { val: productShowcaseEmpty } = useContent('home.showcase.empty', { lang, fallback: '' });
  // Announcement — read the canonical marketing.announcement.text key.
  // (home.announcement.text was a duplicate registration removed in CRIT-03.)
  const { val: announcementText } = useContent('marketing.announcement.text', { lang, fallback: '' });
  // About
  const { val: aboutHeroHeadline } = useContent('about.hero.headline', { lang, fallback: '' });
  const { val: aboutHeroCta } = useContent('about.hero.cta', { lang, fallback: '' });
  const { val: aboutHeroImage } = useContent('about.hero.image', { lang, fallback: '' });
  const { val: aboutIntentionalTitle } = useContent('about.intentional.title', { lang, fallback: '' });
  const { val: aboutIntentionalText } = useContent('about.intentional.text', { lang, fallback: '' });
  const { val: aboutFoundationLabel } = useContent('about.foundation.label', { lang, fallback: '' });
  const { val: aboutFoundationTitle } = useContent('about.foundation.title', { lang, fallback: '' });
  const { val: aboutFoundationText1 } = useContent('about.foundation.text1', { lang, fallback: '' });
  const { val: aboutFoundationText2 } = useContent('about.foundation.text2', { lang, fallback: '' });
  const { val: aboutTeamMember1Name } = useContent('about.team.member1.name', { lang, fallback: '' });
  const { val: aboutTeamMember1Title } = useContent('about.team.member1.title', { lang, fallback: '' });
  const { val: aboutTeamMember1Image } = useContent('about.team.member1.image', { lang, fallback: '' });
  const { val: aboutTeamMember2Name } = useContent('about.team.member2.name', { lang, fallback: '' });
  const { val: aboutTeamMember2Title } = useContent('about.team.member2.title', { lang, fallback: '' });
  const { val: aboutTeamMember2Image } = useContent('about.team.member2.image', { lang, fallback: '' });
  const { val: aboutTeamMember3Name } = useContent('about.team.member3.name', { lang, fallback: '' });
  const { val: aboutTeamMember3Title } = useContent('about.team.member3.title', { lang, fallback: '' });
  const { val: aboutTeamMember3Image } = useContent('about.team.member3.image', { lang, fallback: '' });
  const { val: aboutFounderNoteHeading } = useContent('about.founder.note.heading', { lang, fallback: '' });
  const { val: aboutFounderLetter } = useContent('about.founder.letter', { lang, fallback: '' });
  const { val: aboutTeamLabel } = useContent('about.team.label', { lang, fallback: '' });
  const { val: aboutTeamTitle } = useContent('about.team.title', { lang, fallback: '' });
  const { val: aboutTeamDescription } = useContent('about.team.description', { lang, fallback: '' });
  const { val: aboutValuesImage } = useContent('about.values.image', { lang, fallback: '' });
  const { val: aboutFoundationImage } = useContent('about.foundation.image', { lang, fallback: '' });
  const { val: aboutIntentionalImage } = useContent('about.intentional.image', { lang, fallback: '' });
  const { val: aboutFounderSignatureImage } = useContent('about.founder.signature.image', { lang, fallback: '' });
  // Shop
  const { val: shopEmptyAll } = useContent('shop.empty.all', { lang, fallback: 'No products are available yet.' });
  const { val: shopEmptyFiltered } = useContent('shop.empty.filtered', { lang, fallback: '' });
  const { val: shopBackToAll } = useContent('shop.back.to.all', { lang, fallback: '' });
  const { val: shopShowMore } = useContent('shop.show.more', { lang, fallback: '' });
  const { val: shopActiveFilters } = useContent('shop.active.filters', { lang, fallback: '' });
  const { val: shopClearAll } = useContent('shop.clear.all', { lang, fallback: '' });
  const { val: shopSortLabel } = useContent('shop.sort.label', { lang, fallback: '' });
  // Product
  const { val: productAddToBag } = useContent('product.add.to.bag', { lang, fallback: 'add to bag' });
  const { val: productBuyNow } = useContent('product.buy.now', { lang, fallback: 'BUY NOW' });
  const { val: productSoldOut } = useContent('product.sold.out', { lang, fallback: '' });
  const { val: productAfterpayText } = useContent('product.afterpay.text', { lang, fallback: '' });
  const { val: productNoReviews } = useContent('product.no.reviews', { lang, fallback: '' });
  const { val: productDetailsFallback } = useContent('product.details.fallback', { lang, fallback: '' });
  const { val: productUnavailableHeadline } = useContent('product.unavailable.headline', { lang, fallback: '' });
  const { val: productUnavailableDesc } = useContent('product.unavailable.desc', { lang, fallback: '' });
  const { val: productUnavailableCta } = useContent('product.unavailable.cta', { lang, fallback: '' });
  const { val: productSelectOption } = useContent('product.select.option', { lang, fallback: '' });
  const { val: productRatingLabel } = useContent('product.rating.label', { lang, fallback: 'AVERAGE RATING' });
  // Cart
  const { val: cartEmptyDrawer } = useContent('cart.empty.drawer', { lang, fallback: '' });
  const { val: cartContinueShopping } = useContent('cart.continue.shopping', { lang, fallback: '' });
  const { val: cartShippingDisclaimer } = useContent('cart.shipping.disclaimer', { lang, fallback: '' });
  const { val: cartCheckoutLabel } = useContent('cart.checkout.label', { lang, fallback: '' });
  const { val: cartBagLabel } = useContent('cart.bag.label', { lang, fallback: '' });
  // Checkout
  const { val: checkoutHeading } = useContent('checkout.heading', { lang, fallback: 'CHECKOUT' });
  const { val: checkoutShippingHeading } = useContent('checkout.shipping.heading', { lang, fallback: '' });
  const { val: checkoutPlaceOrder } = useContent('checkout.place.order', { lang, fallback: 'PLACE ORDER' });
  const { val: checkoutCardLabel } = useContent('checkout.card.label', { lang, fallback: '' });
  const { val: checkoutPaypalLabel } = useContent('checkout.paypal.label', { lang, fallback: '' });
  const { val: checkoutCodLabel } = useContent('checkout.cod.label', { lang, fallback: '' });
  const { val: checkoutReviewHeading } = useContent('checkout.review.heading', { lang, fallback: '' });
  const { val: checkoutTermsText } = useContent('checkout.terms.text', { lang, fallback: '' });
  const { val: checkoutConfirmedHeading } = useContent('checkout.confirmed.heading', { lang, fallback: '' });
  const { val: checkoutConfirmedMessage } = useContent('checkout.confirmed.message', { lang, fallback: '' });
  const { val: checkoutNavBack } = useContent('checkout.nav.back', { lang, fallback: 'Back' });
  const { val: checkoutNavContinue } = useContent('checkout.nav.continue', { lang, fallback: 'Continue' });
  const { val: checkoutSubmittingText } = useContent('checkout.submitting.text', { lang, fallback: '' });
  const { val: checkoutBackToShop } = useContent('checkout.back.to.shop', { lang, fallback: '' });
  const { val: checkoutPaymentHeading } = useContent('checkout.payment.heading', { lang, fallback: '' });
  // Auth
  const { val: authHeadingLogin } = useContent('auth.heading.login', { lang, fallback: 'Login' });
  const { val: authHeadingSignup } = useContent('auth.heading.signup', { lang, fallback: '' });
  const { val: authHeadingAccount } = useContent('auth.heading.account', { lang, fallback: '' });
  const { val: authSignedInAs } = useContent('auth.signed.in.as', { lang, fallback: '' });
  const { val: authSignOut } = useContent('auth.sign.out', { lang, fallback: '' });
  const { val: authPlaceholderName } = useContent('auth.placeholder.name', { lang, fallback: '' });
  const { val: authPlaceholderEmail } = useContent('auth.placeholder.email', { lang, fallback: '' });
  const { val: authPlaceholderPassword } = useContent('auth.placeholder.password', { lang, fallback: '' });
  const { val: authPlaceholderPhone } = useContent('auth.placeholder.phone', { lang, fallback: '' });
  const { val: authSubmitLogin } = useContent('auth.submit.login', { lang, fallback: '' });
  const { val: authSubmitSignup } = useContent('auth.submit.signup', { lang, fallback: '' });
  const { val: authToggleToRegister } = useContent('auth.toggle.to.register', { lang, fallback: '' });
  const { val: authToggleToLogin } = useContent('auth.toggle.to.login', { lang, fallback: '' });
  const { val: authLoginImage } = useContent('auth.login.image', { lang, fallback: '' });
  const { val: authLoginTagline } = useContent('auth.login.tagline', { lang, fallback: '' });
  // Search
  const { val: searchPlaceholder } = useContent('search.placeholder', { lang, fallback: 'Type here' });
  const { val: searchDrawerTitle } = useContent('search.drawer.title', { lang, fallback: 'search' });
  const { val: searchNoResults } = useContent('search.no.results', { lang, fallback: '' });
  const { val: searchCollectionsHeading } = useContent('search.collections.heading', { lang, fallback: '' });
  const { val: searchProductsHeading } = useContent('search.products.heading', { lang, fallback: '' });
  const { val: searchBrandsHeading } = useContent('search.brands.heading', { lang, fallback: '' });
  const { val: searchCollectionsUnavailable } = useContent('search.collections.unavailable', { lang, fallback: '' });
  // Vlog
  const { val: vlogHeroImage } = useContent('vlog.hero.image', { lang, fallback: '' });
  const { val: vlogHeroTitle } = useContent('vlog.hero.title', { lang, fallback: 'PRODUCT STORIES' });
  // FAQ
  const { val: faqHeroImage } = useContent('faq.hero.image', { lang, fallback: '' });
  const { val: faqHeroTitle } = useContent('faq.hero.title', { lang, fallback: '' });
  // Contact
  const { val: contactHeroImage } = useContent('contact.hero.image', { lang, fallback: '' });
  const { val: contactHeroHeading } = useContent('contact.hero.heading', { lang, fallback: 'get in touch' });
  const { val: contactInfoTitle } = useContent('contact.info.title', { lang, fallback: '' });
  const { val: contactSupportInfo } = useContent('contact.support.info', { lang, fallback: '' });
  const { val: contactSupportHours } = useContent('contact.support.hours', { lang, fallback: '' });
  // footer.support.hours is a separate registry key from contact.support.hours
  // (both registered with the same default). Admin edits to the footer key
  // must reflect on the footer without touching the contact page, so we
  // read it independently and fall back to the contact-page value when unset.
  const { val: footerSupportHours } = useContent('footer.support.hours', { lang, fallback: contactSupportHours || '' });
  const { val: contactEmail } = useContent('contact.email', { lang, fallback: 'hello@icare.com' });
  const { val: contactEmailLabel } = useContent('contact.email.label', { lang, fallback: 'email' });
  const { val: contactWholesaleEmail } = useContent('contact.wholesale.email', { lang, fallback: '' });
  const { val: contactWholesaleLabel } = useContent('contact.wholesale.label', { lang, fallback: '' });
  const { val: contactFaqTitle } = useContent('contact.faq.title', { lang, fallback: '' });
  const { val: contactFaqText } = useContent('contact.faq.text', { lang, fallback: '' });
  const { val: contactFaqCta } = useContent('contact.faq.cta', { lang, fallback: '' });
  // Store Locator — canonical marketing.store.locator.* keys
  // (store.locator.* aliases were removed in CRIT-03).
  const { val: storeLocatorTagline } = useContent('marketing.store.locator.tagline', { lang, fallback: 'find icare near you' });
  const { val: storeLocatorNoResults } = useContent('marketing.store.locator.no.results', { lang, fallback: '' });
  // Wishlist
  const { val: wishlistEmpty } = useContent('wishlist.empty', { lang, fallback: '' });
  const { val: wishlistEmptySubtext } = useContent('wishlist.empty.subtext', { lang, fallback: '' });
  const { val: wishlistRecommendationsTitle } = useContent('wishlist.recommendations.title', { lang, fallback: '' });
  // Reviews
  const { val: reviewVerifiedLabel } = useContent('review.verified.label', { lang, fallback: '' });
  const { val: reviewFilterButton } = useContent('review.filter.button', { lang, fallback: '' });
  const { val: reviewSortRecent } = useContent('review.sort.recent', { lang, fallback: '' });
  const { val: reviewShowMore } = useContent('review.show.more', { lang, fallback: '' });
  const { val: reviewShowLess } = useContent('review.show.less', { lang, fallback: '' });
  const { val: reviewHelpfulQuestion } = useContent('review.helpful.question', { lang, fallback: '' });
  const { val: reviewHydrationQuestion } = useContent('review.hydration.question', { lang, fallback: '' });
  const { val: reviewWriteButton } = useContent('review.write.button', { lang, fallback: '' });
  const { val: reviewSortHighest } = useContent('review.sort.highest', { lang, fallback: '' });
  const { val: reviewSortLowest } = useContent('review.sort.lowest', { lang, fallback: '' });
  const { val: reviewSortHelpful } = useContent('review.sort.helpful', { lang, fallback: '' });
  const { val: reviewLoadMore } = useContent('review.load.more', { lang, fallback: '' });
  const { val: reviewFilterStars } = useContent('review.filter.stars', { lang, fallback: '' });
  // Hydration — review labels remain hardcoded literals.
  const reviewHydrationLow = 'Not very hydrated';
  const reviewHydrationHigh = 'Super hydrated';
  // Footer
  const { val: footerNewsletterText } = useContent('footer.newsletter.text', { lang, fallback: '' });
  const { val: footerNewsletterSubtitle } = useContent('footer.newsletter.subtitle', { lang, fallback: '' });
  const { val: footerEmailPlaceholder } = useContent('footer.email.placeholder', { lang, fallback: '' });
  const { val: footerSubscribeBtn } = useContent('footer.subscribe.btn', { lang, fallback: '' });
  const { val: footerPrivacyNotice } = useContent('footer.privacy.notice', { lang, fallback: '' });
  const { val: footerCopyright } = useContent('footer.copyright', { lang, fallback: `© iCare ${new Date().getFullYear()}` });
  const { val: footerCountryRegion } = useContent('footer.country.region', { lang, fallback: '' });
  const { val: footerNavigateTitle } = useContent('footer.columns.title.navigate', { lang, fallback: '' });
  const { val: footerSocialTitle } = useContent('footer.columns.title.social', { lang, fallback: '' });
  const { val: footerOfficialTitle } = useContent('footer.columns.title.official', { lang, fallback: '' });
  const { val: footerSupportTitle } = useContent('footer.columns.title.support', { lang, fallback: '' });
  const { val: footerSupportSubtext } = useContent('footer.support.subtext', { lang, fallback: '' });
  const { val: footerCookieLink } = useContent('footer.cookie.link', { lang, fallback: '' });
  const { val: footerLinkShop } = useContent('footer.link.shop', { lang, fallback: 'Shop' });
  const { val: footerLinkStory } = useContent('footer.link.story', { lang, fallback: '' });
  const { val: footerLinkVlog } = useContent('footer.link.vlog', { lang, fallback: '' });
  const { val: footerLinkFindUs } = useContent('footer.link.find.us', { lang, fallback: '' });
  const { val: footerLinkPrivacy } = useContent('footer.link.privacy', { lang, fallback: '' });
  const { val: footerLinkTerms } = useContent('footer.link.terms', { lang, fallback: '' });
  const { val: footerLinkAccessibility } = useContent('footer.link.accessibility', { lang, fallback: '' });
  const { val: footerLinkFaq } = useContent('footer.link.faq', { lang, fallback: '' });
  const { val: footerLinkContact } = useContent('footer.link.contact', { lang, fallback: '' });

  // Brand
  const { val: siteNameCp } = useContent('marketing.site.name', { lang, fallback: 'iCare Beauty' });
  const siteName = siteNameCp || 'iCare Beauty';
  const metaTitle = 'iCare Beauty';
  const metaDescription = 'iCare Beauty skincare essentials.';
  const siteDescription = 'iCare Beauty skincare essentials.';
  const siteUrl = '';
  const ogImage = '';

  // socialLinks, freeShippingThreshold, shippingRates, defaultShippingCost,
  // shippingPageContent, currencyCode, defaultCountry, enableWishlist,
  // enableProductReviews, enableGuestCheckout, itemsPerPage — out-of-scope
  // (number/JSON object/feature flag) → sourced from settings + context.
  // out-of-scope: number/JSON, registry is text-only.
  const socialLinks = normalizeSocialLinksResponse(contextSocialLinks);
  const freeShippingThreshold = parseSettingNumber(resolveSetting(settings?.shipping?.free_shipping_threshold, settings?.general?.free_shipping_threshold));
  const cartShippingUnlockedText = resolveSetting(settings?.shipping?.free_shipping_unlocked_text, settings?.general?.free_shipping_unlocked_text) ?? '';
  const shippingPageContent = resolveShippingPageContent(
    parseShippingPageContent(resolveSetting(settings?.shipping?.shipping_page_content, settings?.general?.shipping_page_content)),
    lang,
  );
  // out-of-scope: number
  const checkoutTaxRate = Number(settings?.general?.tax_rate ?? '0');
  // out-of-scope: JSON string
  const shippingRates = settings?.general?.shipping_rates ?? '[]';
  // out-of-scope: number
  const defaultShippingCost = parseSettingNumber(resolveSetting(settings?.shipping?.default_shipping_cost, settings?.general?.default_shipping_cost));
  // out-of-scope: feature flag
  const enableWishlist = settings?.general?.enable_wishlist !== 'false';
  const enableProductReviews = settings?.general?.enable_product_reviews !== 'false';
  const enableGuestCheckout = settings?.general?.enable_guest_checkout !== 'false';
  const defaultCountry = settings?.general?.default_country;
  const currencyCode = settings?.general?.currency_code && settings?.general?.currency_code !== 'NaN' ? settings?.general?.currency_code : 'USD';
  // out-of-scope: number
  const itemsPerPage = Number(settings?.general?.items_per_page ?? '12');
  // Aliases preserved for back-compat
  const productBuyNowTemplate = productBuyNow;

  // productShowcaseEmpty/TrendingTitle fallback: hardcoded literal.
  // (productShowcaseLoading was removed — ProductShowcase uses SkeletonPulse.)
  const productShowcaseEmptyFinal = productShowcaseEmpty || 'no featured products are available yet';
  const trendingTitleFinal = trendingTitle || 'trending essentials';
  // searchNoResultsTemplate preserves the legacy alias
  const searchNoResultsTemplate = searchNoResults;

  return useMemo(() => ({
    // ── Brand ──
    siteName,
    metaTitle,
    metaDescription,
    siteDescription,
    siteUrl,
    ogImage: resolveMediaUrl(ogImage),
    // ── Announcement ──
    announcementText,
    freeShippingThreshold,
    cartShippingUnlockedText,
    // ── Home Hero ──
    heroHeadline: heroHeadline || 'the barrier butter.',
    heroImage: resolveMediaUrl(heroImage),
    // ── Home Sections ──
    trendingTitle: trendingTitleFinal,
    marqueeText,
    promoBadge,
    promoHeadline,
    promoDescription,
    promoCtaLabel,
    promoImage: resolveMediaUrl(promoImage),
    philosophyHeadline,
    philosophyText,
    philosophyCta,
    philosophyImage: resolveMediaUrl(philosophyImage),
    commitmentHeadline,
    commitmentCta,
    commitmentImage: resolveMediaUrl(commitmentImage),
    socialGridHeading,
    socialGridCta,
    socialGridImage1: resolveMediaUrl(socialGridImage1),
    socialGridImage2: resolveMediaUrl(socialGridImage2),
    socialGridImage3: resolveMediaUrl(socialGridImage3),
    socialGridImage4: resolveMediaUrl(socialGridImage4),
    productShowcaseEmpty: productShowcaseEmptyFinal,
    // ── About Page ──
    aboutHeroHeadline,
    aboutHeroCta,
    aboutHeroImage: resolveMediaUrl(aboutHeroImage),
    aboutIntentionalTitle,
    aboutIntentionalText,
    aboutFoundationLabel,
    aboutFoundationTitle,
    aboutFoundationText1,
    aboutFoundationText2,
    aboutTeamMember1Name,
    aboutTeamMember1Title,
    aboutTeamMember1Image: resolveMediaUrl(aboutTeamMember1Image),
    aboutTeamMember2Name,
    aboutTeamMember2Title,
    aboutTeamMember2Image: resolveMediaUrl(aboutTeamMember2Image),
    aboutTeamMember3Name,
    aboutTeamMember3Title,
    aboutTeamMember3Image: resolveMediaUrl(aboutTeamMember3Image),
    aboutFounderNoteHeading,
    aboutFounderLetter,
    aboutTeamLabel,
    aboutTeamTitle,
    aboutTeamDescription,
    aboutValuesImage: resolveMediaUrl(aboutValuesImage),
    aboutFoundationImage: resolveMediaUrl(aboutFoundationImage),
    aboutIntentionalImage: resolveMediaUrl(aboutIntentionalImage),
    aboutFounderSignatureImage: resolveMediaUrl(aboutFounderSignatureImage),
    // ── Shop ──
    shopEmptyAll,
    shopEmptyFiltered,
    shopBackToAll,
    shopShowMore,
    shopActiveFilters,
    shopClearAll,
    shopSortLabel,
    // ── Product ──
    productAddToBag,
    productBuyNow,
    productBuyNowTemplate,
    reviewHydrationLow,
    reviewHydrationHigh,
    productSoldOut,
    productAfterpayText,
    productNoReviews,
    productDetailsFallback,
    productUnavailableHeadline,
    productUnavailableDesc,
    productUnavailableCta,
    productSelectOption,
    productRatingLabel,
    // ── Cart ──
    cartEmptyDrawer,
    cartContinueShopping,
    cartShippingDisclaimer,
    cartCheckoutLabel,
    cartBagLabel,
    shippingPageContent,
    // ── Checkout ──
    checkoutHeading,
    checkoutShippingHeading,
    checkoutPlaceOrder,
    checkoutTaxRate,
    shippingRates,
    defaultShippingCost,
    checkoutCardLabel,
    checkoutPaypalLabel,
    checkoutCodLabel,
    checkoutReviewHeading,
    checkoutTermsText,
    checkoutConfirmedHeading,
    checkoutConfirmedMessage,
    checkoutNavBack,
    checkoutNavContinue,
    checkoutSubmittingText,
    checkoutBackToShop,
    checkoutPaymentHeading,
    // ── Auth ──
    authHeadingLogin,
    authHeadingSignup,
    authHeadingAccount,
    authSignedInAs,
    authSignOut,
    authPlaceholderName,
    authPlaceholderEmail,
    authPlaceholderPassword,
    authPlaceholderPhone,
    authSubmitLogin,
    authSubmitSignup,
    authToggleToRegister,
    authToggleToLogin,
    authLoginImage: resolveMediaUrl(authLoginImage),
    authLoginTagline,
    // ── Search ──
    searchPlaceholder,
    searchDrawerTitle,
    searchNoResults,
    searchNoResultsTemplate,
    searchCollectionsHeading,
    searchProductsHeading,
    searchBrandsHeading,
    searchCollectionsUnavailable,
    // ── Vlog ──
    vlogHeroImage: resolveMediaUrl(vlogHeroImage),
    vlogHeroTitle,
    // ── FAQ ──
    faqHeroImage: resolveMediaUrl(faqHeroImage),
    faqHeroTitle,
    // ── Contact ──
    contactHeroImage: resolveMediaUrl(contactHeroImage),
    contactHeroHeading,
    contactInfoTitle,
    contactSupportInfo,
    contactSupportHours,
    footerSupportHours,
    contactEmail,
    contactEmailLabel,
    contactWholesaleEmail,
    contactWholesaleLabel,
    contactFaqTitle,
    contactFaqText,
    contactFaqCta,
    // ── Store Locator ──
    storeLocatorTagline,
    // storeLocatorMapImage removed (CRIT-06) — StoreLocatorMap renders
    // Leaflet OSM tiles, not a static image fallback.
    storeLocatorNoResults,
    // ── Wishlist ──
    wishlistEmpty,
    wishlistEmptySubtext,
    wishlistRecommendationsTitle,
    // ── Reviews ──
    reviewVerifiedLabel,
    reviewFilterButton,
    reviewSortRecent,
    reviewShowMore,
    reviewShowLess,
    reviewHelpfulQuestion,
    reviewHydrationQuestion,
    reviewWriteButton,
    reviewSortHighest,
    reviewSortLowest,
    reviewSortHelpful,
    reviewLoadMore,
    reviewFilterStars,
    // ── Social ──
    socialLinks,
    // ── Footer ──
    footerNewsletterText,
    footerNewsletterSubtitle,
    footerEmailPlaceholder,
    footerSubscribeBtn,
    footerPrivacyNotice,
    footerCopyright,
    footerCountryRegion,
    footerNavigateTitle,
    footerSocialTitle,
    footerOfficialTitle,
    footerSupportTitle,
    footerSupportSubtext,
    footerCookieLink,
    footerLinkShop,
    footerLinkStory,
    footerLinkVlog,
    footerLinkFindUs,
    footerLinkPrivacy,
    footerLinkTerms,
    footerLinkAccessibility,
    footerLinkFaq,
    footerLinkContact,
    // ── Features ──
    enableWishlist,
    enableProductReviews,
    enableGuestCheckout,
    defaultCountry,
    currencyCode,
    itemsPerPage,
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [
    lang,
    settings, contextSocialLinks,
    heroHeadline, heroImage,
    trendingTitle, marqueeText,
    promoBadge, promoHeadline, promoDescription, promoCtaLabel, promoImage,
    philosophyHeadline, philosophyText, philosophyCta, philosophyImage,
    commitmentHeadline, commitmentCta, commitmentImage,
    socialGridHeading, socialGridCta,
    socialGridImage1, socialGridImage2, socialGridImage3, socialGridImage4,
    productShowcaseEmpty,
    announcementText,
    aboutHeroHeadline, aboutHeroCta, aboutHeroImage,
    aboutIntentionalTitle, aboutIntentionalText,
    aboutFoundationLabel, aboutFoundationTitle, aboutFoundationText1, aboutFoundationText2,
    aboutTeamMember1Name, aboutTeamMember1Title, aboutTeamMember1Image,
    aboutTeamMember2Name, aboutTeamMember2Title, aboutTeamMember2Image,
    aboutTeamMember3Name, aboutTeamMember3Title, aboutTeamMember3Image,
    aboutFounderNoteHeading, aboutFounderLetter,
    aboutTeamLabel, aboutTeamTitle, aboutTeamDescription,
    aboutValuesImage, aboutFoundationImage, aboutIntentionalImage, aboutFounderSignatureImage,
    shopEmptyAll, shopEmptyFiltered, shopBackToAll, shopShowMore, shopActiveFilters, shopClearAll, shopSortLabel,
    productAddToBag, productBuyNow, productSoldOut, productAfterpayText, productNoReviews,
    productDetailsFallback, productUnavailableHeadline, productUnavailableDesc, productUnavailableCta,
    productSelectOption, productRatingLabel,
    cartEmptyDrawer, cartContinueShopping, cartShippingDisclaimer, cartCheckoutLabel, cartBagLabel,
    checkoutHeading, checkoutShippingHeading, checkoutPlaceOrder,
    checkoutCardLabel, checkoutPaypalLabel, checkoutCodLabel, checkoutReviewHeading,
    checkoutTermsText, checkoutConfirmedHeading, checkoutConfirmedMessage,
    checkoutNavBack, checkoutNavContinue, checkoutSubmittingText, checkoutBackToShop, checkoutPaymentHeading,
    authHeadingLogin, authHeadingSignup, authHeadingAccount, authSignedInAs, authSignOut,
    authPlaceholderName, authPlaceholderEmail, authPlaceholderPassword, authPlaceholderPhone,
    authSubmitLogin, authSubmitSignup, authToggleToRegister, authToggleToLogin,
    authLoginImage, authLoginTagline,
    searchPlaceholder, searchDrawerTitle, searchNoResults,
    searchCollectionsHeading, searchProductsHeading, searchBrandsHeading, searchCollectionsUnavailable,
    vlogHeroImage, vlogHeroTitle,
    faqHeroImage, faqHeroTitle,
    contactHeroImage, contactHeroHeading, contactInfoTitle, contactSupportInfo, contactSupportHours, footerSupportHours,
    contactEmail, contactEmailLabel, contactWholesaleEmail, contactWholesaleLabel,
    contactFaqTitle, contactFaqText, contactFaqCta,
    storeLocatorTagline, storeLocatorNoResults,
    wishlistEmpty, wishlistEmptySubtext, wishlistRecommendationsTitle,
    reviewVerifiedLabel, reviewFilterButton, reviewSortRecent, reviewShowMore, reviewShowLess,
    reviewHelpfulQuestion, reviewHydrationQuestion, reviewWriteButton,
    reviewSortHighest, reviewSortLowest, reviewSortHelpful, reviewLoadMore, reviewFilterStars,
    footerNewsletterText, footerNewsletterSubtitle, footerEmailPlaceholder, footerSubscribeBtn,
    footerPrivacyNotice, footerCopyright, footerCountryRegion,
    footerNavigateTitle, footerSocialTitle, footerOfficialTitle, footerSupportTitle, footerSupportSubtext,
    footerCookieLink,
    footerLinkShop, footerLinkStory, footerLinkVlog, footerLinkFindUs,
    footerLinkPrivacy, footerLinkTerms, footerLinkAccessibility, footerLinkFaq, footerLinkContact,
  ]);
};
