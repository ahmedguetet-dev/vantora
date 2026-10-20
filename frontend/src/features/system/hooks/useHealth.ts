import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { ApiEnvelope } from '@/types/api'

export interface Health {
  status: 'ok' | 'degraded'
  app: string
  environment: string
  database: 'up' | 'down'
  time: string
}

export function useHealth() {
  return useQuery({
    queryKey: ['health'],
    queryFn: async () => (await api.get<ApiEnvelope<Health>>('/health')).data.data,
    retry: false,
  })
}