import { AnimatePresence } from 'framer-motion'
import { ShoppingBag } from 'lucide-react'
import { Link } from 'react-router-dom'
import { buttonVariants } from '@/components/ui/buttonVariants'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { Skeleton } from '@/components/ui/Skeleton'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { CartLineItem } from '../components/CartLineItem'
import { CartSummary } from '../components/CartSummary'
import { useCart } from '../hooks/useCart'
import { useCartActions } from '../hooks/useCartActions'

export function CartPage() {
  useDocumentTitle('Your cart')
  const { user } = useAuth()
  const { cart, isLoading, isError, refetch } = useCart()
  const { setQuantity, remove } = useCartActions()
  const busy = setQuantity.isPending || remove.isPending

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <h1 className="text-3xl sm:text-4xl">Your cart</h1>
      {!isLoading && !isError && cart.items.length > 0 && (
        <p className="mt-2 text-sm text-muted">
          {cart.totals.item_count} {cart.totals.item_count === 1 ? 'item' : 'items'}
        </p>
      )}

      <div className="mt-8">
        {isLoading ? (
          <div className="grid gap-8 lg:grid-cols-[1fr_22rem]">
            <div className="space-y-4">
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} className="h-28 w-full" />
              ))}
            </div>
            <Skeleton className="h-72 w-full" />
          </div>
        ) : isError ? (
          <ErrorState onRetry={() => refetch()} />
        ) : cart.items.length === 0 ? (
          <EmptyState
            icon={ShoppingBag}
            title="Your cart is empty"
            description="Looks like you have not added anything yet. Browse the collection and find something you love."
            action={
              <Link to="/products" className={buttonVariants({ size: 'lg' })}>
                Start shopping
              </Link>
            }
          />
        ) : (
          <div className="grid items-start gap-8 lg:grid-cols-[1fr_22rem]">
            <section aria-label="Cart items" className="rounded-2xl border border-border bg-surface px-5 shadow-soft">
              <ul className="divide-y divide-border">
                <AnimatePresence initial={false}>
                  {cart.items.map((line) => (
                    <CartLineItem
                      key={line.product_id}
                      line={line}
                      busy={busy}
                      onQuantityChange={(quantity) => setQuantity.mutate({ productId: line.product_id, quantity })}
                      onRemove={() => remove.mutate(line.product_id)}
                    />
                  ))}
                </AnimatePresence>
              </ul>
            </section>

            <aside className="rounded-2xl border border-border bg-surface p-6 shadow-soft lg:sticky lg:top-24">
              <h2 className="mb-5 font-sans text-lg font-semibold tracking-normal">Order summary</h2>

              <CartSummary totals={cart.totals} />

              {user ? (
                <Link to="/checkout" className={`${buttonVariants({ size: 'lg' })} mt-5 w-full`}>
                  Proceed to checkout
                </Link>
              ) : (
                <p className="mt-5 rounded-xl bg-surface-muted p-3.5 text-sm text-muted">
                  <Link to="/login" state={{ from: '/cart' }} className="font-medium text-accent hover:underline">
                    Sign in
                  </Link>{' '}
                  to check out and keep this cart on all your devices.
                </p>
              )}

              <Link to="/products" className={`${buttonVariants({ variant: 'outline', size: 'lg' })} mt-3 w-full`}>
                Continue shopping
              </Link>
            </aside>
          </div>
        )}
      </div>
    </div>
  )
}
