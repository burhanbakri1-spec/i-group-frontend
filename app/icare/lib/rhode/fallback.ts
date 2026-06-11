/**
 * lib/rhode/fallback.ts — Rich fallback showcase data for Rhode showcase units.
 * Used when API is unavailable or returns empty. Covers all 17 unit types.
 */

import type { RhodeShowcaseUnit } from '../../types/rhode-showcase-units';

const UNSPLASH_SKIN_1 = 'https://images.unsplash.com/photo-1616683693504-3ce769069d67?q=80&w=1200';
const UNSPLASH_SKIN_2 = 'https://images.unsplash.com/photo-1666025062728-c33a25e8ee3f?q=80&w=1200';
const UNSPLASH_SKIN_3 = 'https://images.unsplash.com/photo-1670201203150-bf8771401590?q=80&w=1200';
const UNSPLASH_SKIN_4 = 'https://images.unsplash.com/photo-1635870224943-26189bd9e527?q=80&w=1200';
const UNSPLASH_SKIN_5 = 'https://images.unsplash.com/photo-1611960555774-35f9d21c7e25?q=80&w=1200';
const UNSPLASH_SKIN_6 = 'https://images.unsplash.com/photo-1728994062543-74a1dc2c9392?q=80&w=1200';
const UNSPLASH_SKIN_7 = 'https://images.unsplash.com/photo-1710580889701-9fa8f2cd5927?q=80&w=1200';
const UNSPLASH_SKIN_8 = 'https://images.unsplash.com/photo-1589221134210-f010476445e2?q=80&w=800';

