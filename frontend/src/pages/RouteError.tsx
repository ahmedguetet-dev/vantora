import { isRouteErrorResponse, useRouteError } from 'react-router-dom'
import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { NotFoundPage } from './NotFoundPage'

export function RouteError() {
  const error = useRouteError()

  if (isRouteErrorResponse(error) && error.status === 404) return <NotFoundPage />

  return (
    <section role="alert" className="mx-auto flex min-h-screen max-w-xl animate-fade-up flex-col items-center justify-center px-4 text-center">
      <AlertTriangle className="h-12 w-12 text-danger" aria-hidden />
      <h1 className="mt-4 text-3xl">Something went wrong</h1>
      <p className="mt-2 text-muted">An unexpected error occurred. Please try again.</p>
      <Button className="mt-8" onClick={() => window.location.reload()}>
        Reload page
      </Button>
    </section>
  )
}