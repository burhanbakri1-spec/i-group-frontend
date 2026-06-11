# Rhode Showcase — Backend Migration Guide
> **Audience:** Backend team + next executer  
> **Goal:** Add all 17 Rhode showcase unit types to the backend API so the frontend fetch path stops falling back to hardcoded demo data.  
> **Source of truth:** `i-group/app/icare/types/rhode-showcase-units.ts` (Zod schemas). The backend must emit payloads that pass those schemas exactly.

---

## 1. Base Unit Contract (Every unit must have these fields)

```json
{
  "id": "string (unique per product)",
  "type": "string — one of the 17 type keys listed below",
  "sortOrder": 0,
  "isActive": true,
  "direction": "ltr | rtr (optional, default: ltr)",
  "theme": "light | dark | cream | clinical | brand (optional)",
  "payload": { /* type-specific — see §2 */ }
}
```

**Rules:**
- `id` must be unique within a product's unit list.
- `sortOrder` is a non-negative integer; units render ascending.
- `isActive: false` hides the unit (frontend filters it out).
- `type` must match one of the 17 exact string literals below — no variations, no legacy names.

---

## 2. The 17 Unit Types — Exact Payload Schemas

### M1 — `hero_gallery`

```json
{
  "images": [
    { "url": "https://...", "alt": "Product front", "width": 1200, "height": 1600 }
  ],
  "badges": ["#1 Best Seller"],
  "sizes": [
    { "id": "30ml", "label": "30 ml", "subtext": "Travel", "priceDelta": -10 }
  ],
  "defaultSizeId": "200ml",
  "videoUrl": "https://... (optional)",
  "videoPoster": { "url": "https://...", "alt": "Video poster" }
}
```
**Rules:** `images` min 2. `sizes` is optional but each entry needs `id` + `label`. `videoUrl` and `videoPoster` are both optional but must come together if used.

---

### M2 — `benefits_grid`

```json
{
  "eyebrow": "why it works (optional)",
  "heading": "Glazed skin, daily (optional)",
  "items": [
    { "icon": "https://... (optional, URL to SVG/PNG)", "text": "Deeply hydrating" }
  ]
}
```
**Rules:** `items` min 2, max 6. Each item needs `text`. `icon` is optional string URL.

---

### M3 — `application_steps`

```json
{
  "eyebrow": "application (optional)",
  "heading": { "eyebrow": "how to", "title": "Apply it your way", "subtitle": "...", "description": "..." },
  "steps": [
    {
      "id": "step-mix",
      "stepNumber": 1,
      "title": "Mix with foundation",
      "description": "Blend a few drops...",
      "image": { "url": "https://...", "alt": "..." },
      "duration": "morning base"
    }
  ],
  "defaultActiveStepId": "step-mix"
}
```
**Rules:** `steps` min 2, max 6. Each step needs `id` + `title`. `stepNumber`, `image`, `duration` are optional. `defaultActiveStepId` must match a step `id` if provided.

---

### M4 — `key_ingredients`

```json
{
  "heading": { "eyebrow": "formulated with", "title": "Key ingredients.", "subtitle": "...", "description": "..." },
  "heroIngredients": [
    { "name": "Hyaluronic Acid", "description": "...", "image": { "url": "...", "alt": "..." } }
  ],
  "alsoMadeWith": ["Niacinamide", "Peptides"],
  "fullListUrl": "https://... (optional)",
  "fullListText": "View full ingredient list (optional)"
}
```
**Rules:** `heading` is REQUIRED (not optional). `heroIngredients` min 1, max 3. Each needs `name` + `description`. `image` per ingredient is optional.

---

### M5 — `value_props_grid`

```json
{
  "eyebrow": "glazing milk (optional)",
  "props": [
    { "icon": { "url": "...", "alt": "..." }, "label": "fragrance-free" }
  ]
}
```
**Rules:** `props` min 2, max 4. Each needs `label`. `icon` is optional MediaAsset.

---

### M6 — `visual_application`

```json
{
  "eyebrow": "how to use (optional)",
  "heading": "Three steps to glazed (optional)",
  "steps": [
    { "number": 1, "title": "Cleanse", "description": "...", "image": { "url": "...", "alt": "..." } }
  ]
}
```
**Rules:** `steps` min 2, max 5. Each needs `number` (int, min 1) + `title`. `description` and `image` are optional.

---

### M7 — `ingredient_spotlight`

```json
{
  "heading": { "eyebrow": "spotlight", "title": "Ingredient deep-dive", "...": "..." },
  "heroImage": { "url": "https://...", "alt": "Hero", "width": 800, "height": 1000 },
  "featuredIngredients": [
    { "name": "Hyaluronic Acid", "description": "...", "image": { "url": "...", "alt": "..." } }
  ],
  "alsoMadeWith": ["Squalane", "Glycerin"]
}
```
**Rules:** `heroImage` is REQUIRED. `featuredIngredients` min 1, max 3. Each needs `name` + `description`. `image` per ingredient is optional.

