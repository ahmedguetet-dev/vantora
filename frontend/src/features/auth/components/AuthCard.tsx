import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

interface AuthCardProps {
  title: string
  subtitle: string
  children: ReactNode
  footer: ReactNode
}

export function AuthCard({ title, subtitle, children, footer }: AuthCardProps) {
  return (
    <section className="relative mx-auto flex min-h-[calc(100vh-10rem)] max-w-md items-center px-4 py-12">
      <div aria-hidden className="pointer-events-none absolute left-1/2 top-1/4 -z-10 h-72 w-72 -translate-x-1/2 rounded-full bg-accent/15 blur-3xl" />
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="w-full rounded-2xl border border-border bg-surface p-6 shadow-lift sm:p-8"
      >
        <Link
          to="/"
          aria-label="Vantora home"
          className="mb-6 grid h-10 w-10 place-items-center rounded-xl bg-accent font-display text-xl text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
        >
          V
        </Link>
        <h1 className="text-3xl">{title}</h1>
        <p className="mt-2 text-sm text-muted">{subtitle}</p>
        <div className="mt-6">{children}</div>
        <div className="mt-6 text-center text-sm text-muted">{footer}</div>
      </motion.div>
    </section>
  )
}
