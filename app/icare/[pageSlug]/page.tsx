import type { Metadata } from 'next';
import { fetchContent } from '../lib/content-client';
import { DynamicPageView } from '../components/DynamicPageView';

interface PageProps {
  params: Promise<{ pageSlug: string }>;
}

async function resolvePage(slug: string) {
  const [title, content, metaTitle, metaDescription] = await Promise.all([
    fetchContent(`page.${slug}.title`, { fallback: '' }),
    fetchContent(`page.${slug}.content`, { fallback: '' }),
    fetchContent(`page.${slug}.meta.title`, { fallback: '' }),
    fetchContent(`page.${slug}.meta.description`, { fallback: '' }),
  ]);
  return {
    title: title.val,
    content: content.val,
    metaTitle: metaTitle.val,
    metaDescription: metaDescription.val,
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { pageSlug } = await params;
  const page = await resolvePage(pageSlug);
  if (!page.title && !page.content) {
    return { title: 'Page not found' };
  }
  return {
    title: page.metaTitle || page.title,
    description: page.metaDescription || undefined,
  };
}

export default async function DynamicPage({ params }: PageProps) {
  const { pageSlug } = await params;
  const page = await resolvePage(pageSlug);
  return (
    <DynamicPageView
      slug={pageSlug}
      fallbackTitle={page.title}
      fallbackContent={page.content}
    />
  );
}