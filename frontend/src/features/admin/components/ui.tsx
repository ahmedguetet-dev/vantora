import { forwardRef, useId, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react'
import { OrderStatusBadge } from '@/components/ui/OrderStatusBadge'
import { cn } from '@/lib/utils'
import type { OrderStatus } from '../api'

export const fieldClass =
  'h-11 w-full rounded-xl border border-border bg-surface px-4 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-50'

export const Select = forwardRef<
  HTMLSelectElement,
  SelectHTMLAttributes<HTMLSelectElement> & { label: string; error?: string }
>(({ label, error, className, children, ...props }, ref) => {
  const id = useId()
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-sm font-medium">{label}</label>
      <select ref={ref} id={id} aria-invalid={error ? true : undefined} className={cn(fieldClass, error && 'border-danger', className)} {...props}>
        {children}
      </select>
      {error && <p role="alert" className="text-sm text-danger">{error}</p>}
    </div>
  )
})
Select.displayName = 'Select'

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string; error?: string }
>(({ label, error, className, ...props }, ref) => {
  const id = useId()
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-sm font-medium">{label}</label>
      <textarea ref={ref} id={id} aria-invalid={error ? true : undefined} rows={4} className={cn(fieldClass, 'h-auto py-3', error && 'border-danger', className)} {...props} />
      {error && <p role="alert" className="text-sm text-danger">{error}</p>}
    </div>
  )
})
Textarea.displayName = 'Textarea'

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}

export function TableShell({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
      <table className="w-full min-w-[640px] text-left text-sm">{children}</table>
    </div>
  )
}
export const th = 'px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted'
export const td = 'px-4 py-3 align-middle'

export function StatusBadge({ status }: { status: OrderStatus }) {
  return <OrderStatusBadge status={status} />
}
