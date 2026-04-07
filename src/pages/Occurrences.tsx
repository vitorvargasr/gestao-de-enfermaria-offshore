import { useState } from 'react'
import useMainStore from '@/stores/useMainStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Plus, Clock, Calendar, AlertTriangle, BellRing } from 'lucide-react'
import { toast } from 'sonner'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'

export default function Occurrences() {
  const { occurrences, addOccurrence, networkStatus } = useMainStore()
  const [open, setOpen] = useState(false)
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [description, setDescription] = useState('')
  const [actions, setActions] = useState('')
  const [isEmergency, setIsEmergency] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    addOccurrence({ date, time, description, actions, isEmergency })

    if (isEmergency && networkStatus === 'Online') {
      toast('ALERTA DE EMERGÊNCIA CRÍTICA', {
        description: `Push Notification enviada para a administração: ${description}`,
        icon: <BellRing className="text-red-500" />,
        className: 'bg-red-50 border-red-200',
        duration: 8000,
      })
    } else {
      toast.success('Ocorrência registrada com sucesso.')
    }

    setOpen(false)
    setDate('')
    setTime('')
    setDescription('')
    setActions('')
    setIsEmergency(false)
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Registro de Ocorrências</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Documente incidentes ou envie alertas emergenciais.
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="shadow-sm">
              <Plus className="mr-2 h-5 w-5" /> Nova Ocorrência
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>Registrar Incidente</DialogTitle>
              <DialogDescription>
                Documente formalmente um incidente médico a bordo.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-5 pt-2">
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100">
                <div className="space-y-0.5">
                  <Label className="text-red-800 font-bold flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" /> Ocorrência de Emergência Crítica
                  </Label>
                  <p className="text-xs text-red-600/80">
                    Ativar enviará um Push Alert imediato para toda a administração.
                  </p>
                </div>
                <Switch checked={isEmergency} onCheckedChange={setIsEmergency} />
              </div>

              <div className="grid grid-cols-2 gap-6 bg-slate-50 p-4 rounded-lg border border-slate-100">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-500" /> Data
                  </Label>
                  <Input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-500" /> Hora
                  </Label>
                  <Input
                    type="time"
                    required
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="bg-white"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Descrição do Evento</Label>
                <Textarea
                  required
                  className="min-h-[100px] resize-none"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Descreva os detalhes do ocorrido..."
                />
              </div>
              <div className="space-y-2">
                <Label>Ações Tomadas</Label>
                <Textarea
                  required
                  className="min-h-[100px] resize-none"
                  value={actions}
                  onChange={(e) => setActions(e.target.value)}
                  placeholder="Descreva os procedimentos realizados e medicações administradas..."
                />
              </div>
              <Button
                type="submit"
                className={cn(
                  'w-full h-11 text-base mt-2',
                  isEmergency && 'bg-red-600 hover:bg-red-700',
                )}
              >
                {isEmergency ? 'Emitir Alerta Crítico' : 'Salvar Registro'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4 pt-2">
        {occurrences.map((o) => (
          <Card
            key={o.id}
            className={cn(
              'shadow-sm overflow-hidden border-l-4',
              o.isEmergency ? 'border-l-red-500' : 'border-l-blue-500',
            )}
          >
            <CardHeader
              className={cn('pb-3 border-b', o.isEmergency ? 'bg-red-50/30' : 'bg-slate-50/50')}
            >
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg text-slate-800 flex items-center gap-2">
                  {o.isEmergency ? (
                    <>
                      <AlertTriangle className="w-5 h-5 text-red-500" /> Emergência Crítica
                    </>
                  ) : (
                    'Incidente Formal'
                  )}
                </CardTitle>
                <CardDescription className="font-semibold text-slate-700 bg-white px-3 py-1 rounded-full border shadow-sm flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5" />
                  {o.date.split('-').reverse().join('/')} às {o.time}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="pt-5 grid md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <h4 className="font-semibold text-xs text-slate-500 uppercase tracking-widest bg-slate-100 px-2 py-1 rounded w-fit">
                  Descrição
                </h4>
                <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-md border border-slate-100 min-h-[80px]">
                  {o.description}
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-xs text-slate-500 uppercase tracking-widest bg-slate-100 px-2 py-1 rounded w-fit">
                  Ações Tomadas
                </h4>
                <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-md border border-slate-100 min-h-[80px]">
                  {o.actions}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
        {occurrences.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg border border-dashed">
            <p className="text-muted-foreground text-lg">Nenhuma ocorrência registrada.</p>
          </div>
        )}
      </div>
    </div>
  )
}
