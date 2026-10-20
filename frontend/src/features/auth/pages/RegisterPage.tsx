import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { ApiError } from '@/lib/api'
import { AuthCard } from '../components/AuthCard'
import { PasswordStrength } from '../components/PasswordStrength'
import { useAuth } from '../hooks/useAuth'
import { registerSchema, type RegisterValues } from '../schemas'
import { applyServerErrors } from '../utils'

export function RegisterPage() {
  const auth = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from ?? '/'

  const {
    register,
    handleSubmit,
    setError,
    control,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      password_confirmation: '',
    },
  })

  const password = useWatch({
    control,
    name: 'password',
    defaultValue: '',
  })

  const onSubmit = handleSubmit(async (values) => {
    try {
      const user = await auth.register.mutateAsync(values)

      toast.success(`Welcome to Vantora, ${user.name.split(' ')[0]}!`)
      navigate(from, { replace: true })
    } catch (error) {
      if (error instanceof ApiError && error.status === 422 && error.errors) {
        applyServerErrors(error, setError)
      } else {
        toast.error(
          error instanceof ApiError
            ? error.message
            : 'Something went wrong.',
        )
      }
    }
  })

  return (
    <AuthCard
      title="Create your account"
      subtitle="Save your wishlist, addresses and order history."
      footer={
        <>
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-medium text-accent hover:underline"
          >
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        <Input
          label="Full name"
          autoComplete="name"
          error={errors.name?.message}
          {...register('name')}
        />

        <Input
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          error={errors.email?.message}
          {...register('email')}
        />

        <div className="space-y-3">
          <Input
            label="Password"
            type="password"
            autoComplete="new-password"
            error={errors.password?.message}
            {...register('password')}
          />

          <PasswordStrength password={password} />
        </div>

        <Input
          label="Confirm password"
          type="password"
          autoComplete="new-password"
          error={errors.password_confirmation?.message}
          {...register('password_confirmation')}
        />

        <Button
          type="submit"
          size="lg"
          className="w-full"
          loading={isSubmitting}
        >
          Create account
        </Button>
      </form>
    </AuthCard>
  )
}