import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, LayoutDashboard, LogOut, User as UserIcon } from 'lucide-react'
import { Skeleton } from '@/components/ui/Skeleton'
import { useAuth } from '../hooks/useAuth'

const ghostLink =
  'inline-flex h-9 items-center rounded-xl px-3 text-sm font-medium transition-colors hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent'
const primaryLink =
  'inline-flex h-9 items-center rounded-xl bg-accent px-4 text-sm font-medium text-accent-foreground shadow-soft transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent'
const menuItem =
  'flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm hover:bg-surface-muted focus-visible:bg-surface-muted focus-visible:outline-none'

export function UserMenu() {
  const { user, isLoading, logout } = useAuth()
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onPointer = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  if (isLoading) return <Skeleton className="h-9 w-24" />

  if (!user) {
    return (
      <div className="flex items-center gap-1">
        <Link to="/login" className={ghostLink}>
          Sign in
        </Link>
        <Link to="/register" className={`${primaryLink} hidden sm:inline-flex`}>
          Create account
        </Link>
      </div>
    )
  }

  const initials = user.name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex h-10 items-center gap-2 rounded-xl pl-1 pr-2 transition-colors hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        <span className="grid h-8 w-8 place-items-center rounded-full bg-accent text-xs font-semibold text-accent-foreground">
          {initials}
        </span>
        <span className="hidden max-w-[8rem] truncate text-sm font-medium sm:block">{user.name}</span>
        <ChevronDown className="h-4 w-4 text-muted" aria-hidden />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.14 }}
            className="absolute right-0 z-50 mt-2 w-64 rounded-2xl border border-border bg-surface p-1.5 shadow-lift"
          >
            <div className="px-3 py-2">
              <p className="truncate text-sm font-medium">{user.name}</p>
              <p className="truncate text-xs text-muted">{user.email}</p>
            </div>
            <div className="my-1 h-px bg-border" />
            <Link to="/account" role="menuitem" className={menuItem} onClick={() => setOpen(false)}>
              <UserIcon className="h-4 w-4" aria-hidden /> My account
            </Link>
            {user.is_staff && (
              <Link to="/admin" role="menuitem" className={menuItem} onClick={() => setOpen(false)}>
                <LayoutDashboard className="h-4 w-4" aria-hidden /> Admin dashboard
              </Link>
            )}
            <button
              type="button"
              role="menuitem"
              className={menuItem}
              disabled={logout.isPending}
              onClick={() => {
                setOpen(false)
                logout.mutate()
              }}
            >
              <LogOut className="h-4 w-4" aria-hidden /> Sign out
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}