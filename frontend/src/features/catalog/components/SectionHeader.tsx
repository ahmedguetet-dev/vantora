import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

export function SectionHeader({
  title,
  subtitle,
  href,
  linkLabel = 'View all',
}: {
  title: string
  subtitle?: string
  href?: string
  linkLabel?: string
}) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4">
      <div>
        <h2 className="text-2xl sm:text-3xl">{title}</h2>
        <span aria-hidden className="mt-2 block h-0.5 w-8 rounded-full bg-accent" />
        {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
      </div>
      {href && (
        <Link
          to={href}
          className="group inline-flex shrink-0 items-center gap-1.5 rounded text-sm font-medium text-accent underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          {linkLabel}
          <ArrowRight className="h-4 w-4 transition-transform motion-safe:group-hover:translate-x-1" aria-hidden />
        </Link>
      )}
    </div>
  )
}