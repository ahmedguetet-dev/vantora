import { useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import { ShoppingBag } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { buttonVariants } from '@/components/ui/buttonVariants'
import { Drawer } from '@/components/ui/Drawer'
import { Skeleton } from '@/components/ui/Skeleton'
import { useCartUiStore } from '@/stores/cartUiStore'
import { useCart } from '../hooks/useCart'
import { useCartActions } from '../hooks/useCartActions'
import { CartLineItem } from './CartLineItem'
import { CartSummary } from './CartSummary'

export function CartDrawer() {
  const open = useCartUiStore((s) => s.open)
  const closeCart = useCartUiStore((s) => s.closeCart)
  const { pathname } = useLocation()
  const { cart, isLoading } = useCart()
  const { setQuantity, remove } = useCartActions()
  const busy = setQuantity.isPending || remove.isPending

  useEffect(() => {
    closeCart()
  }, [pathname, closeCart])

  return (
    <Drawer open={open} onClose={closeCart} title="Your cart" side="right">
      {isLoading ? (
        <div className="space-y-4">
          {[0, 1].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : cart.items.length === 0 ? (
        <div className="flex h-full flex-col items-center justify-center py-16 text-center">
          <span className="grid h-14 w-14 place-items-center rounded-full bg-surface-muted text-muted">
            <ShoppingBag className="h-6 w-6" aria-hidden />
          </span>
          <p className="mt-5 font-medium">Your cart is empty</p>
          <p className="mt-1 text-sm text-muted">Add something you love and it will show up here.</p>
          <Link to="/products" onClick={closeCart} className={`${buttonVariants()} mt-6`}>
            Start shopping
          </Link>
        </div>
      ) : (
        <>
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
          <div className="mt-4 border-t border-border pt-5">
            <CartSummary totals={cart.totals} />
            <Link to="/cart" onClick={closeCart} className={`${buttonVariants({ variant: 'outline', size: 'lg' })} mt-5 w-full`}>
              View full cart
            </Link>
          </div>
        </>
      )}
    </Drawer>
  )
}
