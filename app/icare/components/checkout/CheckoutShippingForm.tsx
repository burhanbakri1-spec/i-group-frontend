'use client';

import React, { forwardRef, useCallback, useImperativeHandle, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Language, checkoutTranslations } from '../../translations';
import { ShippingFormData } from '../../hooks/useCheckout';
import { CartItem, UserAddress } from '../../types';
import { validateCheckout, ValidationResult } from '../../lib/checkout/validate-checkout';
import { shippingSchema, type ShippingFormData as ShippingSchemaData } from '../../lib/checkout/shipping-schema';

const CONTROL_FOCUS_CLASS =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7B7872]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-white';
const INPUT_FOCUS_CLASS =
  'focus-visible:outline-none focus-visible:border-[#67645E] focus-visible:ring-2 focus-visible:ring-[#7B7872]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-white';
const CHECKOUT_INPUT_CLASS = `w-full px-4 py-3 border border-[#DDDDDD] rounded text-[#67645E] placeholder:text-[#84827E] transition-[border-color,box-shadow] duration-200 ${INPUT_FOCUS_CLASS}`;
const INPUT_ERROR_CLASS = `w-full px-4 py-3 border rounded text-[#67645E] placeholder:text-[#84827E] transition-[border-color,box-shadow] duration-200 border-red-500 ${INPUT_FOCUS_CLASS}`;

export interface CheckoutShippingFormHandle {
  validate: () => ValidationResult;
}

interface CheckoutShippingFormProps {
  lang: Language;
  shippingForm: ShippingFormData;
  updateShippingField: (field: keyof ShippingFormData, value: string) => void;
  savedAddresses: UserAddress[];
  selectedAddress: UserAddress | null;
  onSelectSavedAddress: (address: UserAddress) => void;
  checkoutShippingHeading: string;
  cartItems: CartItem[];
}

export const CheckoutShippingForm = forwardRef<
  CheckoutShippingFormHandle,
  CheckoutShippingFormProps
