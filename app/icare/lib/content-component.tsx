'use client';

import Image from 'next/image';
import { useContent, UseContentOptions } from '../hooks/useContent';

type ContentElement = 'h1' | 'h2' | 'h3' | 'p' | 'span' | 'div';

interface ContentProps extends UseContentOptions {
  src: string;
  as?: ContentElement;
  alt?: string;
  className?: string;
  width?: number;
  height?: number;
}

export function Content({
  src,
  lang,
  fallback,
  as: As = 'span',
  alt,
  className,
  width,
  height,
}: ContentProps) {
  const { val, isLoading } = useContent(src, { lang, fallback });

  if (isLoading || val === '') return null;

  if (src.endsWith('.image')) {
    return (
      <Image
        src={val}
        alt={alt ?? ''}
        width={width ?? 1200}
        height={height ?? 675}
        className={className}
      />
    );
  }

  return <As className={className}>{val}</As>;
}
