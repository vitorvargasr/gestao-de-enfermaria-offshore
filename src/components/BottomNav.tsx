import { Home, Users, Activity, Pill, AlertTriangle, BotMessageSquare } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'

export function BottomNav() {
  const location = useLocation()
  const navItems = [
    { path: '/', icon: Home, label: 'Início' },
    { path: '/crew', icon: Users, label: 'Equipe' },
    { path: '/consultations', icon: Activity, label: 'Clínica' },
    { path: '/inventory', icon: Pill, label: 'Estoque' },
    { path: '/ai-assistant', icon: BotMessageSquare, label: 'IA' },
  ]

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t flex justify-around items-center p-1 z-50 h-16 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path
        return (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              'flex flex-col items-center justify-center w-full h-full rounded-xl transition-all duration-200',
              isActive ? 'text-primary' : 'text-slate-400 hover:text-slate-600',
            )}
          >
            <div className={cn('p-1 rounded-full mb-1', isActive && 'bg-primary/10')}>
              <item.icon className="h-5 w-5" />
            </div>
            <span className="text-[10px] font-medium leading-none">{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
