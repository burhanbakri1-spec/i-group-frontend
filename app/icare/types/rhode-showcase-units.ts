/**
 * rhode-showcase-units.ts — Rhode showcase unit type system.
 * Zod schemas, TypeScript types, and discriminated union for all 17 unit kinds.
 * REQ-C2-1, REQ-C2-2
 */

import { z } from 'zod';

// ─── Shared primitives ────────────────────────────────────────────────────────

export const MediaAssetSchema = z.object({
  url: z.string().min(1),
  alt: z.string(),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
});
export type MediaAsset = z.infer<typeof MediaAssetSchema>;

export const CtaSchema = z.object({
  label: z.string().min(1),
  href: z.string().min(1),
});
export type Cta = z.infer<typeof CtaSchema>;

export const SectionHeadingSchema = z.object({
  eyebrow: z.string().optional(),
  kicker: z.string().optional(),
  title: z.string(),
  subtitle: z.string().optional(),
  description: z.string().optional(),
});
export type SectionHeading = z.infer<typeof SectionHeadingSchema>;

// ─── Unit type enum (17 kinds) ────────────────────────────────────────────────

export const RhodeShowcaseUnitTypeSchema = z.enum([
  'hero_gallery',
  'benefits_grid',
  'application_steps',
  'key_ingredients',
  'value_props_grid',
  'visual_application',
  'ingredient_spotlight',
  'results_study',
  'routine_map',
  'reviews',
  'comparison_chart',
  'kit_contents',
  'results_carousel',
  'shade_selector',
  'lifestyle_carousel',
  'research_ingredients',
  'sustainability',
]);
export type RhodeShowcaseUnitType = z.infer<typeof RhodeShowcaseUnitTypeSchema>;

// ─── Base unit ────────────────────────────────────────────────────────────────

export const BaseUnitSchema = z.object({
  id: z.string().min(1),
  type: RhodeShowcaseUnitTypeSchema,
  sortOrder: z.number().int().min(0),
  isActive: z.boolean().default(true),
  direction: z.enum(['ltr', 'rtl']).optional(),
  theme: z.enum(['light', 'dark', 'cream', 'clinical', 'brand']).optional(),
  payload: z.unknown(),
});
export type BaseUnit = z.infer<typeof BaseUnitSchema>;

// ─── Payload schemas ──────────────────────────────────────────────────────────

// M1 HeroGallery
export const HeroGalleryPayloadSchema = z.object({
  images: z.array(MediaAssetSchema).min(2),
  badges: z.array(z.string()).optional(),
  sizes: z.array(z.object({
    id: z.string(),
    label: z.string(),
    subtext: z.string().optional(),
    priceDelta: z.number().optional(),
  })).optional(),
  defaultSizeId: z.string().optional(),
  videoUrl: z.string().optional(),
  videoPoster: MediaAssetSchema.optional(),
});
export type HeroGalleryPayload = z.infer<typeof HeroGalleryPayloadSchema>;

// M2 BenefitsGrid
export const BenefitsGridPayloadSchema = z.object({
  eyebrow: z.string().optional(),
  heading: z.string().optional(),
  items: z.array(z.object({
    icon: z.string().optional(),
    text: z.string().min(1),
  })).min(2).max(6),
});
export type BenefitsGridPayload = z.infer<typeof BenefitsGridPayloadSchema>;

// M3 ApplicationSteps
export const ApplicationStepsPayloadSchema = z.object({
  eyebrow: z.string().optional(),
  heading: SectionHeadingSchema.optional(),
  steps: z.array(z.object({
    id: z.string(),
    stepNumber: z.number().int().min(1).optional(),
    title: z.string().min(1),
    description: z.string().optional(),
    image: MediaAssetSchema.optional(),
    duration: z.string().optional(),
  })).min(2).max(6),
  defaultActiveStepId: z.string().optional(),
});
export type ApplicationStepsPayload = z.infer<typeof ApplicationStepsPayloadSchema>;

// M4 KeyIngredients
export const KeyIngredientsPayloadSchema = z.object({
  heading: SectionHeadingSchema,
  heroIngredients: z.array(z.object({
    name: z.string(),
    description: z.string(),
    image: MediaAssetSchema.optional(),
  })).min(1).max(3),
  alsoMadeWith: z.array(z.string()).default([]),
  fullListUrl: z.string().optional(),
  fullListText: z.string().optional(),
});
export type KeyIngredientsPayload = z.infer<typeof KeyIngredientsPayloadSchema>;

// M5 ValuePropsGrid
export const ValuePropsGridPayloadSchema = z.object({
  eyebrow: z.string().optional(),
  props: z.array(z.object({
    icon: MediaAssetSchema.optional(),
    label: z.string(),
  })).min(2).max(4),
});
export type ValuePropsGridPayload = z.infer<typeof ValuePropsGridPayloadSchema>;

