import React, { useState } from 'react'

export function ImageWithFallback(props: React.ImgHTMLAttributes<HTMLImageElement>) {
  const [didError, setDidError] = useState(false)

  const handleError = () => {
    setDidError(true)
  }

  const { src, alt, style, className, ...rest } = props
  const hasImage = typeof src === 'string' && src.trim().length > 0

  return !hasImage || didError ? (
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
  ) : (
    <img src={src} alt={alt} className={className} style={style} {...rest} onError={handleError} />
  )
}
