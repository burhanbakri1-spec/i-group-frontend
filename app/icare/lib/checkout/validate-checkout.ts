import { Language, checkoutTranslations } from '../../translations';
import { ShippingFormData } from '../../hooks/useCheckout';
import { CartItem } from '../../types';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[+]?[\d\s()-]{7,15}$/;

const REQUIRED_FIELDS: (keyof ShippingFormData)[] = [
  'firstName',
  'email',
  'phone',
  'address',
  'city',
  'country',
];

export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

/**
 * Validates the checkout shipping form and cart state.
 * Returns an object with per-field error messages — NOT a single string.
 */
export function validateCheckout(
  shippingForm: ShippingFormData,
  cartItems: CartItem[],
  lang: Language,
): ValidationResult {
  const ct = checkoutTranslations[lang];
  const errors: Record<string, string> = {};

  // ── Cart must not be empty ──
  if (!cartItems || cartItems.length === 0) {
    errors.cart = ct.cartEmpty;
  }

  // ── Required field presence checks ──
  for (const field of REQUIRED_FIELDS) {
    if (!shippingForm[field] || !shippingForm[field].toString().trim()) {
      errors[field] = ct.fieldRequired;
    }
  }

  // ── Email format (only if a value exists and isn't already flagged as missing) ──
  if (shippingForm.email && !errors.email && !EMAIL_REGEX.test(shippingForm.email.trim())) {
    errors.email = ct.emailInvalid;
  }

  // ── Phone format (only if a value exists and isn't already flagged as missing) ──
  if (shippingForm.phone && !errors.phone && !PHONE_REGEX.test(shippingForm.phone.trim())) {
    errors.phone = ct.phoneInvalid;
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}
