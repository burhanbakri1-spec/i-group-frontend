'use client';

import { useState } from 'react';
import RhodeShowcaseBlock from '../../../components/RhodeShowcaseBlock';
import { RHODE_SHOWCASE_FALLBACK } from '../../../lib/rhode/fallback';
import type { RhodeShowcaseUnit } from '../../../types/rhode-showcase-units';

export default function RhodeShowcasePreviewPage() {
  const [lang, setLang] = useState<'en' | 'ar'>('en');

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem 1rem' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
        }}
      >
        <h1 style={{ fontSize: '1.5rem', fontWeight: 600, margin: 0 }}>
          Rhode Showcase Preview
        </h1>

        <button
          type="button"
          onClick={() => setLang((prev) => (prev === 'en' ? 'ar' : 'en'))}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: 6,
            border: '1px solid #ddd',
            background: '#fff',
            cursor: 'pointer',
            fontSize: '0.875rem',
          }}
        >
          {lang === 'en' ? 'التبديل إلى العربية' : 'Switch to English'}
        </button>
      </div>

      <RhodeShowcaseBlock
        units={RHODE_SHOWCASE_FALLBACK as RhodeShowcaseUnit[]}
        lang={lang}
      />
    </div>
  );
}
