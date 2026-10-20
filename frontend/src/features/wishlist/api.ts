import { api } from '@/lib/api'
import type { ProductCardData } from '@/types/catalog'

export const wishlistApi = {
  async list(): Promise<ProductCardData[]> {
    return (await api.get<{ data: ProductCardData[] }>('/wishlist')).data.data
  },

  async add(productId: number): Promise<void> {
    await api.post('/wishlist', { product_id: productId })
  },

  async remove(productId: number): Promise<void> {
    await api.delete(`/wishlist/${productId}`)
  },
}