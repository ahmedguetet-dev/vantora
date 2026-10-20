import { useState, type FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import { Package, Pencil, Plus, Search, SlidersHorizontal } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Drawer } from '@/components/ui/Drawer'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { Input } from '@/components/ui/Input'
import { Pagination } from '@/components/ui/Pagination'
import { Skeleton } from '@/components/ui/Skeleton'
import { formatMoney } from '@/lib/utils'
import { adminApi, type AdminProduct, type ProductPayload } from '../api'
import { PageHeader, Select, TableShell, Textarea, td, th } from '../components/ui'
import { errorMessage, fieldErrors, fromCents, toCents } from '../helpers'

type FormState = {
  name: string; sku: string; category_id: string; description: string; price: string; compare_at: string
  stock: string; threshold: string; brand: string; image: string; is_active: boolean; is_featured: boolean
}
const blank: FormState = {
  name: '', sku: '', category_id: '', description: '', price: '', compare_at: '', stock: '0',
  threshold: '5', brand: '', image: '', is_active: true, is_featured: false,
}
const toForm = (p: AdminProduct): FormState => ({
  name: p.name, sku: p.sku, category_id: String(p.category_id), description: p.description,
  price: fromCents(p.price_cents), compare_at: fromCents(p.compare_at_cents), stock: String(p.stock),
  threshold: String(p.low_stock_threshold), brand: p.brand ?? '', image: p.images?.[0]?.url ?? '',
  is_active: p.is_active, is_featured: p.is_featured,
})

function StockBadge({ p }: { p: AdminProduct }) {
  if (p.stock <= 0) return <Badge variant="danger">Out of stock</Badge>
  if (p.stock <= p.low_stock_threshold) return <Badge variant="warning">Low · {p.stock}</Badge>
  return <Badge variant="success">{p.stock} in stock</Badge>
}

