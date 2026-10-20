import { Minus, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

const btn =
  'grid h-10 w-10 place-items-center text-muted transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent disabled:pointer-events-none disabled:opacity-40'

export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = 10,
  disabled,
  label = 'Quantity',
  className,
}: {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  disabled?: boolean
  label?: string
  className?: string
}) {
  return (
    <div
      role="group"
      aria-label={label}
      className={cn('inline-flex h-10 items-center rounded-xl border border-border bg-surface', className)}
    >
      <button
        type="button"
        className={cn(btn, 'rounded-l-xl')}
        aria-label="Decrease quantity"
        disabled={disabled || value <= min}
        onClick={() => onChange(value - 1)}
      >
        <Minus className="h-4 w-4" />
      </button>
      <span className="w-9 text-center text-sm font-medium tabular-nums" aria-live="polite">
        {value}
      </span>
      <button
        type="button"
        className={cn(btn, 'rounded-r-xl')}
        aria-label="Increase quantity"
        disabled={disabled || value >= max}
        onClick={() => onChange(value + 1)}
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  )
}