import type { ReactNode } from 'react'
import { motion } from 'framer-motion'

/**
 * Fades and lifts content in once as it scrolls into view.
 * Only opacity/transform animate, so there is no layout shift.
 * `MotionConfig reducedMotion="user"` (see providers) strips the movement for users who prefer less.
 */
export function Reveal({
  children,
  delay = 0,
  y = 16,
  className,
  as = 'div',
}: {
  children: ReactNode
  delay?: number
  y?: number
  className?: string
  as?: 'div' | 'section' | 'li'
}) {
  const Tag = motion[as]
  return (
    <Tag
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -60px 0px' }}
      transition={{ duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </Tag>
  )
}
