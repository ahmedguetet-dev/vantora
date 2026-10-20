import { ApiError } from '@/lib/api'

/** First field error when the API returned validation errors, otherwise the message. */
export function errorMessage(e: unknown): string {
  if (e instanceof ApiError) return Object.values(e.errors ?? {})[0]?.[0] ?? e.message
  return 'Something went wrong.'
}
export const fieldErrors = (e: unknown): Record<string, string> =>
  e instanceof ApiError
    ? Object.fromEntries(Object.entries(e.errors ?? {}).map(([k, v]) => [k, v[0]]))
    : {}

export const toCents = (v: string) => Math.round(parseFloat(v.replace(',', '.')) * 100)
export const fromCents = (c: number | null | undefined) => (c == null ? '' : (c / 100).toFixed(2))
export const fmtDate = (s: string) => new Date(s).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
