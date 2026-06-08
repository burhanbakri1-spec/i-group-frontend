'use client';

import React, { forwardRef, useCallback, useImperativeHandle, useState } from 'react';
import { Language, checkoutTranslations } from '../../translations';
import { ShippingFormData } from '../../hooks/useCheckout';
import { CartItem, UserAddress } from '../../types';
import { validateCheckout, ValidationResult } from '../../lib/checkout/validate-checkout';

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

    // ── Validation ──
    const runValidation = useCallback((): ValidationResult => {
      const result = validateCheckout(shippingForm, cartItems, lang);
      setErrors(result.errors);
      return result;
    }, [shippingForm, cartItems, lang]);

    useImperativeHandle(ref, () => ({ validate: runValidation }), [runValidation]);

    const handleBlurValidate = useCallback(
      (field: keyof ShippingFormData) => {
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

        {/* Shipping form fields */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <input
              type="text"
              value={shippingForm.firstName}
              onChange={(e) => updateShippingField('firstName', e.target.value)}
              onBlur={() => onFieldBlur('firstName')}
              placeholder={ct.firstName}
              className={fieldClass('firstName')}
            />
            {errors.firstName && (
              <p className="mt-1 text-sm text-red-500">{errors.firstName}</p>
            )}
          </div>
          <div>
            <input
              type="text"
              value={shippingForm.lastName}
              onChange={(e) => updateShippingField('lastName', e.target.value)}
              placeholder={ct.lastName}
              className={CHECKOUT_INPUT_CLASS}
            />
          </div>
        </div>

        <div>
          <input
            type="email"
            value={shippingForm.email}
            onChange={(e) => updateShippingField('email', e.target.value)}
            onBlur={() => onFieldBlur('email')}
            placeholder={ct.email}
            className={fieldClass('email')}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-500">{errors.email}</p>
          )}
        </div>

        <div>
          <input
            type="tel"
            value={shippingForm.phone}
            onChange={(e) => updateShippingField('phone', e.target.value)}
            onBlur={() => onFieldBlur('phone')}
            placeholder={ct.phone}
            className={fieldClass('phone')}
          />
          {errors.phone && (
            <p className="mt-1 text-sm text-red-500">{errors.phone}</p>
          )}
        </div>

        <div>
          <input
            type="text"
            value={shippingForm.address}
            onChange={(e) => updateShippingField('address', e.target.value)}
            onBlur={() => onFieldBlur('address')}
            placeholder={ct.address}
            className={fieldClass('address')}
          />
          {errors.address && (
            <p className="mt-1 text-sm text-red-500">{errors.address}</p>
          )}
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <input
              type="text"
              value={shippingForm.city}
              onChange={(e) => updateShippingField('city', e.target.value)}
              onBlur={() => onFieldBlur('city')}
              placeholder={ct.city}
              className={fieldClass('city')}
            />
            {errors.city && (
              <p className="mt-1 text-sm text-red-500">{errors.city}</p>
            )}
          </div>
          <div>
            <input
              type="text"
              value={shippingForm.region}
              onChange={(e) => updateShippingField('region', e.target.value)}
              onBlur={() => onFieldBlur('region')}
              placeholder={ct.region}
              className={CHECKOUT_INPUT_CLASS}
            />
          </div>
          <div>
            <input
              type="text"
              value={shippingForm.postalCode}
              onChange={(e) => updateShippingField('postalCode', e.target.value)}
              placeholder={ct.postalCode}
              className={CHECKOUT_INPUT_CLASS}
            />
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
