import { useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useGuestCartStore } from '@/stores/guestCartStore'
import { cartApi } from '../api'
import { CART_SERVER_KEY } from '../hooks/useCart'

/** When a visitor signs in, their guest cart is merged into their account cart once. */
export function CartSync() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const running = useRef(false)

  useEffect(() => {
    if (!user || running.current) return

    const items = useGuestCartStore.getState().items
    if (items.length === 0) return

    running.current = true
    cartApi
      .merge(items)
      .then((cart) => {
        queryClient.setQueryData(CART_SERVER_KEY, cart)
        useGuestCartStore.getState().clear()
        toast.success('We added the items from your guest cart.')
      })
      .catch(() => toast.error('We could not merge your guest cart. It is still saved on this device.'))
      .finally(() => {
        running.current = false
      })
  }, [user, queryClient])

  return null
}