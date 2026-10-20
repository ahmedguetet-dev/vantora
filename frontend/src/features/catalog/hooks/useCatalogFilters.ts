import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import type { CatalogFilters, SortKey } from '@/types/catalog'
import { SORT_OPTIONS } from '../constants'

const SORT_KEYS = SORT_OPTIONS.map((o) => o.value)

const toNumber = (value: string | null) => {
  if (value === null || value === '') return null
  const n = Number(value)
  return Number.isFinite(n) && n >= 0 ? n : null
}

function toSearchParams(f: CatalogFilters) {
  const q = new URLSearchParams()
  if (f.search) q.set('search', f.search)
  if (f.category) q.set('category', f.category)
  f.brands.forEach((b) => q.append('brand', b))
  if (f.minPrice !== null) q.set('min', String(f.minPrice))
  if (f.maxPrice !== null) q.set('max', String(f.maxPrice))
  if (f.inStock) q.set('in_stock', '1')
  if (f.onSale) q.set('on_sale', '1')
  if (f.sort !== 'newest') q.set('sort', f.sort)
  if (f.page > 1) q.set('page', String(f.page))
  return q
}

/** Catalog filters live in the URL, so every view is shareable and back-button friendly. */
export function useCatalogFilters() {
  const [params, setParams] = useSearchParams()

  const filters = useMemo<CatalogFilters>(() => {
    const sort = params.get('sort') as SortKey | null
    return {
      search: params.get('search') ?? '',
      category: params.get('category') ?? '',
      brands: params.getAll('brand'),
      minPrice: toNumber(params.get('min')),
      maxPrice: toNumber(params.get('max')),
      inStock: params.get('in_stock') === '1',
      onSale: params.get('on_sale') === '1',
      sort: sort && SORT_KEYS.includes(sort) ? sort : 'newest',
      page: Math.max(1, Number(params.get('page')) || 1),
    }
  }, [params])

  const update = useCallback(
    (patch: Partial<CatalogFilters>) => {
      // Any change except an explicit page change returns to page 1.
      setParams(toSearchParams({ ...filters, ...patch, page: patch.page ?? 1 }))
    },
    [filters, setParams],
  )

  const clear = useCallback(
    () =>
      update({
        search: '',
        category: '',
        brands: [],
        minPrice: null,
        maxPrice: null,
        inStock: false,
        onSale: false,
      }),
    [update],
  )

  const hasActive = Boolean(
    filters.search ||
      filters.category ||
      filters.brands.length ||
      filters.minPrice !== null ||
      filters.maxPrice !== null ||
      filters.inStock ||
      filters.onSale,
  )

  return { filters, update, clear, hasActive }
}