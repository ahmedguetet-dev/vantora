import { useState, type FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import { Receipt, Search } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Drawer } from '@/components/ui/Drawer'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { Pagination } from '@/components/ui/Pagination'
import { Skeleton } from '@/components/ui/Skeleton'
import { formatMoney } from '@/lib/utils'
import { adminApi, type OrderStatus } from '../api'
import { PageHeader, StatusBadge, TableShell, td, th } from '../components/ui'
import { errorMessage, fmtDate } from '../helpers'

const statuses: OrderStatus[] = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']

export function AdminOrdersPage() {
  const [page, setPage] = useState(1)
  const [q, setQ] = useState('')
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [payment, setPayment] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [openId, setOpenId] = useState<number | null>(null)

  const params = { page, q: search, status, payment_status: payment, from, to: to && (!from || to >= from) ? to : undefined }
  const orders = useQuery({ queryKey: ['admin', 'orders', params], queryFn: () => adminApi.orders(params), placeholderData: keepPreviousData })
  const rows = orders.data?.data ?? []
  const reset = (set: (v: string) => void) => (e: { target: { value: string } }) => { set(e.target.value); setPage(1) }
  const onSearch = (e: FormEvent) => { e.preventDefault(); setPage(1); setSearch(q.trim()) }
  const sel = 'h-11 rounded-xl border border-border bg-background px-3 text-sm'

  return (
    <div className="space-y-6">
      <PageHeader title="Orders" subtitle={orders.data ? `${orders.data.total} orders` : 'Track and fulfil customer orders'} />
      <div className="grid gap-3 rounded-2xl border border-border bg-surface p-4 md:grid-cols-2 lg:grid-cols-[1fr_9rem_9rem_9rem_9rem]">
        <form onSubmit={onSearch} role="search" className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden />
          <input value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search orders" placeholder="Order number, customer…"
            className="h-11 w-full rounded-xl border border-border bg-background pl-10 pr-4 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent" />
        </form>
        <select aria-label="Order status" value={status} onChange={reset(setStatus)} className={sel}>
          <option value="">Any status</option>{statuses.map((s) => <option key={s} value={s} className="capitalize">{s}</option>)}
        </select>
        <select aria-label="Payment status" value={payment} onChange={reset(setPayment)} className={sel}>
          <option value="">Any payment</option><option value="unpaid">Unpaid</option><option value="paid">Paid</option><option value="refunded">Refunded</option>
        </select>
        <input type="date" aria-label="From date" value={from} onChange={reset(setFrom)} className={sel} />
        <input type="date" aria-label="To date" value={to} min={from || undefined} onChange={reset(setTo)} className={sel} />
      </div>

      {orders.isError ? <ErrorState onRetry={() => void orders.refetch()} />
        : orders.isLoading ? <div className="space-y-2">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-14 w-full rounded-xl" />)}</div>
        : rows.length === 0 ? <EmptyState icon={Receipt} title="No orders found" description="Orders matching your filters will appear here." />
        : (
          <div className={orders.isPlaceholderData ? 'opacity-60 transition-opacity' : 'transition-opacity'}>
            <TableShell>
              <thead className="border-b border-border"><tr>
                <th scope="col" className={th}>Order</th><th scope="col" className={th}>Customer</th><th scope="col" className={th}>Date</th>
                <th scope="col" className={th}>Total</th><th scope="col" className={th}>Payment</th><th scope="col" className={th}>Status</th>
              </tr></thead>
              <tbody className="divide-y divide-border">
                {rows.map((o) => (
                  <tr key={o.id} className="hover:bg-surface-muted/50">
                    <td className={td}><button type="button" onClick={() => setOpenId(o.id)} className="font-medium underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded">{o.number}</button>
                      <p className="text-xs text-muted">{o.items_count} item(s)</p></td>
                    <td className={td}><p>{o.user?.name}</p><p className="text-xs text-muted">{o.user?.email}</p></td>
                    <td className={td}>{fmtDate(o.created_at)}</td>
                    <td className={td}>{formatMoney(o.total_cents)}</td>
                    <td className={td}><Badge variant={o.payment_status === 'paid' ? 'success' : 'neutral'} className="capitalize">{o.payment_status}</Badge></td>
                    <td className={td}><StatusBadge status={o.status} /></td>
                  </tr>
                ))}
              </tbody>
            </TableShell>
          </div>
        )}
      <Pagination page={page} lastPage={orders.data?.last_page ?? 1} onChange={setPage} />

      <Drawer open={openId !== null} onClose={() => setOpenId(null)} side="right" title="Order details">
        {openId !== null && <OrderDetail id={openId} />}
      </Drawer>
    </div>
  )
}

