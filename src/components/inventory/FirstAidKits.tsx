import { useState, useEffect } from 'react'
import pb from '@/lib/pocketbase/client'
import { extractFieldErrors, type FieldErrors } from '@/lib/pocketbase/errors'
import { useRealtime } from '@/hooks/use-realtime'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import {
  Plus,
  AlertTriangle,
  CheckCircle2,
  QrCode,
  FileText,
  RefreshCw,
  ClipboardList,
  MapPin,
  ShieldPlus,
  AlertCircle,
  Clock,
  Edit2,
  Trash2,
  Settings2,
  PackagePlus,
} from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { addDays, format, isBefore } from 'date-fns'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

interface FirstAidKitsProps {
  initialOpenKitId?: string | null
}

export function FirstAidKits({ initialOpenKitId }: FirstAidKitsProps) {
  const [kits, setKits] = useState<any[]>([])
  const [expiringItems, setExpiringItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedKitId, setSelectedKitId] = useState<string | undefined>(
    initialOpenKitId || undefined,
  )

  const loadData = async () => {
    setLoading(true)
    try {
      const kitsData = await pb.collection('kits').getFullList({ sort: 'name' })
      const allItemsData = await pb.collection('kit_items').getFullList()

      const kitsWithStats = kitsData.map((kit) => {
        const kitItems = allItemsData.filter((i) => i.kit === kit.id)
        const count = kitItems.length
        let status = 'conforme'
        const now = new Date()
        const thirtyDays = addDays(now, 30)

        for (const item of kitItems) {
          if (!item.validity) continue
          const exp = new Date(item.validity)
          if (isNaN(exp.getTime())) continue

          if (isBefore(exp, now)) {
            status = 'vencido'
            break
          } else if (isBefore(exp, thirtyDays)) {
            status = 'atencao'
          }
        }

        return { ...kit, count, calculatedStatus: status }
      })
      setKits(kitsWithStats)

      const thirtyDaysFromNow = addDays(new Date(), 30)
      const expItems = await pb.collection('kit_items').getFullList({
        filter: `validity <= "${thirtyDaysFromNow.toISOString().replace('T', ' ')}"`,
        sort: 'validity',
        expand: 'kit',
      })
      setExpiringItems(expItems)
    } catch (err) {
      toast.error('Erro de Conexão', {
        description: 'Não foi possível carregar os dados do servidor.',
      })
    }
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  useRealtime('kits', () => loadData())
  useRealtime('kit_items', () => loadData())

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-foreground">
            Kits de Primeiros Socorros
          </h2>
          <p className="text-muted-foreground text-sm mt-0.5">
            Gerencie o conteúdo, lotes e validade de cada kit distribuído na embarcação.
          </p>
        </div>
        <div className="flex gap-2">
          <DraftsDialog />
          <AddKitDialog />
        </div>
      </div>

      {expiringItems.length > 0 && (
        <Alert
          variant="destructive"
          className="border-red-500/50 bg-red-50 dark:bg-red-950/20 shadow-sm"
        >
          <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
          <AlertTitle className="text-red-800 dark:text-red-300 font-semibold">
            Alerta de Vencimento - Ação Necessária
          </AlertTitle>
          <AlertDescription className="text-red-700 dark:text-red-400 mt-2">
            Notificação Automática: Existem {expiringItems.length} itens vencendo em menos de 30
            dias.
            <ul className="list-disc pl-5 mt-2 space-y-1">
              {expiringItems.slice(0, 3).map((item) => (
                <li key={item.id}>
                  <strong>{item.expand?.kit?.name || 'Kit Desconhecido'}</strong>: {item.name}{' '}
                  (Vence em:{' '}
                  {item.validity && !isNaN(new Date(item.validity).getTime())
                    ? format(new Date(item.validity), 'dd/MM/yyyy')
                    : 'N/A'}
                  )
                </li>
              ))}
              {expiringItems.length > 3 && (
                <li className="font-medium">...e mais {expiringItems.length - 3} itens.</li>
              )}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-8">
        {Object.entries(
          kits.reduce(
            (acc, kit) => {
              const loc = kit.location || 'Outros'
              if (!acc[loc]) acc[loc] = []
              acc[loc].push(kit)
              return acc
            },
            {} as Record<string, any[]>,
          ),
        ).map(([location, locationKits]) => (
          <div key={location} className="space-y-3">
            <h3 className="text-lg font-semibold flex items-center gap-2 text-foreground/80 border-b pb-2">
              <MapPin className="h-5 w-5 text-primary" />
              {location}
              <Badge variant="secondary" className="ml-2 bg-muted text-muted-foreground">
                {(locationKits as any[]).length}{' '}
                {(locationKits as any[]).length === 1 ? 'Kit' : 'Kits'}
              </Badge>
            </h3>
            <Accordion
              type="single"
              collapsible
              value={selectedKitId}
              onValueChange={setSelectedKitId}
              className="flex flex-col gap-3"
            >
              {(locationKits as any[]).map((kit) => (
                <AccordionItem
                  key={kit.id}
                  value={kit.id}
                  className="bg-card border rounded-xl overflow-hidden px-2 sm:px-4"
                >
                  <AccordionTrigger className="hover:no-underline py-4 group pr-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full gap-4 pr-4">
                      <div className="flex items-center gap-4">
                        <div className="p-2.5 border rounded-lg bg-muted/30 text-muted-foreground group-hover:text-primary transition-colors">
                          <ShieldPlus className="h-5 w-5" />
                        </div>
                        <div className="text-left">
                          <h3 className="font-semibold text-foreground text-base">{kit.name}</h3>
                          <div className="flex items-center text-sm text-muted-foreground mt-0.5">
                            <MapPin className="h-3.5 w-3.5 mr-1" />
                            {kit.location}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-6 w-full sm:w-auto pl-14 sm:pl-0">
                        <span className="text-sm text-muted-foreground font-medium whitespace-nowrap">
                          {kit.count} {kit.count === 1 ? 'item' : 'itens'}
                        </span>

                        {kit.calculatedStatus === 'vencido' && (
                          <Badge className="bg-red-500 hover:bg-red-600 text-white border-transparent gap-1.5 py-1 px-2.5 font-medium whitespace-nowrap shadow-sm">
                            <AlertCircle className="h-3.5 w-3.5" /> Vencido / Ação Necessária
                          </Badge>
                        )}
                        {kit.calculatedStatus === 'atencao' && (
                          <Badge
                            variant="outline"
                            className="text-amber-700 border-amber-300 bg-amber-50 gap-1.5 py-1 px-2.5 font-medium whitespace-nowrap shadow-sm"
                          >
                            <Clock className="h-3.5 w-3.5" /> Atenção (Próx. Vencimento)
                          </Badge>
                        )}
                        {kit.calculatedStatus === 'conforme' && (
                          <Badge className="bg-[#0284c7] hover:bg-[#0369a1] text-white border-transparent gap-1.5 py-1 px-2.5 font-medium whitespace-nowrap shadow-sm">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Conforme
                          </Badge>
                        )}
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-2 pb-4">
                    <div className="space-y-6">
                      <div className="flex flex-wrap gap-2 p-4 bg-muted/30 rounded-lg border">
                        <QRCodeDialog kit={kit} />
                        <KitInspectionDialog kit={kit} />
                        <AddItemDialog kitId={kit.id} />
                        <CorrelateItemDialog kitId={kit.id} />
                        <EditKitDialog kit={kit} />
                      </div>

                      <div>
                        <h3 className="text-lg font-medium mb-3">Composição do Kit</h3>
                        <KitItemsTable kitId={kit.id} kits={kits} />
                      </div>

                      <KitInspectionsHistory kitId={kit.id} />
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        ))}
      </div>

      {kits.length === 0 && !loading && (
        <div className="text-center py-16 border-2 border-dashed rounded-xl bg-muted/10">
          <ClipboardList className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-50" />
          <p className="text-lg font-medium text-foreground">Nenhum kit cadastrado</p>
          <p className="text-muted-foreground mt-1">
            Comece adicionando um novo kit de primeiros socorros no banco de dados.
          </p>
        </div>
      )}
    </div>
  )
}

function CorrelateItemDialog({ kitId }: { kitId: string }) {
  const [open, setOpen] = useState(false)
  const [stockItems, setStockItems] = useState<any[]>([])
  const [selectedItemId, setSelectedItemId] = useState('')
  const [loading, setLoading] = useState(false)

  const loadStockItems = async () => {
    try {
      const data = await pb
        .collection('kit_items')
        .getFullList({ filter: 'kit = ""', sort: 'name' })
      setStockItems(data)
    } catch (err) {
      // ignore
    }
  }

  useEffect(() => {
    if (open) loadStockItems()
  }, [open])

  const handleCorrelate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedItemId || selectedItemId === 'empty') return
    setLoading(true)
    try {
      await pb.collection('kit_items').update(selectedItemId, { kit: kitId })
      toast.success('Item Correlacionado', { description: 'Item do estoque adicionado ao kit.' })
      setOpen(false)
      setSelectedItemId('')
    } catch (err) {
      toast.error('Erro ao Correlacionar', { description: 'Não foi possível vincular o item.' })
    }
    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 bg-background border-slate-300">
          <PackagePlus className="h-4 w-4" /> Correlacionar do Estoque
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Correlacionar Item do Estoque</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Selecione um item do estoque geral para mover para este kit.
          </p>
        </DialogHeader>
        <form onSubmit={handleCorrelate} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label>Item do Estoque</Label>
            <select
              className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={selectedItemId}
              onChange={(e) => setSelectedItemId(e.target.value)}
              required
            >
              <option value="" disabled>
                Selecione um item...
              </option>
              {stockItems.length === 0 ? (
                <option value="empty" disabled>
                  Nenhum item disponível no estoque
                </option>
              ) : (
                stockItems.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} - Lote: {item.lot} (Qtd: {item.quantity})
                  </option>
                ))
              )}
            </select>
          </div>
          <Button
            type="submit"
            className="w-full mt-2"
            disabled={loading || !selectedItemId || selectedItemId === 'empty'}
          >
            {loading ? 'Salvando...' : 'Vincular ao Kit'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function EditKitDialog({ kit }: { kit: any }) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState(kit.name)
  const [location, setLocation] = useState(kit.location || '')
  const [status, setStatus] = useState(kit.status || 'Ativo')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<FieldErrors>({})

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrors({})
    try {
      await pb.collection('kits').update(kit.id, { name, location, status })
      toast.success('Kit Atualizado', { description: 'Os dados do kit foram salvos.' })
      setOpen(false)
    } catch (err) {
      const extracted = extractFieldErrors(err)
      setErrors(extracted)
      if (Object.keys(extracted).length === 0) {
        toast.error('Erro ao Atualizar', { description: 'Verifique os dados.' })
      }
    }
    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 bg-background border-slate-300">
          <Settings2 className="h-4 w-4 text-slate-500" /> Editar Kit
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Kit</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleEdit} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label>Nome do Kit</Label>
            <Input required value={name} onChange={(e) => setName(e.target.value)} />
            {errors.name && <p className="text-xs text-red-500 font-medium">{errors.name}</p>}
          </div>
          <div className="space-y-2">
            <Label>Localização na Embarcação</Label>
            <Input required value={location} onChange={(e) => setLocation(e.target.value)} />
            {errors.location && (
              <p className="text-xs text-red-500 font-medium">{errors.location}</p>
            )}
          </div>
          <Button type="submit" className="w-full mt-2" disabled={loading}>
            {loading ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function AddKitDialog() {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [location, setLocation] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<FieldErrors>({})

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrors({})
    try {
      await pb.collection('kits').create({ name, location, status: 'Ativo' })
      toast.success('Kit Cadastrado', { description: 'Registro sincronizado com sucesso.' })
      setOpen(false)
      setName('')
      setLocation('')
    } catch (err) {
      const extracted = extractFieldErrors(err)
      setErrors(extracted)
      if (Object.keys(extracted).length === 0) {
        toast.error('Falha ao Salvar', { description: 'Verifique os dados e tente novamente.' })
      }
    }
    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 shadow-sm bg-slate-900 text-white hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-700">
          <Plus className="h-4 w-4" /> Novo Kit
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cadastrar Novo Kit</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleAdd} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label>Nome do Kit</Label>
            <Input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Kit Trauma A"
            />
            {errors.name && <p className="text-xs text-red-500 font-medium">{errors.name}</p>}
          </div>
          <div className="space-y-2">
            <Label>Localização na Embarcação</Label>
            <Input
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Ex: Ponte de Comando"
            />
            {errors.location && (
              <p className="text-xs text-red-500 font-medium">{errors.location}</p>
            )}
          </div>
          <Button type="submit" className="w-full mt-2" disabled={loading}>
            {loading ? 'Salvando...' : 'Salvar Registro'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function AddItemDialog({ kitId }: { kitId: string }) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [lot, setLot] = useState('')
  const [serial, setSerial] = useState('')
  const [quantity, setQuantity] = useState('')
  const [validity, setValidity] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<FieldErrors>({})

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrors({})
    try {
      await pb.collection('kit_items').create({
        kit: kitId,
        name,
        lot,
        serial,
        quantity: parseInt(quantity),
        validity: new Date(validity).toISOString(),
      })
      toast.success('Item Adicionado', { description: 'O insumo foi vinculado ao kit.' })
      setOpen(false)
      setName('')
      setLot('')
      setSerial('')
      setQuantity('')
      setValidity('')
    } catch (err) {
      const extracted = extractFieldErrors(err)
      setErrors(extracted)
      if (Object.keys(extracted).length === 0) {
        toast.error('Erro ao Adicionar Item', { description: 'Verifique os dados informados.' })
      }
    }
    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 bg-background border-slate-300">
          <Plus className="h-4 w-4" /> Inserir Insumo
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Inserir Insumo no Kit</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleAdd} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label>Nome do Componente</Label>
            <Input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Atadura de Crepom"
            />
            {errors.name && <p className="text-xs text-red-500 font-medium">{errors.name}</p>}
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Lote</Label>
              <Input
                required
                value={lot}
                onChange={(e) => setLot(e.target.value)}
                placeholder="L-12345"
              />
              {errors.lot && <p className="text-xs text-red-500 font-medium">{errors.lot}</p>}
            </div>
            <div className="space-y-2">
              <Label>Serial</Label>
              <Input
                value={serial}
                onChange={(e) => setSerial(e.target.value)}
                placeholder="Opcional"
              />
              {errors.serial && <p className="text-xs text-red-500 font-medium">{errors.serial}</p>}
            </div>
            <div className="space-y-2">
              <Label>Qtd</Label>
              <Input
                type="number"
                min="1"
                required
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="0"
              />
              {errors.quantity && (
                <p className="text-xs text-red-500 font-medium">{errors.quantity}</p>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <Label>Data de Validade</Label>
            <Input
              type="date"
              required
              value={validity}
              onChange={(e) => setValidity(e.target.value)}
            />
            {errors.validity && (
              <p className="text-xs text-red-500 font-medium">{errors.validity}</p>
            )}
          </div>
          <Button type="submit" className="w-full mt-2" disabled={loading}>
            {loading ? 'Salvando...' : 'Confirmar Inserção'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function KitItemsTable({ kitId, kits }: { kitId: string; kits: any[] }) {
  const [items, setItems] = useState<any[]>([])

  const loadItems = async () => {
    try {
      const data = await pb.collection('kit_items').getFullList({
        filter: `kit = "${kitId}"`,
        sort: 'name',
      })
      setItems(data)
    } catch (err) {
      // ignore error
    }
  }

  useEffect(() => {
    loadItems()
  }, [kitId])

  useRealtime('kit_items', () => loadItems())

  return (
    <div className="border rounded-lg overflow-hidden shadow-sm bg-white dark:bg-slate-950">
      <Table>
        <TableHeader className="bg-slate-50 dark:bg-slate-900 border-b">
          <TableRow>
            <TableHead className="font-semibold text-slate-700 dark:text-slate-300">
              Componente
            </TableHead>
            <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Lote</TableHead>
            <TableHead className="font-semibold text-slate-700 dark:text-slate-300">
              Nº Série
            </TableHead>
            <TableHead className="font-semibold text-slate-700 dark:text-slate-300 text-center">
              Qtd
            </TableHead>
            <TableHead className="font-semibold text-slate-700 dark:text-slate-300">
              Validade
            </TableHead>
            <TableHead className="font-semibold text-slate-700 dark:text-slate-300">
              Status
            </TableHead>
            <TableHead className="font-semibold text-slate-700 dark:text-slate-300 text-right">
              Ações
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => {
            const hasValidDate = item.validity && !isNaN(new Date(item.validity).getTime())
            const expDate = hasValidDate ? new Date(item.validity) : null
            const isExpired = expDate ? isBefore(expDate, new Date()) : false
            const isExpiringSoon = expDate ? isBefore(expDate, addDays(new Date(), 30)) : false
            return (
              <TableRow key={item.id} className="group">
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell className="font-mono text-sm">{item.lot || '-'}</TableCell>
                <TableCell className="font-mono text-xs text-slate-500">
                  {item.serial || '-'}
                </TableCell>
                <TableCell className="text-center font-medium">{item.quantity}</TableCell>
                <TableCell>{expDate ? format(expDate, 'dd/MM/yyyy') : 'N/A'}</TableCell>
                <TableCell>
                  {!hasValidDate ? (
                    <Badge
                      variant="outline"
                      className="shadow-none rounded-md bg-slate-50 text-slate-500"
                    >
                      N/A
                    </Badge>
                  ) : isExpired ? (
                    <Badge variant="destructive" className="shadow-none rounded-md">
                      Vencido
                    </Badge>
                  ) : isExpiringSoon ? (
                    <Badge
                      variant="outline"
                      className="text-orange-700 border-orange-300 bg-orange-50 dark:bg-orange-950/30 rounded-md"
                    >
                      Alerta: &lt; 30d
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="text-emerald-700 border-emerald-300 bg-emerald-50 dark:bg-emerald-950/30 rounded-md"
                    >
                      Válido
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <EditItemDialog item={item} kits={kits} />
                    <DeleteItemDialog itemId={item.id} />
                  </div>
                </TableCell>
              </TableRow>
            )
          })}
          {items.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                Nenhum item inserido neste kit até o momento.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}

function EditItemDialog({ item, kits }: { item: any; kits: any[] }) {
  const [open, setOpen] = useState(false)
  const [kitId, setKitId] = useState(item.kit || '')
  const [name, setName] = useState(item.name)
  const [lot, setLot] = useState(item.lot || '')
  const [serial, setSerial] = useState(item.serial || '')
  const [quantity, setQuantity] = useState(item.quantity.toString())
  const [validity, setValidity] = useState(item.validity ? item.validity.split(' ')[0] : '')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<FieldErrors>({})

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrors({})
    try {
      await pb.collection('kit_items').update(item.id, {
        kit: kitId,
        name,
        lot,
        serial,
        quantity: parseInt(quantity),
        validity: new Date(validity).toISOString(),
      })
      toast.success('Insumo Atualizado', { description: 'As alterações foram salvas.' })
      setOpen(false)
    } catch (err) {
      const extracted = extractFieldErrors(err)
      setErrors(extracted)
      if (Object.keys(extracted).length === 0) {
        toast.error('Erro ao Atualizar', { description: 'Falha ao salvar as modificações.' })
      }
    }
    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-blue-600 hover:bg-blue-50"
        >
          <Edit2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Insumo</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleEdit} className="space-y-4 pt-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nome do Componente</Label>
              <Input required value={name} onChange={(e) => setName(e.target.value)} />
              {errors.name && <p className="text-xs text-red-500 font-medium">{errors.name}</p>}
            </div>
            <div className="space-y-2">
              <Label>Kit / Localização</Label>
              <select
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                value={kitId}
                onChange={(e) => setKitId(e.target.value)}
              >
                <option value="">Estoque Geral (Sem Kit)</option>
                {kits.map((k) => (
                  <option key={k.id} value={k.id}>
                    {k.name} ({k.location})
                  </option>
                ))}
              </select>
              {errors.kit && <p className="text-xs text-red-500 font-medium">{errors.kit}</p>}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Lote</Label>
              <Input required value={lot} onChange={(e) => setLot(e.target.value)} />
              {errors.lot && <p className="text-xs text-red-500 font-medium">{errors.lot}</p>}
            </div>
            <div className="space-y-2">
              <Label>Serial</Label>
              <Input value={serial} onChange={(e) => setSerial(e.target.value)} />
              {errors.serial && <p className="text-xs text-red-500 font-medium">{errors.serial}</p>}
            </div>
            <div className="space-y-2">
              <Label>Qtd</Label>
              <Input
                type="number"
                min="0"
                required
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
              {errors.quantity && (
                <p className="text-xs text-red-500 font-medium">{errors.quantity}</p>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <Label>Data de Validade Exata</Label>
            <Input
              type="date"
              required
              value={validity}
              onChange={(e) => setValidity(e.target.value)}
            />
            {errors.validity && (
              <p className="text-xs text-red-500 font-medium">{errors.validity}</p>
            )}
          </div>
          <Button type="submit" className="w-full mt-2" disabled={loading}>
            {loading ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function DeleteItemDialog({ itemId }: { itemId: string }) {
  const handleDelete = async () => {
    try {
      await pb.collection('kit_items').delete(itemId)
      toast.success('Item Removido', { description: 'O insumo foi excluído do inventário.' })
    } catch (err) {
      toast.error('Erro de Exclusão', { description: 'Não foi possível apagar este item.' })
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remover Item?</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja remover este item? A exclusão refletirá no banco de dados
            principal.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            Remover Definitivamente
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

function KitInspectionDialog({ kit }: { kit: any }) {
  const [items, setItems] = useState<any[]>([])
  const [inspectionData, setInspectionData] = useState<
    Record<string, { status: string; notes: string }>
  >({})
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (isOpen) loadItems()
  }, [isOpen])

  const loadItems = async () => {
    try {
      const data = await pb.collection('kit_items').getFullList({ filter: `kit = "${kit.id}"` })
      setItems(data)
      const initialData: any = {}
      data.forEach((item) => {
        initialData[item.id] = { status: 'ok', notes: '' }
      })
      setInspectionData(initialData)
    } catch (err) {
      // ignore error
    }
  }

  const handleSave = async () => {
    const hasIssues = Object.values(inspectionData).some((d) => d.status !== 'ok')

    try {
      await pb.collection('kit_inspections').create({
        kit: kit.id,
        inspector_name: 'Enfermeiro Chefe de Plantão',
        status: hasIssues ? 'needs_attention' : 'ok',
        notes: 'Inspeção de rotina via Checklist Digital',
      })

      let generatedDrafts = 0
      for (const item of items) {
        const data = inspectionData[item.id]
        if (data.status === 'missing' || data.status === 'expired') {
          await pb.collection('replenishment_drafts').create({
            kit: kit.id,
            item_name: item.name,
            quantity_needed: item.quantity,
            reason:
              data.status === 'missing'
                ? 'Reposição: Item ausente na conferência'
                : 'Reposição: Item vencido detectado',
            status: 'draft',
          })
          generatedDrafts++
        }
      }

      toast.success('Inspeção Assinada e Salva', {
        description:
          generatedDrafts > 0
            ? `Auto-Replenishment: ${generatedDrafts} rascunhos de reposição gerados automaticamente.`
            : 'Checklist finalizado. Nenhuma pendência encontrada.',
      })

      setIsOpen(false)
    } catch (err) {
      toast.error('Erro na Inspeção', { description: 'Não foi possível salvar o formulário.' })
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          className="gap-2 shadow-sm bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900"
        >
          <ClipboardList className="h-4 w-4" /> Iniciar Checklist
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Checklist de Inspeção Digital</DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Kit em conferência: <strong>{kit.name}</strong>
          </p>
        </DialogHeader>
        <div className="bg-slate-50 dark:bg-slate-900 border rounded-lg p-4 space-y-4 max-h-[55vh] overflow-y-auto mt-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex flex-col md:flex-row md:items-center gap-4 p-4 border rounded-lg bg-background shadow-sm"
            >
              <div className="flex-1">
                <p className="font-semibold text-foreground">{item.name}</p>
                <div className="flex flex-wrap gap-4 mt-1 text-sm text-muted-foreground">
                  {item.lot && (
                    <span>
                      Lote: <strong className="font-mono">{item.lot}</strong>
                    </span>
                  )}
                  <span>Qtd Ideal: {item.quantity}</span>
                  <span>
                    Vencimento:{' '}
                    {item.validity && !isNaN(new Date(item.validity).getTime())
                      ? format(new Date(item.validity), 'dd/MM/yyyy')
                      : 'N/A'}
                  </span>
                </div>
              </div>
              <div className="flex gap-3 flex-col sm:flex-row w-full md:w-auto">
                <select
                  className={`border rounded-md px-3 py-2 text-sm bg-background font-medium focus:ring-2 focus:ring-primary focus:outline-none transition-colors ${
                    inspectionData[item.id]?.status === 'ok'
                      ? 'border-emerald-500/50 text-emerald-700 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20'
                      : inspectionData[item.id]?.status === 'missing'
                        ? 'border-amber-500/50 text-amber-700 dark:text-amber-400 bg-amber-50/50 dark:bg-amber-950/20'
                        : 'border-red-500/50 text-red-700 dark:text-red-400 bg-red-50/50 dark:bg-red-950/20'
                  }`}
                  value={inspectionData[item.id]?.status}
                  onChange={(e) =>
                    setInspectionData({
                      ...inspectionData,
                      [item.id]: { ...inspectionData[item.id], status: e.target.value },
                    })
                  }
                >
                  <option value="ok">✅ Conforme & Válido</option>
                  <option value="missing">⚠️ Ausente (Falta)</option>
                  <option value="expired">❌ Item Vencido</option>
                </select>
                <Input
                  placeholder="Observação da auditoria..."
                  value={inspectionData[item.id]?.notes}
                  onChange={(e) =>
                    setInspectionData({
                      ...inspectionData,
                      [item.id]: { ...inspectionData[item.id], notes: e.target.value },
                    })
                  }
                  className="w-full sm:w-56"
                />
              </div>
            </div>
          ))}
          {items.length === 0 && (
            <p className="text-muted-foreground text-center py-6">
              Adicione itens ao kit antes de executar uma inspeção.
            </p>
          )}
        </div>
        <div className="pt-4 border-t mt-4">
          <Button
            onClick={handleSave}
            className="w-full text-md py-6 bg-slate-900 text-white hover:bg-slate-800"
            disabled={items.length === 0}
          >
            <CheckCircle2 className="h-5 w-5 mr-2" /> Finalizar e Assinar Inspeção
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function KitInspectionsHistory({ kitId }: { kitId: string }) {
  const [history, setHistory] = useState<any[]>([])

  const loadHistory = async () => {
    try {
      const data = await pb.collection('kit_inspections').getList(1, 5, {
        filter: `kit = "${kitId}"`,
        sort: '-created',
      })
      setHistory(data.items)
    } catch (err) {
      // ignore error
    }
  }

  useEffect(() => {
    loadHistory()
  }, [kitId])

  useRealtime('kit_inspections', () => loadHistory())

  if (history.length === 0) return null

  return (
    <div className="mt-8 border-t pt-6">
      <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
        <FileText className="h-5 w-5 text-muted-foreground" /> Prontuário de Inspeções
      </h3>
      <div className="space-y-3">
        {history.map((ins) => (
          <div
            key={ins.id}
            className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-4 border rounded-lg bg-slate-50 dark:bg-slate-900/50"
          >
            <div>
              <p className="text-sm font-semibold">
                {format(new Date(ins.created), 'dd/MM/yyyy às HH:mm')}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Auditoria realizada por: {ins.inspector_name}
              </p>
              {ins.notes && (
                <p className="text-sm mt-2 italic text-muted-foreground">"{ins.notes}"</p>
              )}
            </div>
            <div className="mt-3 sm:mt-0">
              <Badge
                variant={ins.status === 'ok' ? 'outline' : 'destructive'}
                className={
                  ins.status === 'ok' ? 'text-emerald-700 bg-emerald-50 border-emerald-200' : ''
                }
              >
                {ins.status === 'ok' ? 'Conforme / Operacional' : 'Necessita Reposição'}
              </Badge>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function QRCodeDialog({ kit }: { kit: any }) {
  const appUrl =
    typeof window !== 'undefined'
      ? window.location.origin
      : 'https://enfermaria-poseidon.goskip.app'
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(appUrl + '/inventory?kit=' + kit.id)}&color=0f172a`

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          title="Gerar QR Code do Kit"
          className="gap-2 bg-background border-slate-300"
        >
          <QrCode className="h-4 w-4 text-primary" /> Etiqueta QR
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm text-center">
        <DialogHeader>
          <DialogTitle>Etiqueta Inteligente</DialogTitle>
          <p className="text-sm text-muted-foreground">{kit.name}</p>
        </DialogHeader>
        <div className="flex flex-col items-center gap-6 py-6">
          <div className="p-4 bg-white rounded-2xl shadow-sm border border-slate-200">
            <img src={qrUrl} alt={`QR Code para ${kit.name}`} className="w-48 h-48" />
          </div>
          <p className="text-sm text-muted-foreground px-4 leading-relaxed">
            Fixe esta etiqueta no estojo do kit. Ao escanear via tablet ou celular, o enfermeiro
            será redirecionado imediatamente à ficha técnica e lista de validades.
          </p>
          <Button variant="secondary" className="w-full mt-2" onClick={() => window.print()}>
            Imprimir Etiqueta
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function DraftsDialog() {
  const [drafts, setDrafts] = useState<any[]>([])

  const loadDrafts = async () => {
    try {
      const data = await pb.collection('replenishment_drafts').getFullList({
        filter: 'status = "draft"',
        sort: '-created',
        expand: 'kit',
      })
      setDrafts(data)
    } catch (err) {
      // ignore error
    }
  }

  useRealtime('replenishment_drafts', () => loadDrafts())

  const handleOrder = async (id: string) => {
    try {
      await pb.collection('replenishment_drafts').update(id, { status: 'ordered' })
      toast.success('Pedido de Reposição Gerado', {
        description: 'O sistema enviou a requisição para a logística.',
      })
    } catch (err) {
      toast.error('Erro ao aprovar', { description: 'Tente novamente.' })
    }
  }

  return (
    <Dialog onOpenChange={(open) => open && loadDrafts()}>
      <DialogTrigger asChild>
        <Button
          variant="secondary"
          className="gap-2 border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-sm font-medium dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          <RefreshCw className="h-4 w-4" />
          Sugestões de Reposição
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-5xl">
        <DialogHeader>
          <DialogTitle className="text-xl">Auto-Replenishment: Rascunhos de Pedidos</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Itens identificados como faltantes ou vencidos pelas inspeções e que precisam de
            reposição.
          </p>
        </DialogHeader>
        <div className="overflow-x-auto mt-4 border rounded-lg shadow-sm">
          <Table>
            <TableHeader className="bg-slate-50 dark:bg-slate-900">
              <TableRow>
                <TableHead>Identificação (Data)</TableHead>
                <TableHead>Kit de Origem</TableHead>
                <TableHead>Insumo Demandado</TableHead>
                <TableHead className="text-center">Qtd</TableHead>
                <TableHead>Motivo (Gatilho)</TableHead>
                <TableHead className="text-right">Ação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="bg-card">
              {drafts.map((draft) => (
                <TableRow key={draft.id}>
                  <TableCell className="text-xs font-medium text-muted-foreground">
                    {format(new Date(draft.created), 'dd/MM/yyyy HH:mm')}
                  </TableCell>
                  <TableCell className="font-semibold">{draft.expand?.kit?.name}</TableCell>
                  <TableCell>{draft.item_name}</TableCell>
                  <TableCell className="text-center font-medium">{draft.quantity_needed}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className="text-amber-700 bg-amber-50 border-amber-300 font-normal"
                    >
                      {draft.reason}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" onClick={() => handleOrder(draft.id)} className="shadow-sm">
                      Aprovar Pedido
   