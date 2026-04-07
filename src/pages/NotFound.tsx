import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center space-y-4">
      <h1 className="text-6xl font-bold text-slate-800">404</h1>
      <p className="text-xl text-muted-foreground">Página não encontrada.</p>
      <Button asChild size="lg" className="mt-4">
        <Link to="/">Voltar ao Início</Link>
      </Button>
    </div>
  )
}
