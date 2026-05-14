"use client";

import { useSiteContent } from '../hooks/useSiteContent';

export function AnnouncementBar() {
  const { announcementText } = useSiteContent();

  return (
    <div className="bg-[#f0efeb] text-center h-10 flex items-center justify-center">
      <p className="text-[10px] uppercase tracking-[0.2em] font-medium text-black">
        {announcementText}
      </p>
    </div>
  );
}