---

### M8 — `results_study`

```json
{
  "mode": "tabs",
  "heroImages": [{ "url": "...", "alt": "Before" }, { "url": "...", "alt": "After" }],
  "heading": { "eyebrow": "results", "title": "Glazed skin, measured" },
  "tabs": [
    {
      "id": "consumer",
      "label": "Consumer Study",
      "title": "Consumer study results",
      "description": "...",
      "bullets": ["97% agreed..."],
      "metrics": [
        { "id": "dewy", "value": "97%", "label": "Agreed skin looks dewy", "description": "..." }
      ],
      "beforeAfter": {
        "before": { "url": "...", "alt": "Before" },
        "after": { "url": "...", "alt": "After" },
        "caption": "Photos not retouched"
      },
      "source": "Photos have not been retouched.",
      "disclaimer": "Individual results may vary."
    }
  ],
  "defaultTabId": "consumer",
  "source": "...",
  "disclaimer": "..."
}
```
**Rules:** `mode` is required — `"tabs"` or `"timeline"`. In `tabs` mode, render tab buttons + content panels. In `timeline` mode, the same tab structure represents timepoints (Immediate / 2W / 4W). `tabs` array is required when mode is `tabs`. Each tab needs `id` + `label`. `metrics`, `bullets`, `beforeAfter` are all optional per tab.

---

### M9 — `routine_map`

```json
{
  "title": "The routine for glazed skin.",
  "subtitle": "Your morning and evening sequence.",
  "steps": [
    {
      "id": "step-cleanse",
      "number": 1,
      "label": "CLEANSE",
      "productName": "Pineapple Refresh",
      "productSubtitle": "PGA daily cleanser",
      "swatchImage": { "url": "...", "alt": "..." },
      "lifestyleImage": { "url": "...", "alt": "..." },
      "dayNight": "day | night | both"
    }
  ]
}
```
**Rules:** `steps` min 3, max 7. Each step needs `id` + `number` + `label` + `productName` + `lifestyleImage`. `swatchImage` is optional. `dayNight` defaults to `"both"` if omitted.

---

### M10 — `reviews`

```json
{
  "source": "okendo | native (default: native)",
  "okendoId": "string (optional, required if source=okendo)",
  "productId": "string (optional)",
  "locale": "en (default)",
  "customRatingField": "How hydrated did your skin feel?",
  "nativeReviews": [
    {
      "id": "r1",
      "author": "Sarah M.",
      "rating": 5,
      "title": "Holy grail",
      "body": "I've been using this...",
      "date": "2024-12-15",
      "skinType": "Dry",
      "verified": true
    }
  ],
  "overallRating": 4.8,
  "totalReviews": 12847
}
```
**Rules:** If `source` is `"okendo"`, frontend renders an iframe to `https://www.okendo.io/product-reviews/{okendoId}`. If `"native"`, frontend renders star summary + distribution + review cards. `nativeReviews` is optional but required for native mode to show anything. `overallRating` and `totalReviews` are optional (frontend computes distribution from `nativeReviews` if absent).

---

### E1 — `comparison_chart`

```json
{
  "heading": "Find your match.",
  "products": [
    {
      "id": "glazing-milk",
      "name": "Glazing Milk",
      "shortName": "GM",
      "tagline": "Lightweight dewy essence",
      "image": { "url": "...", "alt": "..." },
      "fields": {
        "whatItIs": "A milky essence...",
        "bestFor": "All skin types",
        "whereItFits": "After cleansing",
        "keyIngredients": "HA, ceramides, peptides"
      },
      "price": "$29",
      "buyUrl": "https://..."
    }
  ]
}
```
**Rules:** `products` min 2, max 3. Each product needs `id` + `name` + `shortName` + `tagline` + `fields` object (4 required strings). `image`, `price`, `buyUrl` are optional.

---

### E2 — `kit_contents`

```json
{
  "heading": { "eyebrow": "in the kit", "title": "Everything you need.", "subtitle": "..." },
  "products": [
    {
      "slug": "glazing-milk",
      "name": "Glazing Milk",
      "subtitle": "Facial treatment essence",
      "image": { "url": "...", "alt": "..." },
      "rating": 4.8,
      "reviewCount": 12847,
      "price": "$29",
      "buyLabel": "Add to bag"
    }
  ]
}
```
**Rules:** `products` min 2, max 8. Each product needs `slug` (string) + `name` + `subtitle` + `image`. `rating`, `reviewCount`, `price`, `buyLabel` are optional.  
> ⚠️ **IMPORTANT vs legacy:** The old `product-presentation-units.ts` used `items: [{ id, title, description, quantity, expand }]`. The new schema uses `products: [{ slug, name, subtitle, image, rating, reviewCount, price, buyLabel }]`. These are **not compatible** — do not send the legacy shape for this type.

