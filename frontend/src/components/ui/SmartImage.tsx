import { useState } from 'react'
import { ImageOff } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Skeleton } from './Skeleton'

/** Image with a shimmer while loading and a clean fallback if it fails. */
export function SmartImage({
  src,
  alt,
  className,
  eager = false,
}: {
  src: string | null
  alt: string
  className?: string
  eager?: boolean
}) {
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>(src ? 'loading' : 'error')

  if (status === 'error' || !src) {
    return (
      <div role="img" aria-label={alt} className={cn('grid place-items-center bg-surface-muted text-muted', className)}>
        <ImageOff className="h-8 w-8" aria-hidden />
      </div>
    )
  }

  return (
    <div className={cn('relative overflow-hidden bg-surface-muted', className)}>
      {status === 'loading' && <Skeleton className="absolute inset-0 rounded-none" />}
      <img
        src={src}
        alt={alt}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        onLoad={() => setStatus('loaded')}
        onError={() => setStatus('error')}
        className={cn(
          'h-full w-full object-cover transition-opacity duration-300',
          status === 'loaded' ? 'opacity-100' : 'opacity-0',
        )}
      />
    </div>
  )
}