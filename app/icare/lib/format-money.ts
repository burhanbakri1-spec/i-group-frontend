import type { BackendNumeric } from '../types';

/**
 * T023 / C-14 — `formatMoney(value, currency)` helper.
 *
 * Replaces the 12+ `.toFixed(2)` callsites in the FE. Returns `'—'`
 * for null / undefined / non-numeric strings / NaN so the UI never
 * renders `'NaN'`. Uses `Intl.NumberFormat` for native currency
 * formatting; falls back to manual concat if the locale data is
 * missing for an exotic currency.
 *
 * @param value    Backend-typed decimal (string from DECIMAL column,
 *                 number, or null/undefined for missing data).
 * @param currency ISO 4217 currency code. Defaults to 'USD'.
 * @param locale   BCP 47 locale tag. Defaults to 'en-US'.
 */
export function formatMoney(
  value: BackendNumeric,
  currency: string = 'USD',
  locale: string = 'en-US',
): string {
  if (value === null || value === undefined || value === '') return '—';
  const num = typeof value === 'string' ? Number(value) : value;
  if (!Number.isFinite(num)) return '—';
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  } catch {
    // Exotic currency or unsupported locale — fall back to a manual
    // concat so the UI never breaks.
    return `${num.toFixed(2)} ${currency}`;
  }
}
