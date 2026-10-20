import { api } from '@/lib/api'
import type { ApiEnvelope, Paginated } from '@/types/api'
import type {
  CatalogFilters,
  Category,
  Facets,
  HomeData,
  ProductCardData,
  ProductDetailData,
} from '@/types/catalog'
import { PAGE_SIZE } from './constants'

export const catalogApi = {
  async home(): Promise<HomeData> {
    return (await api.get<ApiEnvelope<HomeData>>('/home')).data.data
  },

  async categories(): Promise<Category[]> {
    return (await api.get<{ data: Category[] }>('/categories')).data.data
  },

  async facets(): Promise<Facets> {
    return (await api.get<ApiEnvelope<Facets>>('/catalog/facets')).data.data
  },

  async products(filters: CatalogFilters): Promise<Paginated<ProductCardData>> {
    const params: Record<string, unknown> = {
      page: filters.page,
      per_page: PAGE_SIZE,
      sort: filters.sort,
    }
    if (filters.search) params.search = filters.search
    if (filters.category) params.category = filters.category
    if (filters.brands.length) params.brand = filters.brands
    if (filters.minPrice !== null) params.min_price = Math.round(filters.minPrice * 100)
    if (filters.maxPrice !== null) params.max_price = Math.round(filters.maxPrice * 100)
    if (filters.inStock) params.in_stock = 1
    if (filters.onSale) params.on_sale = 1

    return (await api.get<Paginated<ProductCardData>>('/products', { params })).data
  },

  async product(slug: string): Promise<ProductDetailData> {
    return (await api.get<ApiEnvelope<ProductDetailData>>(`/products/${slug}`)).data.data
  },

  async related(slug: string): Promise<ProductCardData[]> {
    return (await api.get<{ data: ProductCardData[] }>(`/products/${slug}/related`)).data.data
  },
}