export function AdminProductsPage() {
  const qc = useQueryClient()
  const [page, setPage] = useState(1)
  const [q, setQ] = useState('')
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [status, setStatus] = useState('')
  const [stock, setStock] = useState('')
  const [editing, setEditing] = useState<AdminProduct | 'new' | null>(null)
  const [stockFor, setStockFor] = useState<AdminProduct | null>(null)

  const params = { page, q: search, category_id: category, status, stock }
  const products = useQuery({
    queryKey: ['admin', 'products', params],
    queryFn: () => adminApi.products(params),
    placeholderData: keepPreviousData,
  })
  const categories = useQuery({ queryKey: ['admin', 'categories'], queryFn: () => adminApi.categories() })

  const invalidate = () => {
    void qc.invalidateQueries({ queryKey: ['admin', 'products'] })
    void qc.invalidateQueries({ queryKey: ['admin', 'dashboard'] })
  }

  const toggle = useMutation({
    mutationFn: (p: AdminProduct) => adminApi.setProductActive(p.id, !p.is_active),
    onSuccess: (p) => { toast.success(p.is_active ? 'Product activated' : 'Product deactivated'); invalidate() },
    onError: (e) => toast.error(errorMessage(e)),
  })

  const submitSearch = (e: FormEvent) => { e.preventDefault(); setPage(1); setSearch(q.trim()) }
  const filter = (set: (v: string) => void) => (e: { target: { value: string } }) => { set(e.target.value); setPage(1) }
  const rows = products.data?.data ?? []

  return (
    <div className="space-y-6">
      <PageHeader
        title="Products"
        subtitle={products.data ? `${products.data.total} products` : 'Manage your catalogue and stock'}
        action={<Button onClick={() => setEditing('new')}><Plus className="h-4 w-4" aria-hidden />New product</Button>}
      />

      <div className="grid gap-3 rounded-2xl border border-border bg-surface p-4 md:grid-cols-[1fr_repeat(3,10rem)]">
        <form onSubmit={submitSearch} role="search" className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden />
          <input
            value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search products"
            placeholder="Search name, SKU or brand…"
            className="h-11 w-full rounded-xl border border-border bg-background pl-10 pr-4 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          />
        </form>
        <select aria-label="Category" value={category} onChange={filter(setCategory)} className="h-11 rounded-xl border border-border bg-background px-3 text-sm">
          <option value="">All categories</option>
          {categories.data?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select aria-label="Status" value={status} onChange={filter(setStatus)} className="h-11 rounded-xl border border-border bg-background px-3 text-sm">
          <option value="">Any status</option><option value="active">Active</option><option value="inactive">Inactive</option>
        </select>
        <select aria-label="Stock level" value={stock} onChange={filter(setStock)} className="h-11 rounded-xl border border-border bg-background px-3 text-sm">
          <option value="">Any stock</option><option value="in">In stock</option><option value="low">Low stock</option><option value="out">Out of stock</option>
        </select>
      </div>

      {products.isError ? (
        <ErrorState onRetry={() => void products.refetch()} />
      ) : products.isLoading ? (
        <div className="space-y-2">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-14 w-full rounded-xl" />)}</div>
      ) : rows.length === 0 ? (
        <EmptyState icon={SlidersHorizontal} title="No products found" description="Try adjusting your search or filters, or add a new product." />
      ) : (
        <div className={products.isPlaceholderData ? 'opacity-60 transition-opacity' : 'transition-opacity'}>
          <TableShell>
            <thead className="border-b border-border"><tr>
              <th scope="col" className={th}>Product</th><th scope="col" className={th}>Category</th><th scope="col" className={th}>Price</th>
              <th scope="col" className={th}>Stock</th><th scope="col" className={th}>Status</th><th scope="col" className={`${th} text-right`}>Actions</th>
            </tr></thead>
            <tbody className="divide-y divide-border">
              {rows.map((p) => (
                <tr key={p.id} className="hover:bg-surface-muted/50">
                  <td className={td}>
                    <div className="flex items-center gap-3">
                      {p.images?.[0] ? (
                        <img src={p.images[0].url} alt="" loading="lazy" width={44} height={44} className="h-11 w-11 rounded-lg object-cover" />
                      ) : (
                        <span className="grid h-11 w-11 place-items-center rounded-lg bg-surface-muted text-muted"><Package className="h-5 w-5" aria-hidden /></span>
                      )}
                      <div className="min-w-0"><p className="truncate font-medium">{p.name}</p><p className="text-xs text-muted">{p.sku}</p></div>
                    </div>
                  </td>
                  <td className={td}>{p.category?.name ?? '—'}</td>
                  <td className={td}>{formatMoney(p.price_cents)}</td>
                  <td className={td}><button type="button" onClick={() => setStockFor(p)} className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent" aria-label={`Adjust stock for ${p.name}`}><StockBadge p={p} /></button></td>
                  <td className={td}>
                    <button type="button" role="switch" aria-checked={p.is_active} aria-label={`${p.is_active ? 'Deactivate' : 'Activate'} ${p.name}`}
                      disabled={toggle.isPending} onClick={() => toggle.mutate(p)}
                      className={`relative h-6 w-11 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${p.is_active ? 'bg-success' : 'bg-border'}`}>
                      <span className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${p.is_active ? 'translate-x-5' : ''}`} />
                    </button>
                  </td>
                  <td className={`${td} text-right`}><Button variant="ghost" size="icon" aria-label={`Edit ${p.name}`} onClick={() => setEditing(p)}><Pencil className="h-4 w-4" /></Button></td>
                </tr>
              ))}
            </tbody>
          </TableShell>
        </div>
      )}

      <Pagination page={page} lastPage={products.data?.last_page ?? 1} onChange={setPage} />

      <Drawer open={editing !== null} onClose={() => setEditing(null)} side="right" title={editing === 'new' ? 'New product' : 'Edit product'}>
        {editing !== null && (
          <ProductForm key={editing === 'new' ? 'new' : editing.id} product={editing === 'new' ? null : editing}
            onSaved={() => { setEditing(null); invalidate() }} />
        )}
      </Drawer>
      <Drawer open={stockFor !== null} onClose={() => setStockFor(null)} side="right" title="Adjust stock">
        {stockFor && <StockForm product={stockFor} onSaved={() => { setStockFor(null); invalidate() }} />}
      </Drawer>
    </div>
  )
}

function ProductForm({ product, onSaved }: { product: AdminProduct | null; onSaved: () => void }) {
  const [f, setF] = useState<FormState>(product ? toForm(product) : blank)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const categories = useQuery({ queryKey: ['admin', 'categories'], queryFn: () => adminApi.categories() })
  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setF((s) => ({ ...s, [k]: v }))

  const save = useMutation({
    mutationFn: () => {
      const payload: ProductPayload = {
        category_id: Number(f.category_id), name: f.name.trim(), sku: f.sku.trim(), description: f.description.trim(),
        price_cents: toCents(f.price), compare_at_cents: f.compare_at ? toCents(f.compare_at) : null,
        low_stock_threshold: Number(f.threshold || 0), brand: f.brand.trim() || null,
        is_active: f.is_active, is_featured: f.is_featured,
        images: f.image.trim() ? [{ url: f.image.trim() }] : [],
      }
      if (!product) payload.stock = Number(f.stock || 0)
      return product ? adminApi.updateProduct(product.id, payload) : adminApi.createProduct(payload)
    },
    onSuccess: () => { toast.success(product ? 'Product updated' : 'Product created'); onSaved() },
    onError: (e) => { setErrors(fieldErrors(e)); toast.error(errorMessage(e)) },
  })

  return (
    <form onSubmit={(e) => { e.preventDefault(); setErrors({}); save.mutate() }} className="space-y-4">
      <Input label="Name" value={f.name} onChange={(e) => set('name', e.target.value)} error={errors.name} required />
      <div className="grid grid-cols-2 gap-3">
        <Input label="SKU" value={f.sku} onChange={(e) => set('sku', e.target.value)} error={errors.sku} required />
        <Input label="Brand" value={f.brand} onChange={(e) => set('brand', e.target.value)} error={errors.brand} />
      </div>
      <Select label="Category" value={f.category_id} onChange={(e) => set('category_id', e.target.value)} error={errors.category_id} required>
        <option value="" disabled>Select a category</option>
        {categories.data?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
      </Select>
      <Textarea label="Description" value={f.description} onChange={(e) => set('description', e.target.value)} error={errors.description} required />
      <div className="grid grid-cols-2 gap-3">
        <Input label="Price (TND)" type="number" step="0.01" min="0" value={f.price} onChange={(e) => set('price', e.target.value)} error={errors.price_cents} required />
        <Input label="Compare-at (TND)" type="number" step="0.01" min="0" value={f.compare_at} onChange={(e) => set('compare_at', e.target.value)} error={errors.compare_at_cents} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Input label="Opening stock" type="number" min="0" value={f.stock} onChange={(e) => set('stock', e.target.value)} disabled={!!product}
          hint={product ? 'Use “Adjust stock” to change stock.' : undefined} error={errors.stock} />
        <Input label="Low-stock alert at" type="number" min="0" value={f.threshold} onChange={(e) => set('threshold', e.target.value)} error={errors.low_stock_threshold} />
      </div>
      <Input label="Image URL" type="url" value={f.image} onChange={(e) => set('image', e.target.value)} error={errors['images.0.url']} placeholder="https://…" />
      <div className="flex gap-6 text-sm">
        <label className="flex items-center gap-2"><input type="checkbox" checked={f.is_active} onChange={(e) => set('is_active', e.target.checked)} className="h-4 w-4" />Active</label>
        <label className="flex items-center gap-2"><input type="checkbox" checked={f.is_featured} onChange={(e) => set('is_featured', e.target.checked)} className="h-4 w-4" />Featured</label>
      </div>
      <Button type="submit" loading={save.isPending} className="w-full">{product ? 'Save changes' : 'Create product'}</Button>
    </form>
  )
}

function StockForm({ product, onSaved }: { product: AdminProduct; onSaved: () => void }) {
  const [delta, setDelta] = useState('')
  const [reason, setReason] = useState('restock')
  const [error, setError] = useState('')
  const save = useMutation({
    mutationFn: () => adminApi.adjustStock(product.id, Number(delta), reason),
    onSuccess: (p) => { toast.success(`Stock is now ${p.stock}`); onSaved() },
    onError: (e) => { setError(fieldErrors(e).delta ?? errorMessage(e)) },
  })
  const n = Number(delta)
  return (
    <form onSubmit={(e) => { e.preventDefault(); setError(''); save.mutate() }} className="space-y-4">
      <div><p className="font-medium">{product.name}</p><p className="text-sm text-muted">Current stock: {product.stock}</p></div>
      <Input label="Change (+ add / − remove)" type="number" step="1" value={delta} onChange={(e) => setDelta(e.target.value)} error={error} required />
      <Select label="Reason" value={reason} onChange={(e) => setReason(e.target.value)}>
        <option value="restock">Restock</option><option value="correction">Correction</option>
        <option value="damaged">Damaged</option><option value="returned">Returned</option>
      </Select>
      {Number.isInteger(n) && n !== 0 && <p className="text-sm text-muted">New stock will be {product.stock + n}.</p>}
      <Button type="submit" loading={save.isPending} disabled={!Number.isInteger(n) || n === 0} className="w-full">Apply adjustment</Button>
    </form>
  )
}
