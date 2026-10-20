import { Check, ChevronRight, PackageSearch, RotateCcw, ShieldCheck, Truck } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { Badge } from '@/components/ui/Badge'
import { buttonVariants } from '@/components/ui/buttonVariants'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { Reveal } from '@/components/motion/Reveal'
import { Skeleton } from '@/components/ui/Skeleton'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { ApiError } from '@/lib/api'
import { cn } from '@/lib/utils'
import { Price } from '../components/Price'
import { ProductGallery } from '../components/ProductGallery'
import { ProductGrid, ProductGridSkeleton } from '../components/ProductGrid'
import { Rating } from '../components/Rating'
import { PurchasePanel } from '@/features/cart/components/PurchasePanel'
import { useProduct, useRelated } from '../hooks/useCatalog'

function StockLine({ status, left }: { status: string; left: number | null }) {
  const config =
    status === 'out_of_stock'
      ? { dot: 'bg-danger', text: 'Out of stock' }
      : status === 'low_stock'
        ? { dot: 'bg-warning', text: `Only ${left} left, order soon` }
        : { dot: 'bg-success', text: 'In stock, ready to ship' }

  return (
    <p className="flex items-center gap-2 text-sm font-medium">
      <span className={cn('h-2 w-2 rounded-full', config.dot)} aria-hidden />
      {config.text}
    </p>
  )
}

function ProductSkeleton() {
  return (
    <div className="grid gap-10 lg:grid-cols-2" aria-busy aria-label="Loading product">
      <Skeleton className="aspect-square rounded-2xl" />
      <div className="space-y-4">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-9 w-32" />
        <Skeleton className="h-24 w-full" />
      </div>
    </div>
  )
}

export function ProductPage() {
  const { slug = '' } = useParams()
  const { data: product, isLoading, isError, error, refetch } = useProduct(slug)
  const { data: related, isLoading: relatedLoading } = useRelated(slug)
  useDocumentTitle(product?.name)

  const notFound = error instanceof ApiError && error.status === 404

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {isLoading ? (
        <ProductSkeleton />
      ) : notFound ? (
        <EmptyState
          icon={PackageSearch}
          title="We could not find that product"
          description="It may have been removed or the link is out of date."
          action={
            <Link to="/products" className={buttonVariants()}>
              Browse all products
            </Link>
          }
        />
      ) : isError || !product ? (
        <ErrorState onRetry={() => refetch()} />
      ) : (
        <>
          <nav aria-label="Breadcrumb" className="mb-6 text-sm text-muted">
            <ol className="flex flex-wrap items-center gap-1.5">
              <li>
                <Link to="/" className="transition-colors hover:text-foreground">
                  Home
                </Link>
              </li>
              <ChevronRight className="h-3.5 w-3.5" aria-hidden />
              <li>
                <Link to="/products" className="hover:text-foreground">
                  Shop
                </Link>
              </li>
              <ChevronRight className="h-3.5 w-3.5" aria-hidden />
              <li>
                <Link to={`/products?category=${product.category.slug}`} className="hover:text-foreground">
                  {product.category.name}
                </Link>
              </li>
              <ChevronRight className="h-3.5 w-3.5" aria-hidden />
              <li aria-current="page" className="line-clamp-1 text-foreground">
                {product.name}
              </li>
            </ol>
          </nav>

          <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
            <div className="lg:sticky lg:top-24 lg:self-start">
              <ProductGallery images={product.images} name={product.name} />
            </div>

            <div>
              <div className="flex items-center gap-2">
                {product.brand && <p className="text-sm uppercase tracking-wide text-muted">{product.brand}</p>}
                {product.discount_percent && <Badge variant="danger">-{product.discount_percent}%</Badge>}
              </div>
              <h1 className="mt-2 text-3xl leading-tight sm:text-4xl">{product.name}</h1>

              <div className="mt-4">
                <Rating value={product.rating_avg} count={product.rating_count} />
              </div>

              <div className="mt-6">
                <Price cents={product.price_cents} compareAt={product.compare_at_cents} size="lg" />
              </div>

              <div className="mt-4">
                <StockLine status={product.stock_status} left={product.stock_left} />
              </div>

              <div className="mt-6">
                <PurchasePanel product={product} />
              </div>

              <p className="mt-6 leading-relaxed text-muted">{product.description}</p>

              <ul className="mt-8 space-y-3 rounded-2xl border border-border bg-surface p-5 text-sm shadow-soft">
                <li className="flex items-center gap-3">
                  <Truck className="h-5 w-5 text-accent" aria-hidden /> Free shipping on qualifying orders
                </li>
                <li className="flex items-center gap-3">
                  <RotateCcw className="h-5 w-5 text-accent" aria-hidden /> 30-day easy returns
                </li>
                <li className="flex items-center gap-3">
                  <ShieldCheck className="h-5 w-5 text-accent" aria-hidden /> 2-year warranty included
                </li>
              </ul>

              <dl className="mt-8 divide-y divide-border border-y border-border text-sm">
                {[
                  ['Brand', product.brand ?? '-'],
                  ['Category', product.category.name],
                  ['SKU', product.sku],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between py-3">
                    <dt className="text-muted">{label}</dt>
                    <dd className="flex items-center gap-1.5 font-medium">
                      {label === 'SKU' && <Check className="h-4 w-4 text-success" aria-hidden />}
                      {value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>

          <Reveal className="mt-20">
          <section aria-labelledby="related-title">
            <h2 id="related-title" className="mb-6 text-2xl sm:text-3xl">
              You may also like
            </h2>
            {relatedLoading ? (
              <ProductGridSkeleton count={4} />
            ) : related && related.length > 0 ? (
              <ProductGrid products={related} />
            ) : null}
          </section>
          </Reveal>
        </>
      )}
    </div>
  )
}
