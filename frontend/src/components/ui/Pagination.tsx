import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

function pageList(page: number, last: number): (number | 'gap')[] {
  const wanted = [...new Set([1, last, page - 1, page, page + 1])]
    .filter((n) => n >= 1 && n <= last)
    .sort((a, b) => a - b)

  const out: (number | 'gap')[] = []
  wanted.forEach((n, i) => {
    if (i > 0 && n - wanted[i - 1] > 1) out.push('gap')
    out.push(n)
  })
  return out
}

const base =
  'grid h-10 min-w-10 place-items-center rounded-xl px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:pointer-events-none disabled:opacity-40'

export function Pagination({
  page,
  lastPage,
  onChange,
}: {
  page: number
  lastPage: number
  onChange: (page: number) => void
}) {
  if (lastPage <= 1) return null

  return (
    <nav aria-label="Pagination" className="mt-10 flex items-center justify-center gap-1.5">
      <button
        type="button"
        className={cn(base, 'border border-border bg-surface hover:bg-surface-muted')}
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
        aria-label="Previous page"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      {pageList(page, lastPage).map((item, i) =>
        item === 'gap' ? (
          <span key={`gap-${i}`} className="px-1 text-muted" aria-hidden>
            &hellip;
          </span>
        ) : (
          <button
            key={item}
            type="button"
            onClick={() => onChange(item)}
            aria-label={`Page ${item}`}
            aria-current={item === page ? 'page' : undefined}
            className={cn(
              base,
              item === page
                ? 'bg-accent text-accent-foreground shadow-soft'
                : 'border border-border bg-surface hover:bg-surface-muted',
            )}
          >
            {item}
          </button>
        ),
      )}

      <button
        type="button"
        className={cn(base, 'border border-border bg-surface hover:bg-surface-muted')}
        disabled={page >= lastPage}
        onClick={() => onChange(page + 1)}
        aria-label="Next page"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  )
}