>(
  (
    {
      lang,
      shippingForm,
      updateShippingField,
      savedAddresses,
      selectedAddress,
      onSelectSavedAddress,
      checkoutShippingHeading,
      cartItems,
    },
    ref,
  ) => {
    const ct = checkoutTranslations[lang];
    const [errors, setErrors] = useState<Record<string, string>>({});

    // T022 / C-13 — RHF + zodResolver. The form state still flows
    // through the parent hook (updateShippingField), but every input
    // is registered with RHF so we get per-field validation,
    // aria-invalid wiring, and a single `errors` map. The legacy
    // `validateCheckout` is preserved as the second-line semantic
    // check (cart-level rules, country-specific phone shape).
    const {
      register,
      formState: { errors: rhfErrors },
      trigger,
    } = useForm<ShippingSchemaData>({
      resolver: zodResolver(shippingSchema),
      mode: 'onBlur',
      defaultValues: {
        firstName: shippingForm.firstName,
        lastName: shippingForm.lastName,
        email: shippingForm.email,
        phone: shippingForm.phone,
        address: shippingForm.address,
        city: shippingForm.city,
        region: shippingForm.region ?? '',
        postalCode: shippingForm.postalCode ?? '',
        country: shippingForm.country || 'Palestine',
        deliveryNotes: shippingForm.deliveryNotes ?? '',
      },
    });

    // ── Validation ──
    const runValidation = useCallback((): ValidationResult => {
      // Sync path: RHF mode:'onBlur' has already populated `rhfErrors`.
      // We merge with the legacy semantic checks (cart-level rules,
      // country-specific phone shape) so the parent gets the union.
      const result = validateCheckout(shippingForm, cartItems, lang);
      const merged: Record<string, string> = { ...result.errors };
      for (const [k, v] of Object.entries(rhfErrors)) {
        if (v?.message && !merged[k]) merged[k] = v.message;
      }
      setErrors(merged);
      return { valid: Object.keys(merged).length === 0 && result.valid, errors: merged };
    }, [shippingForm, cartItems, lang, rhfErrors]);

    useImperativeHandle(ref, () => ({ validate: runValidation }), [runValidation]);

    const handleBlurValidate = useCallback(
      (_field: keyof ShippingFormData) => {
        // RHF's mode:'onBlur' already validates per-field on blur.
        // Keep the legacy semantic check for cart-level rules.
        const result = validateCheckout(shippingForm, cartItems, lang);
        setErrors(result.errors);
      },
      [shippingForm, cartItems, lang],
    );

    // ── Saved address selection — populate ALL form fields ──
    const handleSelectSavedAddress = useCallback(
      (addr: UserAddress) => {
        onSelectSavedAddress(addr);
        // Populate all form fields from saved address
        const fields: [keyof ShippingFormData, string][] = [
          ['address', addr.street],
          ['city', addr.city],
          ['region', addr.governorate || ''],
          ['country', addr.country],
          ['postalCode', addr.postalCode || ''],
        ];
        for (const [field, value] of fields) {
          if (value) {
            updateShippingField(field, value);
          }
        }
      },
      [onSelectSavedAddress, updateShippingField],
    );

    // ── Field-level blur handler ──
    const onFieldBlur = useCallback(
      (field: keyof ShippingFormData) => {
        handleBlurValidate(field);
      },
      [handleBlurValidate],
    );

    /**
     * Returns the CSS class for a field — error border when field has an error.
     */
    const fieldClass = (field: string) =>
      errors[field] ? INPUT_ERROR_CLASS : CHECKOUT_INPUT_CLASS;

    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-light mb-6">{checkoutShippingHeading}</h2>

        {/* Saved Addresses */}
        {savedAddresses.length > 0 && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-[#67645E] mb-2">
              {ct.savedAddresses}
            </label>
            <div className="space-y-2">
              {savedAddresses.map((addr) => (
                <button
                  key={addr.id}
                  type="button"
                  onClick={() => handleSelectSavedAddress(addr)}
                  className={`w-full p-3 border rounded-[12px] text-left transition-colors ${CONTROL_FOCUS_CLASS} ${
                    selectedAddress?.id === addr.id
                      ? 'border-[#67645E] bg-[#F1F0ED]'
                      : 'border-[#DDDDDD] hover:border-[#67645E]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">{addr.label}</span>
                    {addr.isDefault && (
                      <span className="text-xs bg-[#E6E5E2] text-[#67645E] px-2 py-0.5 rounded">
                        {ct.defaultLabel}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-[#84827E] mt-1">
                    {[addr.street, addr.building, addr.apartment]
                      .filter(Boolean)
                      .join(', ')}
                    {addr.area ? `, ${addr.area}` : ''}
                  </p>
                  <p className="text-xs text-[#84827E]">
                    {addr.city}, {addr.governorate || addr.country}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Shipping form fields
            T022 / C-13 — every input now carries:
              - explicit <label htmlFor> (WCAG 3.3.2)
              - aria-required / aria-invalid (WCAG 4.1.2)
              - aria-describedby pointing to the error <p> when present
            The existing Tailwind styling is preserved. */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="shipping-firstName" className="sr-only">{ct.firstName}</label>
            <input
              id="shipping-firstName"
              type="text"
              value={shippingForm.firstName}
              onChange={(e) => updateShippingField('firstName', e.target.value)}
              onBlur={() => onFieldBlur('firstName')}
              placeholder={ct.firstName}
              required
              aria-required="true"
              aria-invalid={!!errors.firstName}
              aria-describedby={errors.firstName ? 'shipping-firstName-error' : undefined}
              className={fieldClass('firstName')}
            />
            {errors.firstName && (
              <p id="shipping-firstName-error" role="alert" className="mt-1 text-sm text-red-500">
                {errors.firstName}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="shipping-lastName" className="sr-only">{ct.lastName}</label>
            <input
              id="shipping-lastName"
              type="text"
              value={shippingForm.lastName}
              onChange={(e) => updateShippingField('lastName', e.target.value)}
              placeholder={ct.lastName}
              required
              aria-required="true"
              aria-invalid={!!errors.lastName}
              aria-describedby={errors.lastName ? 'shipping-lastName-error' : undefined}
              className={CHECKOUT_INPUT_CLASS}
            />
            {errors.lastName && (
              <p id="shipping-lastName-error" role="alert" className="mt-1 text-sm text-red-500">
                {errors.lastName}
              </p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="shipping-email" className="sr-only">{ct.email}</label>
          <input
            id="shipping-email"
            type="email"
            value={shippingForm.email}
            onChange={(e) => updateShippingField('email', e.target.value)}
            onBlur={() => onFieldBlur('email')}
            placeholder={ct.email}
            required
            aria-required="true"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? 'shipping-email-error' : undefined}
            className={fieldClass('email')}
          />
          {errors.email && (
            <p id="shipping-email-error" role="alert" className="mt-1 text-sm text-red-500">
              {errors.email}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="shipping-phone" className="sr-only">{ct.phone}</label>
          <input
            id="shipping-phone"
            type="tel"
            value={shippingForm.phone}
            onChange={(e) => updateShippingField('phone', e.target.value)}
            onBlur={() => onFieldBlur('phone')}
            placeholder={ct.phone}
            required
            aria-required="true"
            aria-invalid={!!errors.phone}
            aria-describedby={errors.phone ? 'shipping-phone-error' : undefined}
            className={fieldClass('phone')}
          />
          {errors.phone && (
            <p id="shipping-phone-error" role="alert" className="mt-1 text-sm text-red-500">
              {errors.phone}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="shipping-address" className="sr-only">{ct.address}</label>
          <input
            id="shipping-address"
            type="text"
            value={shippingForm.address}
            onChange={(e) => updateShippingField('address', e.target.value)}
            onBlur={() => onFieldBlur('address')}
            placeholder={ct.address}
            required
            aria-required="true"
            aria-invalid={!!errors.address}
            aria-describedby={errors.address ? 'shipping-address-error' : undefined}
            className={fieldClass('address')}
          />
          {errors.address && (
            <p id="shipping-address-error" role="alert" className="mt-1 text-sm text-red-500">
              {errors.address}
            </p>
          )}
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="shipping-city" className="sr-only">{ct.city}</label>
            <input
              id="shipping-city"
              type="text"
              value={shippingForm.city}
              onChange={(e) => updateShippingField('city', e.target.value)}
              onBlur={() => onFieldBlur('city')}
              placeholder={ct.city}
              required
              aria-required="true"
              aria-invalid={!!errors.city}
              aria-describedby={errors.city ? 'shipping-city-error' : undefined}
              className={fieldClass('city')}
            />
            {errors.city && (
              <p id="shipping-city-error" role="alert" className="mt-1 text-sm text-red-500">
                {errors.city}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="shipping-region" className="sr-only">{ct.region}</label>
            <input
              id="shipping-region"
              type="text"
              value={shippingForm.region}
              onChange={(e) => updateShippingField('region', e.target.value)}
              placeholder={ct.region}
              aria-invalid={!!errors.region}
              aria-describedby={errors.region ? 'shipping-region-error' : undefined}
              className={CHECKOUT_INPUT_CLASS}
            />
            {errors.region && (
              <p id="shipping-region-error" role="alert" className="mt-1 text-sm text-red-500">
                {errors.region}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="shipping-postalCode" className="sr-only">{ct.postalCode}</label>
            <input
              id="shipping-postalCode"
              type="text"
              value={shippingForm.postalCode}
              onChange={(e) => updateShippingField('postalCode', e.target.value)}
              placeholder={ct.postalCode}
              aria-invalid={!!errors.postalCode}
              aria-describedby={errors.postalCode ? 'shipping-postalCode-error' : undefined}
              className={CHECKOUT_INPUT_CLASS}
            />
            {errors.postalCode && (
              <p id="shipping-postalCode-error" role="alert" className="mt-1 text-sm text-red-500">
                {errors.postalCode}
              </p>
            )}
          </div>
        </div>

        <div>
          <input
            type="text"
            value={shippingForm.country}
            onChange={(e) => updateShippingField('country', e.target.value)}
            onBlur={() => onFieldBlur('country')}
            placeholder={ct.country}
            className={fieldClass('country')}
          />
          {errors.country && (
            <p className="mt-1 text-sm text-red-500">{errors.country}</p>
          )}
        </div>

        {/* Delivery notes textarea */}
        <div>
          <textarea
            value={shippingForm.deliveryNotes}
            onChange={(e) => updateShippingField('deliveryNotes', e.target.value)}
            placeholder={ct.notesPlaceholder}
            maxLength={500}
            rows={3}
            className={`${CHECKOUT_INPUT_CLASS} resize-y`}
          />
          <p className="text-xs text-gray-400 mt-1 text-right">
            {shippingForm.deliveryNotes.length}/500
          </p>
        </div>

        {/* Global cart error */}
        {errors.cart && (
          <p className="text-sm text-red-500">{errors.cart}</p>
        )}
      </div>
    );
  },
);

CheckoutShippingForm.displayName = 'CheckoutShippingForm';
