import { useState, type FormEvent } from 'react'
import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { Search, Users } from 'lucide-react'
import { Drawer } from '@/components/ui/Drawer'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { Pagination } from '@/components/ui/Pagination'
import { Skeleton } from '@/components/ui/Skeleton'
import { formatMoney } from '@/lib/utils'
import { adminApi } from '../api'
import { PageHeader, StatusBadge, TableShell, td, th } from '../components/ui'
import { fmtDate } from '../helpers'

export function AdminCustomersPage() {
  const [page, setPage] = useState(1)
  const [q, setQ] = useState('')
  const [search, setSearch] = useState('')
  const [openId, setOpenId] = useState<number | null>(null)
  const params = { page, q: search }
  const list = useQuery({ queryKey: ['admin', 'customers', params], queryFn: () => adminApi.customers(params), placeholderData: keepPreviousData })
  const rows = list.data?.data ?? []
  const onSearch = (e: FormEvent) => { e.preventDefault(); setPage(1); setSearch(q.trim()) }

  return (
    <div className="space-y-6">
      <PageHeader title="Customers" subtitle={list.data ? `${list.data.total} customers` : 'Everyone who shops with you'} />
      <form onSubmit={onSearch} role="search" className="relative max-w-md">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden />
        <input value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search customers" placeholder="Search name or email…"
          className="h-11 w-full rounded-xl border border-border bg-surface pl-10 pr-4 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent" />
      </form>
      {list.isError ? <ErrorState onRetry={() => void list.refetch()} />
        : list.isLoading ? <Skeleton className="h-64 w-full rounded-2xl" />
        : rows.length === 0 ? <EmptyState icon={Users} title="No customers found" description="Try a different search." />
        : (
          <div className={list.isPlaceholderData ? 'opacity-60 transition-opacity' : 'transition-opacity'}>
            <TableShell>
              <thead className="border-b border-border"><tr>
                <th scope="col" className={th}>Customer</th><th scope="col" className={th}>Joined</th><th scope="col" className={th}>Orders</th>
                <th scope="col" className={th}>Total spent</th><th scope="col" className={th}>Last order</th>
              </tr></thead>
              <tbody className="divide-y divide-border">
                {rows.map((c) => (
                  <tr key={c.id} className="hover:bg-surface-muted/50">
                    <td className={td}><button type="button" onClick={() => setOpenId(c.id)} className="text-left rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">
                      <span className="block font-medium underline-offset-4 hover:underline">{c.name}</span><span className="text-xs text-muted">{c.email}</span></button></td>
                    <td className={td}>{fmtDate(c.created_at)}</td>
                    <td className={td}>{c.orders_count}</td>
                    <td className={td}>{formatMoney(Number(c.total_spent_cents ?? 0))}</td>
                    <td className={td}>{c.last_order_at ? fmtDate(c.last_order_at) : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </TableShell>
          </div>
        )}
      <Pagination page={page} lastPage={list.data?.last_page ?? 1} onChange={setPage} />
      <Drawer open={openId !== null} onClose={() => setOpenId(null)} side="right" title="Customer">
        {openId !== null && <CustomerDetail id={openId} />}
      </Drawer>
    </div>
  )
}

function CustomerDetail({ id }: { id: number }) {
  const q = useQuery({ queryKey: ['admin', 'customer', id], queryFn: () => adminApi.customer(id) })
  if (q.isError) return <ErrorState onRetry={() => void q.refetch()} />
  if (!q.data) return <Skeleton className="h-60 w-full rounded-2xl" />
  const c = q.data
  return (
    <div className="space-y-5 text-sm">
      <div><p className="text-base font-semibold">{c.name}</p><p className="text-muted">{c.email}{c.phone ? ` · ${c.phone}` : ''}</p>
        <p className="text-muted">Customer since {fmtDate(c.created_at)}</p></div>
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-border p-3"><p className="text-muted">Orders</p><p className="text-lg font-semibold">{c.orders_count}</p></div>
        <div className="rounded-xl border border-border p-3"><p className="text-muted">Total spent</p><p className="text-lg font-semibold">{formatMoney(Number(c.total_spent_cents ?? 0))}</p></div>
      </div>
      <section aria-label="Recent orders"><h3 className="mb-2 font-semibold">Recent orders</h3>
        {c.orders.length === 0 ? <p className="text-muted">No orders yet.</p> : (
          <ul className="divide-y divide-border rounded-xl border border-border">
            {c.orders.map((o) => (
              <li key={o.id} className="flex items-center justify-between gap-3 p-3">
                <span><span className="block font-medium">{o.number}</span><span className="text-xs text-muted">{fmtDate(o.created_at)} · {formatMoney(o.total_cents)}</span></span>
                <StatusBadge status={o.status} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
