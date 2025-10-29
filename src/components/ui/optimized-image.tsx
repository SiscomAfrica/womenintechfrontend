import React, { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  lazy?: boolean
  quality?: number
  priority?: boolean
  placeholder?: 'blur' | 'empty'
  blurDataURL?: string
  sizes?: string
  onLoad?: () => void
  onError?: () => void
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className,
  lazy = true,
  quality = 75,
  priority = false,
  placeholder = 'empty',
  blurDataURL,
  sizes,
  onLoad,
  onError,
  ...props
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isInView, setIsInView] = useState(!lazy || priority)
  const [hasError, setHasError] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)
  const [currentSrc, setCurrentSrc] = useState<string>('')

  
  const generateSrcSet = (baseSrc: string) => {
    if (!baseSrc) return ''
    
    
    if (baseSrc.includes('?') || baseSrc.startsWith('http')) {
      return baseSrc
    }

    const widths = [320, 640, 768, 1024, 1280, 1920]
    const srcSet = widths
      .map(w => `${baseSrc}?w=${w}&q=${quality}&f=webp ${w}w`)
      .join(', ')
    
    return srcSet
  }

  const generateSources = (baseSrc: string) => {
    if (!baseSrc || baseSrc.startsWith('http')) return []
    
    return [
      {
        srcSet: generateSrcSet(baseSrc).replace(/&f=webp/g, '&f=avif'),
        type: 'image/avif'
      },
      {
        srcSet: generateSrcSet(baseSrc),
        type: 'image/webp'
      }
    ]
  }

  
  useEffect(() => {
    if (!lazy || priority || isInView) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          observer.disconnect()
        }
      },
      {
        rootMargin: '50px',
        threshold: 0.1,
      }
    )

    if (imgRef.current) {
      observer.observe(imgRef.current)
    }

    return () => observer.disconnect()
  }, [lazy, priority, isInView])

  
  useEffect(() => {
    if (isInView && !currentSrc) {
      setCurrentSrc(src)
    }
  }, [isInView, src, currentSrc])

  const handleLoad = () => {
    setIsLoaded(true)
    onLoad?.()
  }

  const handleError = () => {
    setHasError(true)
    onError?.()
  }

  
  const renderPlaceholder = () => {
    if (placeholder === 'blur' && blurDataURL) {
      return (
        <img
          src={blurDataURL}
          alt=""
          className={cn(
            'absolute inset-0 w-full h-full object-cover transition-opacity duration-300',
            isLoaded ? 'opacity-0' : 'opacity-100'
          )}
          aria-hidden="true"
        />
      )
    }

    return (
      <div
        className={cn(
          'absolute inset-0 bg-gray-200 animate-pulse transition-opacity duration-300',
          isLoaded ? 'opacity-0' : 'opacity-100'
        )}
        aria-hidden="true"
      />
    )
  }

  
  if (hasError) {
    return (
      <div
        className={cn(
          'flex items-center justify-center bg-gray-100 text-gray-400',
          className
        )}
        style={{ width, height }}
      >
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </div>
    )
  }

  const sources = generateSources(currentSrc)

  return (
    <div className={cn('relative overflow-hidden', className)} style={{ width, height }}>
      {!isLoaded && renderPlaceholder()}
      
      {isInView && currentSrc && (
        <picture>
          {sources.map((source, index) => (
            <source
              key={index}
              srcSet={source.srcSet}
              type={source.type}
              sizes={sizes}
            />
          ))}
          <img
            ref={imgRef}
            src={currentSrc}
            alt={alt}
            width={width}
            height={height}
            className={cn(
              'w-full h-full object-cover transition-opacity duration-300',
              isLoaded ? 'opacity-100' : 'opacity-0'
            )}
            onLoad={handleLoad}
            onError={handleError}
            loading={lazy && !priority ? 'lazy' : 'eager'}
            decoding="async"
            {...props}
          />
        </picture>
      )}
    </div>
  )
}


interface OptimizedAvatarProps {
  src?: string
  alt: string
  name?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

export function OptimizedAvatar({
  src,
  alt,
  name,
  size = 'md',
  className,
}: OptimizedAvatarProps) {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-sm',
    lg: 'w-16 h-16 text-base',
    xl: 'w-24 h-24 text-xl',
  }

  const sizePixels = {
    sm: 32,
    md: 48,
    lg: 64,
    xl: 96,
  }

  const initials = name
    ? name
        .split(' ')
        .map(n => n.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : alt.charAt(0).toUpperCase()

  if (!src) {
    return (
      <div
        className={cn(
          'flex items-center justify-center rounded-full bg-orange-500 text-white font-semibold',
          sizeClasses[size],
          className
        )}
      >
        {initials}
      </div>
    )
  }

  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={sizePixels[size]}
      height={sizePixels[size]}
      className={cn('rounded-full', sizeClasses[size], className)}
      sizes={`${sizePixels[size]}px`}
      quality={90}
    />
  )
}


interface OptimizedBackgroundProps {
  src: string
  alt: string
  children?: React.ReactNode
  className?: string
  overlay?: boolean
  overlayOpacity?: number
}

export function OptimizedBackground({
  src,
  alt,
  children,
  className,
  overlay = false,
  overlayOpacity = 0.5,
}: OptimizedBackgroundProps) {
  return (
    <div className={cn('relative overflow-hidden', className)}>
      <OptimizedImage
        src={src}
        alt={alt}
        className="absolute inset-0 w-full h-full object-cover"
        sizes="100vw"
        priority
      />
      {overlay && (
        <div
          className="absolute inset-0 bg-black"
          style={{ opacity: overlayOpacity }}
        />
      )}
      {children && (
        <div className="relative z-10">
          {children}
        </div>
      )}
    </div>
  )
}