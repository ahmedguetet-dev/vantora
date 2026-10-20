import { cn, formatMoney } from '@/lib/utils'

export function Price({
  cents,
  compareAt,
  size = 'md',
}: {
  cents: number
  compareAt?: number | null
  size?: 'md' | 'lg'
}) {
  return (
    <span className="flex flex-wrap items-baseline gap-x-2">
      <span className={cn('font-semibold', size === 'lg' ? 'text-3xl' : 'text-base')}>{formatMoney(cents)}</span>
      {compareAt && compareAt > cents && (
        <span className={cn('text-muted line-through', size === 'lg' ? 'text-lg' : 'text-sm')}>
          <span className="sr-only">Original price </span>
          {formatMoney(compareAt)}
        </span>
      )}
    </span>
  )
}