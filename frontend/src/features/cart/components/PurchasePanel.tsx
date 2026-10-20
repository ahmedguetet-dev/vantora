import { useState } from 'react'
import { Check, ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { QuantityStepper } from '@/components/ui/QuantityStepper'
import { WishlistButton } from '@/features/wishlist/components/WishlistButton'
import type { ProductDetailData } from '@/types/catalog'
import { useCartActions } from '../hooks/useCartActions'

export function PurchasePanel({ product }: { product: ProductDetailData }) {
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)
  const { add } = useCartActions()
  const soldOut = product.stock_status === 'out_of_stock'
  const max = Math.min(10, product.stock_left ?? 10)

  return (
    <div className="space-y-4">
      {!soldOut && (
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium">Quantity</span>
          <QuantityStepper value={Math.min(quantity, max)} max={max} onChange={setQuantity} />
        </div>
      )}

      <div className="flex gap-3">
        <Button
          size="lg"
          className="flex-1"
          disabled={soldOut}
          loading={add.isPending}
          onClick={() =>
            add.mutate(
              { product, quantity: Math.min(quantity, max) },
              {
                onSuccess: () => {
                  setAdded(true)
                  window.setTimeout(() => setAdded(false), 1500)
                },
              },
            )
          }
        >
          {added ? <Check className="h-5 w-5" aria-hidden /> : <ShoppingBag className="h-5 w-5" aria-hidden />}
          {soldOut ? 'Out of stock' : added ? 'Added to cart' : 'Add to cart'}
        </Button>
        <WishlistButton product={product} variant="button" />
      </div>
    </div>
  )
}