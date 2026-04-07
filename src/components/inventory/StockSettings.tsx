import useMainStore from '@/stores/useMainStore'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle } from 'lucide-react'

export default function StockSettings() {
  const { inventory, updateInventorySettings } = useMainStore()

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Configuração de Níveis Críticos</CardTitle>
          <CardDescription>
            Defina o estoque mínimo global e por setor. O sistema alertará automaticamente quando as
            quantidades caírem abaixo destes valores.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead className="w-[140px] text-right">Mínimo Global</TableHead>
                  <TableHead className="w-[140px] text-right">Setor: Enfermaria</TableHead>
                  <TableHead className="w-[140px] text-right">Kits de Emerg.</TableHead>
                  <TableHead className="w-[120px] text-right">Status Atual</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inventory.map((item) => {
                  const isLow = item.quantity <= item.minQuantity
                  return (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        {item.name}
                        <div className="text-xs text-muted-foreground mt-0.5">
                          Qtd atual: {item.quantity} un
                        </div>
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={item.minQuantity}
                          onChange={(e) =>
                            updateInventorySettings(item.id, {
                              minQuantity: Number(e.target.value),
                            })
                          }
                          className="w-24 ml-auto text-right font-mono"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={item.sectorMinQuantity?.['Enfermaria'] || ''}
                          onChange={(e) =>
                            updateInventorySettings(item.id, {
                              sectorMinQuantity: {
                                ...(item.sectorMinQuantity || {}),
                                Enfermaria: Number(e.target.value),
                              },
                            })
                          }
                          className="w-24 ml-auto text-right font-mono"
                          placeholder="0"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={item.sectorMinQuantity?.['Kits'] || ''}
                          onChange={(e) =>
                            updateInventorySettings(item.id, {
                              sectorMinQuantity: {
                                ...(item.sectorMinQuantity || {}),
                                Kits: Number(e.target.value),
                              },
                            })
                          }
                          className="w-24 ml-auto text-right font-mono"
                          placeholder="0"
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        {isLow ? (
                          <Badge variant="destructive" className="justify-center">
                            <AlertTriangle className="w-3 h-3 mr-1" /> Crítico
                          </Badge>
                        ) : (
                          <Badge
                            variant="secondary"
                            className="bg-green-100 text-green-800 justify-center"
                          >
                            Adequado
                          </Badge>
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
    </div>
  )
}
