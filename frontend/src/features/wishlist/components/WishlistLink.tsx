import { motion } from 'framer-motion'
import { Heart } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useWishlist } from '../hooks/useWishlist'

export function WishlistLink() {
  const { products } = useWishlist()
  const count = products.length

  return (
    <Link
      to="/wishlist"
      aria-label={`Wishlist${count > 0 ? `, ${count} saved` : ''}`}
      className="relative hidden h-10 w-10 place-items-center rounded-xl text-foreground transition-colors hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent sm:grid"
    >
      <Heart className="h-5 w-5" />
      {count > 0 && (
        <motion.span
          key={count}
          aria-hidden
          initial={{ scale: 0.5 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 500, damping: 18 }}
          className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-danger px-1 text-[11px] font-semibold text-white"
        >
          {count}
        </motion.span>
      )}
    </Link>
  )
}