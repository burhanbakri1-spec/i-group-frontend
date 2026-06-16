'use client';

import { createContext, useContext } from 'react';

type ContactSettings = {
  address: string;
  phone: string;
  email: string;
};

type SocialLink = {
  key: string;
  label: string;
  url: string;
};

type BrandSettings = {
  contactSettings: ContactSettings;
  socialLinks: SocialLink[];
};

type JsonRequestInit = Omit<RequestInit, 'body'> & {
  body?: BodyInit | string | Record<string, unknown>;
};

const defaultBrandSettings: BrandSettings = {
  contactSettings: {
    address: '',
    phone: '',
    email: '',
  },
  socialLinks: [],
};

const BrandSettingsContext = createContext<BrandSettings>(defaultBrandSettings);

export function BrandSettingsProvider({ children }: { children: React.ReactNode }) {
  return (
    <BrandSettingsContext.Provider value={defaultBrandSettings}>
      {children}
    </BrandSettingsContext.Provider>
  );
}

export function useBrandSettings() {
  return useContext(BrandSettingsContext);
}

export async function apiRequest(path: string, init?: JsonRequestInit) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const { body, ...requestInit } = init ?? {};
  const requestBody: BodyInit = (body instanceof FormData || typeof body === 'string')
    ? body
    : body ? JSON.stringify(body) : undefined;

  const response = await fetch(normalizedPath, {
    ...requestInit,
    body: requestBody,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  });

  if (!response.ok) {
    throw new Error('Request failed');
  }

  return response.json().catch(() => null);
}