---

### E3 — `results_carousel`

```json
{
  "heading": "The results are in.",
  "subtitle": "Real people, real glazed skin.",
  "cards": [
    {
      "id": "rc1",
      "productName": "Glazing Milk",
      "metricValue": "97%",
      "metricLabel": "said skin looks more radiant",
      "image": { "url": "...", "alt": "..." },
      "creator": { "handle": "@sarahglows", "skinType": "Dry" }
    }
  ]
}
```
**Rules:** `cards` min 2, max 8. Each card needs `id` + `productName` + `metricValue` + `metricLabel` + `image`. `creator` is optional.

---

### E4 — `shade_selector`

```json
{
  "heading": "Find your shade.",
  "shades": [
    {
      "id": "biscuit",
      "name": "biscuit",
      "description": "A warm, toasty nude",
      "hex": "#C8956C",
      "image": { "url": "...", "alt": "..." },
      "isNew": false,
      "isOutOfStock": false,
      "group": "limited_edition | core"
    }
  ],
  "defaultShadeId": "biscuit"
}
```
**Rules:** `shades` min 1. Each shade needs `id` + `name` + `group`. `group` must be `"limited_edition"` or `"core"`. `hex` must be a valid `#RRGGBB` string if provided. `isNew` and `isOutOfStock` default to `false`. `defaultShadeId` must match a shade `id` if provided.

---

### E5 — `lifestyle_carousel`

```json
{
  "heading": "Meet the shade.",
  "images": [
    { "id": "lc1", "image": { "url": "...", "alt": "..." }, "caption": "Morning glow" }
  ]
}
```
**Rules:** `images` min 3, max 10. Each item needs `id` + `image`. `caption` is optional.

---

### E6 — `research_ingredients`

```json
{
  "heroImage": { "url": "...", "alt": "..." },
  "heading": { "eyebrow": "science", "title": "Backed by research.", "subtitle": "...", "description": "..." },
  "ingredients": [
    {
      "id": "ha",
      "name": "Hyaluronic Acid",
      "icon": { "url": "...", "alt": "..." },
      "description": "Can hold up to 1,000x its weight...",
      "alsoMadeWith": ["Sodium Hyaluronate", "Hydrolyzed HA"]
    }
  ]
}
```
**Rules:** `heroImage` is REQUIRED. `ingredients` min 2, max 6. Each needs `id` + `name` + `description`. `icon` and `alsoMadeWith` are optional.

---

### E7 — `sustainability`

```json
{
  "title": "Thoughtful packaging.",
  "intro": "We think about what happens after the last drop.",
  "specs": [
    { "component": "Bottle", "detail": "PCR plastic — 50% post-consumer recycled" }
  ],
  "recycleCta": { "label": "Learn how to recycle", "href": "https://..." },
  "steps": ["Empty and rinse the bottle", "Remove the pump", "Drop in curbside recycling"],
  "closingNote": "We're always working toward more..."
}
```
**Rules:** `title` is REQUIRED. `specs` min 2 — each needs `component` + `detail`. `recycleCta`, `steps`, `closingNote` are all optional. `steps` is a plain `string[]` (instructions, not objects).

---

## 3. MediaAsset (Used by many units — repeatable pattern)

```typescript
{ "url": "https://...", "alt": "Description", "width": 1200, "height": 1600 }
```
- `url`: string, required. Must be a full URL (CDN-hosted).  
- `alt`: string, required. Accessibility text.  
- `width` / `height`: positive integers, optional. Helps frontend reserve layout space. **Strongly recommended** for LCP images (hero gallery, heroImage).

---

## 4. SectionHeading (Reusable heading block)

```json
{ "eyebrow": "optional micro-label", "kicker": "alt label (optional)", "title": "Required heading text", "subtitle": "optional", "description": "optional long text" }
```
Used by: `application_steps`, `key_ingredients`, `ingredient_spotlight`, `results_study`, `research_ingredients`, `kit_contents`.

---

## 5. API Endpoint

**Current endpoint:** `icareApi.products.showcase(slug)`  
**Route (likely):** `GET /api/v1/products/{slug}/showcase`  
**Returns:** Array of BaseUnit objects with type-specific payloads.

**What must change:**
- The backend currently returns the OLD flat shape (4 types, `items` arrays, etc).
- After migration: the backend must return ONLY the new Rhode 17-unit shapes.
- The `type` field for each unit must be one of the 17 exact strings listed above.

---

## 6. Current Backward Compatibility Note

The frontend `fetchProductShowcaseRhode` in `i-group/app/icare/lib/catalog-client.ts` now **skips** any unit it can't parse and **keeps the good ones**. This means:

