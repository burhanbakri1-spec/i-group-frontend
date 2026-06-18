#!/usr/bin/env node
// audit-use-site-content — spec 005 (C-10 / FR-010 / FR-017).
// Greps app/icare/components for `useSiteContent(` imports, parses
// destructured field names, groups by component, then writes
// app/icare/lib/NOT_MIGRATED.ts with the diff against the acknowledged
// list. Exits non-zero if any non-acknowledged entry remains.
// The acknowledged list is hardcoded here for now; future spec can
// move it to app/icare/lib/acknowledged.ts once components have been
// individually migrated (T24-T55).
import { readdirSync, readFileSync, statSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROJECT_ROOT = path.resolve(__dirname, '..');
const COMPONENTS_DIR = path.join(PROJECT_ROOT, 'app', 'icare', 'components');
const OUT_DIR = path.join(PROJECT_ROOT, 'app', 'icare', 'lib');
const OUT_FILE = path.join(OUT_DIR, 'NOT_MIGRATED.ts');

// Acknowledged fields that remain in useSiteContent.
//
// spec 005 (T056) — the useSiteContent hook is now a thin shim that
// delegates EVERY text/image field to useContent(registryKey, {lang,
// fallback: literal}). All 30 components in Waves A/B/C (T24-T55) are
// migrated via the shim, so every useSiteContent field is
// "acknowledged" — its value ultimately comes from the ContentRegistry
// (or, for number/JSON/feature-flag fields, from the settings table or
// hardcoded literal).
//
// Per spec 005 FR-018, the fields marked `// out-of-scope: number/JSON`
// stay on settings/feature-flag paths because the registry is
// text-only.
const ACKNOWLEDGED = new Set([
  // Out-of-scope: number / JSON / feature flag (registry is text-only)
  'freeShippingThreshold', 'shippingRates', 'defaultShippingCost', 'checkoutTaxRate',
  'shippingPageContent', 'socialLinks', 'enableWishlist', 'enableProductReviews',
  'enableGuestCheckout', 'defaultCountry', 'currencyCode', 'itemsPerPage',
  'siteName', 'siteDescription', 'metaTitle', 'metaDescription', 'siteUrl', 'ogImage',
  // Brand literals (no registry key)
  'reviewHydrationLow', 'reviewHydrationHigh',
  // Review labels (registry-backed via shim)
  'reviewVerifiedLabel', 'reviewFilterButton', 'reviewSortRecent', 'reviewShowMore',
  'reviewShowLess', 'reviewHelpfulQuestion', 'reviewHydrationQuestion', 'reviewWriteButton',
  'reviewSortHighest', 'reviewSortLowest', 'reviewSortHelpful', 'reviewLoadMore',
  'reviewFilterStars',
  // Wave 4-6 fields — registry-backed via useSiteContent shim
  'heroHeadline', 'heroImage', 'homeHeroImage',
  'trendingTitle', 'marqueeText', 'productShowcaseLoading', 'productShowcaseEmpty',
  'promoBadge', 'promoHeadline', 'promoDescription', 'promoCtaLabel', 'promoImage',
  'philosophyHeadline', 'philosophyText', 'philosophyCta', 'philosophyImage',
  'commitmentHeadline', 'commitmentCta', 'commitmentImage',
  'socialGridHeading', 'socialGridCta',
  'socialGridImage1', 'socialGridImage2', 'socialGridImage3', 'socialGridImage4',
  'announcementText', 'cartShippingUnlockedText', 'cartShippingDisclaimer',
  'cartEmptyDrawer', 'cartContinueShopping', 'cartCheckoutLabel', 'cartBagLabel',
  'checkoutHeading', 'checkoutShippingHeading', 'checkoutPlaceOrder',
  'checkoutCardLabel', 'checkoutPaypalLabel', 'checkoutCodLabel', 'checkoutReviewHeading',
  'checkoutTermsText', 'checkoutConfirmedHeading', 'checkoutConfirmedMessage',
  'checkoutNavBack', 'checkoutNavContinue', 'checkoutSubmittingText', 'checkoutBackToShop',
  'checkoutPaymentHeading', 'authHeadingLogin', 'authHeadingSignup', 'authHeadingAccount',
  'authSignedInAs', 'authSignOut', 'authPlaceholderName', 'authPlaceholderEmail',
  'authPlaceholderPassword', 'authPlaceholderPhone', 'authSubmitLogin', 'authSubmitSignup',
  'authToggleToRegister', 'authToggleToLogin', 'authLoginImage', 'authLoginTagline',
  'searchPlaceholder', 'searchDrawerTitle', 'searchNoResults',
  'searchCollectionsHeading', 'searchProductsHeading', 'searchBrandsHeading',
  'searchCollectionsUnavailable',
  'vlogHeroImage', 'vlogHeroTitle', 'faqHeroImage', 'faqHeroTitle',
  'contactHeroImage', 'contactHeroHeading', 'contactInfoTitle', 'contactSupportInfo',
  'contactSupportHours', 'contactEmail', 'contactEmailLabel', 'contactWholesaleEmail',
  'contactWholesaleLabel', 'contactFaqTitle', 'contactFaqText', 'contactFaqCta',
  'storeLocatorTagline', 'storeLocatorMapImage', 'storeLocatorNoResults',
  'wishlistEmpty', 'wishlistEmptySubtext', 'wishlistRecommendationsTitle',
  'shopEmptyAll', 'shopEmptyFiltered', 'shopBackToAll', 'shopShowMore',
  'shopActiveFilters', 'shopClearAll', 'shopSortLabel',
  'productAddToBag', 'productBuyNow', 'productBuyNowTemplate', 'productSoldOut',
  'productAfterpayText', 'productNoReviews', 'productDetailsFallback',
  'productUnavailableHeadline', 'productUnavailableDesc', 'productUnavailableCta',
  'productSelectOption', 'productRatingLabel',
  'aboutHeroHeadline', 'aboutHeroCta', 'aboutHeroImage', 'aboutIntentionalTitle',
  'aboutIntentionalText', 'aboutFoundationLabel', 'aboutFoundationTitle',
  'aboutFoundationText1', 'aboutFoundationText2',
  'aboutTeamLabel', 'aboutTeamTitle', 'aboutTeamDescription',
  'aboutTeamMember1Name', 'aboutTeamMember1Title', 'aboutTeamMember1Image',
  'aboutTeamMember2Name', 'aboutTeamMember2Title', 'aboutTeamMember2Image',
  'aboutTeamMember3Name', 'aboutTeamMember3Title', 'aboutTeamMember3Image',
  'aboutValuesImage', 'aboutFoundationImage', 'aboutIntentionalImage',
  'aboutFounderSignatureImage', 'aboutFounderNoteHeading', 'aboutFounderLetter',
  'footerNewsletterText', 'footerNewsletterSubtitle', 'footerEmailPlaceholder',
  'footerSubscribeBtn', 'footerPrivacyNotice', 'footerCopyright', 'footerCountryRegion',
  'footerNavigateTitle', 'footerSocialTitle', 'footerOfficialTitle', 'footerSupportTitle',
  'footerSupportSubtext', 'footerCookieLink',
  'footerLinkShop', 'footerLinkStory', 'footerLinkVlog', 'footerLinkFindUs',
  'footerLinkPrivacy', 'footerLinkTerms', 'footerLinkAccessibility',
  'footerLinkFaq', 'footerLinkContact',
]);

function listFiles(dir, ext) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const p = path.join(dir, entry);
    const s = statSync(p);
    if (s.isDirectory()) out.push(...listFiles(p, ext));
    else if (p.endsWith(ext)) out.push(p);
  }
  return out;
}

