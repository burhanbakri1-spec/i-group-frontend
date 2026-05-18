/**
 * Reference/type contract artifact for future iCare product presentation units.
 * Not wired into runtime yet; importing this file should not change application behavior.
 *
 * This file intentionally contains only exported TypeScript types and reference
 * metadata constants. It imports no React or application code and has no side effects.
 */

/**
 * Confirmed semantic product-detail showcase/storytelling sections from the old
 * ba-group product detail page. These are not visual layouts.
 */
export type ProductPresentationUnitType =
  | 'kit_contents'
  | 'application_steps'
  | 'results_study'
  | 'routine_steps';

/**
 * Current/legacy generic fallback for the flat i-group showcase shape.
 * Keep separate from confirmed old product-detail showcase section types.
 */
export type LegacySimplePresentationUnitType = 'simple_media_text';

export type PresentationTheme = 'light' | 'dark' | 'cream' | 'clinical' | 'brand';

export type ContentDirection = 'ltr' | 'rtl';

/**
 * `direction` controls content flow (ltr = image left / text right;
 * rtl = image right / text left). Applies to both semantic and legacy units.
 * `type`/`unitType` is semantic and drives the section renderer.
 */

export interface MediaAsset {
  url: string;
  alt: string;
  width?: number;
  height?: number;
}

export interface PresentationCta {
  label: string;
  href: string;
}

export interface BaseProductPresentationUnit<
  TType extends ProductPresentationUnitType | LegacySimplePresentationUnitType,
  TPayload,
> {
  id: string;
  type: TType;
  sortOrder: number;
  isActive: boolean;
  theme?: PresentationTheme;
  direction?: ContentDirection;
  payload: TPayload;
}

export interface SimpleMediaTextPayload {
  eyebrow?: string;
  title: string;
  description: string;
  image?: MediaAsset;
  cta?: PresentationCta;
}

export type SimpleMediaTextUnit = BaseProductPresentationUnit<
  'simple_media_text',
  SimpleMediaTextPayload
>;

export interface KitContentsItem {
  id: string;
  title: string;
  description?: string;
  quantity?: string;
  image?: MediaAsset;
  expand?: string;
}

export interface SectionHeadingFragments {
  eyebrow?: string;
  kicker?: string;
  title: string;
  subtitle?: string;
  description?: string;
}

export interface OldSectionLayoutNotes {
  oldBaGroupTopology: string;
  interaction?: string;
  responsiveBehavior?: string;
}

export interface KitContentsPayload {
  heading: SectionHeadingFragments;
  media?: MediaAsset;
  items: readonly KitContentsItem[];
  oldSectionLayoutNotes: OldSectionLayoutNotes;
  note?: string;
}

export type KitContentsUnit = BaseProductPresentationUnit<
  'kit_contents',
  KitContentsPayload
>;

export interface ApplicationStep {
  id: string;
  stepNumber: number;
  label?: string;
  text?: string;
  title: string;
  description: string;
  duration?: string;
  icon?: string;
  image?: MediaAsset;
}

export interface ApplicationStepsPayload {
  heading: SectionHeadingFragments;
  steps: readonly ApplicationStep[];
  defaultActiveStepId?: string;
  interaction: 'active_step';
  note?: string;
}

export type ApplicationStepsUnit = BaseProductPresentationUnit<
  'application_steps',
  ApplicationStepsPayload
>;

export interface ResultsStudyMetric {
  id: string;
  value: string;
  label: string;
  description?: string;
}

export interface BeforeAfterImagePair {
  id: string;
  before: MediaAsset;
  after: MediaAsset;
  label?: string;
}

export interface ResultsStudyTab {
  id: string;
  label: string;
  title?: string;
  description?: string;
  metrics: readonly ResultsStudyMetric[];
  beforeAfterImages?: readonly BeforeAfterImagePair[];
  source?: string;
  disclaimer?: string;
}

export interface ResultsStudyPayload {
  heading: SectionHeadingFragments;
  tabs: readonly ResultsStudyTab[];
  defaultTabId?: string;
  beforeAfterImages?: readonly BeforeAfterImagePair[];
  source?: string;
  disclaimer?: string;
}

export type ResultsStudyUnit = BaseProductPresentationUnit<
  'results_study',
  ResultsStudyPayload
>;

export interface RoutineStep {
  id: string;
  order: number;
  label?: string;
  subtitle?: string;
  title: string;
  description?: string;
  color?: string;
  timing?: string;
  relatedProductSlug?: string;
  icon?: string;
  image?: MediaAsset;
}

