import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

const variants = {
  neutral: 'bg-surface text-foreground border border-border',
  accent: 'bg-accent text-accent-foreground',
  success: 'bg-success/15 text-success',
  warning: 'bg-warning/15 text-warning',
  danger: 'bg-danger text-white',
}

export function Badge({
  children,
  variant = 'neutral',
  className,
}: {
  children: ReactNode
  variant?: keyof typeof variants
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium leading-none',
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  )
}