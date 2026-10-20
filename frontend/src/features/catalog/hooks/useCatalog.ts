import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { ApiError } from '@/lib/api'
import type { CatalogFilters } from '@/types/catalog'
import { catalogApi } from '../api'

export const useHome = () =>
  useQuery({ queryKey: ['home'], queryFn: catalogApi.home, staleTime: 5 * 60_000 })

export const useCategories = () =>
  useQuery({ queryKey: ['categories'], queryFn: catalogApi.categories, staleTime: 10 * 60_000 })

export const useFacets = () =>
  useQuery({ queryKey: ['facets'], queryFn: catalogApi.facets, staleTime: 10 * 60_000 })

export const useProducts = (filters: CatalogFilters) =>
  useQuery({
    queryKey: ['products', filters],
    queryFn: () => catalogApi.products(filters),
    placeholderData: keepPreviousData,
  })

export const useProduct = (slug: string) =>
  useQuery({
    queryKey: ['product', slug],
    queryFn: () => catalogApi.product(slug),
    enabled: Boolean(slug),
    retry: (count, error) => !(error instanceof ApiError && error.status === 404) && count < 1,
  })

export const useRelated = (slug: string) =>
  useQuery({
    queryKey: ['product', slug, 'related'],
    queryFn: () => catalogApi.related(slug),
    enabled: Boolean(slug),
  })