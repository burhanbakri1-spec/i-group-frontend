import { z } from 'zod';

// Permissive phone shape: 7–20 chars, digits + space/-/()/+, must
// contain at least 7 digits. The BE does country-specific validation.
const PHONE_REGEX = /^[\d\s+\-()]{7,20}$/;

export const shippingSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50, 'First name is too long'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name is too long'),
  email: z.string().email('Please enter a valid email address'),
  phone: z
    .string()
    .min(7, 'Phone number is too short')
    .max(20, 'Phone number is too long')
    .regex(PHONE_REGEX, 'Phone number contains invalid characters'),
  address: z.string().min(5, 'Address is required').max(200, 'Address is too long'),
  city: z.string().min(1, 'City is required').max(50, 'City is too long'),
  region: z.string().max(50, 'Region is too long').optional().or(z.literal('')),
  postalCode: z.string().max(20, 'Postal code is too long').optional().or(z.literal('')),
  country: z.string().min(1, 'Country is required').max(50, 'Country is too long'),
  deliveryNotes: z.string().max(500, 'Delivery notes are too long').optional().or(z.literal('')),
});

export type ShippingFormData = z.infer<typeof shippingSchema>;

export const shippingFieldErrors = (error: z.ZodError): Record<string, string[]> => {
  const fieldErrors: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const key = issue.path.join('.');
    if (!fieldErrors[key]) fieldErrors[key] = [];
    fieldErrors[key].push(issue.message);
  }
  return fieldErrors;
};
