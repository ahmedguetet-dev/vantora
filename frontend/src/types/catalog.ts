export type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock'

export interface ProductCardData {
  id: number
  name: string
  slug: string
  brand: string | null
  price_cents: number
  compare_at_cents: number | null
  discount_percent: number | null
  rating_avg: number
  rating_count: number
  is_featured: boolean
  image: string | null
  hover_image: string | null
  category?: { name: string; slug: string }
  stock_status: StockStatus
  stock_left: number | null
}

export interface ProductDetailData extends ProductCardData {
  description: string
  sku: string
  images: { url: string; alt: string | null }[]
  category: { id: number; name: string; slug: string }
}

export interface Category {
  id: number
  name: string
  slug: string
  description: string | null
  image: string | null
  products_count?: number
}

export interface Facets {
  brands: { name: string; count: number }[]
  price: { min: number; max: number }
}

export interface HomeData {
  featured: ProductCardData[]
  new_arrivals: ProductCardData[]
  deals: ProductCardData[]
  categories: Category[]
}

export type SortKey = 'newest' | 'popular' | 'rating' | 'price_asc' | 'price_desc'

export interface CatalogFilters {
  search: string
  category: string
  brands: string[]
  /** Dollars (UI units). Converted to cents when calling the API. */
  minPrice: number | null
  maxPrice: number | null
  inStock: boolean
  onSale: boolean
  sort: SortKey
  page: number
}