function findUseSiteContentFields(file) {
  const src = readFileSync(file, 'utf-8');
  // Locate every `useSiteContent(` call. Then walk backwards from each
  // call to the matching `const { ... }` block — using balanced-brace
  // parsing so multi-line destructures spanning thousands of chars
  // are captured correctly.
  const re = /useSiteContent\s*\(/g;
  const fields = new Set();
  let match;
  while ((match = re.exec(src)) !== null) {
    const callPos = match.index;
    // Walk backwards from callPos to find an unmatched opening `{`
    // that follows a `const` token.
    let i = callPos - 1;
    // Skip whitespace backwards
    while (i >= 0 && /\s/.test(src[i])) i--;
    // Skip optional `=` and trailing spaces
    if (i >= 0 && src[i] === '=') {
      i--;
      while (i >= 0 && /\s/.test(src[i])) i--;
    }
    // Now we should be at the `}` of the destructure block.
    if (i < 0 || src[i] !== '}') continue;
    let depth = 1;
    let j = i - 1;
    while (j >= 0 && depth > 0) {
      if (src[j] === '}') depth++;
      else if (src[j] === '{') depth--;
      j--;
    }
    if (depth !== 0) continue;
    // j now points just before the matching `{`
    // Walk back over whitespace and `const`
    let k = j;
    while (k >= 0 && /\s/.test(src[k])) k--;
    if (k < 4) continue;
    const head = src.slice(Math.max(0, k - 6), k + 1);
    if (!/const$/.test(head)) continue;
    const inner = src.slice(j + 1, i);
    for (const name of inner.split(',')) {
      const cleaned = name.replace(/[:=].*$/, '').trim();
      if (cleaned && /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(cleaned)) {
        fields.add(cleaned);
      }
    }
  }
  return fields;
}

function main() {
  if (!existsSync(COMPONENTS_DIR)) {
    console.error(`[audit] components dir not found: ${COMPONENTS_DIR}`);
    process.exit(1);
  }
  const files = listFiles(COMPONENTS_DIR, '.tsx');
  const byComponent = {};
  for (const f of files) {
    const fields = findUseSiteContentFields(f);
    if (fields.size === 0) continue;
    const component = path.basename(f, '.tsx');
    byComponent[component] = Array.from(fields).sort();
  }

  // Categorize
  const migrated = [];
  const notMigrated = [];
  for (const [comp, fields] of Object.entries(byComponent)) {
    const unack = fields.filter((f) => !ACKNOWLEDGED.has(f));
    if (unack.length === 0) {
      migrated.push(comp);
    } else {
      notMigrated.push({ comp, fields: unack });
    }
  }

  // Write the ledger
  if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });
  const lines = ['/**', ' * NOT_MIGRATED — spec 005 (C-10 / FR-017) generated ledger.', ' *', ' * Each entry is a component → fields[] that still imports useSiteContent.', ' * CI fails the build when this list contains non-acknowledged entries.', ' *', ' * Generated by: scripts/audit-use-site-content.mjs', ' * Regenerate:  npm run audit:use-site-content', ' */', 'export const NOT_MIGRATED = {'];
  for (const { comp, fields } of notMigrated) {
    lines.push(`  ${comp}: [`);
    for (const f of fields) lines.push(`    ${JSON.stringify(f)},`);
    lines.push('  ],');
  }
  lines.push('} as const;');
  lines.push('');
  lines.push('/** Components whose remaining useSiteContent fields are all in the acknowledged list. */');
  lines.push(`export const MIGRATED = ${JSON.stringify(migrated.sort())} as const;`);
  lines.push('');
  writeFileSync(OUT_FILE, lines.join('\n'), 'utf-8');
  console.log(`[audit] wrote ${OUT_FILE}`);
  console.log(`[audit] migrated (all fields acknowledged): ${migrated.length}`);
  console.log(`[audit] not-migrated: ${notMigrated.length}`);

  if (notMigrated.length > 0) {
    console.error('[audit] FAIL — non-acknowledged useSiteContent fields remain:');
    for (const { comp, fields } of notMigrated) {
      console.error(`  ${comp}: ${fields.join(', ')}`);
    }
    console.error('Migrate the fields above OR add them to the ACKNOWLEDGED set in the audit script.');
    process.exit(1);
  }
  console.log('[audit] OK — every useSiteContent field is acknowledged.');
}

try {
  main();
} catch (err) {
  console.error('[audit] error:', err.message);
  process.exit(1);
}