// M6 VisualApplication
export const VisualApplicationPayloadSchema = z.object({
  eyebrow: z.string().optional(),
  heading: z.string().optional(),
  steps: z.array(z.object({
    number: z.number().int().min(1),
    title: z.string(),
    description: z.string().optional(),
    image: MediaAssetSchema.optional(),
  })).min(2).max(5),
});
export type VisualApplicationPayload = z.infer<typeof VisualApplicationPayloadSchema>;

// M7 IngredientSpotlight
export const IngredientSpotlightPayloadSchema = z.object({
  heading: SectionHeadingSchema.optional(),
  heroImage: MediaAssetSchema,
  featuredIngredients: z.array(z.object({
    name: z.string(),
    description: z.string(),
    image: MediaAssetSchema.optional(),
  })).min(1).max(3),
  alsoMadeWith: z.array(z.string()).default([]),
});
export type IngredientSpotlightPayload = z.infer<typeof IngredientSpotlightPayloadSchema>;

// M8 ResultsStudy (tabs | timeline)
export const ResultsStudyPayloadSchema = z.object({
  mode: z.enum(['tabs', 'timeline']),
  heroImages: z.array(MediaAssetSchema).optional(),
  heading: SectionHeadingSchema.optional(),
  tabs: z.array(z.object({
    id: z.string(),
    label: z.string(),
    title: z.string().optional(),
    description: z.string().optional(),
    bullets: z.array(z.string()).default([]),
    metrics: z.array(z.object({
      id: z.string(),
      value: z.string(),
      label: z.string(),
      description: z.string().optional(),
    })).default([]),
    beforeAfter: z.object({
      before: MediaAssetSchema.optional(),
      after: MediaAssetSchema.optional(),
      caption: z.string().optional(),
    }).optional(),
    source: z.string().optional(),
    disclaimer: z.string().optional(),
  })).default([]),
  defaultTabId: z.string().optional(),
  source: z.string().optional(),
  disclaimer: z.string().optional(),
});
export type ResultsStudyPayload = z.infer<typeof ResultsStudyPayloadSchema>;

// M9 RoutineMap
export const RoutineMapPayloadSchema = z.object({
  title: z.string(),
  subtitle: z.string().optional(),
  steps: z.array(z.object({
    id: z.string(),
    number: z.number().int().min(1),
    label: z.string(),
    productName: z.string(),
    productSubtitle: z.string().optional(),
    swatchImage: MediaAssetSchema.optional(),
    lifestyleImage: MediaAssetSchema,
    dayNight: z.enum(['day', 'night', 'both']).optional(),
  })).min(3).max(7),
});
export type RoutineMapPayload = z.infer<typeof RoutineMapPayloadSchema>;

// M10 Reviews
export const ReviewsPayloadSchema = z.object({
  source: z.enum(['okendo', 'native']).default('native'),
  okendoId: z.string().optional(),
  productId: z.string().optional(),
  locale: z.string().default('en'),
  customRatingField: z.string().optional(),
  nativeReviews: z.array(z.object({
    id: z.string(),
    author: z.string(),
    rating: z.number().min(1).max(5),
    title: z.string().optional(),
    body: z.string(),
    date: z.string().optional(),
    skinType: z.string().optional(),
    verified: z.boolean().default(false),
  })).optional(),
  overallRating: z.number().min(0).max(5).optional(),
  totalReviews: z.number().int().min(0).optional(),
});
export type ReviewsPayload = z.infer<typeof ReviewsPayloadSchema>;

// E1 ComparisonChart
export const ComparisonChartPayloadSchema = z.object({
  heading: z.string().optional(),
  products: z.array(z.object({
    id: z.string(),
    name: z.string(),
    shortName: z.string(),
    tagline: z.string(),
    image: MediaAssetSchema.optional(),
    fields: z.object({
      whatItIs: z.string(),
      bestFor: z.string(),
      whereItFits: z.string(),
      keyIngredients: z.string(),
    }),
    price: z.string().optional(),
    buyUrl: z.string().optional(),
  })).min(2).max(3),
});
export type ComparisonChartPayload = z.infer<typeof ComparisonChartPayloadSchema>;

// E2 KitContents
export const KitContentsPayloadSchema = z.object({
  heading: SectionHeadingSchema.optional(),
  products: z.array(z.object({
    slug: z.string(),
    name: z.string(),
    subtitle: z.string(),
    image: MediaAssetSchema,
    rating: z.number().min(0).max(5).optional(),
    reviewCount: z.number().int().min(0).optional(),
    price: z.string().optional(),
    buyLabel: z.string().optional(),
  })).min(2).max(8),
});
export type KitContentsPayload = z.infer<typeof KitContentsPayloadSchema>;

