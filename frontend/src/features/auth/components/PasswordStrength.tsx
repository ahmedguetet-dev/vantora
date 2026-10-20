import { Check, Circle } from 'lucide-react'
import { cn } from '@/lib/utils'

const CHECKS = [
  { label: '8+ characters', test: (p: string) => p.length >= 8 },
  { label: 'Lowercase letter', test: (p: string) => /[a-z]/.test(p) },
  { label: 'Uppercase letter', test: (p: string) => /[A-Z]/.test(p) },
  { label: 'Number', test: (p: string) => /[0-9]/.test(p) },
]

export function PasswordStrength({ password }: { password: string }) {
  if (!password) return null

  const score = CHECKS.filter((c) => c.test(password)).length
  const tone = score <= 1 ? 'bg-danger' : score < 4 ? 'bg-warning' : 'bg-success'

  return (
    <div className="space-y-2" aria-live="polite">
      <div className="flex gap-1.5" aria-hidden>
        {CHECKS.map((_, i) => (
          <span
            key={i}
            className={cn('h-1.5 flex-1 rounded-full transition-colors', i < score ? tone : 'bg-surface-muted')}
          />
        ))}
      </div>
      <ul className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
        {CHECKS.map((c) => {
          const ok = c.test(password)
          return (
            <li key={c.label} className={cn('flex items-center gap-1.5', ok ? 'text-success' : 'text-muted')}>
              {ok ? <Check className="h-3.5 w-3.5" aria-hidden /> : <Circle className="h-3.5 w-3.5" aria-hidden />}
              {c.label}
            </li>
          )
        })}
      </ul>
    </div>
  )
}