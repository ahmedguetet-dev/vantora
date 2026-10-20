import { useEffect } from 'react'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useGuestCartStore } from '@/stores/guestCartStore'
import type { Cart } from '@/types/cart'
import { cartApi } from '../api'

export const CART_SERVER_KEY = ['cart', 'server'] as const

export const EMPTY_CART: Cart = {
  items: [],
  totals: {
    item_count: 0,
    subtotal_cents: 0,
    shipping_cents: 0,
    tax_cents: 0,
    discount_cents: 0,
    total_cents: 0,
    free_shipping_remaining_cents: 0,
  },
}

/** One cart for the UI: server cart when signed in, server-priced preview of the local cart for guests. */
export function useCart() {
  const { user, isLoading: authLoading } = useAuth()
  const guestItems = useGuestCartStore((s) => s.items)
  const hasGuestItems = guestItems.length > 0

  const query = useQuery({
    queryKey: user ? CART_SERVER_KEY : ['cart', 'guest', guestItems],
    queryFn: () => (user ? cartApi.get() : cartApi.preview(guestItems)),
    enabled: !authLoading && (Boolean(user) || hasGuestItems),
    placeholderData: keepPreviousData,
  })

  // Drop guest lines the server no longer knows about (deleted / inactive products).
  useEffect(() => {
    if (user || !query.data || query.isPlaceholderData) return
    const valid = new Set(query.data.items.map((i) => i.product_id))
    const { items, remove } = useGuestCartStore.getState()
    items.filter((i) => !valid.has(i.product_id)).forEach((i) => remove(i.product_id))
  }, [user, query.data, query.isPlaceholderData])

  const hasCart = Boolean(user) || hasGuestItems

  return {
    cart: hasCart ? (query.data ?? EMPTY_CART) : EMPTY_CART,
    isLoading: authLoading || query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    refetch: query.refetch,
  }
}