import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface GuestCartItem {
  product_id: number
  quantity: number
}

interface GuestCartState {
  items: GuestCartItem[]
  add: (productId: number, quantity?: number) => void
  setQuantity: (productId: number, quantity: number) => void
  remove: (productId: number) => void
  clear: () => void
}

const MAX = 99

/**
 * Guests keep only {product_id, quantity}. Prices and stock always come from the
 * server (GET /cart/preview), so a stale browser can never show a wrong total.
 */
export const useGuestCartStore = create<GuestCartState>()(
  persist(
    (set) => ({
      items: [],
      add: (productId, quantity = 1) =>
        set((s) => {
          const existing = s.items.find((i) => i.product_id === productId)
          return {
            items: existing
              ? s.items.map((i) =>
                  i.product_id === productId ? { ...i, quantity: Math.min(MAX, i.quantity + quantity) } : i,
                )
              : [...s.items, { product_id: productId, quantity: Math.min(MAX, quantity) }],
          }
        }),
      setQuantity: (productId, quantity) =>
        set((s) => ({
          items:
            quantity <= 0
              ? s.items.filter((i) => i.product_id !== productId)
              : s.items.map((i) =>
                  i.product_id === productId ? { ...i, quantity: Math.min(MAX, quantity) } : i,
                ),
        })),
      remove: (productId) => set((s) => ({ items: s.items.filter((i) => i.product_id !== productId) })),
      clear: () => set({ items: [] }),
    }),
    { name: 'vantora-guest-cart' },
  ),
)