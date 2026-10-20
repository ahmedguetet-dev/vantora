import { useQuery } from '@tanstack/react-query'
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Boxes,
  CheckCircle2,
  CircleDollarSign,
  ClipboardList,
  Layers3,
  Package,
  RefreshCw,
  ShieldAlert,
  ShoppingCart,
  Users,
} from 'lucide-react'
import { Skeleton } from '@/components/ui/Skeleton'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { api } from '@/lib/api'
import { formatMoney } from '@/lib/utils'
import type { ApiEnvelope } from '@/types/api'

type DashboardStats = {
  products: {
    total: number
    active: number
    low_stock: number
    out_of_stock: number
  }
  categories: {
    total: number
    active: number
  }
  customers: {
    total: number
  }
  orders: {
    total: number
    today: number
    pending: number
    revenue_cents: number
  }
}

const money = formatMoney

export function AdminHomePage() {
  const { user } = useAuth()

  const {
    data,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn: async () =>
      (await api.get<ApiEnvelope<DashboardStats>>('/admin/dashboard')).data.data,
    retry: false,
  })

  const stats = [
    {
      label: 'Total products',
      value: data?.products.total,
      detail: `${data?.products.active ?? 0} active products`,
      icon: Package,
    },
    {
      label: 'Total orders',
      value: data?.orders.total,
      detail: `${data?.orders.today ?? 0} created today`,
      icon: ShoppingCart,
    },
    {
      label: 'Customers',
      value: data?.customers.total,
      detail: 'Registered customers',
      icon: Users,
    },
    {
      label: 'Paid revenue',
      value: data ? money(data.orders.revenue_cents) : undefined,
      detail: 'Confirmed paid orders only',
      icon: CircleDollarSign,
    },
    {
      label: 'Categories',
      value: data?.categories.total,
      detail: `${data?.categories.active ?? 0} active categories`,
      icon: Layers3,
    },
    {
      label: 'Pending orders',
      value: data?.orders.pending,
      detail: 'Orders awaiting processing',
      icon: ClipboardList,
    },
  ]

  return (
    <section className="w-full">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-muted">VANTORA / MANAGEMENT</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            Admin dashboard
          </h1>
          <p className="mt-2 text-sm text-muted">
            Welcome back, {user?.name ?? 'Admin'}. Here is your store overview.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void refetch()}
          disabled={isFetching}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-medium transition hover:bg-surface-muted disabled:opacity-60"
        >
          <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
          Refresh data
        </button>
      </div>

      {isLoading && (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }, (_, index) => (
            <div
              key={index}
              className="rounded-2xl border border-border bg-surface p-5"
            >
              <Skeleton className="h-4 w-32" />
              <Skeleton className="mt-5 h-8 w-24" />
              <Skeleton className="mt-4 h-3 w-40" />
            </div>
          ))}
        </div>
      )}

      {isError && (
        <div className="mt-8 rounded-2xl border border-danger/30 bg-surface p-5">
          <div className="flex items-start gap-3">
            <ShieldAlert className="mt-0.5 h-5 w-5 text-danger" />
            <div>
              <h2 className="font-semibold">Unable to load dashboard</h2>
              <p className="mt-1 text-sm text-muted">
                Access may have expired, or the server may be unavailable. Sign in with an
                admin or manager account and try again.
              </p>
              <button
                type="button"
                onClick={() => void refetch()}
                className="mt-4 rounded-lg border border-border px-3 py-2 text-sm font-medium hover:bg-surface-muted"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      )}

      {data && (
        <>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {stats.map((stat) => {
              const Icon = stat.icon

              return (
                <article
                  key={stat.label}
                  className="rounded-2xl border border-border bg-surface p-5 shadow-soft transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-muted">{stat.label}</p>
                    <span className="rounded-xl border border-border p-2.5">
                      <Icon className="h-5 w-5" aria-hidden />
                    </span>
                  </div>
                  <p className="mt-5 break-words text-2xl font-semibold tracking-tight sm:text-3xl">
                    {stat.value ?? '—'}
                  </p>
                  <p className="mt-2 text-sm text-muted">{stat.detail}</p>
                </article>
              )
            })}
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-2">
            <section className="rounded-2xl border border-border bg-surface p-5 shadow-soft">
              <div className="flex items-center gap-3">
                <span className="rounded-xl border border-border p-2.5">
                  <Boxes className="h-5 w-5" aria-hidden />
                </span>
                <div>
                  <h2 className="font-semibold">Inventory health</h2>
                  <p className="mt-1 text-sm text-muted">Stock levels across your catalog</p>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-muted/10 p-4">
                  <p className="text-sm text-muted">Low stock</p>
                  <p className="mt-2 text-2xl font-semibold">{data.products.low_stock}</p>
                  <p className="mt-1 flex items-center gap-1 text-xs text-muted">
                    <ArrowDownRight className="h-3.5 w-3.5" />
                    At or below threshold
                  </p>
                </div>
                <div className="rounded-xl bg-muted/10 p-4">
                  <p className="text-sm text-muted">Out of stock</p>
                  <p className="mt-2 text-2xl font-semibold">{data.products.out_of_stock}</p>
                  <p className="mt-1 flex items-center gap-1 text-xs text-muted">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    Unavailable products
                  </p>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-border bg-surface p-5 shadow-soft">
              <div className="flex items-center gap-3">
                <span className="rounded-xl border border-border p-2.5">
                  <ClipboardList className="h-5 w-5" aria-hidden />
                </span>
                <div>
                  <h2 className="font-semibold">Store activity</h2>
                  <p className="mt-1 text-sm text-muted">A quick look at your store</p>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <span className="flex items-center gap-2 text-sm text-muted">
                    <ShoppingCart className="h-4 w-4" />
                    Orders created today
                  </span>
                  <span className="font-semibold">{data.orders.today}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="flex items-center gap-2 text-sm text-muted">
                    <CheckCircle2 className="h-4 w-4" />
                    Active products
                  </span>
                  <span className="font-semibold">{data.products.active}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="flex items-center gap-2 text-sm text-muted">
                    <ArrowUpRight className="h-4 w-4" />
                    Paid revenue
                  </span>
                  <span className="font-semibold">
                    {money(data.orders.revenue_cents)}
                  </span>
                </div>
              </div>
            </section>
          </div>
        </>
      )}
    </section>
  )
}
