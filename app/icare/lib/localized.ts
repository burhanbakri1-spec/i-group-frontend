/**
 * localized.ts — Single source of truth for backend localized values.
 *
 * The iCare backend returns translatable text fields (category names, brand
 * names, content strings, etc.) as either:
 *   - a plain `string` (the en fallback the BE usually returns), or
 *   - a localized object: `{ en: string; ar: string }`.
 *
 * Earlier code assumed `name` was always a string and called `.trim()` /
 * rendered it as JSX. When the BE shipped localized objects this caused:
 *   - "x?.trim is not a function" (calling undefined on a non-string)
 *   - "Objects are not valid as a React child (found: object with keys
 *     {en, ar})" (rendering the raw object as a child)
 *
 * `pickLocalized` is the only safe read path. Use it everywhere a backend
 * field might be localized — never call `.trim()` / render the value
 * directly. This makes the bug structurally impossible to reintroduce.
 */
import type { Language } from '../translations';

export type LocalizedValue = string | null | undefined | { en?: string | null; ar?: string | null };

export type LocalizedKey = 'en' | 'ar';

/**
 * Pick the right-locale string out of a possibly-localized value.
 *
 * Rules:
 *   - `null` / `undefined` → `fallback` (defaults to `''`).
 *   - `string`             → return as-is (BE may still send a plain string).
 *   - object with `en`/`ar` → pick the active locale, fall back to en,
 *                              then to `fallback` if both are empty.
 *
 * Never throws. Always returns a string.
 */
export const pickLocalized = (value: LocalizedValue, lang: Language, fallback = ''): string => {
  if (value == null) return fallback;

  if (typeof value === 'string') return value;

  if (typeof value === 'object') {
    const activeKey: LocalizedKey = lang === 'ar' ? 'ar' : 'en';
    const fallbackKey: LocalizedKey = activeKey === 'ar' ? 'en' : 'ar';

    // Try the active locale first, then the other locale, then the explicit
    // `en` fallback. An empty/whitespace-only entry is treated as missing.
    for (const key of [activeKey, fallbackKey, 'en'] as LocalizedKey[]) {
      const candidate = value[key];
      if (typeof candidate === 'string' && candidate.trim() !== '') return candidate;
    }
    return fallback;
  }

  return fallback;
};

/**
 * Convenience: `pickLocalized` plus a `trim()`, with a default. Use this
 * for fields the FE previously called `.trim()` on (category.name, brand.name).
 */
export const pickLocalizedTrimmed = (value: LocalizedValue, lang: Language, fallback = ''): string => {
  return pickLocalized(value, lang, fallback).trim();
};

/**
 * Type guard: true when the value is a localized object shape `{en, ar}`.
 * Used by mappers that want to coerce the field into a string before
 * downstream code (which still assumes strings) sees it.
 */
export const isLocalizedObject = (value: unknown): value is { en?: string | null; ar?: string | null } => {
  if (value == null || typeof value !== 'object' || Array.isArray(value)) return false;
  const obj = value as Record<string, unknown>;
  // Treat as localized only if it has at least one of `en`/`ar` string keys
  // AND lacks other arbitrary properties (defensive against non-payload objects).
  const hasLocaleKey = ('en' in obj) || ('ar' in obj);
  const onlyLocaleKeys = Object.keys(obj).every((k) => k === 'en' || k === 'ar');
  return hasLocaleKey && onlyLocaleKeys;
};
