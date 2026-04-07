import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Anchor, ShieldAlert } from 'lucide-react'
import { toast } from 'sonner'

export default function Login() {
  const [email, setEmail] = useState('vitorvargas@vvconsulting.com.br')
  const [password, setPassword] = useState('Skip@Pass')
  const [loading, setLoading] = useState(false)
  const { signIn, user, loading: authLoading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (user) {
      navigate('/')
    }
  }, [user, navigate])

  if (authLoading) return null

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { error } = await signIn(email, password)

    if (error) {
      toast.error('Acesso Negado', {
        description: 'Credenciais inválidas. Verifique seu email e senha.',
      })
    } else {
      toast.success('Login efetuado com sucesso', {
        description: 'Bem-vindo ao Poseidon Offshore.',
      })
      navigate('/')
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
      <div className="absolute inset-0 bg-[url('https://img.usecurling.com/p/1920/1080?q=ocean%20waves&color=blue')] opacity-5 bg-cover bg-center pointer-events-none" />

      <Card className="w-full max-w-md shadow-2xl border-slate-200 dark:border-slate-800 relative z-10 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm">
        <CardHeader className="space-y-3 text-center pb-6">
          <div className="mx-auto w-14 h-14 bg-slate-900 dark:bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-slate-500/20 dark:shadow-blue-500/20">
            <Anchor className="h-7 w-7 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Poseidon Offshore</CardTitle>
          <CardDescription className="text-base">Gestão de Enfermaria Marítima</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2 text-left">
              <Label htmlFor="email">Email Corporativo</Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nome@empresa.com"
                className="bg-white dark:bg-slate-950"
              />
            </div>
            <div className="space-y-2 text-left">
              <Label htmlFor="password">Senha de Acesso</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-white dark:bg-slate-950"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-slate-900 hover:bg-slate-800 text-white dark:bg-blue-600 dark:hover:bg-blue-700 h-11 text-base mt-2"
              disabled={loading}
            >
              {loading ? 'Autenticando e sincronizando...' : 'Acessar Painel'}
            </Button>
          </form>

          <div className="mt-8 flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg text-sm text-blue-800 dark:text-blue-300 border border-blue-100 dark:border-blue-900/50">
            <ShieldAlert className="h-5 w-5 shrink-0 text-blue-600 dark:text-blue-400 mt-0.5" />
            <p className="leading-relaxed">
              Acesso restrito a profissionais de saúde e tripulação autorizada. Todas as ações,
              prescrições e inspeções são registradas em log de auditoria via Skip Cloud.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
