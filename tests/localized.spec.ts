/**
 * tests/localized.spec.ts
 *
 * Regression tests for the localized-value helper in app/icare/lib/localized.ts.
 *
 * Background: the iCare backend returns translatable text fields (category.name,
 * brand.name, product name, etc.) as either a plain string or a localized
 * object `{ en, ar }`. Earlier code assumed plain strings and crashed with
 *   - "x?.trim is not a function" — when the BE shipped `{en, ar}` and the FE
 *     called `.trim()` on the object.
 *   - "Objects are not valid as a React child (found: object with keys
 *     {en, ar})" — when the FE rendered the raw object as JSX.
 *
 * `pickLocalized` is the single safe read path. These tests pin its behavior
 * so the bug is structurally impossible to reintroduce.
 *
 * Run: cd i-group && npx vitest run tests/localized.spec.ts
 */

import { describe, it, expect } from 'vitest';
import { pickLocalized, pickLocalizedTrimmed, isLocalizedObject } from '../app/icare/lib/localized';

describe('pickLocalized', () => {
  it('passes a plain string through unchanged', () => {
    expect(pickLocalized('Hello', 'en')).toBe('Hello');
    expect(pickLocalized('Hello', 'ar')).toBe('Hello');
  });

  it('returns the en string for lang="en"', () => {
    expect(pickLocalized({ en: 'Hello', ar: 'مرحبا' }, 'en')).toBe('Hello');
  });

  it('returns the ar string for lang="ar"', () => {
    expect(pickLocalized({ en: 'Hello', ar: 'مرحبا' }, 'ar')).toBe('مرحبا');
  });

  it('returns the explicit fallback when the value is null or undefined', () => {
    expect(pickLocalized(null, 'en', 'fallback')).toBe('fallback');
    expect(pickLocalized(undefined, 'en', 'fallback')).toBe('fallback');
  });

  it('returns the empty-string default when the value is null with no fallback', () => {
    expect(pickLocalized(null, 'en')).toBe('');
  });

  it('falls through to the other locale when the active one is empty/whitespace', () => {
    expect(pickLocalized({ en: '', ar: 'مرحبا' }, 'en')).toBe('مرحبا');
    expect(pickLocalized({ en: '   ', ar: 'مرحبا' }, 'en')).toBe('مرحبا');
    expect(pickLocalized({ en: 'Hello', ar: '' }, 'ar')).toBe('Hello');
  });

  it('falls back to en when the requested locale is missing entirely', () => {
    expect(pickLocalized({ en: 'Hello' }, 'ar')).toBe('Hello');
    expect(pickLocalized({ ar: 'مرحبا' }, 'en')).toBe('مرحبا');
  });

  it('returns the explicit fallback when both locales are empty/missing', () => {
    expect(pickLocalized({}, 'en', 'fallback')).toBe('fallback');
    expect(pickLocalized({ en: '', ar: '' }, 'en', 'fallback')).toBe('fallback');
  });

  it('does not throw on arrays or other non-object, non-string values', () => {
    expect(pickLocalized(42 as unknown as string, 'en', 'safe')).toBe('safe');
    expect(pickLocalized(true as unknown as string, 'en', 'safe')).toBe('safe');
  });
});

describe('pickLocalizedTrimmed', () => {
  it('trims surrounding whitespace from a plain string', () => {
    expect(pickLocalizedTrimmed('  Beauty  ', 'en')).toBe('Beauty');
  });

  it('trims surrounding whitespace from a localized object', () => {
    expect(pickLocalizedTrimmed({ en: '  Beauty  ', ar: 'جمال' }, 'en')).toBe('Beauty');
  });

  it('does not throw on an object with no trim method (the original bug)', () => {
    // Before the fix, the code did `product.category.name.trim()` which
    // threw "x?.trim is not a function" when name was `{en, ar}`.
    expect(() => pickLocalizedTrimmed({ en: 'Beauty', ar: 'جمال' }, 'en', 'shop all')).not.toThrow();
    expect(pickLocalizedTrimmed({ en: 'Beauty', ar: 'جمال' }, 'en', 'shop all')).toBe('Beauty');
  });
});

describe('isLocalizedObject', () => {
  it('returns true for {en} shape', () => {
    expect(isLocalizedObject({ en: 'Hello' })).toBe(true);
  });

  it('returns true for {ar} shape', () => {
    expect(isLocalizedObject({ ar: 'مرحبا' })).toBe(true);
  });

  it('returns true for {en, ar} shape', () => {
    expect(isLocalizedObject({ en: 'Hello', ar: 'مرحبا' })).toBe(true);
  });

  it('returns false for a plain string', () => {
    expect(isLocalizedObject('Hello')).toBe(false);
  });

  it('returns false for null/undefined', () => {
    expect(isLocalizedObject(null)).toBe(false);
    expect(isLocalizedObject(undefined)).toBe(false);
  });

  it('returns false for an object with arbitrary keys', () => {
    // Defensive: only treat as localized if keys are en/ar.
    expect(isLocalizedObject({ slug: 'beauty', name: 'Beauty' })).toBe(false);
  });
});
