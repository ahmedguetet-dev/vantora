import { motion } from 'framer-motion'
import { CheckCircle2, Database, Server, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { cn } from '@/lib/utils'
import { useHealth } from '../hooks/useHealth'

function StatusCard({ icon: Icon, label, ok, detail }: {
  icon: typeof Server
  label: string
  ok: boolean
  detail: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-border bg-surface p-5 shadow-soft transition-shadow hover:shadow-lift"
    >
      <div className="flex items-center justify-between">
        <Icon className="h-5 w-5 text-muted" aria-hidden />
        {ok ? (
          <CheckCircle2 className="h-5 w-5 text-success" aria-label="Healthy" />
        ) : (
          <XCircle className="h-5 w-5 text-danger" aria-label="Unhealthy" />
        )}
      </div>
      <p className="mt-4 font-medium">{label}</p>
      <p className={cn('text-sm', ok ? 'text-muted' : 'text-danger')}>{detail}</p>
    </motion.div>
  )
}

export function StatusPage() {
  const { data, isLoading, isError, error, refetch, isFetching } = useHealth()

  return (
    <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="text-4xl sm:text-5xl">Vantora is getting ready.</h1>
      <p className="mt-3 text-muted">Foundation check: frontend, API and database connectivity.</p>

      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        {isLoading && [0, 1, 2].map((i) => <Skeleton key={i} className="h-32" />)}

        {data && (
          <>
            <StatusCard icon={Server} label="Frontend" ok detail="React app running" />
            <StatusCard icon={Server} label="Laravel API" ok detail={`${data.app} \u00B7 ${data.environment}`} />
            <StatusCard
              icon={Database}
              label="MySQL"
              ok={data.database === 'up'}
              detail={data.database === 'up' ? 'Connected' : 'Connection failed'}
            />
          </>
        )}
      </div>

      {isError && (
        <div role="alert" className="mt-6 rounded-2xl border border-danger/30 bg-danger/5 p-5">
          <p className="font-medium text-danger">API unreachable</p>
          <p className="mt-1 text-sm text-muted">{error.message}</p>
          <Button className="mt-4" variant="outline" size="sm" loading={isFetching} onClick={() => refetch()}>
            Try again
          </Button>
        </div>
      )}
    </section>
  )
}