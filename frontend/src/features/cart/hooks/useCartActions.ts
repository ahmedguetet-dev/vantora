import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { ApiError } from '@/lib/api'
import { useCartUiStore } from '@/stores/cartUiStore'
import { useGuestCartStore } from '@/stores/guestCartStore'
import type { ProductCardData } from '@/types/catalog'
import { cartApi, type CartResponse } from '../api'
import { CART_SERVER_KEY } from './useCart'

const errorMessage = (error: unknown, fallback: string) =>
  error instanceof ApiError ? (error.errors?.product_id?.[0] ?? error.message) : fallback

export function useCartActions() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const openCart = useCartUiStore((s) => s.openCart)

  const applyServer = (response: CartResponse) => {
    queryClient.setQueryData(CART_SERVER_KEY, response.data)
    if (response.notice) toast.warning(response.notice)
  }

  const add = useMutation({
    mutationFn: async ({ product, quantity }: { product: ProductCardData; quantity: number }) => {
      if (user) applyServer(await cartApi.add(product.id, quantity))
      else useGuestCartStore.getState().add(product.id, quantity)
    },
    onSuccess: (_data, { product }) =>
      toast.success(`${product.name} added to your cart`, {
        action: { label: 'View cart', onClick: () => openCart() },
      }),
    onError: (error) => toast.error(errorMessage(error, 'Could not add this item to your cart.')),
  })

  const setQuantity = useMutation({
    mutationFn: async ({ productId, quantity }: { productId: number; quantity: number }) => {
      if (user) applyServer(await cartApi.setQuantity(productId, quantity))
      else useGuestCartStore.getState().setQuantity(productId, quantity)
    },
    onError: (error) => toast.error(errorMessage(error, 'Could not update the quantity.')),
  })

  const remove = useMutation({
    mutationFn: async (productId: number) => {
      if (user) applyServer(await cartApi.remove(productId))
      else useGuestCartStore.getState().remove(productId)
    },
    onError: (error) => toast.error(errorMessage(error, 'Could not remove this item.')),
  })

  return { add, setQuantity, remove }
}