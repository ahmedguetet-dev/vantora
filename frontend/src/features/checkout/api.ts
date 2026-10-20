import { api } from '@/lib/api'

export interface Address {
  id: number
  label: string
  full_name: string
  line1: string
  line2: string | null
  city: string
  region: string | null
  postal_code: string | null
  country: string
  phone: string
  is_default: boolean
}

export type AddressPayload = Omit<Address, 'id'> 

export interface OrderItem {
  id: number
  product_id: number
  product_name?: string
  quantity: number
  unit_price_cents: number
  total_cents: number
}

export interface Order {
id: number
number?: string
order_number?: string
status: string
payment_status: string
subtotal_cents: number
shipping_cents: number
tax_cents: number
discount_cents: number
total_cents: number
notes?: string | null
created_at: string
items: OrderItem[]
}


interface ApiEnvelope<T> {
  data: T
  message?: string
}

interface OrderListResponse {
  data: {
    data: Order[]
    current_page: number
    last_page: number
    total: number
  }
}

export const checkoutApi = {
  async addresses(): Promise<Address[]> {
    return (await api.get<ApiEnvelope<Address[]>>('/addresses')).data.data
  },

  async createAddress(payload: AddressPayload): Promise<Address> {
    return (await api.post<ApiEnvelope<Address>>('/addresses', payload)).data.data
  },

  async updateAddress(id: number, payload: Partial<AddressPayload>): Promise<Address> {
    return (await api.put<ApiEnvelope<Address>>(`/addresses/${id}`, payload)).data.data
  },

  async deleteAddress(id: number): Promise<void> {
    await api.delete(`/addresses/${id}`)
  },

  async makeDefaultAddress(id: number): Promise<Address> {
    return (await api.patch<ApiEnvelope<Address>>(`/addresses/${id}/default`)).data.data
  },

  async placeOrder(addressId: number, notes?: string): Promise<Order> {
    return (
      await api.post<ApiEnvelope<Order>>('/checkout', {
        address_id: addressId,
        notes: notes || undefined,
      })
    ).data.data
  },

  async orders(): Promise<OrderListResponse['data']> {
    return (await api.get<OrderListResponse>('/orders')).data.data
  },

  async order(id: number): Promise<Order> {
    return (await api.get<ApiEnvelope<Order>>(`/orders/${id}`)).data.data
  },
}
