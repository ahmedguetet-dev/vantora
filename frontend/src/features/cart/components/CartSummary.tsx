import { PackageCheck, Truck } from 'lucide-react'
import { formatMoney } from '@/lib/utils'
import type { CartTotals } from '@/types/cart'

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={strong ? 'flex justify-between text-base font-semibold' : 'flex justify-between text-sm'}>
      <dt className={strong ? '' : 'text-muted'}>{label}</dt>
      <dd className="tabular-nums">{value}</dd>
    </div>
  )
}

export function CartSummary({ totals }: { totals: CartTotals }) {
  const threshold = totals.subtotal_cents + totals.free_shipping_remaining_cents
  const progress = threshold > 0 ? Math.min(100, Math.round((totals.subtotal_cents / threshold) * 100)) : 0
  const unlocked = totals.subtotal_cents > 0 && totals.free_shipping_remaining_cents === 0

  return (
    <div className="space-y-5">
      {totals.subtotal_cents > 0 && (
        <div className="rounded-xl bg-surface-muted p-3.5 text-sm">
          <p className="flex items-center gap-2 font-medium">
            {unlocked ? (
              <>
                <PackageCheck className="h-4 w-4 text-success" aria-hidden /> You have unlocked free shipping
              </>
            ) : (
              <>
                <Truck className="h-4 w-4 text-accent" aria-hidden /> Add{' '}
                {formatMoney(totals.free_shipping_remaining_cents)} more for free shipping
              </>
            )}
          </p>
          <div
            className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-border"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progress}
            aria-label="Progress to free shipping"
          >
            <div
              className="h-full rounded-full bg-accent transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      <dl className="space-y-2.5">
        <Row label="Subtotal" value={formatMoney(totals.subtotal_cents)} />
        <Row label="Shipping" value={totals.shipping_cents === 0 ? 'Free' : formatMoney(totals.shipping_cents)} />
        <Row label="Estimated tax" value={formatMoney(totals.tax_cents)} />
        <div className="border-t border-border pt-3">
          <Row label="Total" value={formatMoney(totals.total_cents)} strong />
        </div>
      </dl>
    </div>
  )
}