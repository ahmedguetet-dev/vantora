import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Rating({ value, count }: { value: number; count?: number }) {
  const label = `Rated ${value.toFixed(1)} out of 5${count !== undefined ? ` from ${count} reviews` : ''}`

  return (
    <div className="flex items-center gap-1.5 text-sm" role="img" aria-label={label}>
      <div className="flex" aria-hidden>
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            className={cn('h-4 w-4', i <= Math.round(value) ? 'fill-warning text-warning' : 'text-border')}
          />
        ))}
      </div>
      <span className="text-muted" aria-hidden>
        {value.toFixed(1)}
        {count !== undefined && ` (${count})`}
      </span>
    </div>
  )
}