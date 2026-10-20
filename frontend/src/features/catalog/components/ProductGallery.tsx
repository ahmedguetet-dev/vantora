import { useState, type KeyboardEvent, type MouseEvent } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { SmartImage } from '@/components/ui/SmartImage'
import { cn } from '@/lib/utils'

const arrow =
  'absolute top-1/2 z-10 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-border bg-surface/90 shadow-soft backdrop-blur transition motion-safe:hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent'

export function ProductGallery({ images, name }: { images: { url: string; alt: string | null }[]; name: string }) {
  const [index, setIndex] = useState(0)
  const [origin, setOrigin] = useState('50% 50%')
  const count = images.length
  const current = images[index]
  const go = (next: number) => setIndex((next + count) % count)

  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    setOrigin(`${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`)
  }
  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (count < 2) return
    if (e.key === 'ArrowLeft') go(index - 1)
    if (e.key === 'ArrowRight') go(index + 1)
  }

  return (
    <div className="space-y-4">
      <div
        className="group relative aspect-square overflow-hidden rounded-2xl border border-border bg-surface-muted"
        onMouseMove={onMove}
        onKeyDown={onKey}
        tabIndex={count > 1 ? 0 : undefined}
        role="group"
        aria-roledescription="carousel"
        aria-label={`${name} images`}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={current?.url ?? 'empty'}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div
              className="h-full w-full transition-transform duration-300 ease-out motion-safe:group-hover:scale-[1.6] motion-safe:md:cursor-zoom-in"
              style={{ transformOrigin: origin }}
            >
              <SmartImage src={current?.url ?? null} alt={current?.alt ?? name} className="h-full w-full" eager />
            </div>
          </motion.div>
        </AnimatePresence>

        {count > 1 && (
          <>
            <button type="button" aria-label="Previous image" onClick={() => go(index - 1)} className={cn(arrow, 'left-3')}>
              <ChevronLeft className="h-5 w-5" aria-hidden />
            </button>
            <button type="button" aria-label="Next image" onClick={() => go(index + 1)} className={cn(arrow, 'right-3')}>
              <ChevronRight className="h-5 w-5" aria-hidden />
            </button>
            <p className="absolute bottom-3 right-3 rounded-full bg-black/55 px-2.5 py-1 text-xs font-medium text-white" aria-live="polite">
              {index + 1} / {count}
            </p>
          </>
        )}
      </div>

      {count > 1 && (
        <ul className="grid grid-cols-4 gap-3">
          {images.map((image, i) => (
            <li key={image.url}>
              <button
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Show image ${i + 1} of ${count}`}
                aria-current={i === index}
                className={cn(
                  'block aspect-square w-full overflow-hidden rounded-xl border-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
                  i === index ? 'border-accent' : 'border-transparent opacity-70 hover:opacity-100',
                )}
              >
                <SmartImage src={image.url} alt="" className="h-full w-full" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
