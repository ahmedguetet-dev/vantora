import { api } from '@/lib/api'
import type { ApiEnvelope } from '@/types/api'

export interface LaravelPage<T> {
  data: T[]
  current_page: number
  last_page: number
  total: number
}

export interface AdminCategory {
  id: number
  parent_id: number | null
  name: string
  slug: string
  description: string | null
  image: string | null
  sort_order: number
  is_active: boolean
  products_count?: number
  parent?: { id: number; name: string } | null
}

export interface AdminProduct {
  id: number
  category_id: number
  name: string
  slug: string
  sku: string
  description: string
  price_cents: number
  compare_at_cents: number | null
  stock: number
  low_stock_threshold: number
  brand: string | null
  is_active: boolean
  is_featured: boolean
  category?: { id: number; name: string }
  images?: { id: number; url: string; alt: string | null }[]
}

export interface ProductPayload {
  category_id: number
  name: string
  sku: string
  description: string
  price_cents: number
  compare_at_cents: number | null
  stock?: number
  low_stock_threshold: number
  brand: string | null
  is_active: boolean
  is_featured: boolean
  images: { url: string }[]
}

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'

export interface AdminOrder {
  id: number
  number: string
  status: OrderStatus
  payment_status: 'unpaid' | 'paid' | 'refunded'
  payment_method: string
  total_cents: number
  subtotal_cents: number
  shipping_cents: number
  tax_cents: number
  discount_cents: number
  notes: string | null
  created_at: string
  items_count?: number
  shipping_address?: Record<string, string | null>
  user?: { id: number; name: string; email: string; phone?: string | null }
  items?: { id: number; name: string; sku: string; quantity: number; unit_price_cents: number; line_total_cents: number }[]
  histories?: { id: number; from_status: string | null; to_status: string; note: string | null; created_at: string; changed_by?: { name: string } | null }[]
}

export interface AdminCustomer {
  id: number
  name: string
  email: string
  phone: string | null
  created_at: string
  orders_count: number
  total_spent_cents: number | null
  last_order_at: string | null
}

type Params = Record<string, string | number | undefined>
const clean = (p: Params) => Object.fromEntries(Object.entries(p).filter(([, v]) => v !== undefined && v !== ''))

export const adminApi = {
  products: async (p: Params) =>
    (await api.get<ApiEnvelope<LaravelPage<AdminProduct>>>('/admin/products', { params: clean(p) })).data.data,
  createProduct: async (b: ProductPayload) => (await api.post<ApiEnvelope<AdminProduct>>('/admin/products', b)).data.data,
  updateProduct: async (id: number, b: Partial<ProductPayload>) =>
    (await api.put<ApiEnvelope<AdminProduct>>(`/admin/products/${id}`, b)).data.data,
  setProductActive: async (id: number, is_active: boolean) =>
    (await api.patch<ApiEnvelope<AdminProduct>>(`/admin/products/${id}/active`, { is_active })).data.data,
  adjustStock: async (id: number, delta: number, reason: string) =>
    (await api.post<ApiEnvelope<AdminProduct>>(`/admin/products/${id}/stock`, { delta, reason })).data.data,

  categories: async (p: Params = {}) =>
    (await api.get<ApiEnvelope<AdminCategory[]>>('/admin/categories', { params: clean(p) })).data.data,
  saveCategory: async (id: number | null, b: Partial<AdminCategory>) =>
    (id
      ? await api.put<ApiEnvelope<AdminCategory>>(`/admin/categories/${id}`, b)
      : await api.post<ApiEnvelope<AdminCategory>>('/admin/categories', b)
    ).data.data,
  setCategoryActive: async (id: number, is_active: boolean) =>
    (await api.patch<ApiEnvelope<AdminCategory>>(`/admin/categories/${id}/active`, { is_active })).data.data,

  orders: async (p: Params) =>
    (await api.get<ApiEnvelope<LaravelPage<AdminOrder>>>('/admin/orders', { params: clean(p) })).data.data,
  order: async (id: number) =>
    (await api.get<{ data: AdminOrder; meta: { allowed_transitions: OrderStatus[] } }>(`/admin/orders/${id}`)).data,
  updateOrderStatus: async (id: number, status: OrderStatus, note?: string) =>
    (await api.patch(`/admin/orders/${id}/status`, { status, note: note || undefined })).data,

  customers: async (p: Params) =>
    (await api.get<ApiEnvelope<LaravelPage<AdminCustomer>>>('/admin/customers', { params: clean(p) })).data.data,
  customer: async (id: number) =>
    (await api.get<ApiEnvelope<AdminCustomer & { orders: AdminOrder[] }>>(`/admin/customers/${id}`)).data.data,
}
