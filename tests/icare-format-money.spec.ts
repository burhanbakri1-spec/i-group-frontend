import { describe, it, expect } from 'vitest';
import { formatMoney } from '../app/icare/lib/format-money';

describe('formatMoney', () => {
  it('formats USD by default', () => {
    expect(formatMoney(29.99)).toBe('$29.99');
    expect(formatMoney(1234.5)).toBe('$1,234.50');
  });

  it('formats non-USD currencies', () => {
    expect(formatMoney(100, 'EUR', 'en-US')).toBe('€100.00');
    expect(formatMoney(50.5, 'GBP', 'en-US')).toBe('£50.50');
  });

  it('returns em-dash for null / undefined / empty', () => {
    expect(formatMoney(null)).toBe('—');
    expect(formatMoney(undefined)).toBe('—');
    expect(formatMoney('')).toBe('—');
  });

  it('returns em-dash for non-numeric strings', () => {
    expect(formatMoney('not a number')).toBe('—');
    expect(formatMoney('NaN')).toBe('—');
    expect(formatMoney('Infinity')).toBe('—');
  });

  it('accepts numeric strings from BE decimal columns', () => {
    expect(formatMoney('29.99')).toBe('$29.99');
    expect(formatMoney('1234.5')).toBe('$1,234.50');
  });

  it('falls back to manual concat for exotic currencies', () => {
    // Use an obviously invalid currency code; Intl throws.
    expect(formatMoney(50, 'XX', 'en-US')).toBe('50.00 XX');
  });
});
