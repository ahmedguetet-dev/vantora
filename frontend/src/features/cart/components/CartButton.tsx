import { motion } from 'framer-motion'
import { ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useCartUiStore } from '@/stores/cartUiStore'
import { useGuestCartStore } from '@/stores/guestCartStore'
import { useCart } from '../hooks/useCart'

export function CartButton() {
  const { user } = useAuth()
  const { cart } = useCart()
  const guestCount = useGuestCartStore((s) => s.items.reduce((sum, i) => sum + i.quantity, 0))
  const openCart = useCartUiStore((s) => s.openCart)

  const count = user ? cart.totals.item_count : guestCount

  return (
    <Button
      variant="ghost"
      size="icon"
      className="relative"
      onClick={openCart}
      aria-label={`Open cart, ${count} ${count === 1 ? 'item' : 'items'}`}
    >
      <ShoppingBag className="h-5 w-5" />
      {count > 0 && (
        <motion.span
          key={count}
          aria-hidden
          initial={{ scale: 0.5 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 500, damping: 18 }}
          className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-accent px-1 text-[11px] font-semibold text-accent-foreground"
        >
          {count > 99 ? '99+' : count}
        </motion.span>
      )}
    </Button>
  )
}