// E3 ResultsCarousel
export const ResultsCarouselPayloadSchema = z.object({
  heading: z.string(),
  subtitle: z.string().optional(),
  cards: z.array(z.object({
    id: z.string(),
    productName: z.string(),
    metricValue: z.string(),
    metricLabel: z.string(),
    image: MediaAssetSchema,
    creator: z.object({
      handle: z.string(),
      skinType: z.string().optional(),
    }).optional(),
  })).min(2).max(8),
});
export type ResultsCarouselPayload = z.infer<typeof ResultsCarouselPayloadSchema>;

// E4 ShadeSelector
export const ShadeSelectorPayloadSchema = z.object({
  heading: z.string().optional(),
  shades: z.array(z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    hex: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
    image: MediaAssetSchema.optional(),
    isNew: z.boolean().default(false),
    isOutOfStock: z.boolean().default(false),
    group: z.enum(['limited_edition', 'core']),
  })).min(1),
  defaultShadeId: z.string().optional(),
});
export type ShadeSelectorPayload = z.infer<typeof ShadeSelectorPayloadSchema>;

// E5 LifestyleCarousel
export const LifestyleCarouselPayloadSchema = z.object({
  heading: z.string(),
  images: z.array(z.object({
    id: z.string(),
    image: MediaAssetSchema,
    caption: z.string().optional(),
  })).min(3).max(10),
});
export type LifestyleCarouselPayload = z.infer<typeof LifestyleCarouselPayloadSchema>;

// E6 ResearchIngredients
export const ResearchIngredientsPayloadSchema = z.object({
  heroImage: MediaAssetSchema,
  heading: SectionHeadingSchema.optional(),
  ingredients: z.array(z.object({
    id: z.string(),
    name: z.string(),
    icon: MediaAssetSchema.optional(),
    description: z.string(),
    alsoMadeWith: z.array(z.string()).default([]),
  })).min(2).max(6),
});
export type ResearchIngredientsPayload = z.infer<typeof ResearchIngredientsPayloadSchema>;

// E7 Sustainability
export const SustainabilityPayloadSchema = z.object({
  title: z.string(),
  intro: z.string().optional(),
  specs: z.array(z.object({
    component: z.string(),
    detail: z.string(),
  })).min(2),
  recycleCta: z.object({
    label: z.string(),
    href: z.string().min(1),
  }).optional(),
  steps: z.array(z.string()).default([]),
  closingNote: z.string().optional(),
});
export type SustainabilityPayload = z.infer<typeof SustainabilityPayloadSchema>;

// ─── Discriminated union ──────────────────────────────────────────────────────

export type RhodeShowcaseUnit = {
  hero_gallery: BaseUnit & { type: 'hero_gallery'; payload: HeroGalleryPayload };
  benefits_grid: BaseUnit & { type: 'benefits_grid'; payload: BenefitsGridPayload };
  application_steps: BaseUnit & { type: 'application_steps'; payload: ApplicationStepsPayload };
  key_ingredients: BaseUnit & { type: 'key_ingredients'; payload: KeyIngredientsPayload };
  value_props_grid: BaseUnit & { type: 'value_props_grid'; payload: ValuePropsGridPayload };
  visual_application: BaseUnit & { type: 'visual_application'; payload: VisualApplicationPayload };
  ingredient_spotlight: BaseUnit & { type: 'ingredient_spotlight'; payload: IngredientSpotlightPayload };
  results_study: BaseUnit & { type: 'results_study'; payload: ResultsStudyPayload };
  routine_map: BaseUnit & { type: 'routine_map'; payload: RoutineMapPayload };
  reviews: BaseUnit & { type: 'reviews'; payload: ReviewsPayload };
  comparison_chart: BaseUnit & { type: 'comparison_chart'; payload: ComparisonChartPayload };
  kit_contents: BaseUnit & { type: 'kit_contents'; payload: KitContentsPayload };
  results_carousel: BaseUnit & { type: 'results_carousel'; payload: ResultsCarouselPayload };
  shade_selector: BaseUnit & { type: 'shade_selector'; payload: ShadeSelectorPayload };
  lifestyle_carousel: BaseUnit & { type: 'lifestyle_carousel'; payload: LifestyleCarouselPayload };
  research_ingredients: BaseUnit & { type: 'research_ingredients'; payload: ResearchIngredientsPayload };
  sustainability: BaseUnit & { type: 'sustainability'; payload: SustainabilityPayload };
}[RhodeShowcaseUnitType];

// ─── Response type ────────────────────────────────────────────────────────────

export const RhodeShowcaseResponseSchema = z.object({
  productId: z.string(),
  productSlug: z.string(),
  units: z.array(BaseUnitSchema),
});
export type RhodeShowcaseResponse = z.infer<typeof RhodeShowcaseResponseSchema>;

// Generic normalized unit (for the registry component API)
export type NormalizedRhodeUnit<P = unknown> = BaseUnit & { payload: P };
