/**
 * Showcase preview sub-page for Rhode showcase units.
 * Route: /icare/products/[slug]/showcase
 *
 * This page renders the RhodeShowcaseBlock for a given product slug,
 * allowing designers, admins, and QA to preview all showcase units
 * for a product without navigating to the full product page.
 */

import type { Metadata } from 'next';
import { RhodeShowcasePreviewPage } from '../../../components/rhode/RhodeShowcasePreviewPage';

interface ShowcasePreviewPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ShowcasePreviewPageProps): Promise<Metadata> {
  const { slug } = await params;
  const productName = slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return {
    title: `${productName} — Showcase Preview | iCare`,
    description: `Rhode-style showcase preview for ${productName}. Displays all active showcase units for review.`,
    robots: { index: false, follow: false }, // No indexing for admin preview pages
  };
}

export default async function ShowcasePreviewPage({ params }: ShowcasePreviewPageProps) {
  const { slug } = await params;
  return <RhodeShowcasePreviewPage slug={decodeURIComponent(slug)} />;
}