export const RHODE_SHOWCASE_FALLBACK: RhodeShowcaseUnit[] = [
  // M1 HeroGallery
  {
    id: 'fallback-hero-gallery',
    type: 'hero_gallery',
    sortOrder: 1,
    isActive: true,
    payload: {
      images: [
        { url: UNSPLASH_SKIN_1, alt: 'Glazing Milk front' },
        { url: UNSPLASH_SKIN_2, alt: 'Glazing Milk texture detail' },
        { url: UNSPLASH_SKIN_3, alt: 'Glazing Milk lifestyle' },
        { url: UNSPLASH_SKIN_4, alt: 'Glazing Milk application' },
      ],
      badges: ['#1 Best Seller', 'Hyaluronic Acid + Ceramides'],
      sizes: [
        { id: '30ml', label: '30 ml', subtext: 'Travel size' },
        { id: '200ml', label: '200 ml', subtext: 'Full size' },
      ],
      defaultSizeId: '200ml',
    },
  } as RhodeShowcaseUnit,

  // M2 BenefitsGrid
  {
    id: 'fallback-benefits-grid',
    type: 'benefits_grid',
    sortOrder: 2,
    isActive: true,
    payload: {
      eyebrow: 'why it works',
      heading: 'Glazed skin, daily.',
      items: [
        { text: 'Deeply hydrating hyaluronic acid complex' },
        { text: 'Ceramide barrier support' },
        { text: 'Lightweight, non-greasy formula' },
        { text: 'Suitable for all skin types' },
      ],
    },
  } as RhodeShowcaseUnit,

  // M3 ApplicationSteps
  {
    id: 'fallback-application-steps',
    type: 'application_steps',
    sortOrder: 3,
    isActive: true,
    payload: {
      eyebrow: 'application',
      heading: { title: 'Apply it your way.' },
      steps: [
        {
          id: 'step-mix',
          stepNumber: 1,
          title: 'Mix with foundation',
          description: 'Blend a few drops into your foundation for a dewy, skin-first makeup base.',
          image: { url: UNSPLASH_SKIN_2, alt: 'Mixing with foundation' },
          duration: 'morning base',
        },
        {
          id: 'step-tap',
          stepNumber: 2,
          title: 'Tap onto high points',
          description: 'Apply a pea-sized amount to cheekbones and brow bone after makeup for a glassy finish.',
          image: { url: UNSPLASH_SKIN_3, alt: 'Tapping onto skin' },
          duration: 'after makeup',
        },
        {
          id: 'step-mask',
          stepNumber: 3,
          title: 'Use as overnight mask',
          description: 'Apply a generous layer before bed to wake up with deeply hydrated, plump skin.',
          image: { url: UNSPLASH_SKIN_5, alt: 'Overnight mask application' },
          duration: 'night routine',
        },
      ],
      defaultActiveStepId: 'step-mix',
    },
  } as RhodeShowcaseUnit,

  // M4 KeyIngredients
  {
    id: 'fallback-key-ingredients',
    type: 'key_ingredients',
    sortOrder: 4,
    isActive: true,
    payload: {
      heading: { eyebrow: 'formulated with', title: 'Key ingredients.' },
      heroIngredients: [
        {
          name: 'Hyaluronic Acid Complex',
          description: 'A multi-weight HA blend that draws moisture into every layer of skin for lasting plumpness.',
        },
        {
          name: 'Ceramide NP',
          description: 'Restores the skin\'s natural barrier, sealing in hydration and protecting from daily stressors.',
        },
      ],
      alsoMadeWith: ['Niacinamide', 'Peptides', 'Vitamin E', 'Glycerin', 'Squalane'],
      fullListText: 'View full ingredient list',
    },
  } as RhodeShowcaseUnit,

  // M5 ValuePropsGrid
  {
    id: 'fallback-value-props-grid',
    type: 'value_props_grid',
    sortOrder: 5,
    isActive: true,
    payload: {
      eyebrow: 'glazing milk',
      props: [
        { label: 'fragrance-free' },
        { label: 'dermatologist tested' },
        { label: 'vegan formula' },
        { label: 'cruelty-free' },
      ],
    },
  } as RhodeShowcaseUnit,

  // M6 VisualApplication
  {
    id: 'fallback-visual-application',
    type: 'visual_application',
    sortOrder: 6,
    isActive: true,
    payload: {
      eyebrow: 'how to use',
      heading: 'Three steps to glazed.',
      steps: [
        {
          number: 1,
          title: 'Cleanse',
          description: 'Start with clean, dry skin.',
          image: { url: UNSPLASH_SKIN_5, alt: 'Cleansing step' },
        },
        {
          number: 2,
          title: 'Apply',
          description: 'Press 3–4 drops onto your face and neck.',
          image: { url: UNSPLASH_SKIN_6, alt: 'Applying product' },
        },
        {
          number: 3,
          title: 'Layer',
          description: 'Follow with moisturizer or wear alone for a dewy finish.',
          image: { url: UNSPLASH_SKIN_7, alt: 'Layering products' },
        },
      ],
    },
  } as RhodeShowcaseUnit,

  // M7 IngredientSpotlight
  {
    id: 'fallback-ingredient-spotlight',
    type: 'ingredient_spotlight',
    sortOrder: 7,
    isActive: true,
    payload: {
      heading: { eyebrow: 'spotlight', title: 'Ingredient deep-dive.' },
      heroImage: { url: UNSPLASH_SKIN_4, alt: 'Ingredient spotlight hero' },
      featuredIngredients: [
        {
          name: 'Hyaluronic Acid',
          description: 'A humectant that can hold up to 1,000× its weight in water. Our three-weight complex reaches every skin layer.',
        },
        {
          name: 'Ceramides',
          description: 'Lipids that make up ~50% of the skin\'s barrier. Repleting them restores moisture retention and smooths texture.',
        },
        {
          name: 'Peptides',
          description: 'Short chains of amino acids that signal skin to rebuild collagen and increase firmness over time.',
        },
      ],
      alsoMadeWith: ['Niacinamide', 'Glycerin', 'Squalane'],
    },
  } as RhodeShowcaseUnit,

  // M8 ResultsStudy
  {
    id: 'fallback-results-study',
    type: 'results_study',
    sortOrder: 8,
    isActive: true,
    payload: {
      mode: 'tabs',
      heading: { eyebrow: 'results', title: 'Glazed skin, measured.' },
      tabs: [
        {
          id: 'consumer',
          label: 'Consumer Study',
          title: 'Consumer study results',
          description: 'Based on a 31-subject consumer perception study after one week of use.',
          bullets: [],
          metrics: [
            { id: 'm1', value: '97%', label: 'Agreed skin looks dewy and radiant' },
            { id: 'm2', value: '90%', label: 'Agreed skin feels hydrated all day' },
            { id: 'm3', value: '87%', label: 'Agreed it helps calm irritated skin' },
          ],
          beforeAfter: {
            before: { url: UNSPLASH_SKIN_8, alt: 'Before use' },
            after: { url: UNSPLASH_SKIN_1, alt: 'After one week' },
          },
          source: 'Photos have not been retouched.',
          disclaimer: 'Individual results may vary.',
        },
        {
          id: 'community',
          label: 'Community Results',
          title: 'Community results',
          description: 'Self-reported results after two weeks of consistent use.',
          bullets: [],
          metrics: [
            { id: 'm4', value: '100%', label: "Agreed it's the perfect winter base" },
            { id: 'm5', value: '95%', label: 'Said it replaced their daily moisturizer' },
            { id: 'm6', value: '92%', label: 'Loved the cozy, scented experience' },
          ],
          source: 'Real skin, no filters.',
        },
      ],
      defaultTabId: 'consumer',
    },
  } as RhodeShowcaseUnit,

  // M9 RoutineMap
  {
    id: 'fallback-routine-map',
    type: 'routine_map',
    sortOrder: 9,
    isActive: true,
    payload: {
      title: 'The routine for glazed skin.',
      subtitle: 'Your morning and evening sequence.',
      steps: [
        {
          id: 'step-cleanse',
          number: 1,
          label: 'CLEANSE',
          productName: 'Pineapple Refresh',
          productSubtitle: 'PGA daily cleanser',
          lifestyleImage: { url: UNSPLASH_SKIN_5, alt: 'Cleanser lifestyle' },
          dayNight: 'both',
        },
        {
          id: 'step-prep',
          number: 2,
          label: 'PREP',
          productName: 'Glazing Milk',
          productSubtitle: 'Facial treatment essence',
          lifestyleImage: { url: UNSPLASH_SKIN_6, alt: 'Glazing milk lifestyle' },
          dayNight: 'both',
        },
        {
          id: 'step-glaze',
          number: 3,
          label: 'GLAZE',
          productName: 'Peptide Glazing Fluid',
          productSubtitle: 'Dewy hydration serum',
          lifestyleImage: { url: UNSPLASH_SKIN_7, alt: 'Glazing fluid lifestyle' },
          dayNight: 'both',
        },
        {
          id: 'step-comfort',
          number: 4,
          label: 'COMFORT',
          productName: 'Barrier Restore Cream',
          productSubtitle: 'Rich moisturizing treatment',
          lifestyleImage: { url: UNSPLASH_SKIN_4, alt: 'Barrier cream lifestyle' },
          dayNight: 'both',
        },
        {
          id: 'step-nourish',
          number: 5,
          label: 'NOURISH',
          productName: 'Peptide Lip Treatment',
          productSubtitle: 'Nourishing lip layer',
          lifestyleImage: { url: UNSPLASH_SKIN_3, alt: 'Lip treatment lifestyle' },
          dayNight: 'both',
        },
      ],
    },
  } as RhodeShowcaseUnit,

  // M10 Reviews
  {
    id: 'fallback-reviews',
    type: 'reviews',
    sortOrder: 10,
    isActive: true,
    payload: {
      source: 'native',
      locale: 'en',
      overallRating: 4.8,
      totalReviews: 12847,
      nativeReviews: [
        {
          id: 'r1',
          author: 'Sarah M.',
          rating: 5,
          title: 'Holy grail for dry skin',
          body: 'I\'ve been using this for 3 months now and my skin has never looked better. The glazed effect is real!',
          date: '2024-12-15',
          skinType: 'Dry',
          verified: true,
        },
        {
          id: 'r2',
          author: 'Jessica L.',
          rating: 5,
          title: 'Replaced my entire routine',
          body: 'Light enough to wear alone, hydrating enough to skip my moisturizer in summer. Game changer.',
          date: '2024-11-28',
          skinType: 'Combination',
          verified: true,
        },
        {
          id: 'r3',
          author: 'Aisha K.',
          rating: 4,
          title: 'Gorgeous texture',
          body: 'Absolutely love the milky texture and how it sinks in so fast. Would give 5 stars but wish it had SPF.',
          date: '2024-10-10',
          skinType: 'Normal',
          verified: true,
        },
      ],
    },
  } as RhodeShowcaseUnit,

  // E1 ComparisonChart
  {
    id: 'fallback-comparison-chart',
    type: 'comparison_chart',
    sortOrder: 11,
    isActive: true,
    payload: {
      heading: 'Find your match.',
      products: [
        {
          id: 'glazing-milk',
          name: 'Glazing Milk',
          shortName: 'GM',
          tagline: 'Lightweight dewy essence',
          image: { url: UNSPLASH_SKIN_6, alt: 'Glazing Milk' },
          fields: {
            whatItIs: 'A milky, water-light essence that preps skin with a burst of hydration.',
            bestFor: 'All skin types, especially normal to dry.',
            whereItFits: 'After cleansing, before serum.',
            keyIngredients: 'HA complex, ceramides, peptides',
          },
          price: '$29',
        },
        {
          id: 'barrier-cream',
          name: 'Barrier Restore Cream',
          shortName: 'BRC',
          tagline: 'Rich barrier moisturizer',
          image: { url: UNSPLASH_SKIN_7, alt: 'Barrier Restore Cream' },
          fields: {
            whatItIs: 'A rich, whipped moisturizer that rebuilds the skin barrier.',
            bestFor: 'Dry, sensitized, or compromised skin.',
            whereItFits: 'Final step of PM routine or as spot treatment.',
            keyIngredients: 'Ceramide complex, shea butter, niacinamide',
          },
          price: '$38',
        },
      ],
    },
  } as RhodeShowcaseUnit,

  // E2 KitContents
  {
    id: 'fallback-kit-contents',
    type: 'kit_contents',
    sortOrder: 12,
    isActive: true,
    payload: {
      heading: { eyebrow: 'in the kit', title: 'Everything you need.' },
      products: [
        {
          slug: 'glazing-milk',
          name: 'Glazing Milk',
          subtitle: 'Facial treatment essence',
          image: { url: UNSPLASH_SKIN_6, alt: 'Glazing Milk' },
          rating: 4.8,
          reviewCount: 12847,
          price: '$29',
        },
        {
          slug: 'barrier-cream',
          name: 'Barrier Restore Cream',
          subtitle: 'Rich moisturizing treatment',
          image: { url: UNSPLASH_SKIN_7, alt: 'Barrier Cream' },
          rating: 4.7,
          reviewCount: 8203,
          price: '$38',
        },
        {
          slug: 'lip-tint',
          name: 'Peptide Lip Tint',
          subtitle: 'Nourishing color treatment',
          image: { url: UNSPLASH_SKIN_3, alt: 'Lip Tint' },
          rating: 4.9,
          reviewCount: 21506,
          price: '$22',
        },
        {
          slug: 'eye-peptide',
          name: 'Peptide Eye Treatment',
          subtitle: 'Brightening eye complex',
          image: { url: UNSPLASH_SKIN_5, alt: 'Eye Treatment' },
          rating: 4.6,
          reviewCount: 5129,
          price: '$34',
        },
      ],
    },
  } as RhodeShowcaseUnit,

  // E3 ResultsCarousel
  {
    id: 'fallback-results-carousel',
    type: 'results_carousel',
    sortOrder: 13,
    isActive: true,
    payload: {
      heading: 'The results are in.',
      subtitle: 'Real people, real glazed skin.',
      cards: [
        {
          id: 'rc1',
          productName: 'Glazing Milk',
          metricValue: '97%',
          metricLabel: 'said skin looks more radiant',
          image: { url: UNSPLASH_SKIN_1, alt: 'Radiant skin result' },
          creator: { handle: '@sarahglows', skinType: 'Dry' },
        },
        {
          id: 'rc2',
          productName: 'Glazing Milk',
          metricValue: '90%',
          metricLabel: 'reported all-day hydration',
          image: { url: UNSPLASH_SKIN_2, alt: 'Hydrated skin result' },
          creator: { handle: '@beautyjess', skinType: 'Combination' },
        },
        {
          id: 'rc3',
          productName: 'Glazing Milk',
          metricValue: '87%',
          metricLabel: 'noticed calmer, less irritated skin',
          image: { url: UNSPLASH_SKIN_8, alt: 'Calm skin result' },
          creator: { handle: '@glowyaisha', skinType: 'Sensitive' },
        },
        {
          id: 'rc4',
          productName: 'Glazing Milk',
          metricValue: '95%',
          metricLabel: 'would recommend to a friend',
          image: { url: UNSPLASH_SKIN_3, alt: 'Recommended product' },
          creator: { handle: '@skinfirst', skinType: 'Normal' },
        },
      ],
    },
  } as RhodeShowcaseUnit,

  // E4 ShadeSelector
  {
    id: 'fallback-shade-selector',
    type: 'shade_selector',
    sortOrder: 14,
    isActive: true,
    payload: {
      heading: 'Find your shade.',
      shades: [
        {
          id: 'biscuit',
          name: 'biscuit',
          description: 'A warm, toasty nude — our bestseller.',
          hex: '#C8956C',
          group: 'core',
          isNew: false,
          isOutOfStock: false,
        },
        {
          id: 'ribbon',
          name: 'ribbon',
          description: 'A cool-toned rosy pink.',
          hex: '#DBA8A5',
          group: 'core',
          isNew: false,
          isOutOfStock: false,
        },
        {
          id: 'toast',
          name: 'toast',
          description: 'A medium, neutral-warm brown.',
          hex: '#B07860',
          group: 'core',
          isNew: false,
          isOutOfStock: false,
        },
        {
          id: 'milkshake',
          name: 'milkshake',
          description: 'A soft, peachy-pink — Limited Edition.',
          hex: '#F2C4B5',
          group: 'limited_edition',
          isNew: true,
          isOutOfStock: false,
        },
        {
          id: 'raspberry-jello',
          name: 'raspberry jello',
          description: 'A vivid berry pink — Limited Edition.',
          hex: '#C4607B',
          group: 'limited_edition',
          isNew: true,
          isOutOfStock: false,
        },
      ],
      defaultShadeId: 'biscuit',
    },
  } as RhodeShowcaseUnit,

  // E5 LifestyleCarousel
  {
    id: 'fallback-lifestyle-carousel',
    type: 'lifestyle_carousel',
    sortOrder: 15,
    isActive: true,
    payload: {
      heading: 'Meet the shade.',
      images: [
        { id: 'lc1', image: { url: UNSPLASH_SKIN_1, alt: 'Lifestyle 1' }, caption: 'Morning routine glow.' },
        { id: 'lc2', image: { url: UNSPLASH_SKIN_2, alt: 'Lifestyle 2' }, caption: 'Soft, blurred skin.' },
        { id: 'lc3', image: { url: UNSPLASH_SKIN_3, alt: 'Lifestyle 3' }, caption: 'Evening glazed finish.' },
        { id: 'lc4', image: { url: UNSPLASH_SKIN_4, alt: 'Lifestyle 4' }, caption: 'Everyday dewy look.' },
        { id: 'lc5', image: { url: UNSPLASH_SKIN_5, alt: 'Lifestyle 5' }, caption: 'Fresh out the shower glow.' },
      ],
    },
  } as RhodeShowcaseUnit,

  // E6 ResearchIngredients
  {
    id: 'fallback-research-ingredients',
    type: 'research_ingredients',
    sortOrder: 16,
    isActive: true,
    payload: {
      heroImage: { url: UNSPLASH_SKIN_4, alt: 'Research ingredients hero swatch' },
      heading: { eyebrow: 'science', title: 'Backed by research.' },
      ingredients: [
        {
          id: 'ha',
          name: 'Hyaluronic Acid',
          description: 'Can hold up to 1,000× its weight in water. Our multi-weight blend targets all skin layers.',
          alsoMadeWith: ['Sodium Hyaluronate', 'Hydrolyzed Hyaluronic Acid'],
        },
        {
          id: 'ceramides',
          name: 'Ceramide Complex',
          description: 'Ceramides make up ~50% of the skin\'s lipid barrier. Replenishing them restores resilience.',
          alsoMadeWith: ['Ceramide NP', 'Ceramide AP', 'Phytosphingosine'],
        },
        {
          id: 'peptides',
          name: 'Signal Peptides',
          description: 'Amino acid sequences that stimulate collagen synthesis and accelerate skin renewal.',
          alsoMadeWith: ['Palmitoyl Tripeptide-1', 'Palmitoyl Tetrapeptide-7'],
        },
        {
          id: 'niacinamide',
          name: 'Niacinamide 5%',
          description: 'Clinically proven to reduce pore appearance, even skin tone, and strengthen the barrier.',
          alsoMadeWith: ['Vitamin B3'],
        },
      ],
    },
  } as RhodeShowcaseUnit,

  // E7 Sustainability
  {
    id: 'fallback-sustainability',
    type: 'sustainability',
    sortOrder: 17,
    isActive: true,
    payload: {
      title: 'Thoughtful packaging.',
      intro: 'We think about what happens after the last drop.',
      specs: [
        { component: 'Bottle', detail: 'PCR plastic — 50% post-consumer recycled content' },
        { component: 'Cap', detail: 'PP — recyclable in most municipalities' },
        { component: 'Outer box', detail: 'FSC-certified cardstock, soy-based ink' },
        { component: 'Inner fill', detail: 'Biodegradable tissue — plastic-free' },
      ],
      recycleCta: {
        label: 'Learn how to recycle',
        href: '#recycling-program',
      },
      steps: [
        'Empty and rinse the bottle',
        'Remove the pump',
        'Drop bottle + cap into your curbside recycling',
        'Return the pump to any rhode pop-up for terracycle recycling',
      ],
      closingNote: 'We\'re always working toward more sustainable packaging. Thank you for recycling.',
    },
  } as RhodeShowcaseUnit,
];
