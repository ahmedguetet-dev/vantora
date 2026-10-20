import type { ProductCardData } from './catalog'

export interface CartLine {
  product_id: number
  quantity: number
  max_quantity: number
  unit_price_cents: number
  line_total_cents: number
  issue: 'unavailable' | 'limited' | null
  product: ProductCardData
}

export interface CartTotals {
  item_count: number
  subtotal_cents: number
  shipping_cents: number
  tax_cents: number
  discount_cents: number
  total_cents: number
  free_shipping_remaining_cents: number
}

export interface Cart {
  items: CartLine[]
  totals: CartTotals
}