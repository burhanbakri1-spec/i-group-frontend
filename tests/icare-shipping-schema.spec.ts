import { describe, it, expect } from 'vitest';
import { shippingSchema, shippingFieldErrors } from '../app/icare/lib/checkout/shipping-schema';

describe('shippingSchema', () => {
  const valid = {
    firstName: 'Layla',
    lastName: 'Khalil',
    email: 'layla@example.com',
    phone: '+970 599 123 456',
    address: '123 Main St',
    city: 'Ramallah',
    region: '',
    postalCode: '',
    country: 'Palestine',
    deliveryNotes: '',
  };

  it('accepts a valid payload', () => {
    const result = shippingSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it('rejects invalid email', () => {
    const result = shippingSchema.safeParse({ ...valid, email: 'not-an-email' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path.includes('email'))).toBe(true);
    }
  });

  it('rejects phone with letters', () => {
    const result = shippingSchema.safeParse({ ...valid, phone: 'abc1234567' });
    expect(result.success).toBe(false);
  });

  it('accepts phone with digits/spaces/dashes/parens/+', () => {
    for (const phone of ['+970 599 123 456', '(02) 123-4567', '123-456-7890']) {
      expect(shippingSchema.safeParse({ ...valid, phone }).success).toBe(true);
    }
  });

  it('rejects empty firstName', () => {
    expect(shippingSchema.safeParse({ ...valid, firstName: '' }).success).toBe(false);
  });

  it('rejects address shorter than 5 chars', () => {
    expect(shippingSchema.safeParse({ ...valid, address: 'abc' }).success).toBe(false);
  });

  it('rejects empty country', () => {
    expect(shippingSchema.safeParse({ ...valid, country: '' }).success).toBe(false);
  });

  it('shippingFieldErrors maps zod issues to per-field arrays', () => {
    const result = shippingSchema.safeParse({ ...valid, email: 'bad', phone: 'x' });
    expect(result.success).toBe(false);
    if (!result.success) {
      const errors = shippingFieldErrors(result.error);
      expect(errors.email).toBeDefined();
      expect(errors.phone).toBeDefined();
    }
  });
});
