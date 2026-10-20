import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Layers3, Pencil, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import { Drawer } from '@/components/ui/Drawer'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { Input } from '@/components/ui/Input'
import { Skeleton } from '@/components/ui/Skeleton'
import { Badge } from '@/components/ui/Badge'
import { adminApi, type AdminCategory } from '../api'
import { PageHeader, Select, TableShell, Textarea, td, th } from '../components/ui'
import { errorMessage, fieldErrors } from '../helpers'

export function AdminCategoriesPage() {
  const qc = useQueryClient()
  const [editing, setEditing] = useState<AdminCategory | 'new' | null>(null)
  const list = useQuery({ queryKey: ['admin', 'categories'], queryFn: () => adminApi.categories() })
  const refresh = () => {
    void qc.invalidateQueries({ queryKey: ['admin', 'categories'] })
    void qc.invalidateQueries({ queryKey: ['admin', 'dashboard'] })
  }
  const toggle = useMutation({
    mutationFn: (c: AdminCategory) => adminApi.setCategoryActive(c.id, !c.is_active),
    onSuccess: (c) => { toast.success(c.is_active ? 'Category activated' : 'Category deactivated'); refresh() },
    onError: (e) => toast.error(errorMessage(e)),
  })

  return (
    <div className="space-y-6">
      <PageHeader title="Categories" subtitle="Organise your catalogue"
        action={<Button onClick={() => setEditing('new')}><Plus className="h-4 w-4" aria-hidden />New category</Button>} />
      {list.isError ? <ErrorState onRetry={() => void list.refetch()} />
        : list.isLoading ? <Skeleton className="h-64 w-full rounded-2xl" />
        : !list.data?.length ? <EmptyState icon={Layers3} title="No categories yet" description="Create your first category to start adding products." />
        : (
          <TableShell>
            <thead className="border-b border-border"><tr>
              <th scope="col" className={th}>Name</th><th scope="col" className={th}>Parent</th><th scope="col" className={th}>Products</th>
              <th scope="col" className={th}>Status</th><th scope="col" className={`${th} text-right`}>Actions</th>
            </tr></thead>
            <tbody className="divide-y divide-border">
              {list.data.map((c) => (
                <tr key={c.id} className="hover:bg-surface-muted/50">
                  <td className={td}><p className="font-medium">{c.name}</p><p className="text-xs text-muted">/{c.slug}</p></td>
                  <td className={td}>{c.parent?.name ?? '—'}</td>
                  <td className={td}>{c.products_count ?? 0}</td>
                  <td className={td}><Badge variant={c.is_active ? 'success' : 'neutral'}>{c.is_active ? 'Active' : 'Inactive'}</Badge></td>
                  <td className={`${td} text-right`}>
                    <div className="flex justify-end gap-1">
                      <Button variant="outline" size="sm" loading={toggle.isPending && toggle.variables?.id === c.id} onClick={() => toggle.mutate(c)}>
                        {c.is_active ? 'Deactivate' : 'Activate'}
                      </Button>
                      <Button variant="ghost" size="icon" aria-label={`Edit ${c.name}`} onClick={() => setEditing(c)}><Pencil className="h-4 w-4" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </TableShell>
        )}
      <Drawer open={editing !== null} onClose={() => setEditing(null)} side="right" title={editing === 'new' ? 'New category' : 'Edit category'}>
        {editing !== null && (
          <CategoryForm key={editing === 'new' ? 'new' : editing.id} category={editing === 'new' ? null : editing}
            all={list.data ?? []} onSaved={() => { setEditing(null); refresh() }} />
        )}
      </Drawer>
    </div>
  )
}

function CategoryForm({ category, all, onSaved }: { category: AdminCategory | null; all: AdminCategory[]; onSaved: () => void }) {
  const [name, setName] = useState(category?.name ?? '')
  const [parent, setParent] = useState(category?.parent_id ? String(category.parent_id) : '')
  const [description, setDescription] = useState(category?.description ?? '')
  const [image, setImage] = useState(category?.image ?? '')
  const [sort, setSort] = useState(String(category?.sort_order ?? 0))
  const [active, setActive] = useState(category?.is_active ?? true)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const save = useMutation({
    mutationFn: () => adminApi.saveCategory(category?.id ?? null, {
      name: name.trim(), parent_id: parent ? Number(parent) : null, description: description.trim() || null,
      image: image.trim() || null, sort_order: Number(sort || 0), is_active: active,
    }),
    onSuccess: () => { toast.success(category ? 'Category updated' : 'Category created'); onSaved() },
    onError: (e) => { setErrors(fieldErrors(e)); toast.error(errorMessage(e)) },
  })

  return (
    <form onSubmit={(e) => { e.preventDefault(); setErrors({}); save.mutate() }} className="space-y-4">
      <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} error={errors.name} required />
      <Select label="Parent category" value={parent} onChange={(e) => setParent(e.target.value)} error={errors.parent_id}>
        <option value="">None (top level)</option>
        {all.filter((c) => c.id !== category?.id).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
      </Select>
      <Textarea label="Description" value={description} onChange={(e) => setDescription(e.target.value)} error={errors.description} />
      <Input label="Image URL" type="url" value={image} onChange={(e) => setImage(e.target.value)} error={errors.image} placeholder="https://…" />
      <Input label="Sort order" type="number" min="0" value={sort} onChange={(e) => setSort(e.target.value)} error={errors.sort_order} />
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} className="h-4 w-4" />Active</label>
      <Button type="submit" loading={save.isPending} className="w-full">{category ? 'Save changes' : 'Create category'}</Button>
    </form>
  )
}
