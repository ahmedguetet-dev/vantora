import { formatMoney } from '@/lib/utils'
import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
CheckCircle2,
LogOut,
MapPin,
Package,
Pencil,
Plus,
Trash2,
UserRound,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { OrderStatusBadge } from '@/components/ui/OrderStatusBadge'
import { Skeleton } from '@/components/ui/Skeleton'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { ME_KEY } from '@/features/auth/hooks/useAuth'
import { authApi, type UpdateProfilePayload, type UpdatePasswordPayload } from '@/features/auth/api'
import { checkoutApi, type Address, type AddressPayload } from '@/features/checkout/api'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

const emptyAddress: AddressPayload = {
label: 'Home',
full_name: '',
line1: '',
line2: '',
city: '',
region: '',
postal_code: '',
country: 'TN',
phone: '',
is_default: false,
}

const formatDate = (value: string) =>
new Date(value).toLocaleDateString('fr-TN', {
year: 'numeric',
month: 'short',
day: 'numeric',
})

export function AccountPage() {
useDocumentTitle('My account')

const { user, logout } = useAuth()
const location = useLocation()
const queryClient = useQueryClient()

const updateProfile = useMutation({
  mutationFn: authApi.updateProfile,
  onSuccess: (updatedUser) => {
    queryClient.setQueryData(ME_KEY, updatedUser)
    setProfileError('')
    setProfileSuccess('Profile updated successfully.')
  },
  onError: (error: Error) => {
    setProfileSuccess('')
    setProfileError(error.message)
  },
})

const updatePassword = useMutation({
  mutationFn: authApi.updatePassword,
  onSuccess: () => {
    setPasswordForm({
      current_password: '',
      password: '',
      password_confirmation: '',
    })
    setPasswordError('')
    setPasswordSuccess('Password changed successfully.')
  },
  onError: (error: Error) => {
    setPasswordSuccess('')
    setPasswordError(error.message)
  },
})

const [profileForm, setProfileForm] = useState<UpdateProfilePayload>(() => ({
  name: user?.name ?? '',
  email: user?.email ?? '',
  phone: user?.phone ?? '',
}))
const [profileError, setProfileError] = useState('')
const [profileSuccess, setProfileSuccess] = useState('')

const [passwordForm, setPasswordForm] = useState<UpdatePasswordPayload>({
  current_password: '',
  password: '',
  password_confirmation: '',
})
const [passwordError, setPasswordError] = useState('')
const [passwordSuccess, setPasswordSuccess] = useState('')


const [addressFormOpen, setAddressFormOpen] = useState(false)
const [editingId, setEditingId] = useState<number | null>(null)
const [addressForm, setAddressForm] = useState<AddressPayload>(emptyAddress)
const [addressError, setAddressError] = useState('')

const state = location.state as {
orderPlaced?: boolean
orderId?: number
orderNumber?: string
} | null

const ordersQuery = useQuery({
queryKey: ['orders'],
queryFn: checkoutApi.orders,
enabled: Boolean(user),
})

const addressesQuery = useQuery({
queryKey: ['addresses'],
queryFn: checkoutApi.addresses,
enabled: Boolean(user),
})

const refreshAddresses = () =>
queryClient.invalidateQueries({ queryKey: ['addresses'] })

const createAddress = useMutation({
mutationFn: checkoutApi.createAddress,
onSuccess: async () => {
await refreshAddresses()
setAddressForm(emptyAddress)
setAddressFormOpen(false)
setEditingId(null)
setAddressError('')
},
onError: (error: Error) => setAddressError(error.message),
})

const updateAddress = useMutation({
mutationFn: ({ id, payload }: { id: number; payload: AddressPayload }) =>
checkoutApi.updateAddress(id, payload),
onSuccess: async () => {
await refreshAddresses()
setAddressForm(emptyAddress)
setAddressFormOpen(false)
setEditingId(null)
setAddressError('')
},
onError: (error: Error) => setAddressError(error.message),
})

const deleteAddress = useMutation({
mutationFn: checkoutApi.deleteAddress,
onSuccess: async () => {
await refreshAddresses()
setAddressError('')
},
onError: (error: Error) => setAddressError(error.message),
})

const makeDefaultAddress = useMutation({
mutationFn: checkoutApi.makeDefaultAddress,
onSuccess: async () => {
await refreshAddresses()
setAddressError('')
},
onError: (error: Error) => setAddressError(error.message),
})

if (!user) return null

const orders = ordersQuery.data?.data ?? []
const addresses = addressesQuery.data ?? []

const placedOrder = state?.orderPlaced
? orders.find((order) => order.id === state.orderId)
: undefined

const orderNumber =
state?.orderNumber ||
placedOrder?.number ||
placedOrder?.order_number

const since = new Date(user.created_at).toLocaleDateString('fr-TN', {
year: 'numeric',
month: 'long',
})

const startEditing = (item: Address) => {
const { id: _id, ...payload } = item
setAddressForm(payload)
setEditingId(item.id)
setAddressFormOpen(true)
setAddressError('')
}

const cancelAddressForm = () => {
setAddressForm(emptyAddress)
setEditingId(null)
setAddressFormOpen(false)
setAddressError('')
}

const saveAddress = (event: React.FormEvent<HTMLFormElement>) => {
event.preventDefault()
setAddressError('')

const payload: AddressPayload = {
  ...addressForm,
  label: addressForm.label.trim(),
  full_name: addressForm.full_name.trim(),
  line1: addressForm.line1.trim(),
  line2: addressForm.line2?.trim() || null,
  city: addressForm.city.trim(),
  region: addressForm.region?.trim() || null,
  postal_code: addressForm.postal_code?.trim() || null,
  country: addressForm.country.trim().toUpperCase(),
  phone: addressForm.phone.trim(),
}

if (editingId !== null) {
  updateAddress.mutate({ id: editingId, payload })
} else {
  createAddress.mutate(payload)
}

}

const addressSaving = createAddress.isPending || updateAddress.isPending

return ( <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6"> <h1 className="text-3xl font-semibold sm:text-4xl">Your account</h1> <p className="mt-2 text-muted">
Manage your personal information, delivery addresses and orders. </p>

  {state?.orderPlaced && (
    <div role="status" className="mt-8 animate-fade-up rounded-2xl border border-success/30 bg-success/10 p-5">
      <div className="flex items-start gap-3">
        <CheckCircle2 className="mt-1 h-6 w-6 shrink-0 text-success" aria-hidden />
        <div>
          <h2 className="text-lg font-semibold">
            Order placed successfully!
          </h2>
          <p className="mt-1 text-sm">
            Thank you for your order. You can follow its status below.
          </p>
          {orderNumber && (
            <p className="mt-3 text-sm font-semibold">
              Order number: {orderNumber}
            </p>
          )}
          {placedOrder && (
            <p className="mt-1 text-sm">
              Total: {formatMoney(placedOrder.total_cents)}
            </p>
          )}
        </div>
      </div>
    </div>
  )}

<form
  className="mt-8 space-y-4 rounded-2xl border border-border bg-surface p-5 shadow-soft sm:p-6"
  onSubmit={(event) => {
    event.preventDefault()
    setProfileError('')
    setProfileSuccess('')
    updateProfile.mutate({
      name: profileForm.name.trim(),
      email: profileForm.email.trim(),
      phone: profileForm.phone?.trim() || null,
    })
  }}
>
  <h2 className="text-xl font-semibold">Edit personal information</h2>

  <Input
    label="Full name"
    required
    minLength={2}
    maxLength={100}
    value={profileForm.name}
    onChange={(event) =>
      setProfileForm({ ...profileForm, name: event.target.value })
    }
  />

  <Input
    label="Email address"
    type="email"
    required
    maxLength={255}
    value={profileForm.email}
    onChange={(event) =>
      setProfileForm({ ...profileForm, email: event.target.value })
    }
  />

  <Input
    label="Phone (optional)"
    type="tel"
    maxLength={32}
    value={profileForm.phone ?? ''}
    onChange={(event) =>
      setProfileForm({ ...profileForm, phone: event.target.value })
    }
  />

  {profileError && (
    <p role="alert" className="rounded-xl bg-danger/10 p-3 text-sm text-danger">
      {profileError}
    </p>
  )}

  {profileSuccess && (
    <p role="status" className="rounded-xl bg-success/10 p-3 text-sm font-medium text-success">
      {profileSuccess}
    </p>
  )}

  <Button type="submit" loading={updateProfile.isPending}>
    Save profile
  </Button>
</form>
  {/* Personal information */}

  <div className="mt-8 flex items-center gap-3">
    <UserRound className="h-5 w-5 text-muted" />
    <h2 className="text-xl font-semibold">Personal information</h2>
  </div>

  <dl className="mt-4 divide-y divide-border rounded-2xl border border-border bg-surface shadow-soft">
    {[
      ['Name', user.name],
      ['Email', user.email],
      ['Role', user.role],
      ['Member since', since],
    ].map(([label, value]) => (
      <div
        key={label}
        className="flex items-center justify-between gap-4 px-5 py-4"
      >
        <dt className="text-sm text-muted">{label}</dt>
        <dd className="break-all text-right text-sm font-medium capitalize">
          {value}
        </dd>
      </div>
    ))}
  </dl>

<div className="mt-8">
  <h2 className="text-xl font-semibold">Change password</h2>
  <p className="mt-2 text-sm text-muted">
    Enter your current password and choose a new one.
  </p>

  <form
    className="mt-4 space-y-4 rounded-2xl border border-border bg-surface p-5 shadow-soft sm:p-6"
    onSubmit={(event) => {
      event.preventDefault()
      setPasswordError('')
      setPasswordSuccess('')
      updatePassword.mutate(passwordForm)
    }}
  >
    <Input
      label="Current password"
      type="password"
      required
      autoComplete="current-password"
      value={passwordForm.current_password}
      onChange={(event) =>
        setPasswordForm({ ...passwordForm, current_password: event.target.value })
      }
    />

    <Input
      label="New password"
      type="password"
      required
      minLength={8}
      autoComplete="new-password"
      value={passwordForm.password}
      onChange={(event) =>
        setPasswordForm({ ...passwordForm, password: event.target.value })
      }
    />

    <Input
      label="Confirm new password"
      type="password"
      required
      minLength={8}
      autoComplete="new-password"
      value={passwordForm.password_confirmation}
      onChange={(event) =>
        setPasswordForm({
          ...passwordForm,
          password_confirmation: event.target.value,
        })
      }
    />

    {passwordError && (
      <p role="alert" className="rounded-xl bg-danger/10 p-3 text-sm text-danger">
        {passwordError}
      </p>
    )}

    {passwordSuccess && (
      <p role="status" className="rounded-xl bg-success/10 p-3 text-sm font-medium text-success">
        {passwordSuccess}
      </p>
    )}

    <Button type="submit" loading={updatePassword.isPending}>
      Change password
    </Button>
  </form>
</div>
  {/* Delivery addresses */}
  <div className="mt-10 flex flex-wrap items-center justify-between gap-3">
    <div className="flex items-center gap-3">
      <MapPin className="h-5 w-5 text-muted" />
      <h2 className="text-xl font-semibold">My addresses</h2>
    </div>

    {!addressFormOpen && (
      <Button
        onClick={() => {
          setAddressForm(emptyAddress)
          setEditingId(null)
          setAddressError('')
          setAddressFormOpen(true)
        }}
      >
        <Plus className="h-4 w-4" />
        Add address
      </Button>
    )}
  </div>

  {addressesQuery.isLoading && (
    <p className="mt-4 text-sm text-muted">Loading addresses...</p>
  )}

  {addressesQuery.isError && (
    <div className="mt-4 rounded-xl border border-border p-4">
      <p className="text-sm">Unable to load your addresses.</p>
      <Button
        variant="outline"
        className="mt-3"
        onClick={() => void addressesQuery.refetch()}
      >
        Retry
      </Button>
    </div>
  )}

  {!addressesQuery.isLoading &&
    !addressesQuery.isError &&
    addresses.length === 0 &&
    !addressFormOpen && (
      <div className="mt-4 rounded-2xl border border-border p-6 text-center">
        <MapPin className="mx-auto h-8 w-8 text-muted" />
        <p className="mt-3 font-medium">No saved addresses</p>
        <p className="mt-1 text-sm text-muted">
          Add a delivery address to make checkout easier.
        </p>
      </div>
    )}

  {addressFormOpen && (
    <form
      className="mt-5 space-y-4 rounded-2xl border border-border bg-surface p-5 shadow-soft sm:p-6"
      onSubmit={saveAddress}
    >
      <h3 className="text-lg font-semibold">
        {editingId !== null ? 'Edit address' : 'Add a new address'}
      </h3>

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Address label"
          required
          maxLength={100}
          value={addressForm.label}
          onChange={(event) =>
            setAddressForm({ ...addressForm, label: event.target.value })
          }
        />

        <Input
          label="Full name"
          required
          maxLength={150}
          value={addressForm.full_name}
          onChange={(event) =>
            setAddressForm({ ...addressForm, full_name: event.target.value })
          }
        />

        <Input
          label="Address line 1"
          required
          maxLength={255}
          value={addressForm.line1}
          onChange={(event) =>
            setAddressForm({ ...addressForm, line1: event.target.value })
          }
        />

        <Input
          label="Address line 2 (optional)"
          maxLength={255}
          value={addressForm.line2 ?? ''}
          onChange={(event) =>
            setAddressForm({ ...addressForm, line2: event.target.value })
          }
        />

        <Input
          label="City"
          required
          maxLength={100}
          value={addressForm.city}
          onChange={(event) =>
            setAddressForm({ ...addressForm, city: event.target.value })
          }
        />

        <Input
          label="Region (optional)"
          maxLength={100}
          value={addressForm.region ?? ''}
          onChange={(event) =>
            setAddressForm({ ...addressForm, region: event.target.value })
          }
        />

        <Input
          label="Postal code (optional)"
          maxLength={20}
          value={addressForm.postal_code ?? ''}
          onChange={(event) =>
            setAddressForm({ ...addressForm, postal_code: event.target.value })
          }
        />

        <Input
          label="Country code (2 letters)"
          required
          minLength={2}
          maxLength={2}
          value={addressForm.country}
          onChange={(event) =>
            setAddressForm({
              ...addressForm,
              country: event.target.value.toUpperCase(),
            })
          }
        />

        <Input
          label="Phone"
          required
          type="tel"
          maxLength={30}
          value={addressForm.phone}
          onChange={(event) =>
            setAddressForm({ ...addressForm, phone: event.target.value })
          }
        />
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={addressForm.is_default}
          onChange={(event) =>
            setAddressForm({
              ...addressForm,
              is_default: event.target.checked,
            })
          }
          className="h-4 w-4 accent-current"
        />
        Set as my default address
      </label>

      {addressError && (
        <p role="alert" className="rounded-xl bg-danger/10 p-3 text-sm text-danger">
          {addressError}
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        <Button type="submit" loading={addressSaving}>
          {editingId !== null ? 'Save changes' : 'Save address'}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={addressSaving}
          onClick={cancelAddressForm}
        >
          Cancel
        </Button>
      </div>
    </form>
  )}

  {!addressesQuery.isLoading &&
    !addressesQuery.isError &&
    addresses.length > 0 && (
      <div className="mt-4 space-y-4">
        {addresses.map((address) => (
          <article
            key={address.id}
            className="rounded-2xl border border-border bg-surface p-5 shadow-soft"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold">{address.label}</h3>
                  {address.is_default && (
                    <span className="rounded-full border border-border px-2.5 py-1 text-xs font-medium">
                      Default
                    </span>
                  )}
                </div>
                <p className="mt-2 text-sm">{address.full_name}</p>
                <p className="mt-1 text-sm text-muted">
                  {address.line1}
                  {address.line2 ? `, ${address.line2}` : ''}
                </p>
                <p className="text-sm text-muted">
                  {address.city}
                  {address.region ? `, ${address.region}` : ''}
                  {address.postal_code ? ` ${address.postal_code}` : ''}
                  {' Â· '}
                  {address.country}
                </p>
                <p className="mt-1 text-sm text-muted">{address.phone}</p>
              </div>

              <div className="flex flex-wrap gap-2">
                {!address.is_default && (
                  <Button
                    size="sm"
                    variant="outline"
                    loading={makeDefaultAddress.isPending}
                    disabled={deleteAddress.isPending}
                    onClick={() => {
                      setAddressError('')
                      makeDefaultAddress.mutate(address.id)
                    }}
                  >
                    Set default
                  </Button>
                )}

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => startEditing(address)}
                >
                  <Pencil className="h-4 w-4" />
                  Edit
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  loading={
                    deleteAddress.isPending &&
                    deleteAddress.variables === address.id
                  }
                  disabled={deleteAddress.isPending || makeDefaultAddress.isPending}
                  onClick={() => {
                    const confirmed = window.confirm(
                      `Delete the address "${address.label}"?`,
                    )
                    if (confirmed) {
                      setAddressError('')
                      deleteAddress.mutate(address.id)
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
              </div>
            </div>
          </article>
        ))}
      </div>
    )}

  {(deleteAddress.isError || makeDefaultAddress.isError) && addressError && (
    <p role="alert" className="mt-3 rounded-xl bg-danger/10 p-3 text-sm text-danger">
      {addressError}
    </p>
  )}

  {/* Orders */}
  <div className="mt-10 flex items-center gap-3">
    <Package className="h-5 w-5 text-muted" />
    <h2 className="text-xl font-semibold">My orders</h2>
  </div>

  {ordersQuery.isLoading && (
    <div className="mt-4 space-y-4" aria-busy aria-label="Loading your orders"><Skeleton className="h-28 w-full rounded-2xl" /><Skeleton className="h-28 w-full rounded-2xl" /></div>
  )}

  {ordersQuery.isError && (
    <div className="mt-4 rounded-xl border border-border p-4">
      <p className="text-sm">Unable to load orders.</p>
      <Button
        variant="outline"
        className="mt-3"
        onClick={() => void ordersQuery.refetch()}
      >
        Retry
      </Button>
    </div>
  )}

  {!ordersQuery.isLoading &&
    !ordersQuery.isError &&
    orders.length === 0 && (
      <div className="mt-4 rounded-2xl border border-border p-6 text-center">
        <p className="font-medium">No orders yet</p>
        <p className="mt-2 text-sm text-muted">
          Your orders will appear here after checkout.
        </p>
      </div>
    )}

  <div className="mt-4 space-y-4">
    {orders.map((order) => (
      <article
        key={order.id}
        className="rounded-2xl border border-border bg-surface p-5 shadow-soft"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="font-semibold">
              {order.number || order.order_number || `Order #${order.id}`}
            </p>
            <p className="mt-1 text-sm text-muted">
              {formatDate(order.created_at)}
            </p>
          </div>
          <OrderStatusBadge status={order.status} />
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
          <span className="text-sm text-muted">Total</span>
          <span className="font-semibold">{formatMoney(order.total_cents)}</span>
        </div>

        <p className="mt-2 text-xs text-muted">
          Payment: {order.payment_status}
        </p>
      </article>
    ))}
  </div>

  <Button
    variant="outline"
    className="mt-8"
    loading={logout.isPending}
    onClick={() => logout.mutate()}
  >
    <LogOut className="h-4 w-4" aria-hidden />
    Sign out
  </Button>
</section>

)
}


