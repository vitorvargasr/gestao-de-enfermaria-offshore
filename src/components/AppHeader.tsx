import { SidebarTrigger } from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { useNavigate } from 'react-router-dom'

export function AppHeader() {
  const { signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/login', { replace: true })
  }

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b bg-white/50 backdrop-blur-sm px-4 dark:bg-slate-950/50">
      <div className="flex items-center gap-2">
        <SidebarTrigger />
        <div className="font-semibold text-lg ml-2">Enfermaria Marítima</div>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleSignOut}
        className="gap-2 text-muted-foreground hover:text-foreground"
      >
        <LogOut className="h-4 w-4" />
        <span className="hidden sm:inline">Sair</span>
      </Button>
    </header>
  )
}
