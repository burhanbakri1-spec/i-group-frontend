'use client';

import { useState } from 'react';
import ShowcaseBlock from '../../../components/showcase/ShowcaseBlock';
import { SHOWCASE_FALLBACK } from '../../../lib/showcase/fallback';
import type { ShowcaseUnit } from '../../../types/showcase-units';

export default function ShowcasePreviewPage() {
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
          Showcase Preview
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

      <ShowcaseBlock
        units={SHOWCASE_FALLBACK as ShowcaseUnit[]}
        lang={lang}
      />
    </div>
  );
}
