import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/Badge'
import { SmartImage } from '@/components/ui/SmartImage'
import { QuickAdd } from '@/features/cart/components/QuickAdd'
import { WishlistButton } from '@/features/wishlist/components/WishlistButton'
import { cn } from '@/lib/utils'
import type { ProductCardData } from '@/types/catalog'
import { Price } from './Price'
import { Rating } from './Rating'

export function ProductCard({ product }: { product: ProductCardData }) {
  const soldOut = product.stock_status === 'out_of_stock'

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-soft transition-all duration-300 hover:border-accent/30 hover:shadow-lift focus-within:ring-2 focus-within:ring-accent motion-safe:hover:-translate-y-1">
      <div className="relative aspect-square overflow-hidden">
        <div
          className={cn(
            'absolute inset-0 transition-transform duration-700 ease-out motion-safe:group-hover:scale-105',
            soldOut && 'opacity-60',
          )}
        >
          <SmartImage src={product.image} alt={product.name} className="h-full w-full" />
          {product.hover_image && (
            <img
              src={product.hover_image}
              alt=""
              aria-hidden
              loading="lazy"
              decoding="async"
              onError={(e) => {
                e.currentTarget.style.display = 'none'
              }}
              className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            />
          )}
        </div>

        <div className="absolute left-3 top-3 flex flex-col items-start gap-1.5">
          {product.discount_percent && <Badge variant="danger">-{product.discount_percent}%</Badge>}
          {soldOut && <Badge>Sold out</Badge>}
          {product.stock_status === 'low_stock' && <Badge variant="warning">Only {product.stock_left} left</Badge>}
        </div>

        <WishlistButton product={product} className="absolute right-3 top-3 z-10" />

        <div className="absolute inset-x-3 bottom-3 z-10 transition-all duration-300 sm:translate-y-2 sm:opacity-0 sm:group-focus-within:translate-y-0 sm:group-focus-within:opacity-100 sm:group-hover:translate-y-0 sm:group-hover:opacity-100">
          <QuickAdd product={product} />
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <p className="text-xs uppercase tracking-wide text-muted">{product.brand ?? product.category?.name}</p>
        <h3 className="font-sans text-sm font-medium leading-snug tracking-normal transition-colors group-hover:text-accent sm:text-base">
          <Link
            to={`/products/${product.slug}`}
            className="line-clamp-2 after:absolute after:inset-0 after:content-[''] focus-visible:outline-none"
          >
            {product.name}
          </Link>
        </h3>
        <Rating value={product.rating_avg} count={product.rating_count} />
        <div className="mt-auto pt-2">
          <Price cents={product.price_cents} compareAt={product.compare_at_cents} />
        </div>
      </div>
    </article>
  )
}