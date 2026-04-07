import { useEffect } from 'react'
import { useNavigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { Loader2 } from 'lucide-react'
import pb from '@/lib/pocketbase/client'

export function AuthGuard() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login', { replace: true })
    }
  }, [loading, user, navigate])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-4 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="font-medium">Conectando ao sistema...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return <Outlet />
}
