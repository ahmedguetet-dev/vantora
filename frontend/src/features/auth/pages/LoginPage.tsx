import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { ApiError } from '@/lib/api'
import { AuthCard } from '../components/AuthCard'
import { useAuth } from '../hooks/useAuth'
import { loginSchema, type LoginValues } from '../schemas'
import { applyServerErrors } from '../utils'

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from ?? '/'

  const {
    register,
    handleSubmit,
    setError,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '', remember: false },
  })

  const onSubmit = handleSubmit(async (values) => {
    try {
      const user = await login.mutateAsync(values)
      toast.success(`Welcome back, ${user.name.split(' ')[0]}!`)
      navigate(from, { replace: true })
    } catch (error) {
      if (error instanceof ApiError && error.status === 422 && error.errors) {
        applyServerErrors(error, setError)
      } else {
        toast.error(error instanceof ApiError ? error.message : 'Something went wrong.')
      }
    }
  })

  return (
    <AuthCard
      title="Welcome back"
      subtitle="Sign in to track orders and check out faster."
      footer={
        <>
          New to Vantora?{' '}
          <Link to="/register" className="font-medium text-accent hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          error={errors.email?.message}
          {...register('email')}
        />
        <Input
          label="Password"
          type="password"
          autoComplete="current-password"
          error={errors.password?.message}
          {...register('password')}
        />

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" className="h-4 w-4 rounded border-border accent-accent" {...register('remember')} />
          Keep me signed in
        </label>

        <Button type="submit" size="lg" className="w-full" loading={isSubmitting}>
          Sign in
        </Button>

        {import.meta.env.DEV && (
          <button
            type="button"
            className="w-full text-center text-sm text-muted underline-offset-4 hover:text-foreground hover:underline"
            onClick={() => {
              setValue('email', 'customer@vantora.test')
              setValue('password', 'Password123!')
            }}
          >
            Fill in the demo account (development only)
          </button>
        )}
      </form>
    </AuthCard>
  )
}