- You don't need to migrate all 17 types at once.
- Products can have a mix of old and new units during migration.
- Unknown or malformed units are silently dropped and logged: `[fetchProductShowcaseRhode] Skipping unit with invalid payload, type: ...`
- If a product has zero valid units after filtering, the frontend shows `RHODE_SHOWCASE_FALLBACK` (hardcoded demo data) — so **test each product after migration**.

**Recommended migration order (per product):**
1. Start with `kit_contents` and `application_steps` (easiest, most common)
2. Add `results_study`, `routine_map`
3. Add the rest in any order
4. Remove the old legacy `type` values from the API response once all products are converted

---

## 7. Field-by-Field Migration Cheat Sheet (Legacy → Rhode)

| Legacy type | Old payload key | New payload key | Notes |
|---|---|---|---|
| `kit_contents` | `items[]` (id, title, description, quantity, expand) | `products[]` (slug, name, subtitle, image, rating, reviewCount, price, buyLabel) | Complete shape change |
| `kit_contents` | `media` (image at section level) | `heading` + each product has `image` | Media moves to product entries |
| `application_steps` | `steps[].stepNumber` | `steps[].stepNumber` | Same ✅ |
| `application_steps` | `steps[].label` | `steps[].label` (not used by frontend, safe to omit) | Extra field in schema |
| `application_steps` | `steps[].text` | `steps[].title` | **Rename: `text` → `title`** |
| `results_study` | `tabs[].beforeAfterImages[]` | `tabs[].beforeAfter` | **Rename + restructure** |
| `results_study` | (global `metrics[]`) | `tabs[].metrics[]` | Metrics move inside tabs |
| `routine_steps` | `steps[].order` | `steps[].number` | **Rename: `order` → `number`** |
| `routine_steps` | `routineTitle`, `routineSubtitle` | `title`, `subtitle` at top level | **Rename** |
| `routine_steps` | `steps[].timing` | `steps[].dayNight` | **Rename: `timing` → `dayNight`** |
| `routine_steps` | `steps[].color` | `steps[].swatchImage` | **Replace color string with image** |

All other new types (`hero_gallery`, `benefits_grid`, `key_ingredients`, `value_props_grid`, `visual_application`, `ingredient_spotlight`, `reviews`, `comparison_chart`, `results_carousel`, `shade_selector`, `lifestyle_carousel`, `research_ingredients`, `sustainability`) have **no legacy equivalent** — they are new and must be added from scratch.

---

## 8. QA Checklist (After migrating a product)

- [ ] Fetch `GET /api/v1/products/{slug}/showcase` — confirm response is valid JSON array
- [ ] Each unit has `type` matching one of the 17 exact strings
- [ ] Each unit has `id` (string), `sortOrder` (number), `isActive` (boolean)
- [ ] Payload fields match the schema in §2 exactly (no extra/missing fields that matter)
- [ ] All image URLs are absolute and publicly accessible
- [ ] `alt` text is present on all `MediaAsset` objects
- [ ] `sortOrder` values make visual sense (ascending)
- [ ] `/icare/products/{slug}` renders without falling back to demo data
- [ ] `/icare/rhode-showcase-preview` shows the live product data (not fallback) if `slug` is passed
- [ ] No console warnings: `[fetchProductShowcaseRhode] Skipping unit...`

---

## 9. Next Executer Actions

1. **Immediate:** Tell backend team to read this doc and plan a migration — starting with the cheat sheet (§7).
2. **Short-term:** Add a backend DTO/entity for `RhodeShowcaseUnit` with the 17-type enum and the base `payload: jsonb` column.
3. **Admin UI:** Update `ProductShowcasePanel.tsx` (in `e-commerce-backend/admin-ui`) to support the new payload shapes — the old editor sends legacy shapes.
4. **Validation:** Add backend Zod (or equivalent) validation mirroring the frontend schemas so bad payloads are caught at write time, not render time.
5. **Rollout:** Migrate one product end-to-end first (e.g., Glazing Milk), verify on preview page, then batch the rest.
6. **Cleanup (post-migration):** Once all products are migrated, remove the `continue` skip logic from `fetchProductShowcaseRhode` and make it strict-validate (fail = null, no skip). Also remove the legacy type fallbacks from `types/index.ts`.

---

## 10. Quick Reference: All 17 Type Strings (copy-paste safe)

```
hero_gallery
benefits_grid
application_steps
key_ingredients
value_props_grid
visual_application
ingredient_spotlight
results_study
routine_map
reviews
comparison_chart
kit_contents
results_carousel
shade_selector
lifestyle_carousel
research_ingredients
sustainability
```

---
*Generated by executer — 2026-06-11 — Source of truth: `i-group/app/icare/types/rhode-showcase-units.ts`*
