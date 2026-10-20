export type UserRole = 'customer' | 'manager' | 'admin'

export interface User {
  id: number
  name: string
  email: string
  phone: string | null
  avatar: string | null
  role: UserRole
  is_staff: boolean
  created_at: string
}