import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { authApi, type LoginPayload, type RegisterPayload } from '../api'

export const ME_KEY = ['me'] as const

export function useAuth() {
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ME_KEY,
    queryFn: authApi.me,
    staleTime: Infinity,
    retry: false,
  })

  const login = useMutation({
    mutationFn: (payload: LoginPayload) => authApi.login(payload),
    onSuccess: (user) => queryClient.setQueryData(ME_KEY, user),
  })

  const register = useMutation({
    mutationFn: (payload: RegisterPayload) => authApi.register(payload),
    onSuccess: (user) => queryClient.setQueryData(ME_KEY, user),
  })

  const logout = useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      queryClient.removeQueries({ predicate: (q) => q.queryKey[0] !== 'me' })
      queryClient.setQueryData(ME_KEY, null)
      toast.success('You have been signed out.')
    },
    onError: () => toast.error('Could not sign out. Please try again.'),
  })

  const user = data ?? null

  return {
    user,
    isLoading,
    isAuthenticated: user !== null,
    isStaff: user?.is_staff ?? false,
    login,
    register,
    logout,
  }
}