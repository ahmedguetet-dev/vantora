
import { api, ApiError, fetchCsrfCookie } from '@/lib/api'
import type { ApiEnvelope } from '@/types/api'
import type { User } from '@/types/auth'

export interface LoginPayload {
  email: string
  password: string
  remember?: boolean
}

export interface RegisterPayload {
  name: string
  email: string
  password: string
  password_confirmation: string
}

export interface UpdateProfilePayload {
  name: string
  email: string
  phone?: string | null
}

export interface UpdatePasswordPayload {
  current_password: string
  password: string
  password_confirmation: string
}

export const authApi = {
  /** Returns null when nobody is signed in. */
  async me(): Promise<User | null> {
    try {
      return (await api.get<ApiEnvelope<User>>('/me')).data.data
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) return null
      throw error
    }
  },

  async login(payload: LoginPayload): Promise<User> {
    await fetchCsrfCookie()
    return (await api.post<ApiEnvelope<User>>('/login', payload)).data.data
  },

  async register(payload: RegisterPayload): Promise<User> {
    await fetchCsrfCookie()
    return (await api.post<ApiEnvelope<User>>('/register', payload)).data.data
  },

  async updateProfile(payload: UpdateProfilePayload): Promise<User> {
    return (await api.put<ApiEnvelope<User>>('/me', payload)).data.data
  },

  async updatePassword(payload: UpdatePasswordPayload): Promise<void> {
    await api.put('/me/password', payload)
  },

  async logout(): Promise<void> {
    await api.post('/logout')
  },
}