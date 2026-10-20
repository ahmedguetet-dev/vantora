import { Loader2 } from 'lucide-react'

export function PageSpinner() {
  return (
    <div className="grid min-h-[50vh] place-items-center" role="status" aria-live="polite">
      <Loader2 className="h-6 w-6 animate-spin text-muted" aria-hidden />
      <span className="sr-only">Loading</span>
    </div>
  )
}