export interface RoutineStepsPayload {
  heading: SectionHeadingFragments;
  heroImage?: MediaAsset;
  lifestyleImage?: MediaAsset;
  routineTitle: string;
  routineSubtitle?: string;
  steps: readonly RoutineStep[];
  defaultActiveStepId?: string;
  interaction: 'active_routine_step';
  note?: string;
}

export type RoutineStepsUnit = BaseProductPresentationUnit<
  'routine_steps',
  RoutineStepsPayload
>;

export type ProductPresentationUnit =
  | SimpleMediaTextUnit
  | KitContentsUnit
  | ApplicationStepsUnit
  | ResultsStudyUnit
  | RoutineStepsUnit;

export interface ProductPresentationResponse {
  productId: string;
  productSlug: string;
  units: readonly ProductPresentationUnit[];
}

export type ProductDetailNonShowcaseUnitType =
  | 'product_hero_gallery'
  | 'reviews_summary_list'
  | 'related_lineup'
  | 'sticky_buy_bar';

export interface ProductShowcaseSectionReference {
  unitType: ProductPresentationUnitType;
  oldBaGroupSectionReference: string;
  oldBaGroupDataReference: string;
  newIGroupStatus: string;
  stateRequired: string;
  visualTopology: string;
  backendPayloadNeeds: readonly string[];
}

export interface ProductDetailNonShowcaseReference {
  unitType: ProductDetailNonShowcaseUnitType;
  oldBaGroupReference: string;
  oldBaGroupDataReference: string;
  whyNotShowcaseUnit: string;
  newIGroupStatus: string;
}

export const CONFIRMED_PRODUCT_SHOWCASE_SECTION_TYPES = [
  'kit_contents',
  'application_steps',
  'results_study',
  'routine_steps',
] as const satisfies readonly ProductPresentationUnitType[];

export const PRODUCT_SHOWCASE_SECTION_REFERENCES = [
  {
    unitType: 'kit_contents',
    oldBaGroupSectionReference:
      'ba-group/app/icare/components/ProductPage.tsx kit contents section lines 334-375.',
    oldBaGroupDataReference:
      'Inline kit items in ba-group/app/icare/components/ProductPage.tsx lines 348-364.',
    newIGroupStatus:
      'Not preserved by current generic showcase model except as flattened image/title/description cards, losing section semantics and styling.',
    stateRequired: 'None confirmed beyond static section rendering.',
    visualTopology:
      'Editorial kit contents block with section heading, media, and included-item cards/list.',
    backendPayloadNeeds: [
      'heading fragments: eyebrow/kicker/title/subtitle/description',
      'kit image/media',
      'included item list',
      'item title/description/quantity/image',
      'old section layout notes for topology preservation',
    ],
  },
  {
    unitType: 'application_steps',
    oldBaGroupSectionReference:
      'ba-group/app/icare/components/ProductPage.tsx application section lines 377-473.',
    oldBaGroupDataReference:
      'ba-group/app/icare/components/ProductPage.tsx applicationSteps data lines 27-43.',
    newIGroupStatus:
      'Not represented semantically. Could only be approximated as generic cards, losing step order, numbering, and application-specific layout.',
    stateRequired:
      'Requires active step state equivalent to old activeStep interaction.',
    visualTopology:
      'Step selector/list paired with active-step explanatory text and image.',
    backendPayloadNeeds: [
      'Section heading/subheading',
      'ordered steps with number/label/text/title/description/image',
      'default active step id or deterministic first-step fallback',
      'optional safety or usage note',
    ],
  },
  {
    unitType: 'results_study',
    oldBaGroupSectionReference:
      'ba-group/app/icare/components/ProductPage.tsx results section lines 475-623.',
    oldBaGroupDataReference:
      'Inline metrics in ba-group/app/icare/components/ProductPage.tsx lines 491-520; resultsTab state distinguishes consumer study/community results.',
    newIGroupStatus:
      'Not represented semantically. Current showcase units cannot model metrics, evidence groups, study notes, or result visual hierarchy.',
    stateRequired:
      'Requires active tab/group state equivalent to old resultsTab interaction.',
    visualTopology:
      'Tabbed evidence section with metric cards and before/after proof imagery.',
    backendPayloadNeeds: [
      'Section heading/subheading',
      'tabs/groups for consumer study and community results',
      'metrics list with value/label/description',
      'before/after image pair(s)',
      'disclaimer/source text',
    ],
  },
  {
    unitType: 'routine_steps',
    oldBaGroupSectionReference:
      'ba-group/app/icare/components/ProductPage.tsx routine section lines 625-706.',
    oldBaGroupDataReference:
      'ba-group/app/icare/components/ProductPage.tsx routineSteps data lines 74-110.',
    newIGroupStatus:
      'Not represented semantically. Generic cards cannot preserve routine timing, ordered sequence, or routine-specific styling.',
    stateRequired:
      'Requires active routine step state equivalent to old activeRoutineStep interaction.',
    visualTopology:
      'Lifestyle/hero image plus routine step rail/cards with active-step emphasis.',
    backendPayloadNeeds: [
      'Section heading/subheading',
      'hero/lifestyle image',
      'routine title/subtitle',
      'ordered routine steps with title/subtitle/label/image/color',
      'optional timing/product relation/icon fields',
      'optional routine note',
    ],
  },
] as const satisfies readonly ProductShowcaseSectionReference[];

