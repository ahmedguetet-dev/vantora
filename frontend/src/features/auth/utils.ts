import type { FieldValues, Path, UseFormSetError } from 'react-hook-form'
import type { ApiError } from '@/lib/api'

/** Copies Laravel 422 field errors onto the matching react-hook-form fields. */
export function applyServerErrors<T extends FieldValues>(error: ApiError, setError: UseFormSetError<T>) {
  Object.entries(error.errors ?? {}).forEach(([field, messages]) => {
    setError(field as Path<T>, { type: 'server', message: messages[0] })
  })
}