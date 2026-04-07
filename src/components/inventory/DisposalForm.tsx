import { useState } from 'react'
import useMainStore from '@/stores/useMainStore'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { Trash2, FileDown } from 'lucide-react'
import { format } from 'date-fns'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export default function DisposalForm() {
  const { inventory, disposals, addDisposal } = useMainStore()
  const [itemId, setItemId] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [reason, setReason] = useState('Vencido')
  const [notes, setNotes] = useState('')

  const handleDispose = (e: React.FormEvent) => {
    e.preventDefault()
    if (!itemId) return toast.error('Selecione um item.')

    addDisposal({ itemId, quantity, reason, notes })
    toast.success('Descarte registrado com sucesso. Certificado gerado e pronto para download.')
    setItemId('')
    setQuantity(1)
    setNotes('')
  }

  const handleGenerateCertificate = (id: string) => {
    toast.success(`Gerando Certificado de Descarte Seguro em PDF para o ID: ${id}...`)
  }

  return (
    <div className="grid lg:grid-cols-12 gap-6">
      <Card className="lg:col-span-5 h-fit">
        <CardHeader className="bg-slate-50 border-b">
          <CardTitle>Registrar Descarte</CardTitle>
          <CardDescription>
            Dê baixa em insumos avariados ou vencidos seguindo protocolos de segurança sanitária.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleDispose} className="space-y-4">
            <div className="space-y-2">
              <Label>Item a descartar</Label>
              <Select value={itemId} onValueChange={setItemId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {inventory
                    .filter((i) => i.quantity > 0)
                    .map((i) => (
                      <SelectItem key={i.id} value={i.id}>
                        {i.name} (Lote: {i.batch})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Quantidade</Label>
                <Input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label>Motivo Regulatório</Label>
                <Select value={reason} onValueChange={setReason}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Vencido">Prazo Vencido</SelectItem>
                    <SelectItem value="Avariado">Avariado / Quebrado</SelectItem>
                    <SelectItem value="Contaminado">Contaminado</SelectItem>
                    <SelectItem value="Outro">Outro Motivo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Observações / Relatório</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Detalhes adicionais obrigatórios para auditoria..."
                className="resize-none"
              />
            </div>
            <Button type="submit" variant="destructive" className="w-full">
              <Trash2 className="w-4 h-4 mr-2" /> Confirmar Descarte Definitivo
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="lg:col-span-7">
        <CardHeader className="bg-slate-50 border-b">
          <CardTitle>Histórico e Certificados de Descarte</CardTitle>
          <CardDescription>Registro formal de baixas realizadas na embarcação.</CardDescription>
        </CardHeader>
        <CardContent className="pt-6 p-0 sm:p-6">
          <div className="rounded-md border overflow-hidden mx-4 sm:mx-0 mb-4 sm:mb-0">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Item / Motivo</TableHead>
                  <TableHead className="text-right">Qtd Baixada</TableHead>
                  <TableHead className="text-right">Certificado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {disposals.map((d) => {
                  const item = inventory.find((i) => i.id === d.itemId)
                  return (
                    <TableRow key={d.id}>
                      <TableCell className="text-sm">
                        {format(new Date(d.date), 'dd/MM/yyyy')}
                      </TableCell>
                      <TableCell className="text-sm">
                        <div className="font-medium">{item?.name || 'Desconhecido'}</div>
                        <div className="text-xs text-muted-foreground">{d.reason}</div>
                      </TableCell>
                      <TableCell className="text-sm text-red-600 font-bold text-right">
                        -{d.quantity}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleGenerateCertificate(d.id)}
                          title="Baixar PDF do Certificado"
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <FileDown className="w-4 h-4 mr-2" /> PDF
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
                {disposals.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                      Nenhum histórico de descarte registrado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
