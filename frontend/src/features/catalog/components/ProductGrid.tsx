import { Reveal } from '@/components/motion/Reveal'
import { Skeleton } from '@/components/ui/Skeleton'
import { cn } from '@/lib/utils'
import type { ProductCardData } from '@/types/catalog'
import { ProductCard } from './ProductCard'

const gridClass = 'grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 xl:grid-cols-4'

export function ProductGrid({ products, className }: { products: ProductCardData[]; className?: string }) {
  return (
    <div className={cn(gridClass, className)}>
      {products.map((product, i) => (
        <Reveal key={product.id} delay={Math.min(i % 4, 3) * 0.06} y={14}>
          <ProductCard product={product} />
        </Reveal>
      ))}
    </div>
  )
}

export function ProductGridSkeleton({ count = 8, className }: { count?: number; className?: string }) {
  return (
    <div className={cn(gridClass, className)} aria-busy aria-label="Loading products">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="overflow-hidden rounded-2xl border border-border bg-surface">
          <Skeleton className="aspect-square rounded-none" />
          <div className="space-y-2.5 p-4">
            <Skeleton className="h-3 w-1/3" />
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-5 w-1/4" />
          </div>
        </div>
      ))}
    </div>
  )
}