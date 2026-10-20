import { formatMoney } from '@/lib/utils'
import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, CheckCircle2, MapPin, ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { buttonVariants } from '@/components/ui/buttonVariants'
import { Input } from '@/components/ui/Input'
import { ErrorState } from '@/components/ui/ErrorState'
import { PageSpinner } from '@/components/ui/PageSpinner'
import { useCart } from '@/features/cart/hooks/useCart'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { checkoutApi, type AddressPayload } from './api'

const initialAddress: AddressPayload = {
  label: 'Home',
  full_name: '',
  line1: '',
  line2: '',
  city: '',
  region: '',
  postal_code: '',
  country: 'TN',
  phone: '',
  is_default: true,
}

export function CheckoutPage() {
  useDocumentTitle('Checkout')
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const { cart, isLoading: cartLoading, isError: cartError, refetch } = useCart()

  const [addressId, setAddressId] = useState<number | ''>('')
  const [addingAddress, setAddingAddress] = useState(false)
  const [address, setAddress] = useState<AddressPayload>(initialAddress)
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')

  const addressesQuery = useQuery({
    queryKey: ['addresses'],
    queryFn: checkoutApi.addresses,
  })

  const createAddress = useMutation({
    mutationFn: checkoutApi.createAddress,
    onSuccess: async (created) => {
      await queryClient.invalidateQueries({ queryKey: ['addresses'] })
      setAddressId(created.id)
      setAddingAddress(false)
      setAddress(initialAddress)
      setError('')
    },
    onError: (err: Error) => setError(err.message),
  })

  const placeOrder = useMutation({
    mutationFn: () => {
      if (addressId === '') throw new Error('Please choose a delivery address.')
      return checkoutApi.placeOrder(addressId, notes)
    },
    onSuccess: async (order) => {
      await queryClient.invalidateQueries({ queryKey: ['cart', 'server'] })
      await queryClient.invalidateQueries({ queryKey: ['addresses'] })
      navigate('/account', {
        state: {
          orderPlaced: true,
          orderId: order.id,
          orderNumber: order.order_number,
        },
      })
    },
    onError: (err: Error) => setError(err.message),
  })

  if (!user) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="text-3xl">Sign in to checkout</h1>
        <Link to="/login" className={`${buttonVariants({ size: 'lg' })} mt-6`}>
          Sign in
        </Link>
      </section>
    )
  }

  if (cartLoading || addressesQuery.isLoading) return <PageSpinner />

  if (cartError) return <ErrorState onRetry={() => refetch()} />

  if (addressesQuery.isError) {
    return <ErrorState onRetry={() => addressesQuery.refetch()} />
  }

  if (cart.items.length === 0) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-16 text-center">
        <ShoppingBag className="mx-auto h-10 w-10 text-muted" />
        <h1 className="mt-4 text-3xl">Your cart is empty</h1>
        <Link to="/products" className={`${buttonVariants({ size: 'lg' })} mt-6`}>
          Browse products
        </Link>
      </section>
    )
  }

  const addresses = addressesQuery.data ?? []

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <Link to="/cart" className="inline-flex items-center gap-2 text-sm text-muted hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to cart
      </Link>

      <h1 className="mt-5 text-3xl sm:text-4xl">Checkout</h1>
      <p className="mt-2 text-sm text-muted">Choose where you want your order delivered.</p>

      <div className="mt-8 grid items-start gap-8 lg:grid-cols-[1fr_22rem]">
        <section className="space-y-6">
          <div className="rounded-2xl border border-border bg-surface p-5 shadow-soft sm:p-6">
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <MapPin className="h-5 w-5" /> Delivery address
            </h2>

            {addresses.length > 0 && !addingAddress && (
              <div className="mt-5 space-y-3">
                {addresses.map((item) => (
                  <label
                    key={item.id}
                    className={`relative flex cursor-pointer gap-3 rounded-xl border p-4 transition-all duration-200 focus-within:ring-2 focus-within:ring-accent ${
                      addressId === item.id
                        ? 'border-accent bg-accent/5 shadow-soft'
                        : 'border-border hover:border-accent/40 hover:bg-surface-muted/60'
                    }`}
                  >
                    <input
                      type="radio"
                      name="address"
                      checked={addressId === item.id}
                      onChange={() => setAddressId(item.id)}
                      className="mt-1"
                    />
                    <span className="min-w-0 text-sm">
                      <span className="block font-semibold">
                        {item.label} {item.is_default && '· Default'}
                      </span>
                      <span className="mt-1 block">{item.full_name}</span>
                      <span className="block text-muted">
                        {item.line1}{item.line2 ? `, ${item.line2}` : ''}
                      </span>
                      <span className="block text-muted">
                        {item.city}{item.region ? `, ${item.region}` : ''} · {item.country}
                      </span>
                      <span className="block text-muted">{item.phone}</span>
                    </span>
                    {addressId === item.id && (
                      <CheckCircle2 className="absolute right-4 top-4 h-5 w-5 text-accent" aria-hidden />
                    )}
                  </label>
                ))}
              </div>
            )}

            {addresses.length === 0 && !addingAddress && (
              <p className="mt-4 text-sm text-muted">You haven't saved a delivery address yet.</p>
            )}

            {!addingAddress && (
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setAddingAddress(true)}
              >
                + Add a new address
              </Button>
            )}

            {addingAddress && (
              <form
                className="mt-5 space-y-4"
                onSubmit={(event) => {
                  event.preventDefault()
                  setError('')
                  createAddress.mutate(address)
                }}
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input label="Address label" required value={address.label}
                    onChange={(e) => setAddress({ ...address, label: e.target.value })} />
                  <Input label="Full name" required value={address.full_name}
                    onChange={(e) => setAddress({ ...address, full_name: e.target.value })} />
                  <Input label="Address line 1" required value={address.line1}
                    onChange={(e) => setAddress({ ...address, line1: e.target.value })} />
                  <Input label="Address line 2 (optional)" value={address.line2 ?? ''}
                    onChange={(e) => setAddress({ ...address, line2: e.target.value })} />
                  <Input label="City" required value={address.city}
                    onChange={(e) => setAddress({ ...address, city: e.target.value })} />
                  <Input label="Region (optional)" value={address.region ?? ''}
                    onChange={(e) => setAddress({ ...address, region: e.target.value })} />
                  <Input label="Postal code (optional)" value={address.postal_code ?? ''}
                    onChange={(e) => setAddress({ ...address, postal_code: e.target.value })} />
                  <Input label="Country code (2 letters)" required minLength={2} maxLength={2}
                    value={address.country}
                    onChange={(e) => setAddress({ ...address, country: e.target.value.toUpperCase() })} />
                  <Input label="Phone" required type="tel" value={address.phone}
                    onChange={(e) => setAddress({ ...address, phone: e.target.value })} />
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button type="submit" loading={createAddress.isPending}>Save address</Button>
                  <Button type="button" variant="outline" onClick={() => setAddingAddress(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            )}
          </div>

          <div className="rounded-2xl border border-border bg-surface p-5 shadow-soft sm:p-6">
            <h2 className="text-lg font-semibold">Payment</h2>
            <p className="mt-2 text-sm text-muted">Cash on delivery (COD)</p>
            <p className="mt-1 text-xs text-muted">Pay when your order arrives.</p>
          </div>

          <div className="rounded-2xl border border-border bg-surface p-5 shadow-soft sm:p-6">
            <label htmlFor="order-notes" className="text-sm font-semibold">Order notes (optional)</label>
            <textarea
              id="order-notes"
              rows={3}
              maxLength={1000}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any delivery instructions?"
              className="mt-2 w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            />
          </div>
        </section>

        <aside className="rounded-2xl border border-border bg-surface p-6 shadow-soft lg:sticky lg:top-24">
          <h2 className="text-lg font-semibold">Order summary</h2>
          <ul className="mt-5 divide-y divide-border">
            {cart.items.map((item) => (
              <li key={item.product_id} className="flex justify-between gap-4 py-3 text-sm">
                <span className="min-w-0">
                  {item.product.name} <span className="text-muted">× {item.quantity}</span>
                </span>
                <span className="shrink-0 font-medium">{formatMoney(item.line_total_cents)}</span>
              </li>
            ))}
          </ul>

          <dl className="mt-4 space-y-3 border-t border-border pt-4 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="text-muted">Subtotal</dt><dd>{formatMoney(cart.totals.subtotal_cents)}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted">Shipping</dt><dd>{cart.totals.shipping_cents === 0 ? 'Free' : formatMoney(cart.totals.shipping_cents)}</dd>
            </div>
            {cart.totals.tax_cents > 0 && (
              <div className="flex justify-between gap-3">
                <dt className="text-muted">Tax</dt><dd>{formatMoney(cart.totals.tax_cents)}</dd>
              </div>
            )}
            {cart.totals.discount_cents > 0 && (
              <div className="flex justify-between gap-3">
                <dt className="text-muted">Discount</dt><dd>-{formatMoney(cart.totals.discount_cents)}</dd>
              </div>
            )}
            <div className="flex justify-between gap-3 border-t border-border pt-4 text-base font-semibold">
              <dt>Total</dt><dd>{formatMoney(cart.totals.total_cents)}</dd>
            </div>
          </dl>

          {error && <p role="alert" className="mt-4 rounded-xl bg-danger/10 p-3 text-sm text-danger">{error}</p>}

          <Button
            className="mt-6 w-full"
            size="lg"
            loading={placeOrder.isPending}
            disabled={addressId === '' || addingAddress || placeOrder.isPending}
            onClick={() => {
              setError('')
              placeOrder.mutate()
            }}
          >
            <CheckCircle2 className="h-4 w-4" /> Place order
          </Button>
          <p className="mt-3 text-center text-xs text-muted">Review your delivery address before confirming.</p>
        </aside>
      </div>
    </div>
  )
}


