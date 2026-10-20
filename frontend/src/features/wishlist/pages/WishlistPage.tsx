import { Heart } from 'lucide-react'
import { Link } from 'react-router-dom'
import { buttonVariants } from '@/components/ui/buttonVariants'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { ProductGrid, ProductGridSkeleton } from '@/features/catalog/components/ProductGrid'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useWishlist } from '../hooks/useWishlist'

export function WishlistPage() {
  useDocumentTitle('Wishlist')
  const { products, isLoading, isError, refetch } = useWishlist()

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <p className="text-sm font-medium text-accent">Saved for later</p>
      <h1 className="mt-1 text-3xl sm:text-4xl">Your wishlist</h1>
      {!isLoading && !isError && products.length > 0 && (
        <p className="mt-2 text-sm text-muted">
          {products.length} saved {products.length === 1 ? 'item' : 'items'}
        </p>
      )}

      <div className="mt-8">
        {isLoading ? (
          <ProductGridSkeleton count={4} />
        ) : isError ? (
          <ErrorState onRetry={() => refetch()} />
        ) : products.length === 0 ? (
          <EmptyState
            icon={Heart}
            title="Nothing saved yet"
            description="Tap the heart on any product to keep it here for later."
            action={
              <Link to="/products" className={buttonVariants({ size: 'lg' })}>
                Discover products
              </Link>
            }
          />
        ) : (
          <ProductGrid products={products} />
        )}
      </div>
    </div>
  )
}
