import { useState } from 'react'
import useMainStore from '@/stores/useMainStore'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'

export default function Audits() {
  const { inventory, audits, addAudit } = useMainStore()
  const [activeTab, setActiveTab] = useState('new')

  const [auditCounts, setAuditCounts] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {}
    inventory.forEach((i) => {
      initial[i.id] = i.quantity
    })
    return initial
  })

  const handleCountChange = (id: string, value: string) => {
    const num = parseInt(value, 10)
    setAuditCounts((prev) => ({
      ...prev,
      [id]: isNaN(num) ? 0 : num,
    }))
  }

  const handleSaveAudit = () => {
    const items = inventory.map((i) => {
      const scannedQuantity = auditCounts[i.id] ?? 0
      return {
        itemId: i.id,
        theoreticalQuantity: i.quantity,
        scannedQuantity,
        variance: scannedQuantity - i.quantity,
      }
    })

    addAudit({
      date: new Date().toISOString(),
      items,
    })

    toast.success('Auditoria salva com sucesso!')
    setActiveTab('history')
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard de Auditoria</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList>
          <TabsTrigger value="new">Nova Auditoria</TabsTrigger>
          <TabsTrigger value="history">Histórico</TabsTrigger>
        </TabsList>

        <TabsContent value="new" className="mt-6 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Contagem Física de Estoque</CardTitle>
              <CardDescription>
                Compare o estoque teórico do sistema com a contagem física (auditada).
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader className="bg-slate-50">
                    <TableRow>
                      <TableHead>Item / Medicamento</TableHead>
                      <TableHead>Lote</TableHead>
                      <TableHead className="text-right">Estoque Teórico</TableHead>
                      <TableHead className="w-[180px] text-right">Contagem Física</TableHead>
                      <TableHead className="text-right">Divergência</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {inventory.map((item) => {
                      const theoretical = item.quantity
                      const physical = auditCounts[item.id] ?? 0
                      const variance = physical - theoretical

                      return (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.name}</TableCell>
                          <TableCell className="text-slate-500">{item.batch || '-'}</TableCell>
                          <TableCell className="text-right text-slate-500">{theoretical}</TableCell>
                          <TableCell className="text-right">
                            <Input
                              type="number"
                              min="0"
                              value={auditCounts[item.id] === undefined ? '' : auditCounts[item.id]}
                              onChange={(e) => handleCountChange(item.id, e.target.value)}
                              className="w-24 ml-auto text-right font-mono"
                            />
                          </TableCell>
                          <TableCell className="text-right">
                            {variance === 0 ? (
                              <Badge variant="secondary" className="bg-slate-100 text-slate-700">
                                OK
                              </Badge>
                            ) : variance > 0 ? (
                              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                                +{variance}
                              </Badge>
                            ) : (
                              <Badge variant="destructive">{variance}</Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
              <div className="flex justify-end mt-4">
                <Button onClick={handleSaveAudit}>Salvar Auditoria</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <div className="grid gap-4">
            {audits.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhuma auditoria registrada.</p>
            ) : (
              audits.map((audit) => {
                const totalVariance = audit.items.reduce(
                  (acc, item) => acc + Math.abs(item.variance),
                  0,
                )
                return (
                  <Card key={audit.id}>
                    <CardHeader>
                      <CardTitle className="text-lg">
                        Auditoria - {format(new Date(audit.date), 'dd/MM/yyyy HH:mm')}
                      </CardTitle>
                      <CardDescription>
                        {audit.items.length} itens auditados. Divergência total absoluta:{' '}
                        {totalVariance} unidades.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="rounded-md border overflow-hidden">
                        <Table>
                          <TableHeader className="bg-slate-50">
                            <TableRow>
                              <TableHead>Item</TableHead>
                              <TableHead className="text-right">Teórico</TableHead>
                              <TableHead className="text-right">Físico</TableHead>
                              <TableHead className="text-right">Divergência</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {audit.items.map((auditItem) => {
                              const item = inventory.find((i) => i.id === auditItem.itemId)
                              return (
                                <TableRow key={auditItem.itemId}>
                                  <TableCell className="font-medium">
                                    {item?.name || 'Desconhecido'}
                                  </TableCell>
                                  <TableCell className="text-right text-slate-500">
                                    {auditItem.theoreticalQuantity}
                                  </TableCell>
                                  <TableCell className="text-right">
                                    {auditItem.scannedQuantity}
                                  </TableCell>
                                  <TableCell className="text-right">
                                    {auditItem.variance === 0 ? (
                                      <span className="text-slate-500">0</span>
                                    ) : auditItem.variance > 0 ? (
                                      <span className="text-blue-600">+{auditItem.variance}</span>
                                    ) : (
                                      <span className="text-red-600">{auditItem.variance}</span>
                                    )}
                                  </TableCell>
                                </TableRow>
                              )
                            })}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>
                )
              })
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
