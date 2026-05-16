'use client';

import React, { useState } from 'react';
import Image from 'next/image';

interface ImageWithFallbackProps {
  src?: string;
  alt?: string;
  className?: string;
  style?: React.CSSProperties;
  sizes?: string;
  priority?: boolean;
  width?: number;
  height?: number;
}

const isNativeImageSource = (src: string) => {
  if (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('//')) return true;
  if (src.startsWith('/api/icare/uploads/') || src.startsWith('/uploads/')) return true;
  return false;
};

export function ImageWithFallback({
  src,
  alt,
  className,
  style,
  sizes,
  priority = false,
  width,
  height,
}: ImageWithFallbackProps) {
  const [loaded, setLoaded] = useState(false);
  const [didError, setDidError] = useState(false);
  const hasImage = typeof src === 'string' && src.trim().length > 0;

  if (!hasImage || didError) {
    return (
      <div
        className={`inline-flex bg-muted text-center align-middle ${className ?? ''}`}
        style={style}
        role="img"
        aria-label={alt ?? 'Image unavailable'}
      >
        <div className="flex items-center justify-center w-full h-full px-2 text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/30">
          no image
        </div>
      </div>
    );
  }

  const imageSrc: string = src;
  const visibleClass = `${className ?? ''} ${!loaded ? 'opacity-0' : 'opacity-100 skeleton-content'}`;

  const skeletonOverlay = !loaded && (
    <div
      className="absolute inset-0 bg-muted motion-safe:animate-[skeleton-pulse_2.5s_ease-in-out_infinite] motion-reduce:opacity-50 rounded-[inherit]"
    />
  );

  if (isNativeImageSource(imageSrc)) {
    return (
      <div className={`relative ${className ?? ''}`} style={style}>
        {skeletonOverlay}
        <img
          src={imageSrc}
          alt={alt ?? ''}
          className={visibleClass}
          style={style}
          onLoad={() => setLoaded(true)}
          onError={() => setDidError(true)}
        />
      </div>
    );
  }

  if (width !== undefined && height !== undefined) {
    return (
      <div className="relative inline-flex" style={style}>
        {skeletonOverlay}
        <Image
          src={imageSrc}
          alt={alt ?? ''}
          width={width}
          height={height}
          sizes={sizes}
          priority={priority}
          className={visibleClass}
          style={style}
          onLoad={() => setLoaded(true)}
          onError={() => setDidError(true)}
        />
      </div>
    );
  }

  return (
    <div className={`relative ${className ?? ''}`} style={style}>
      {skeletonOverlay}
      <Image
        src={imageSrc}
        alt={alt ?? ''}
        fill
        sizes={sizes ?? '100vw'}
        priority={priority}
        className={visibleClass}
        onLoad={() => setLoaded(true)}
        onError={() => setDidError(true)}
      />
    </div>
  );
}
