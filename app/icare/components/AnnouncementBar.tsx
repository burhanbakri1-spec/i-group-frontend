"use client";

import { useSiteContent } from '../hooks/useSiteContent';

export function AnnouncementBar() {
  const { announcementText } = useSiteContent();

  return (
    <div className="bg-[var(--rb-bg-warm-gray)] text-center h-10 flex items-center justify-center border-b border-[var(--rb-border-light)]">
      <p className="text-[10px] uppercase tracking-[0.2em] font-medium text-[var(--rb-primary-text)]">
        {announcementText}
      </p>
    </div>
  );
}
