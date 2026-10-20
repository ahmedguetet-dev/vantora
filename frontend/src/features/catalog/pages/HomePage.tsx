import { motion } from 'framer-motion'
import { RotateCcw, ShieldCheck, Sparkles, Truck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Reveal } from '@/components/motion/Reveal'
import { buttonVariants } from '@/components/ui/buttonVariants'
import { ErrorState } from '@/components/ui/ErrorState'
import { Skeleton } from '@/components/ui/Skeleton'
import { SmartImage } from '@/components/ui/SmartImage'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { cn, formatMoney } from '@/lib/utils'
import type { ProductCardData } from '@/types/catalog'
import { ProductGrid, ProductGridSkeleton } from '../components/ProductGrid'
import { SectionHeader } from '../components/SectionHeader'
import { useHome } from '../hooks/useCatalog'

const PERKS = [
  { icon: Truck, title: 'Free shipping', text: 'On qualifying orders' },
  { icon: RotateCcw, title: '30-day returns', text: 'Changed your mind? No problem' },
  { icon: ShieldCheck, title: '2-year warranty', text: 'On everything we sell' },
  { icon: Sparkles, title: 'Curated range', text: 'Only products we would own' },
]

function HeroTiles({ products }: { products: ProductCardData[] }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      {products.map((p, i) => (
        <motion.div
          key={p.id}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 * i, duration: 0.4 }}
          className={cn(i % 2 === 1 && 'mt-8')}
        >
          <Link
            to={`/products/${p.slug}`}
            className="group relative block aspect-[4/5] overflow-hidden rounded-3xl border border-border shadow-lift transition-shadow duration-300 hover:shadow-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <SmartImage
              src={p.image}
              alt={p.name}
              eager
              className="h-full w-full transition-transform duration-700 ease-out motion-safe:group-hover:scale-105"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent p-4 pt-10 text-white">
              <p className="line-clamp-1 text-sm font-medium">{p.name}</p>
              <p className="text-xs opacity-80">{formatMoney(p.price_cents)}</p>
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  )
}

export function HomePage() {
  useDocumentTitle()
  const { data, isLoading, isError, refetch } = useHome()

  if (isError) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20">
        <ErrorState onRetry={() => refetch()} />
      </div>
    )
  }

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-accent/15 blur-3xl motion-safe:animate-float"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-32 -left-24 h-80 w-80 rounded-full bg-accent/10 blur-3xl"
        />
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:py-20">
          <div className="relative motion-safe:animate-fade-up">
            <p className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-medium shadow-soft">
              <span className="h-1.5 w-1.5 rounded-full bg-success" aria-hidden /> New season, new setup
            </p>
            <h1 className="mt-6 text-4xl leading-[1.05] sm:text-6xl lg:text-7xl">
              Considered goods for <span className="text-accent">modern living.</span>
            </h1>
            <p className="mt-5 max-w-md text-lg text-muted">
              Audio, wearables and desk gear chosen for how well they work and how long they last.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/products" className={buttonVariants({ size: 'lg' })}>
                Shop the collection
              </Link>
              <Link to="/products?on_sale=1" className={buttonVariants({ size: 'lg', variant: 'outline' })}>
                See deals
              </Link>
            </div>
            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted">
              <li className="flex items-center gap-2"><Truck className="h-4 w-4 text-accent" aria-hidden /> Fast delivery</li>
              <li className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-accent" aria-hidden /> Secure checkout</li>
              <li className="flex items-center gap-2"><RotateCcw className="h-4 w-4 text-accent" aria-hidden /> Easy returns</li>
            </ul>
          </div>

          {isLoading || !data ? (
            <div className="grid grid-cols-2 gap-4">
              {[0, 1, 2, 3].map((i) => (
                <Skeleton key={i} className={cn('aspect-[4/5] rounded-3xl', i % 2 === 1 && 'mt-8')} />
              ))}
            </div>
          ) : (
            <HeroTiles products={data.featured.slice(0, 4)} />
          )}
        </div>
      </section>

      {/* Categories */}
      <Reveal as="section" className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <SectionHeader title="Shop by category" subtitle="Find your next favourite thing" href="/products" />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {isLoading || !data
            ? Array.from({ length: 8 }, (_, i) => <Skeleton key={i} className="aspect-[4/3] rounded-2xl" />)
            : data.categories.map((c) => (
                <Link
                  key={c.id}
                  to={`/products?category=${c.slug}`}
                  className="group relative block aspect-[4/3] overflow-hidden rounded-2xl border border-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                  <SmartImage
                    src={c.image}
                    alt=""
                    className="h-full w-full transition-transform duration-700 ease-out motion-safe:group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent transition-opacity duration-300 group-hover:from-black/85" />
                  <div className="absolute inset-x-0 bottom-0 p-4 text-white transition-transform duration-300 motion-safe:group-hover:-translate-y-1">
                    <p className="font-medium">{c.name}</p>
                    <p className="text-xs opacity-80">{c.products_count} products</p>
                  </div>
                </Link>
              ))}
        </div>
      </Reveal>

      {/* Featured */}
      <Reveal as="section" className="mx-auto max-w-7xl px-4 pb-14 sm:px-6">
        <SectionHeader title="Featured" subtitle="Our most loved pieces right now" href="/products?sort=rating" />
        {isLoading || !data ? <ProductGridSkeleton count={4} /> : <ProductGrid products={data.featured.slice(0, 4)} />}
      </Reveal>

      {/* Perks */}
      <section className="border-y border-border bg-surface">
        <ul className="mx-auto grid max-w-7xl gap-6 px-4 py-10 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
          {PERKS.map(({ icon: Icon, title, text }, i) => (
            <Reveal as="li" key={title} delay={i * 0.07} className="group flex items-start gap-4">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-accent/10 text-accent transition-colors duration-300 group-hover:bg-accent group-hover:text-accent-foreground">
                <Icon className="h-5 w-5" aria-hidden />
              </span>
              <div>
                <p className="font-medium">{title}</p>
                <p className="text-sm text-muted">{text}</p>
              </div>
            </Reveal>
          ))}
        </ul>
      </section>

      {/* New arrivals */}
      <Reveal as="section" className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <SectionHeader title="New arrivals" subtitle="Just landed" href="/products?sort=newest" />
        {isLoading || !data ? (
          <ProductGridSkeleton count={4} />
        ) : (
          <ProductGrid products={data.new_arrivals.slice(0, 4)} />
        )}
      </Reveal>

      {/* Deals */}
      {data && data.deals.length > 0 && (
        <Reveal as="section" className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
          <SectionHeader title="Deals" subtitle="Limited-time prices" href="/products?on_sale=1" />
          <ProductGrid products={data.deals} />
        </Reveal>
      )}
    </>
  )
}
