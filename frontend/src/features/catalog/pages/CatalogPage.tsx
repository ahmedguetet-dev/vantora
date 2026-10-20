import { useEffect, useState } from 'react'
import { SearchX, SlidersHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Drawer } from '@/components/ui/Drawer'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { Pagination } from '@/components/ui/Pagination'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { cn } from '@/lib/utils'
import type { SortKey } from '@/types/catalog'
import { ActiveFilters } from '../components/ActiveFilters'
import { FilterPanel } from '../components/FilterPanel'
import { ProductGrid, ProductGridSkeleton } from '../components/ProductGrid'
import { SORT_OPTIONS } from '../constants'
import { useCategories, useFacets, useProducts } from '../hooks/useCatalog'
import { useCatalogFilters } from '../hooks/useCatalogFilters'

export function CatalogPage() {
  const { filters, update, clear, hasActive } = useCatalogFilters()
  const { data, isLoading, isError, refetch, isPlaceholderData } = useProducts(filters)
  const { data: categories = [] } = useCategories()
  const { data: facets } = useFacets()
  const [filtersOpen, setFiltersOpen] = useState(false)

  const activeCategory = categories.find((c) => c.slug === filters.category)
  const title = filters.search ? `Results for "${filters.search}"` : (activeCategory?.name ?? 'All products')
  useDocumentTitle(title)

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [filters.page])

  const panel = (
    <FilterPanel
      filters={filters}
      categories={categories}
      facets={facets}
      hasActive={hasActive}
      onChange={update}
      onClear={clear}
    />
  )

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <header>
        <p className="text-sm font-medium text-accent">{filters.search ? 'Search' : 'Shop'}</p>
        <h1 className="mt-1 text-3xl sm:text-4xl">{title}</h1>
        {activeCategory?.description && !filters.search && (
          <p className="mt-2 max-w-xl text-muted">{activeCategory.description}</p>
        )}
      </header>

      {categories.length > 0 && !filters.search && (
        <nav aria-label="Categories" className="-mx-4 mt-6 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
          <ul className="flex w-max gap-2 sm:w-auto sm:flex-wrap">
            {[{ id: 0, name: 'All', slug: '' }, ...categories].map((c) => {
              const active = filters.category === c.slug
              return (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => update({ category: c.slug })}
                    aria-pressed={active}
                    className={cn(
                      'rounded-full border px-4 py-2 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent motion-safe:active:scale-95',
                      active
                        ? 'border-accent bg-accent text-accent-foreground shadow-soft'
                        : 'border-border bg-surface text-muted hover:border-accent/40 hover:text-foreground',
                    )}
                  >
                    {c.name}
                  </button>
                </li>
              )
            })}
          </ul>
        </nav>
      )}

      <div className="mt-8 grid gap-8 lg:grid-cols-[16rem_1fr]">
        <aside className="hidden lg:block" aria-label="Filters">
          <div className="sticky top-24">{panel}</div>
        </aside>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted" aria-live="polite">
              {data ? `${data.meta.total} ${data.meta.total === 1 ? 'product' : 'products'}` : 'Loading...'}
            </p>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="lg:hidden" onClick={() => setFiltersOpen(true)}>
                <SlidersHorizontal className="h-4 w-4" aria-hidden /> Filters
              </Button>
              <label className="sr-only" htmlFor="sort">
                Sort by
              </label>
              <select
                id="sort"
                value={filters.sort}
                onChange={(e) => update({ sort: e.target.value as SortKey })}
                className="h-9 rounded-xl border border-border bg-surface px-3 text-sm transition-colors hover:border-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4">
            <ActiveFilters filters={filters} categories={categories} onChange={update} />
          </div>

          <div className="mt-6" aria-busy={isLoading || isPlaceholderData}>
            {isLoading ? (
              <ProductGridSkeleton count={12} className="md:grid-cols-3 xl:grid-cols-3" />
            ) : isError ? (
              <ErrorState onRetry={() => refetch()} />
            ) : data && data.data.length === 0 ? (
              <EmptyState
                icon={SearchX}
                title="No products found"
                description="Try removing a filter or searching for something else."
                action={
                  hasActive ? (
                    <Button variant="outline" onClick={clear}>
                      Clear all filters
                    </Button>
                  ) : undefined
                }
              />
            ) : (
              data && (
                <>
                  <div className={cn('transition-opacity', isPlaceholderData && 'opacity-60')}>
                    <ProductGrid products={data.data} className="md:grid-cols-3 xl:grid-cols-3" />
                  </div>
                  <Pagination
                    page={data.meta.current_page}
                    lastPage={data.meta.last_page}
                    onChange={(page) => update({ page })}
                  />
                </>
              )
            )}
          </div>
        </div>
      </div>

      <Drawer open={filtersOpen} onClose={() => setFiltersOpen(false)} title="Filters">
        {panel}
        <Button className="mt-8 w-full" onClick={() => setFiltersOpen(false)}>
          {data ? `Show ${data.meta.total} products` : 'Show products'}
        </Button>
      </Drawer>
    </div>
  )
}