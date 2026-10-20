export interface ApiEnvelope<T> {
  data: T
  message?: string
}

export interface PaginationMeta {
  current_page: number
  last_page: number
  per_page: number
  total: number
}

export interface Paginated<T> {
  data: T[]
  meta: PaginationMeta
  links: { first: string | null; last: string | null; prev: string | null; next: string | null }
}