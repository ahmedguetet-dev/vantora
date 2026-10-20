import axios, { AxiosError } from 'axios'

export const API_ORIGIN = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

export class ApiError extends Error {
  status: number
  errors?: Record<string, string[]>

  constructor(message: string, status: number, errors?: Record<string, string[]>) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.errors = errors
  }
}

export const api = axios.create({
  baseURL: `${API_ORIGIN}/api/v1`,
  withCredentials: true,
  withXSRFToken: true,
  headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
})

/** Call once before login/register so Laravel sets the XSRF cookie. */
export const fetchCsrfCookie = () =>
  axios.get(`${API_ORIGIN}/sanctum/csrf-cookie`, { withCredentials: true })

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string; errors?: Record<string, string[]> }>) => {
    if (!error.response) {
      return Promise.reject(new ApiError('Cannot reach the server. Check your connection.', 0))
    }
    const { status, data } = error.response
    return Promise.reject(new ApiError(data?.message ?? 'Something went wrong.', status, data?.errors))
  },
)