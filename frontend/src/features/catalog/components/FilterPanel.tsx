import { useState, type FormEvent, type ReactNode } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { cn } from '@/lib/utils'
import type { CatalogFilters, Category, Facets } from '@/types/catalog'

interface FilterPanelProps {
  filters: CatalogFilters
  categories: Category[]
  facets?: Facets
  hasActive: boolean
  onChange: (patch: Partial<CatalogFilters>) => void
  onClear: () => void
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h3 className="font-sans text-sm font-semibold tracking-normal">{title}</h3>
      <div className="mt-3">{children}</div>
    </section>
  )
}

function CheckRow({
  checked,
  onChange,
  label,
  count,
}: {
  checked: boolean
  onChange: (checked: boolean) => void
  label: string
  count?: number
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-3 rounded-lg px-1 py-1.5 text-sm hover:bg-surface-muted">
      <span className="flex items-center gap-2.5">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="h-4 w-4 rounded border-border accent-accent"
        />
        {label}
      </span>
      {count !== undefined && <span className="text-xs text-muted">{count}</span>}
    </label>
  )
}

function PriceRange({
  min,
  max,
  bounds,
  onApply,
}: {
  min: number | null
  max: number | null
  bounds?: { min: number; max: number }
  onApply: (min: number | null, max: number | null) => void
}) {
  const [lo, setLo] = useState(min?.toString() ?? '')
  const [hi, setHi] = useState(max?.toString() ?? '')

  const submit = (e: FormEvent) => {
    e.preventDefault()
    let a = lo === '' ? null : Number(lo)
    let b = hi === '' ? null : Number(hi)
    if (a !== null && b !== null && a > b) [a, b] = [b, a]
    onApply(a, b)
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Min ($)"
          type="number"
          min={0}
          inputMode="numeric"
          value={lo}
          onChange={(e) => setLo(e.target.value)}
          placeholder={bounds ? String(Math.floor(bounds.min / 100)) : '0'}
        />
        <Input
          label="Max ($)"
          type="number"
          min={0}
          inputMode="numeric"
          value={hi}
          onChange={(e) => setHi(e.target.value)}
          placeholder={bounds ? String(Math.ceil(bounds.max / 100)) : ''}
        />
      </div>
      <Button type="submit" variant="outline" size="sm" className="w-full">
        Apply price
      </Button>
    </form>
  )
}

export function FilterPanel({ filters, categories, facets, hasActive, onChange, onClear }: FilterPanelProps) {
  const toggleBrand = (name: string) =>
    onChange({
      brands: filters.brands.includes(name)
        ? filters.brands.filter((b) => b !== name)
        : [...filters.brands, name],
    })

  const option = (active: boolean) =>
    cn(
      'flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
      active ? 'bg-accent/10 font-medium text-accent' : 'hover:bg-surface-muted',
    )

  return (
    <div className="space-y-8">
      {hasActive && (
        <Button variant="outline" size="sm" className="w-full" onClick={onClear}>
          Clear all filters
        </Button>
      )}

      <Section title="Category">
        <ul className="space-y-0.5">
          <li>
            <button
              type="button"
              className={option(!filters.category)}
              aria-pressed={!filters.category}
              onClick={() => onChange({ category: '' })}
            >
              All products
            </button>
          </li>
          {categories.map((c) => (
            <li key={c.id}>
              <button
                type="button"
                className={option(filters.category === c.slug)}
                aria-pressed={filters.category === c.slug}
                onClick={() => onChange({ category: c.slug })}
              >
                <span>{c.name}</span>
                <span className="text-xs text-muted">{c.products_count}</span>
              </button>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Price">
        <PriceRange
          key={`${filters.minPrice}-${filters.maxPrice}`}
          min={filters.minPrice}
          max={filters.maxPrice}
          bounds={facets?.price}
          onApply={(minPrice, maxPrice) => onChange({ minPrice, maxPrice })}
        />
      </Section>

      {facets && facets.brands.length > 0 && (
        <Section title="Brand">
          <div className="space-y-0.5">
            {facets.brands.map((b) => (
              <CheckRow
                key={b.name}
                label={b.name}
                count={b.count}
                checked={filters.brands.includes(b.name)}
                onChange={() => toggleBrand(b.name)}
              />
            ))}
          </div>
        </Section>
      )}

      <Section title="Availability">
        <div className="space-y-0.5">
          <CheckRow label="In stock only" checked={filters.inStock} onChange={(inStock) => onChange({ inStock })} />
          <CheckRow label="On sale" checked={filters.onSale} onChange={(onSale) => onChange({ onSale })} />
        </div>
      </Section>
    </div>
  )
}