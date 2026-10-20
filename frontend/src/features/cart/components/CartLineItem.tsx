import { motion } from 'framer-motion'
import { Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { QuantityStepper } from '@/components/ui/QuantityStepper'
import { SmartImage } from '@/components/ui/SmartImage'
import { formatMoney } from '@/lib/utils'
import type { CartLine } from '@/types/cart'

export function CartLineItem({
  line,
  busy,
  onQuantityChange,
  onRemove,
}: {
  line: CartLine
  busy?: boolean
  onQuantityChange: (quantity: number) => void
  onRemove: () => void
}) {
  const { product } = line
  const unavailable = line.issue === 'unavailable'

  return (
    <motion.li
      layout
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.25 }}
      className="flex gap-4 overflow-hidden py-5"
    >
      <Link
        to={`/products/${product.slug}`}
        className="block h-24 w-24 shrink-0 overflow-hidden rounded-xl border border-border transition-shadow hover:shadow-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        aria-label={product.name}
      >
        <SmartImage src={product.image} alt="" className="h-full w-full" />
      </Link>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Link to={`/products/${product.slug}`} className="line-clamp-2 text-sm font-medium hover:underline">
              {product.name}
            </Link>
            {product.brand && <p className="text-xs text-muted">{product.brand}</p>}
          </div>
          <button
            type="button"
            onClick={onRemove}
            disabled={busy}
            aria-label={`Remove ${product.name} from cart`}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-muted transition-colors hover:bg-surface-muted hover:text-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        {unavailable && <p className="mt-1 text-xs font-medium text-danger">No longer available. Remove it to continue.</p>}
        {line.issue === 'limited' && (
          <p className="mt-1 text-xs font-medium text-warning">
            Only {line.max_quantity} available, so we adjusted the quantity.
          </p>
        )}

        <div className="mt-auto flex items-center justify-between gap-3 pt-3">
          {unavailable ? (
            <span />
          ) : (
            <QuantityStepper
              value={line.quantity}
              max={line.max_quantity}
              disabled={busy}
              onChange={onQuantityChange}
              label={`Quantity for ${product.name}`}
            />
          )}
          <p className="text-sm font-semibold tabular-nums">
            {unavailable ? '-' : formatMoney(line.line_total_cents)}
          </p>
        </div>
      </div>
    </motion.li>
  )
}