import { Link } from 'react-router-dom'
import { buttonVariants } from '@/components/ui/buttonVariants'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

export function NotFoundPage() {
  useDocumentTitle('Page not found')

  return (
    <section className="mx-auto flex min-h-[60vh] max-w-xl animate-fade-up flex-col items-center justify-center px-4 text-center">
      <p className="font-display text-8xl text-accent">404</p>
      <h1 className="mt-4 text-3xl">This page wandered off</h1>
      <p className="mt-2 text-muted">The page you are looking for does not exist or has moved.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link to="/" className={buttonVariants({ size: 'lg' })}>
          Back to the store
        </Link>
        <Link to="/products" className={buttonVariants({ size: 'lg', variant: 'outline' })}>
          Browse products
        </Link>
      </div>
    </section>
  )
}
