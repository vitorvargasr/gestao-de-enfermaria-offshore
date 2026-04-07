import { useState, useEffect } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { isBefore, parseISO, format, differenceInDays } from 'date-fns'
import { Input } from '@/components/ui/input'
import {
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  ScanLine,
  Clock,
  FileEdit,
  Plus,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { getKitItems, createKitItem, updateKitItem, type KitItem } from '@/services/kit_items'
import { getKits, type Kit } from '@/services/kits'
import { useRealtime } from '@/hooks/use-realtime'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'

function ItemDialog({ item, onSuccess }: { item?: KitItem; onSuccess: () => void }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    serial: '',
    location: '',
    quantity: '',
    lot: '',
    validity: '',
    kit: '',
  })

  useEffect(() => {
    if (open) {
      setFormData({
        name: item?.name || '',
        category: item?.category || '',
        serial: item?.serial || '',
        location: item?.location || '',
        quantity: item?.quantity?.toString() || '',
        lot: item?.lot || '',
        validity: item?.validity ? item.validity.substring(0, 10) : '',
        kit: item?.kit || '',
      })
    }
  }, [open, item])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const payload: any = {
        ...formData,
        quantity: Number(formData.quantity),
      }

      if (payload.validity) {
        payload.validity = new Date(payload.validity + 'T12:00:00Z').toISOString()
      }

      if (!payload.kit) {
        payload.kit = ''
      }

      if (item) {
        await updateKitItem(item.id, payload)
        toast.success('Item atualizado com sucesso!')
      } else {
        await createKitItem(payload)
        toast.success('Item inserido no estoque com sucesso!')
      }
      setOpen(false)
      onSuccess()
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || 'Erro ao salvar item.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {item ? (
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1 px-2 text-slate-600 hover:text-slate-900"
          >
            <FileEdit className="w-3.5 h-3.5" /> Editar
          </Button>
        ) : (
          <Button className="gap-2 bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-200">
            <Plus className="h-4 w-4" /> Inserir Manualmente
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{item ? 'Editar Item' : 'Inserir Novo Item'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 col-span-2">
              <Label>Nome</Label>
              <Input
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Paracetamol 500mg"
              />
            </div>
            <div className="space-y-2">
              <Label>Categoria</Label>
              <Input
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="Ex: Medicamento, Ampola"
              />
            </div>
            <div className="space-y-2">
              <Label>Quantidade</Label>
              <Input
                type="number"
                required
                min="1"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Lote</Label>
              <Input
                required
                value={formData.lot}
                onChange={(e) => setFormData({ ...formData, lot: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Validade</Label>
              <Input
                type="date"
                required
                value={formData.validity}
                onChange={(e) => setFormData({ ...formData, validity: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Serial (Opcional)</Label>
              <Input
                value={formData.serial}
                onChange={(e) => setFormData({ ...formData, serial: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Localização (Opcional)</Label>
              <Input
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Ex: Prateleira A"
              />
            </div>
          </div>
          <Button type="submit" className="w-full mt-2" disabled={loading}>
            {loading ? 'Salvando...' : 'Salvar'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default function StockTable() {
  const [items, setItems] = useState<KitItem[]>([])
  const [kits, setKits] = useState<Kit[]>([])
  const now = new Date()

  const loadData = async () => {
    try {
      const [fetchedItems, fetchedKits] = await Promise.all([getKitItems('kit = ""'), getKits()])
      setItems(fetchedItems)
      setKits(fetchedKits)
    } catch (err) {
      console.error('Failed to load data', err)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  useRealtime('kit_items', () => {
    loadData()
  })

  return (
    <div className="space-y-4 h-full flex flex-col">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Itens no Estoque Geral</h2>
          <p className="text-sm text-muted-foreground">Itens não associados a nenhum kit</p>
        </div>
        <ItemDialog onSuccess={loadData} />
      </div>

      <div className="border rounded-md bg-white shadow-sm overflow-hidden flex-1 flex flex-col">
        <div className="overflow-auto flex-1">
          <Table>
            <TableHeader className="bg-slate-50 sticky top-0 z-10 shadow-sm">
              <TableRow>
                <TableHead className="font-semibold">Item / Medicamento</TableHead>
                <TableHead className="font-semibold">Categoria</TableHead>
                <TableHead className="font-semibold">Lote</TableHead>
                <TableHead className="font-semibold">Validade</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="w-[180px] font-semibold text-right">Qtd. Atual</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Nenhum item encontrado no estoque.
                  </TableCell>
                </TableRow>
              ) : (
                items.map((item) => {
                  const expiryDate = item.validity ? parseISO(item.validity) : new Date()
                  const isExpired = isBefore(expiryDate, now)
                  const daysToExpire = differenceInDays(expiryDate, now)
                  const minQuantity = 10
                  const isLowStock = item.quantity <= minQuantity

                  let statusNode
                  if (isExpired) {
                    statusNode = (
                      <Badge variant="destructive" className="gap-1.5 py-1">
                        <AlertCircle className="w-3.5 h-3.5" /> Vencido
                      </Badge>
                    )
                  } else if (daysToExpire >= 0 && daysToExpire <= 90) {
                    statusNode = (
                      <Badge
                        variant="secondary"
                        className="gap-1.5 py-1 bg-orange-100 text-orange-800 hover:bg-orange-200"
                      >
                        <Clock className="w-3.5 h-3.5" /> Vence em {daysToExpire} dias
                      </Badge>
                    )
                  } else if (isLowStock) {
                    statusNode = (
                      <Badge
                        variant="secondary"
                        className="gap-1.5 py-1 bg-amber-100 text-amber-800 hover:bg-amber-200"
                      >
                        <AlertTriangle className="w-3.5 h-3.5" /> Estoque Baixo
                      </Badge>
                    )
                  } else {
                    statusNode = (
                      <Badge
                        variant="secondary"
                        className="gap-1.5 py-1 bg-green-100 text-green-800 hover:bg-green-200"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> OK
                      </Badge>
                    )
                  }

                  return (
                    <TableRow key={item.id} className="hover:bg-slate-50/50">
                      <TableCell className="font-medium text-slate-900">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            {item.name}
                            {item.serial && (
                              <ScanLine
                                className="w-3.5 h-3.5 text-slate-400"
                                title={`Serial: ${item.serial}`}
                              />
                            )}
                          </div>
                          {item.location && (
                            <span className="text-xs text-slate-500">Loc: {item.location}</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-600">{item.category || '-'}</TableCell>
                      <TableCell className="text-slate-600 font-mono text-sm">
                        {item.lot || '-'}
                      </TableCell>
                      <TableCell className="text-slate-600 font-mono text-sm">
                        {item.validity ? format(expiryDate, 'dd/MM/yyyy') : '-'}
                      </TableCell>
                      <TableCell>{statusNode}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-3">
                          <div className="flex items-baseline gap-1">
                            <span className="font-mono font-semibold text-base text-slate-900 dark:text-white">
                              {item.quantity}
                            </span>
                            <span className="text-xs text-slate-500">un</span>
                          </div>
                          <ItemDialog item={item} onSuccess={loadData} />
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
