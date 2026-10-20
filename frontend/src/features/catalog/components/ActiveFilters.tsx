import { X } from 'lucide-react'
import type { CatalogFilters, Category } from '@/types/catalog'

export function ActiveFilters({
  filters,
  categories,
  onChange,
}: {
  filters: CatalogFilters
  categories: Category[]
  onChange: (patch: Partial<CatalogFilters>) => void
}) {
  const chips: { label: string; remove: () => void }[] = []

  if (filters.search) chips.push({ label: `"${filters.search}"`, remove: () => onChange({ search: '' }) })
  if (filters.category) {
    const name = categories.find((c) => c.slug === filters.category)?.name ?? filters.category
    chips.push({ label: name, remove: () => onChange({ category: '' }) })
  }
  filters.brands.forEach((brand) =>
    chips.push({ label: brand, remove: () => onChange({ brands: filters.brands.filter((b) => b !== brand) }) }),
  )
  if (filters.minPrice !== null || filters.maxPrice !== null) {
    chips.push({
      label: `$${filters.minPrice ?? 0} - ${filters.maxPrice !== null ? `$${filters.maxPrice}` : 'any'}`,
      remove: () => onChange({ minPrice: null, maxPrice: null }),
    })
  }
  if (filters.inStock) chips.push({ label: 'In stock', remove: () => onChange({ inStock: false }) })
  if (filters.onSale) chips.push({ label: 'On sale', remove: () => onChange({ onSale: false }) })

  if (chips.length === 0) return null

  return (
    <ul className="flex flex-wrap gap-2" aria-label="Active filters">
      {chips.map((chip) => (
        <li key={chip.label}>
          <button
            type="button"
            onClick={chip.remove}
            aria-label={`Remove filter: ${chip.label}`}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-medium transition-colors hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            {chip.label}
            <X className="h-3.5 w-3.5" aria-hidden />
          </button>
        </li>
      ))}
    </ul>
  )
}