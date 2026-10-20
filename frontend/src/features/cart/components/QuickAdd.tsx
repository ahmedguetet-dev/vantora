import { useState } from 'react'
import { Check, ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import type { ProductCardData } from '@/types/catalog'
import { useCartActions } from '../hooks/useCartActions'

export function QuickAdd({ product }: { product: ProductCardData }) {
  const { add } = useCartActions()
  const [added, setAdded] = useState(false)
  const soldOut = product.stock_status === 'out_of_stock'

  const onClick = () =>
    add.mutate(
      { product, quantity: 1 },
      {
        onSuccess: () => {
          setAdded(true)
          window.setTimeout(() => setAdded(false), 1500)
        },
      },
    )

  return (
    <Button
      size="sm"
      className="w-full shadow-lift"
      disabled={soldOut}
      loading={add.isPending}
      onClick={onClick}
      aria-label={soldOut ? `${product.name} is sold out` : `Add ${product.name} to cart`}
    >
      {added ? <Check className="h-4 w-4" aria-hidden /> : <ShoppingBag className="h-4 w-4" aria-hidden />}
      {soldOut ? 'Sold out' : added ? 'Added' : 'Add to cart'}
    </Button>
  )
}
