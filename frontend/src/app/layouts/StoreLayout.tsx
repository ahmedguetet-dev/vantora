import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowUp, Heart, Menu, User } from 'lucide-react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Drawer } from '@/components/ui/Drawer'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { UserMenu } from '@/features/auth/components/UserMenu'
import { useCategories } from '@/features/catalog/hooks/useCatalog'
import { SearchForm } from './SearchForm'
import { CartButton } from '@/features/cart/components/CartButton'
import { CartDrawer } from '@/features/cart/components/CartDrawer'
import { CartSync } from '@/features/cart/components/CartSync'
import { WishlistLink } from '@/features/wishlist/components/WishlistLink'
import { cn } from '@/lib/utils'

const CURRENT_YEAR = new Date().getFullYear()

const NAV = [
  { to: '/products', label: 'Shop', match: (p: string, q: string) => p === '/products' && !q },
  { to: '/products?sort=newest', label: 'New arrivals', match: (p: string, q: string) => p === '/products' && q.includes('sort=newest') },
  { to: '/products?on_sale=1', label: 'Deals', match: (p: string, q: string) => p === '/products' && q.includes('on_sale=1') },
]

const navLink =
  'rounded-xl px-3 py-2 text-sm font-medium text-muted transition-colors hover:bg-surface-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent'
const footLink =
  'rounded text-muted transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent'

function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}

/** Gentle fade/lift when the route changes. Query-string changes (filters, pages) do not re-trigger it. */
function PageTransition() {
  const { pathname } = useLocation()

  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: 'easeOut' }}
    >
      <Outlet />
    </motion.div>
  )
}

export function StoreLayout() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [showTop, setShowTop] = useState(false)
  const { data: categories = [] } = useCategories()
  const { user } = useAuth()
  const { pathname, search } = useLocation()
  const close = () => setMenuOpen(false)

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 8)
      setShowTop(window.scrollY > 800)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="flex min-h-screen flex-col">
      <ScrollToTop />
      <CartSync />
      <CartDrawer />

      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-xl focus:bg-accent focus:px-4 focus:py-2 focus:text-accent-foreground"
      >
        Skip to content
      </a>

      <header
        className={cn(
          'sticky top-0 z-40 border-b bg-background/80 backdrop-blur-xl transition-[border-color,box-shadow] duration-300',
          scrolled ? 'border-border shadow-soft' : 'border-transparent',
        )}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-2 px-4 sm:gap-4 sm:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            aria-label="Open menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>

          <Link to="/" className="group flex items-center gap-2 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent" aria-label="Vantora home">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-accent font-display text-lg text-accent-foreground transition-transform duration-300 motion-safe:group-hover:-rotate-6 motion-safe:group-hover:scale-110">
              V
            </span>
            <span className="font-display text-xl font-semibold tracking-tight">Vantora</span>
          </Link>

          <nav className="ml-4 hidden items-center gap-1 lg:flex" aria-label="Primary">
            {NAV.map((item) => {
              const active = item.match(pathname, search)
              return (
                <Link
                  key={item.label}
                  to={item.to}
                  aria-current={active ? 'page' : undefined}
                  className={cn(navLink, 'relative', active && 'text-foreground')}
                >
                  {item.label}
                  {active && (
                    <motion.span
                      layoutId="nav-underline"
                      className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-accent"
                      transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                    />
                  )}
                </Link>
              )
            })}
          </nav>

          <div className="flex-1" />

          <SearchForm className="hidden w-64 md:block lg:w-72" />

          <div className="flex items-center gap-1">
            <WishlistLink />
            <CartButton />
            <ThemeToggle />
            <UserMenu />
          </div>
        </div>
      </header>

      <Drawer open={menuOpen} onClose={close} title="Menu">
        <SearchForm onDone={close} />

        <nav aria-label="Mobile" className="mt-6 flex flex-col">
          {NAV.map((item) => (
            <Link key={item.label} to={item.to} onClick={close} className={`${navLink} py-3 text-base`}>
              {item.label}
            </Link>
          ))}
          <Link to="/wishlist" onClick={close} className={`${navLink} flex items-center gap-2 py-3 text-base`}>
            <Heart className="h-4 w-4" aria-hidden /> Wishlist
          </Link>
          {user && (
            <Link to="/account" onClick={close} className={`${navLink} flex items-center gap-2 py-3 text-base`}>
              <User className="h-4 w-4" aria-hidden /> My account
            </Link>
          )}
        </nav>

        {categories.length > 0 && (
          <>
            <p className="mb-2 mt-8 px-3 text-xs font-semibold uppercase tracking-wide text-muted">Categories</p>

            <ul className="flex flex-col">
              {categories.map((c) => (
                <li key={c.id}>
                  <Link to={`/products?category=${c.slug}`} onClick={close} className={`${navLink} block py-2.5`}>
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </Drawer>

      <main id="main" className="flex-1">
        <PageTransition />
      </main>

      <footer className="border-t border-border bg-surface">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <Link to="/" className="inline-flex items-center gap-2 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-accent font-display text-lg text-accent-foreground">V</span>
              <span className="font-display text-xl font-semibold">Vantora</span>
            </Link>
            <p className="mt-3 max-w-xs text-sm text-muted">Considered goods for modern living.</p>
            <p className="mt-4 inline-flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-xs text-muted">
              <span className="h-1.5 w-1.5 rounded-full bg-success" aria-hidden /> Pay on delivery available
            </p>
          </div>

          <nav aria-label="Footer shop">
            <p className="text-sm font-semibold">Shop</p>
            <ul className="mt-4 space-y-2.5 text-sm">
              {NAV.map((item) => (
                <li key={item.label}>
                  <Link to={item.to} className={footLink}>{item.label}</Link>
                </li>
              ))}
              {categories.slice(0, 3).map((c) => (
                <li key={c.id}>
                  <Link to={`/products?category=${c.slug}`} className={footLink}>{c.name}</Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Footer account">
            <p className="text-sm font-semibold">Account</p>
            <ul className="mt-4 space-y-2.5 text-sm">
              {user ? (
                <>
                  <li><Link to="/account" className={footLink}>My account</Link></li>
                  <li><Link to="/wishlist" className={footLink}>Wishlist</Link></li>
                  <li><Link to="/cart" className={footLink}>Cart</Link></li>
                </>
              ) : (
                <>
                  <li><Link to="/login" className={footLink}>Sign in</Link></li>
                  <li><Link to="/register" className={footLink}>Create account</Link></li>
                  <li><Link to="/cart" className={footLink}>Cart</Link></li>
                </>
              )}
            </ul>
          </nav>
        </div>

        <div className="border-t border-border py-5 text-center text-xs text-muted">
          &copy; {CURRENT_YEAR} Vantora. All rights reserved.
        </div>
      </footer>

      <motion.button
        type="button"
        aria-label="Back to top"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        initial={false}
        animate={{ opacity: showTop ? 1 : 0, y: showTop ? 0 : 12, pointerEvents: showTop ? 'auto' : 'none' }}
        tabIndex={showTop ? 0 : -1}
        className="fixed bottom-5 left-5 z-30 grid h-11 w-11 place-items-center rounded-full border border-border bg-surface shadow-lift transition-colors hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        <ArrowUp className="h-4 w-4" aria-hidden />
      </motion.button>
    </div>
  )
}
