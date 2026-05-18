import type { ShowcaseUnit } from '../types';

export const PRODUCT_SHOWCASE_FALLBACK_UNITS: ShowcaseUnit[] = [
  {
    id: -1,
    type: 'kit_contents',
    image: 'https://images.unsplash.com/photo-1635870224943-26189bd9e527?q=80&w=1200',
    title: 'Travel-size staples for winter skin',
    description: 'A complete essentials kit for hydrated, glazed skin on the go.',
    sortOrder: 1,
    isActive: true,
    payload: {
      heading: {
        eyebrow: 'kit contents',
        title: 'Travel-size staples for winter skin.',
        description: 'A complete edit of daily essentials sized for your bag, carry-on, and cold-weather routine.',
      },
      media: {
        url: 'https://images.unsplash.com/photo-1635870224943-26189bd9e527?q=80&w=1200',
        alt: 'Travel size skincare kit contents',
      },
      items: [
        { id: 'glazing-milk', title: 'Little glazing milk', quantity: '30 ml', description: 'Milky skin prep for a dewy base.' },
        { id: 'barrier-butter', title: 'Little barrier butter', quantity: '10 ml', description: 'Rich comfort for dry winter skin.' },
        { id: 'lip-tint', title: 'Scented peptide lip tint', quantity: 'mini', description: 'Glossy nourishment with a soft tint.' },
        { id: 'bubble-bag', title: 'Mini rhode bubble bag', description: 'Soft carry-all for daily essentials.' },
      ],
      oldSectionLayoutNotes: {
        oldBaGroupTopology: 'Two-column editorial kit block with media and included-item list.',
      },
    },
  },
  {
    id: -2,
    type: 'application_steps',
    image: 'https://images.unsplash.com/photo-1666025062728-c33a25e8ee3f?q=80&w=1200',
    title: 'Application steps',
    description: 'Three flexible ways to layer the formula into a glazed routine.',
    sortOrder: 2,
    isActive: true,
    payload: {
      heading: {
        eyebrow: 'application',
        title: 'Apply it your way.',
        description: 'Tap through the old product-detail application moments restored as semantic steps.',
      },
      interaction: 'active_step',
      defaultActiveStepId: 'mix-foundation',
      steps: [
        {
          id: 'mix-foundation',
          stepNumber: 1,
          label: 'mix',
          title: 'Mix with your favorite foundation',
          description: 'Blend a small amount into foundation for a dewy, skin-first makeup base.',
          duration: 'morning base',
          image: { url: 'https://images.unsplash.com/photo-1666025062728-c33a25e8ee3f?q=80&w=1200', alt: 'Applying skincare with foundation' },
        },
        {
          id: 'highlight',
          stepNumber: 2,
          label: 'finish',
          title: 'Tap onto high points',
          description: 'Apply a pea-sized amount to the high points of your face after makeup for a glassy finish.',
          duration: 'after makeup',
          image: { url: 'https://images.unsplash.com/photo-1762121903467-8cf5cc423ba5?q=80&w=1200', alt: 'Glowy skincare finish' },
        },
        {
          id: 'overnight',
          stepNumber: 3,
          label: 'mask',
          title: 'Use as an overnight mask',
          description: 'Apply a generous layer before bed to wake up with deeply hydrated, plump-looking skin.',
          duration: 'night routine',
          image: { url: 'https://images.unsplash.com/photo-1670201203150-bf8771401590?q=80&w=1200', alt: 'Overnight skincare mask texture' },
        },
      ],
    },
  },
  {
    id: -3,
    type: 'results_study',
    image: 'https://images.unsplash.com/photo-1589221134210-f010476445e2?q=80&w=800',
    title: 'Visible results study',
    description: 'Tabbed consumer and community proof with before/after imagery.',
    sortOrder: 3,
    isActive: true,
    payload: {
      heading: {
        eyebrow: 'results',
        title: 'Glazed skin, measured.',
        description: 'Consumer perception and community feedback restored from the old product detail section.',
      },
      defaultTabId: 'consumer',
      tabs: [
        {
          id: 'consumer',
          label: 'consumer study results',
          title: 'Consumer study results',
          description: 'Based on a 31-subject consumer perception study after one week of use.',
          source: 'Photos have not been retouched.',
          metrics: [
            { id: 'dewy', value: '97%', label: 'Agreed it leaves skin dewy, radiant, and glowing' },
            { id: 'hydrated', value: '90%', label: 'Agreed skin feels hydrated all day' },
            { id: 'calm', value: '87%', label: 'Agreed it helps calm irritated skin' },
          ],
          beforeAfterImages: [
            {
              id: 'consumer-before-after',
              before: { url: 'https://images.unsplash.com/photo-1589221134210-f010476445e2?q=80&w=800', alt: 'Consumer study before' },
              after: { url: 'https://images.unsplash.com/photo-1663691222849-92b8eb09fda5?q=80&w=800', alt: 'Consumer study after' },
            },
          ],
        },
        {
          id: 'community',
          label: 'community results',
          title: 'Community results',
          description: 'Results shared after two weeks of consistent use.',
          source: 'Real skin, no filters.',
          metrics: [
            { id: 'winter-base', value: '100%', label: "Community agreed it's the perfect winter base" },
            { id: 'moisturizer', value: '95%', label: 'Said it replaced their daily moisturizer' },
            { id: 'experience', value: '92%', label: 'Loved the cozy, scented experience' },
          ],
          beforeAfterImages: [
            {
              id: 'community-before-after',
              before: { url: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=800', alt: 'Community before' },
              after: { url: 'https://images.unsplash.com/photo-1616683693504-3ce769069d67?q=80&w=800', alt: 'Community after' },
            },
          ],
        },
      ],
      disclaimer: 'Individual results may vary.',
    },
  },
  {
    id: -4,
    type: 'routine_steps',
    image: 'https://images.unsplash.com/photo-1747324831504-5ee9aa8eec59?q=80&w=1200',
    title: 'The routine for glazed skin',
    description: 'A numbered routine rail with active product focus.',
    sortOrder: 4,
    isActive: true,
    payload: {
      heading: {
        eyebrow: 'routine',
        title: 'The routine for glazed skin.',
        description: 'Your morning and evening skincare sequence.',
      },
      heroImage: { url: 'https://images.unsplash.com/photo-1747324831504-5ee9aa8eec59?q=80&w=1200', alt: 'Skincare routine lifestyle' },
      routineTitle: 'The routine for glazed skin.',
      routineSubtitle: 'Your morning and evening skincare steps.',
      interaction: 'active_routine_step',
      defaultActiveStepId: 'cleanse',
      steps: [
        { id: 'cleanse', order: 1, title: 'pineapple refresh', subtitle: 'PGA daily cleanser', label: 'cleanse', color: '#F7F2D5', image: { url: 'https://images.unsplash.com/photo-1611960555774-35f9d21c7e25?q=80&w=800', alt: 'Daily cleanser product' } },
        { id: 'prep', order: 2, title: 'glazing milk', subtitle: 'facial treatment essence', label: 'prep', color: '#FFFFFF', image: { url: 'https://images.unsplash.com/photo-1728994062543-74a1dc2c9392?q=80&w=800', alt: 'Glazing milk product' } },
        { id: 'glaze', order: 3, title: 'peptide glazing fluid', subtitle: 'dewy hydration serum', label: 'glaze', color: '#F2F1ED', image: { url: 'https://images.unsplash.com/photo-1710580889701-9fa8f2cd5927?q=80&w=800', alt: 'Peptide glazing fluid product' } },
        { id: 'comfort', order: 4, title: 'barrier restore cream', subtitle: 'rich moisturizing treatment', label: 'comfort', color: '#FFFFFF', image: { url: 'https://images.unsplash.com/photo-1728994062543-74a1dc2c9392?q=80&w=800', alt: 'Barrier restore cream product' } },
        { id: 'nourish', order: 5, title: 'peptide lip treatment', subtitle: 'nourishing lip layer', label: 'nourish', color: '#FCE7E9', image: { url: 'https://images.unsplash.com/photo-1764346452591-9bf2da5f82e9?q=80&w=800', alt: 'Peptide lip treatment product' } },
      ],
    },
  },
];
