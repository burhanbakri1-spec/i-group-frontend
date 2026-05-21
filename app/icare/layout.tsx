import type { Metadata } from 'next';
import React, { Suspense } from 'react';
import { IcareShell } from './components/IcareShell';
import { fetchServerSettings } from './lib/settings-server';
import { ProductGridSkeleton } from './components/ui/skeletons';
import './icare.css';

const FALLBACK_TITLE = 'iCare Beauty';
const FALLBACK_DESCRIPTION = 'iCare Beauty skincare essentials.';

const getValidMetadataBase = (siteUrl?: string) => {
  if (!siteUrl) return undefined;

  try {
    const url = new URL(siteUrl);
    return ['http:', 'https:'].includes(url.protocol) ? url : undefined;
  } catch {
    return undefined;
  }
};

export async function generateMetadata(): Promise<Metadata> {
  const settings = await fetchServerSettings();
  const general = settings?.general || {};
  const title = general.meta_title || general.site_name || FALLBACK_TITLE;
  const description = general.meta_description || general.site_description || FALLBACK_DESCRIPTION;
  const metadataBase = getValidMetadataBase(general.site_url);
  const ogImage = general.og_image?.trim();

  return {
    title,
    description,
    metadataBase,
    openGraph: {
      title,
      description,
      ...(ogImage ? { images: [ogImage] } : {}),
    },
  };
}

function LayoutFallback() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center bg-[#F1F0ED] px-6">
      <div className="w-full max-w-screen-xl">
        <ProductGridSkeleton count={4} />
      </div>
    </div>
  );
}

export default function IcareLayout({ children }: { children: React.ReactNode }) {
  return (
    <IcareShell>
      <Suspense fallback={<LayoutFallback />}>{children}</Suspense>
    </IcareShell>
  );
}
