import { useEffect, useRef, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from './Button'

export function Drawer({
  open,
  onClose,
  title,
  side = 'left',
  children,
}: {
  open: boolean
  onClose: () => void
  title: string
  side?: 'left' | 'right'
  children: ReactNode
}) {
  const panelRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!open) return
    const previouslyFocused = document.activeElement as HTMLElement | null
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') return onClose()
      if (e.key !== 'Tab' || !panelRef.current) return
      const items = panelRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      )
      if (items.length === 0) return
      const first = items[0]
      const last = items[items.length - 1]
      const active = document.activeElement
      if (e.shiftKey && (active === first || active === panelRef.current)) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && active === last) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    panelRef.current?.focus()

    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
      previouslyFocused?.focus()
    }
  }, [open, onClose])

  const offscreen = side === 'left' ? '-100%' : '100%'

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="overlay"
          aria-hidden
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        />
      )}
      {open && (
        <motion.aside
          key="panel"
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label={title}
          tabIndex={-1}
          className={cn(
            'fixed inset-y-0 z-50 flex w-[88%] max-w-sm flex-col bg-background shadow-lift focus:outline-none',
            side === 'left' ? 'left-0' : 'right-0',
          )}
          initial={{ x: offscreen }}
          animate={{ x: 0 }}
          exit={{ x: offscreen }}
          transition={{ type: 'spring', damping: 32, stiffness: 340, mass: 0.9 }}
        >
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h2 className="font-sans text-base font-semibold tracking-normal">{title}</h2>
            <Button variant="ghost" size="icon" onClick={onClose} aria-label={`Close ${title}`}>
              <X className="h-5 w-5" />
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto p-5">{children}</div>
        </motion.aside>
      )}
    </AnimatePresence>
  )
}