function OrderDetail({ id }: { id: number }) {
  const qc = useQueryClient()
  const [note, setNote] = useState('')
  const detail = useQuery({ queryKey: ['admin', 'order', id], queryFn: () => adminApi.order(id) })
  const update = useMutation({
    mutationFn: (s: OrderStatus) => adminApi.updateOrderStatus(id, s, note),
    onSuccess: () => {
      toast.success('Order updated'); setNote('')
      void qc.invalidateQueries({ queryKey: ['admin'] })
    },
    onError: (e) => toast.error(errorMessage(e)),
  })

  if (detail.isError) return <ErrorState onRetry={() => void detail.refetch()} />
  if (!detail.data) return <Skeleton className="h-80 w-full rounded-2xl" />
  const o = detail.data.data
  const next = detail.data.meta.allowed_transitions
  const a = o.shipping_address ?? {}

  return (
    <div className="space-y-6 text-sm">
      <div className="flex items-start justify-between gap-3">
        <div><p className="font-semibold">{o.number}</p><p className="text-muted">{fmtDate(o.created_at)}</p></div>
        <StatusBadge status={o.status} />
      </div>
      <section aria-label="Customer"><h3 className="mb-1 font-semibold">Customer</h3>
        <p>{o.user?.name}</p><p className="text-muted">{o.user?.email}{o.user?.phone ? ` · ${o.user.phone}` : ''}</p></section>
      <section aria-label="Shipping address"><h3 className="mb-1 font-semibold">Ship to</h3>
        <p className="text-muted">{[a.full_name, a.line1, a.line2, [a.postal_code, a.city].filter(Boolean).join(' '), a.region, a.country, a.phone].filter(Boolean).join(', ')}</p></section>
      <section aria-label="Items"><h3 className="mb-2 font-semibold">Items</h3>
        <ul className="divide-y divide-border rounded-xl border border-border">
          {o.items?.map((i) => (
            <li key={i.id} className="flex justify-between gap-3 p-3"><span>{i.quantity} × {i.name}<span className="block text-xs text-muted">{i.sku}</span></span><span>{formatMoney(i.line_total_cents)}</span></li>
          ))}
        </ul>
        <dl className="mt-3 space-y-1">
          {([['Subtotal', o.subtotal_cents], ['Shipping', o.shipping_cents], ['Tax', o.tax_cents], ['Discount', -o.discount_cents]] as const).map(([k, v]) => (
            <div key={k} className="flex justify-between text-muted"><dt>{k}</dt><dd>{formatMoney(v)}</dd></div>
          ))}
          <div className="flex justify-between font-semibold"><dt>Total ({o.payment_method === 'cod' ? 'cash on delivery' : o.payment_method})</dt><dd>{formatMoney(o.total_cents)}</dd></div>
        </dl>
      </section>
      {o.notes && <section><h3 className="mb-1 font-semibold">Customer note</h3><p className="text-muted">{o.notes}</p></section>}
      <section aria-label="Update status">
        <h3 className="mb-2 font-semibold">Update status</h3>
        {next.length === 0 ? <p className="text-muted">This order is {o.status} and can no longer change.</p> : (
          <div className="space-y-3">
            <input value={note} onChange={(e) => setNote(e.target.value)} maxLength={255} aria-label="Status note" placeholder="Optional note"
              className="h-11 w-full rounded-xl border border-border bg-background px-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent" />
            <div className="flex flex-wrap gap-2">
              {next.map((s) => (
                <Button key={s} variant={s === 'cancelled' ? 'danger' : 'primary'} size="sm" className="capitalize"
                  loading={update.isPending && update.variables === s} disabled={update.isPending}
                  onClick={() => { if (s !== 'cancelled' || window.confirm('Cancel this order and return its items to stock?')) update.mutate(s) }}>
                  Mark {s}
                </Button>
              ))}
            </div>
          </div>
        )}
      </section>
      <section aria-label="History"><h3 className="mb-2 font-semibold">History</h3>
        <ol className="space-y-2 border-l border-border pl-4">
          {o.histories?.map((h) => (
            <li key={h.id}><span className="capitalize">{h.to_status}</span> <span className="text-muted">· {fmtDate(h.created_at)}{h.changed_by ? ` · ${h.changed_by.name}` : ''}</span>
              {h.note && <p className="text-muted">{h.note}</p>}</li>
          ))}
        </ol>
      </section>
    </div>
  )
}
