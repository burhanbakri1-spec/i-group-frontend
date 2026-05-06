import React, { useState } from 'react'
import Image from 'next/image'

interface ImageWithFallbackProps {
  src?: string
  alt?: string
  className?: string
  style?: React.CSSProperties
  sizes?: string
  priority?: boolean
  width?: number
  height?: number
}

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
  const [didError, setDidError] = useState(false)
  const hasImage = typeof src === 'string' && src.trim().length > 0

  if (!hasImage || didError) {
    return (
      <div
        className={`inline-flex bg-gray-100 text-center align-middle ${className ?? ''}`}
        style={style}
        role="img"
        aria-label={alt ?? 'Image unavailable'}
      >
        <div className="flex items-center justify-center w-full h-full px-2 text-[10px] font-bold uppercase tracking-[0.15em] text-black/30">
          no image
        </div>
      </div>
    )
  }

  const imageSrc: string = src

  // Use explicit dimensions when both width and height are provided,
  // otherwise use fill mode which requires a positioned parent wrapper.
  if (width !== undefined && height !== undefined) {
    return (
      <Image
        src={imageSrc}
        alt={alt ?? ''}
        width={width}
        height={height}
        sizes={sizes}
        priority={priority}
        className={className}
        style={style}
        onError={() => setDidError(true)}
      />
    )
  }

  // fill mode: wrapper div handles sizing/positioning, Image fills it.
  return (
    <div className={`relative ${className ?? ''}`} style={style}>
      <Image
        src={imageSrc}
        alt={alt ?? ''}
        fill
        sizes={sizes ?? '100vw'}
        priority={priority}
        className={className}
        onError={() => setDidError(true)}
      />
    </div>
  )
}
