import { Link, Outlet, useLocation } from 'react-router-dom'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from '@/components/ui/sidebar'
import {
  Activity,
  Box,
  Clipboard,
  LayoutDashboard,
  QrCode,
  Settings,
  ShieldAlert,
  HeartPulse,
  Users,
  AlertTriangle,
  FileText,
  BarChart3,
  BotMessageSquare,
  Stethoscope,
  ClipboardCheck,
  FileBadge,
} from 'lucide-react'
import medGroupLogo from '@/assets/logo-b4757.jpg'
import { AppHeader } from '@/components/AppHeader'
import { useAuth } from '@/hooks/use-auth'

export default function Layout() {
  const location = useLocation()
  const { user } = useAuth()
  const userRole = (user as any)?.role || ''

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/' },
    { icon: Users, label: 'Tripulação', href: '/crew' },
    { icon: Activity, label: 'Consultas', href: '/consultations' },
    { icon: Box, label: 'Gestão de Estoque', href: '/inventory' },
    { icon: ClipboardCheck, label: 'Auditorias', href: '/audits' },
    { icon: Stethoscope, label: 'Equipamentos', href: '/equipments' },
    { icon: AlertTriangle, label: 'Ocorrências', href: '/occurrences' },
    ...(userRole === 'admin' || userRole === 'certifier'
      ? [{ icon: FileBadge, label: 'Medical Chest', href: '/medical-chest' }]
      : []),
    { icon: FileText, label: 'Relatórios', href: '/reports' },
    { icon: BarChart3, label: 'Painel BI', href: '/bi' },
    { icon: QrCode, label: 'Scanner QR', href: '/scanner' },
    { icon: BotMessageSquare, label: 'Assistente IA', href: '/ai-assistant' },
  ]

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <Sidebar className="border-r">
          <SidebarHeader className="border-b p-4">
            <div className="flex items-center gap-2">
              <HeartPulse className="h-6 w-6 text-primary" />
              <span className="font-bold text-lg text-primary">International Health Care</span>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navItems.map((item) => (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        asChild
                        isActive={
                          location.pathname === item.href ||
                          (item.href !== '/' && location.pathname.startsWith(item.href))
                        }
                        tooltip={item.label}
                      >
                        <Link to={item.href}>
                          <item.icon className="h-4 w-4" />
                          <span>{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter className="border-t p-5 flex flex-col items-center justify-center gap-3 bg-muted/10">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
              Desenvolvido por
            </span>
            <a
              href="https://www.medgroupdistribuidora.com.br"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-all duration-300 hover:opacity-80 hover:scale-[1.02]"
            >
              <img
                src={medGroupLogo}
                alt="MedGroup Distribuidora"
                className="h-10 object-contain mix-blend-multiply dark:mix-blend-screen opacity-90 rounded"
              />
            </a>
          </SidebarFooter>
        </Sidebar>
        <main className="flex-1 flex flex-col h-screen overflow-hidden bg-slate-50 dark:bg-zinc-950">
          <AppHeader />
          <div className="flex-1 overflow-y-auto p-4 md:p-8">
            <div className="mx-auto w-full max-w-7xl h-full">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}
