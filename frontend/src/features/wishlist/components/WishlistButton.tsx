import { motion } from 'framer-motion'
import { Heart } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import type { ProductCardData } from '@/types/catalog'
import { useWishlist, useWishlistToggle } from '../hooks/useWishlist'

export function WishlistButton({
  product,
  variant = 'icon',
  className,
}: {
  product: ProductCardData
  variant?: 'icon' | 'button'
  className?: string
}) {
  const { ids } = useWishlist()
  const toggle = useWishlistToggle()
  const wished = ids.has(product.id)
  const label = wished ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`

  if (variant === 'button') {
    return (
      <Button
        variant="outline"
        size="lg"
        onClick={() => toggle(product, wished)}
        aria-pressed={wished}
        aria-label={label}
      >
        <motion.span animate={wished ? { scale: [1, 1.35, 1] } : { scale: 1 }} transition={{ duration: 0.32 }} className="grid place-items-center">
          <Heart className={cn('h-5 w-5 transition-colors', wished && 'fill-danger text-danger')} aria-hidden />
        </motion.span>
        <span className="hidden sm:inline">{wished ? 'Saved' : 'Save'}</span>
      </Button>
    )
  }

  return (
    <button
      type="button"
      onClick={() => toggle(product, wished)}
      aria-pressed={wished}
      aria-label={label}
      className={cn(
        'grid h-9 w-9 place-items-center rounded-full border border-border bg-surface/90 shadow-soft backdrop-blur transition motion-safe:hover:scale-110 motion-safe:active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
        className,
      )}
    >
      <motion.span animate={wished ? { scale: [1, 1.4, 1] } : { scale: 1 }} transition={{ duration: 0.32 }} className="grid place-items-center">
        <Heart className={cn('h-4 w-4 transition-colors', wished && 'fill-danger text-danger')} aria-hidden />
      </motion.span>
    </button>
  )
}