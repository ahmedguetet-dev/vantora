import { Badge } from './Badge'

const variant = {
  pending: 'warning',
  processing: 'accent',
  shipped: 'neutral',
  delivered: 'success',
  cancelled: 'danger',
} as const

/** Shared by the customer order history and the admin order screens. */
export function OrderStatusBadge({ status }: { status: string }) {
  const v = variant[status as keyof typeof variant] ?? 'neutral'
  return <Badge variant={v} className="capitalize">{status}</Badge>
}
