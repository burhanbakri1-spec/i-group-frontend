'use client';

import React, { forwardRef, useCallback, useImperativeHandle, useState } from 'react';
import dynamic from 'next/dynamic';
import { Language, checkoutTranslations } from '../../translations';
import { ShippingFormData } from '../../hooks/useCheckout';
import { CartItem, UserAddress } from '../../types';
import { validateCheckout, ValidationResult } from '../../lib/checkout/validate-checkout';

const MAP_PICKER_FRAME_CLASS =
  'w-full h-64 md:h-80 rounded-lg overflow-hidden border border-gray-300 mb-4';
const CONTROL_FOCUS_CLASS =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E11D48]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-white';
const INPUT_FOCUS_CLASS =
  'focus-visible:outline-none focus-visible:border-black focus-visible:ring-2 focus-visible:ring-[#E11D48]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-white';
const CHECKOUT_INPUT_CLASS = `w-full px-4 py-3 border border-[#8A867E] rounded text-[#222] placeholder:text-[#666] transition-[border-color,box-shadow] duration-200 ${INPUT_FOCUS_CLASS}`;
const INPUT_ERROR_CLASS = `w-full px-4 py-3 border rounded text-[#222] placeholder:text-[#666] transition-[border-color,box-shadow] duration-200 border-red-500 ${INPUT_FOCUS_CLASS}`;

const MapAddressPicker = dynamic(() => import('../MapAddressPicker'), {
  ssr: false,
  loading: () => (
    <div
      className={`${MAP_PICKER_FRAME_CLASS} bg-gray-50 animate-pulse motion-reduce:animate-none`}
      aria-hidden="true"
    />
  ),
});

export interface CheckoutShippingFormHandle {
  validate: () => ValidationResult;
}

interface CheckoutShippingFormProps {
  lang: Language;
  shippingForm: ShippingFormData;
  updateShippingField: (field: keyof ShippingFormData, value: string) => void;
  mapLat: number | null;
  mapLng: number | null;
  onLocationSelect: (lat: number, lng: number) => void;
  savedAddresses: UserAddress[];
  selectedAddress: UserAddress | null;
  onSelectSavedAddress: (address: UserAddress) => void;
  checkoutShippingHeading: string;
  cartItems: CartItem[];
}

/**
 * Parses a Nominatim display_name and address components into discrete
 * street / city / region / country / postalCode fields.
 *
 * Uses Nominatim's `address` object when available (precise), falls back
 * to heuristic splitting of `display_name` by comma.
 */
function parseResolvedAddress(
  displayName: string,
  addressComponents?: Record<string, string>,
): {
  street: string;
  city: string;
  region: string;
  country: string;
  postalCode: string;
} {
  const result = { street: '', city: '', region: '', country: '', postalCode: '' };

  if (addressComponents) {
    // Nominatim address object — precise field extraction
    result.street = [
      addressComponents.house_number,
      addressComponents.road,
      addressComponents.pedestrian,
      addressComponents.footway,
    ]
      .filter(Boolean)
      .join(' ') || addressComponents.neighbourhood || addressComponents.suburb || '';

    result.city =
      addressComponents.city ||
      addressComponents.town ||
      addressComponents.village ||
      addressComponents.municipality ||
      '';

    result.region =
      addressComponents.state ||
      addressComponents.region ||
      addressComponents.province ||
      addressComponents.county ||
      '';

    result.country = addressComponents.country || '';

    result.postalCode = addressComponents.postcode || '';
  }

  // Fallback: heuristic comma-splitting of display_name
  // Nominatim format is typically: detail, street, city, region, country
  if (displayName) {
    const parts = displayName.split(',').map((s) => s.trim());

    if (!result.country && parts.length > 0) {
      result.country = parts[parts.length - 1];
    }
    if (!result.region && parts.length > 1 && parts.length >= 4) {
      result.region = parts[parts.length - 2];
    }
    if (!result.city && parts.length > 2 && parts.length >= 3) {
      result.city = parts[parts.length - 3];
    }
    if (!result.street && parts.length > 3) {
      result.street = parts.slice(0, parts.length - 3).join(', ');
    }
  }

  return result;
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
      mapLat,
      mapLng,
      onLocationSelect,
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

    // ── Address resolved from map pin ──
    const handleAddressResolved = useCallback(
      (displayName: string, addressComponents?: Record<string, string>) => {
        const parsed = parseResolvedAddress(displayName, addressComponents);
        const fields: [keyof ShippingFormData, string][] = [
          ['address', parsed.street],
          ['city', parsed.city],
          ['region', parsed.region],
          ['country', parsed.country],
          ['postalCode', parsed.postalCode],
        ];
        for (const [field, value] of fields) {
          if (value) {
            updateShippingField(field, value);
          }
        }
      },
      [updateShippingField],
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

        {/* Map Section */}
        {mapLat !== null && mapLng !== null ? (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {ct.deliveryLocation}
            </label>
            <MapAddressPicker
              initialLat={mapLat}
              initialLng={mapLng}
              onLocationSelect={onLocationSelect}
              onAddressResolved={handleAddressResolved}
              lang={lang}
            />
            {process.env.NODE_ENV !== 'production' && (
              <p className="text-xs text-gray-500 mt-1">
                Lat: {mapLat.toFixed(6)}, Lng: {mapLng.toFixed(6)}
              </p>
            )}
          </div>
        ) : (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {ct.deliveryLocation}
            </label>
            <MapAddressPicker
              onLocationSelect={onLocationSelect}
              onAddressResolved={handleAddressResolved}
              lang={lang}
            />
            <p className="text-xs text-gray-500 mt-1">{ct.clickMapToSetLocation}</p>
          </div>
        )}

        {/* Saved Addresses */}
        {savedAddresses.length > 0 && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {ct.savedAddresses}
            </label>
            <div className="space-y-2">
              {savedAddresses.map((addr) => (
                <button
                  key={addr.id}
                  type="button"
                  onClick={() => handleSelectSavedAddress(addr)}
                  className={`w-full p-3 border rounded-lg text-left transition-colors ${CONTROL_FOCUS_CLASS} ${
                    selectedAddress?.id === addr.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">{addr.label}</span>
                    {addr.isDefault && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                        {ct.defaultLabel}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {[addr.street, addr.building, addr.apartment]
                      .filter(Boolean)
                      .join(', ')}
                    {addr.area ? `, ${addr.area}` : ''}
                  </p>
                  <p className="text-xs text-gray-600">
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
