import { useState, type FormEvent } from 'react'
import { Search } from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { cn } from '@/lib/utils'

export function SearchForm({ onDone, className }: { onDone?: () => void; className?: string }) {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [value, setValue] = useState(params.get('search') ?? '')

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const term = value.trim()
    navigate(term ? `/products?search=${encodeURIComponent(term)}` : '/products')
    onDone?.()
  }

  return (
    <form onSubmit={submit} role="search" className={cn('relative', className)}>
      <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden />
      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search products"
        aria-label="Search products"
        className="h-10 w-full rounded-xl border border-border bg-surface pl-10 pr-4 text-sm placeholder:text-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      />
    </form>
  )
}