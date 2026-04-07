import { useState } from 'react'
import {
  Plus,
  PenTool,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Info,
  Calendar,
  Edit,
} from 'lucide-react'
import { format, isBefore, differenceInDays } from 'date-fns'
import { ptBR } from 'date-fns/locale'

import useMainStore, { Equipment, EquipmentStatus } from '@/stores/useMainStore'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'

export default function Equipments() {
  const { equipments, addEquipment, maintenanceLogs, addMaintenanceLog, updateEquipment } =
    useMainStore()

  const [isAddOpen, setIsAddOpen] = useState(false)
  const [newEq, setNewEq] = useState<Partial<Equipment>>({
    ownership: 'Own',
    status: 'Operational',
    location: 'Enfermaria',
  })

  const [selectedEq, setSelectedEq] = useState<Equipment | null>(null)
  const [isMaintenanceOpen, setIsMaintenanceOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [newLog, setNewLog] = useState({
    type: 'Calibration',
    description: '',
    cost: 0,
    performedBy: '',
  })

  const getCalibrationStatus = (nextCalibration: string) => {
    const next = new Date(nextCalibration)
    const today = new Date()
    const daysLeft = differenceInDays(next, today)

    if (daysLeft < 0)
      return {
        label: 'Vencida',
        color: 'text-red-600',
        bg: 'bg-red-100',
        icon: XCircle,
        blocked: true,
      }
    if (daysLeft <= 30)
      return {
        label: 'Atenção',
        color: 'text-amber-600',
        bg: 'bg-amber-100',
        icon: AlertCircle,
        blocked: false,
      }
    return {
      label: 'Em Dia',
      color: 'text-emerald-600',
      bg: 'bg-emerald-100',
      icon: CheckCircle2,
      blocked: false,
    }
  }

  const handleAddEquipment = () => {
    if (!newEq.name || !newEq.serialNumber || !newEq.nextCalibration) return

    addEquipment({
      name: newEq.name!,
      type: newEq.type || 'Geral',
      ownership: newEq.ownership as any,
      location: newEq.location as any,
      status: newEq.status as EquipmentStatus,
      serialNumber: newEq.serialNumber!,
      acquisitionDate: newEq.acquisitionDate || new Date().toISOString(),
      lastCalibration: newEq.lastCalibration || new Date().toISOString(),
      nextCalibration: newEq.nextCalibration!,
      supplier: newEq.supplier,
    })
    setIsAddOpen(false)
    setNewEq({ ownership: 'Own', status: 'Operational', location: 'Enfermaria' })
  }

  const handleAddMaintenance = () => {
    if (!selectedEq || !newLog.description) return

    addMaintenanceLog({
      equipmentId: selectedEq.id,
      date: new Date().toISOString(),
      type: newLog.type as any,
      description: newLog.description,
      cost: newLog.cost,
      performedBy: newLog.performedBy,
    })

    if (newLog.type === 'Substitution' || newLog.type === 'Repair') {
      updateEquipment(selectedEq.id, { status: 'Operational' })
    }

    setIsMaintenanceOpen(false)
    setNewLog({ type: 'Calibration', description: '', cost: 0, performedBy: '' })
    setSelectedEq(null)
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Equipamentos Médicos</h1>
          <p className="text-slate-500 mt-1">
            Gestão do ciclo de vida, calibração e manutenção dos ativos.
          </p>
        </div>

        <Dialog
          open={isAddOpen || isEditOpen}
          onOpenChange={(v) => {
            if (!v) {
              setIsAddOpen(false)
              setIsEditOpen(false)
              setNewEq({ ownership: 'Own', status: 'Operational', location: 'Enfermaria' })
            }
          }}
        >
          {!isEditOpen && (
            <DialogTrigger asChild>
              <Button className="gap-2" onClick={() => setIsAddOpen(true)}>
                <Plus className="w-4 h-4" />
                Novo Equipamento
              </Button>
            </DialogTrigger>
          )}
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {isEditOpen ? 'Editar Equipamento' : 'Adicionar Equipamento'}
              </DialogTitle>
              <DialogDescription>
                {isEditOpen
                  ? 'Altere os dados do equipamento.'
                  : 'Registre um novo ativo médico próprio ou alugado.'}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nome do Equipamento</Label>
                  <Input
                    placeholder="Ex: Desfibrilador..."
                    value={newEq.name || ''}
                    onChange={(e) => setNewEq({ ...newEq, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tipo/Categoria</Label>
                  <Input
                    placeholder="Ex: Suporte à Vida"
                    value={newEq.type || ''}
                    onChange={(e) => setNewEq({ ...newEq, type: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Número de Série</Label>
                  <Input
                    placeholder="SN..."
                    value={newEq.serialNumber || ''}
                    onChange={(e) => setNewEq({ ...newEq, serialNumber: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Propriedade</Label>
                  <Select
                    value={newEq.ownership}
                    onValueChange={(v) => setNewEq({ ...newEq, ownership: v as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Own">Próprio</SelectItem>
                      <SelectItem value="Rented">Alugado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {newEq.ownership === 'Rented' && (
                <div className="space-y-2">
                  <Label>Fornecedor (Aluguel)</Label>
                  <Input
                    placeholder="Nome da empresa..."
                    value={newEq.supplier || ''}
                    onChange={(e) => setNewEq({ ...newEq, supplier: e.target.value })}
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Próxima Calibração</Label>
                  <Input
                    type="date"
                    value={newEq.nextCalibration ? newEq.nextCalibration.split('T')[0] : ''}
                    onChange={(e) =>
                      setNewEq({
                        ...newEq,
                        nextCalibration: new Date(e.target.value).toISOString(),
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Localização</Label>
                  <Select
                    value={newEq.location}
                    onValueChange={(v) => setNewEq({ ...newEq, location: v as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Enfermaria">Enfermaria</SelectItem>
                      <SelectItem value="Ponte">Ponte</SelectItem>
                      <SelectItem value="Convés">Convés</SelectItem>
                      <SelectItem value="Casa de Máquinas">Casa de Máquinas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsAddOpen(false)
                  setIsEditOpen(false)
                  setNewEq({ ownership: 'Own', status: 'Operational', location: 'Enfermaria' })
                }}
              >
                Cancelar
              </Button>
              <Button
                onClick={() => {
                  if (isEditOpen && newEq.id) {
                    updateEquipment(newEq.id, newEq as Partial<Equipment>)
                    setIsEditOpen(false)
                    setNewEq({ ownership: 'Own', status: 'Operational', location: 'Enfermaria' })
                  } else {
                    handleAddEquipment()
                  }
                }}
              >
                Salvar Ativo
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {equipments.map((eq) => {
              const calStatus = getCalibrationStatus(eq.nextCalibration)
              const isBlocked = eq.status === 'Blocked' || calStatus.blocked

              return (
                <Card
                  key={eq.id}
                  className={cn(
                    'overflow-hidden transition-all duration-300',
                    isBlocked ? 'border-red-300 shadow-sm' : 'hover:shadow-md',
                  )}
                >
                  <CardHeader className="pb-3 border-b bg-slate-50/50">
                    <div className="flex justify-between items-start">
                      <div>
                        <Badge
                          variant={eq.ownership === 'Own' ? 'default' : 'secondary'}
                          className="mb-2"
                        >
                          {eq.ownership === 'Own' ? 'Próprio' : 'Alugado'}
                        </Badge>
                        <CardTitle className="text-lg leading-tight">{eq.name}</CardTitle>
                        <CardDescription className="mt-1">S/N: {eq.serialNumber}</CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-500 hover:text-slate-700"
                          onClick={() => {
                            setNewEq(eq)
                            setIsEditOpen(true)
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Badge
                          variant="outline"
                          className={cn(
                            'flex items-center gap-1',
                            calStatus.bg,
                            calStatus.color,
                            'border-transparent font-semibold',
                          )}
                        >
                          <calStatus.icon className="w-3.5 h-3.5" />
                          {calStatus.label}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="py-4 space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">Status</span>
                      <Badge
                        variant={
                          isBlocked
                            ? 'destructive'
                            : eq.status === 'Maintenance'
                              ? 'secondary'
                              : 'outline'
                        }
                        className={cn(
                          eq.status === 'Operational' &&
                            !isBlocked &&
                            'bg-emerald-50 text-emerald-700 border-emerald-200',
                          eq.status === 'Maintenance' &&
                            'bg-amber-50 text-amber-700 border-amber-200',
                        )}
                      >
                        {isBlocked
                          ? 'Bloqueado (Uso Proibido)'
                          : eq.status === 'Operational'
                            ? 'Operacional'
                            : 'Em Manutenção'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">Venc. Calibração</span>
                      <span className="font-medium flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {format(new Date(eq.nextCalibration), 'dd/MM/yyyy')}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">Localização</span>
                      <span className="font-medium">{eq.location}</span>
                    </div>
                    {eq.supplier && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500">Fornecedor</span>
                        <span className="font-medium text-blue-600">{eq.supplier}</span>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="pt-0 pb-4 px-4 border-t mt-auto">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full mt-3 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      onClick={() => {
                        setSelectedEq(eq)
                        setIsMaintenanceOpen(true)
                      }}
                    >
                      <PenTool className="w-4 h-4 mr-2" />
                      Registrar Manutenção/Calibração
                    </Button>
                  </CardFooter>
                </Card>
              )
            })}
          </div>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Info className="w-5 h-5 text-blue-500" />
                Resumo de Ativos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-2 border-b">
                  <span className="text-sm text-slate-500">Total de Equipamentos</span>
                  <span className="font-bold">{equipments.length}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b">
                  <span className="text-sm text-slate-500">Ativos Próprios</span>
                  <span className="font-medium">
                    {equipments.filter((e) => e.ownership === 'Own').length}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b">
                  <span className="text-sm text-slate-500">Ativos Alugados</span>
                  <span className="font-medium">
                    {equipments.filter((e) => e.ownership === 'Rented').length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-500">Atenção Necessária</span>
                  <Badge variant="destructive" className="font-bold">
                    {
                      equipments.filter(
                        (e) =>
                          differenceInDays(new Date(e.nextCalibration), new Date()) <= 30 ||
                          e.status === 'Blocked',
                      ).length
                    }
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Últimas Manutenções</CardTitle>
            </CardHeader>
            <CardContent className="px-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-6">Data</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Equipamento</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {maintenanceLogs.slice(0, 5).map((log) => {
                    const eq = equipments.find((e) => e.id === log.equipmentId)
                    return (
                      <TableRow key={log.id}>
                        <TableCell className="pl-6 text-xs text-slate-500 whitespace-nowrap">
                          {format(new Date(log.date), 'dd MMM yy', { locale: ptBR })}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5">
                            {log.type === 'Calibration'
                              ? 'Calibração'
                              : log.type === 'Repair'
                                ? 'Reparo'
                                : log.type === 'Substitution'
                                  ? 'Substit.'
                                  : 'Insp.'}
                          </Badge>
                        </TableCell>
                        <TableCell
                          className="text-xs font-medium truncate max-w-[120px]"
                          title={eq?.name}
                        >
                          {eq?.name || 'Desconhecido'}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                  {maintenanceLogs.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-sm text-slate-500 py-6">
                        Nenhum registro encontrado.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={isMaintenanceOpen} onOpenChange={setIsMaintenanceOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Intervenção</DialogTitle>
            <DialogDescription>
              {selectedEq?.name} (S/N: {selectedEq?.serialNumber})
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Tipo de Intervenção</Label>
              <Select value={newLog.type} onValueChange={(v) => setNewLog({ ...newLog, type: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Calibration">Calibração Periódica</SelectItem>
                  <SelectItem value="Repair">Reparo/Conserto</SelectItem>
                  <SelectItem value="Inspection">Inspeção Visual</SelectItem>
                  <SelectItem value="Substitution">Substituição de Peça</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Descrição Técnica</Label>
              <Textarea
                placeholder="Detalhes do serviço realizado..."
                value={newLog.description}
                onChange={(e) => setNewLog({ ...newLog, description: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Custo (R$)</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={newLog.cost || ''}
                  onChange={(e) => setNewLog({ ...newLog, cost: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label>Técnico / Empresa</Label>
                <Input
                  placeholder="Nome do responsável..."
                  value={newLog.performedBy}
                  onChange={(e) => setNewLog({ ...newLog, performedBy: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsMaintenanceOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddMaintenance}>Salvar Registro</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
