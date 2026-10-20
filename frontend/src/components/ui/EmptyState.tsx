import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { Inbox, type LucideIcon } from 'lucide-react'

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
}: {
  icon?: LucideIcon
  title: string
  description?: string
  action?: ReactNode
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface/40 px-6 py-16 text-center"
    >
      <span className="grid h-14 w-14 place-items-center rounded-full bg-surface-muted text-muted">
        <Icon className="h-6 w-6" aria-hidden />
      </span>
      <h2 className="mt-5 font-sans text-lg font-semibold tracking-normal">{title}</h2>
      {description && <p className="mt-1.5 max-w-sm text-sm text-muted">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </motion.div>
  )
}