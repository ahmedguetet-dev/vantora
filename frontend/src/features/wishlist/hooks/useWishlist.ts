import { useMemo } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useAuth } from '@/features/auth/hooks/useAuth'
import type { ProductCardData } from '@/types/catalog'
import { wishlistApi } from '../api'

export const WISHLIST_KEY = ['wishlist'] as const

export function useWishlist() {
  const { user, isLoading: authLoading } = useAuth()

  const query = useQuery({
    queryKey: WISHLIST_KEY,
    queryFn: wishlistApi.list,
    enabled: !authLoading && Boolean(user),
  })

  const products = useMemo(() => query.data ?? [], [query.data])
  const ids = useMemo(() => new Set(products.map((p) => p.id)), [products])

  return {
    products,
    ids,
    isLoading: authLoading || query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  }
}

/** Optimistic wishlist toggle. Guests are invited to sign in instead. */
export function useWishlistToggle() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const location = useLocation()

  const mutation = useMutation({
    mutationFn: ({ product, wished }: { product: ProductCardData; wished: boolean }) =>
      wished ? wishlistApi.remove(product.id) : wishlistApi.add(product.id),

    onMutate: async ({ product, wished }) => {
      await queryClient.cancelQueries({ queryKey: WISHLIST_KEY })
      const previous = queryClient.getQueryData<ProductCardData[]>(WISHLIST_KEY)

      queryClient.setQueryData<ProductCardData[]>(WISHLIST_KEY, (old = []) =>
        wished ? old.filter((p) => p.id !== product.id) : [product, ...old.filter((p) => p.id !== product.id)],
      )

      return { previous }
    },

    onSuccess: (_data, { product, wished }) =>
      toast.success(wished ? `Removed ${product.name} from your wishlist` : `Saved ${product.name} to your wishlist`),

    onError: (_error, _vars, context) => {
      queryClient.setQueryData(WISHLIST_KEY, context?.previous)
      toast.error('Could not update your wishlist. Please try again.')
    },

    onSettled: () => queryClient.invalidateQueries({ queryKey: WISHLIST_KEY }),
  })

  return (product: ProductCardData, wished: boolean) => {
    if (!user) {
      toast('Sign in to save your favourites', {
        action: {
          label: 'Sign in',
          onClick: () => navigate('/login', { state: { from: location.pathname + location.search } }),
        },
      })
      return
    }
    mutation.mutate({ product, wished })
  }
}