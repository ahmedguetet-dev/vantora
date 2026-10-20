import { api } from '@/lib/api'
import type { GuestCartItem } from '@/stores/guestCartStore'
import type { Cart } from '@/types/cart'

export interface CartResponse {
  data: Cart
  message?: string
  notice?: string
}

export const cartApi = {
  async get(): Promise<Cart> {
    return (await api.get<CartResponse>('/cart')).data.data
  },

  async preview(items: GuestCartItem[]): Promise<Cart> {
    const encoded = items.map((i) => `${i.product_id}:${i.quantity}`).join(',')
    return (await api.get<CartResponse>('/cart/preview', { params: { items: encoded } })).data.data
  },

  async add(productId: number, quantity: number): Promise<CartResponse> {
    return (await api.post<CartResponse>('/cart/items', { product_id: productId, quantity })).data
  },

  async setQuantity(productId: number, quantity: number): Promise<CartResponse> {
    return (await api.put<CartResponse>(`/cart/items/${productId}`, { quantity })).data
  },

  async remove(productId: number): Promise<CartResponse> {
    return (await api.delete<CartResponse>(`/cart/items/${productId}`)).data
  },

  async merge(items: GuestCartItem[]): Promise<Cart> {
    return (await api.post<CartResponse>('/cart/merge', { items })).data.data
  },
}