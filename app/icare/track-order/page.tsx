'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';
import { TrackOrderPage } from '../../components/TrackOrderPage';
import { Language } from '../../translations';

export default function TrackOrderRoutePage() {
  const [lang, setLang] = React.useState<Language>('en');

  React.useEffect(() => {
    // Detect language from document direction
    const dir = document.documentElement.dir;
    if (dir === 'rtl') setLang('ar');
  }, []);

  const searchParams = useSearchParams();
  const initialOrderNumber = searchParams.get('orderNumber') ?? undefined;

  return <TrackOrderPage lang={lang} initialOrderNumber={initialOrderNumber} />;
}
