'use client';

import React from 'react';
import { Language } from '../translations';
import { useContent } from '../hooks/useContent';

interface DynamicPageViewProps {
  slug: string;
  lang?: Language;
  fallbackTitle?: string;
  fallbackContent?: string;
}

/**
 * Renders a CMS-style content page keyed by `page.<slug>.*` registry keys.
 * Used by the dynamic [pageSlug] route for pages migrated into the content
 * registry by ContentMigrationsService.migratePages(). Falls back to empty
 * strings when the slug is not registered (the route 404s softly by
 * rendering an empty prose section rather than a hard crash).
 */
export const DynamicPageView: React.FC<DynamicPageViewProps> = ({
  slug,
  lang = 'en',
  fallbackTitle = '',
  fallbackContent = '',
}) => {
  const { val: title, isLoading: titleLoading } = useContent(`page.${slug}.title`, { lang, fallback: fallbackTitle });
  const { val: content, isLoading: contentLoading } = useContent(`page.${slug}.content`, { lang, fallback: fallbackContent });

  const isLoading = titleLoading || contentLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F1F0ED] px-4 sm:px-6 lg:px-8 py-24">
        <div className="max-w-[860px] mx-auto">
          <div className="h-10 w-2/3 rounded bg-black/5 animate-pulse mb-8" />
          <div className="space-y-3">
            <div className="h-4 w-full rounded bg-black/5 animate-pulse" />
            <div className="h-4 w-full rounded bg-black/5 animate-pulse" />
            <div className="h-4 w-5/6 rounded bg-black/5 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!title && !content) {
    return (
      <div className="min-h-screen bg-[#F1F0ED] px-4 sm:px-6 lg:px-8 py-24">
        <div className="max-w-[860px] mx-auto text-center">
          <h1 className="text-[24px] font-bold text-[#5C5A56]">Page not found</h1>
          <p className="mt-4 text-[14px] text-[#84827E]">The page you are looking for is not available.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F1F0ED] px-4 sm:px-6 lg:px-8 py-24">
      <article className="max-w-[860px] mx-auto">
        {title ? (
          <h1 className="text-[28px] md:text-[36px] font-[900] tracking-tight text-[#5C5A56] mb-10">
            {title}
          </h1>
        ) : null}
        {content ? (
          <div className="text-[15px] md:text-[16px] leading-relaxed text-[#5C5B57] whitespace-pre-line">
            {content}
          </div>
        ) : null}
      </article>
    </div>
  );
};