export const PRODUCT_DETAIL_NON_SHOWCASE_REFERENCES = [
  {
    unitType: 'product_hero_gallery',
    oldBaGroupReference:
      'ba-group/app/icare/components/ProductPage.tsx hero section lines 227-332.',
    oldBaGroupDataReference:
      'ba-group/app/icare/components/ProductPage.tsx productImages data lines 20-25; activeImageIndex state.',
    whyNotShowcaseUnit:
      'Commerce/product identity area, not storytelling showcase. It owns gallery, pricing, purchase CTA, and product detail fields.',
    newIGroupStatus:
      'Already page-owned in i-group/app/icare/components/ProductPage.tsx before ProductShowcaseBlock.',
  },
  {
    unitType: 'reviews_summary_list',
    oldBaGroupReference:
      'ba-group/app/icare/components/ProductPage.tsx reviews data lines 45-72; reviews section lines 708-762.',
    oldBaGroupDataReference:
      'ba-group/app/icare/components/ProductPage.tsx reviews data lines 45-72; isReviewsExpanded state.',
    whyNotShowcaseUnit:
      'Reviews are social proof/UGC summary with expansion state, not one of the confirmed old showcase storytelling sections.',
    newIGroupStatus:
      'Already page-owned after ProductShowcaseBlock in i-group/app/icare/components/ProductPage.tsx.',
  },
  {
    unitType: 'related_lineup',
    oldBaGroupReference:
      'ba-group/app/icare/components/ProductPage.tsx lineup section lines 764-765; ba-group/app/icare/components/ProductLineup.tsx props lines 10-18, visuals lines 20-107, static items lines 122-158.',
    oldBaGroupDataReference:
      'ba-group/app/icare/components/ProductLineup.tsx static items lines 122-158.',
    whyNotShowcaseUnit:
      'Related merchandising/catalog lineup, not product-detail showcase storytelling content.',
    newIGroupStatus:
      'Already page-owned near the product page footer/related-products area.',
  },
  {
    unitType: 'sticky_buy_bar',
    oldBaGroupReference:
      'ba-group/app/icare/components/ProductPage.tsx sticky buy bar lines 767-795.',
    oldBaGroupDataReference:
      'Uses product prop plus showBottomBar state; no standalone showcase payload.',
    whyNotShowcaseUnit:
      'Persistent commerce affordance tied to cart/purchase state, not editorial presentation content.',
    newIGroupStatus:
      'Already page-owned as sticky conversion UI in the new product page.',
  },
] as const satisfies readonly ProductDetailNonShowcaseReference[];

export const PRODUCT_SHOWCASE_ASCII_IMAGINATION = {
  kit_contents: [
    '[ Heading: eyebrow + title ]',
    '+-------------------+  +-----------------------------+',
    '| kit/product media |  | item card | item card | ... |',
    '+-------------------+  +-----------------------------+',
  ],
  application_steps: [
    '[ Section heading ]',
    '+ step rail: 01 02 03 +  + active step image/text +',
    '| user clicks step -> activeStep changes             |',
  ],
  results_study: [
    '[ Heading ]  [ tab: consumer study | community ]',
    '+ metric + metric + metric +   + before | after +',
    '[ source/disclaimer ]',
  ],
  routine_steps: [
    '+ lifestyle/hero image +  + routine title/subtitle +',
    '                         + step rail/cards        +',
    '                         + activeRoutineStep      +',
  ],
} as const satisfies Record<ProductPresentationUnitType, readonly string[]>;
