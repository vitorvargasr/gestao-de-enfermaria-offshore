import { useEffect, useState } from 'react'
import pb from '@/lib/pocketbase/client'
import { useRealtime } from '@/hooks/use-realtime'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Search, AlertTriangle } from 'lucide-react'
import { format, differenceInDays } from 'date-fns'

interface InventoryItem {
  id: string
  item_name?: string
  name?: string
  category: string
  quantity: number
  min_threshold: number
  expiry_date: string
}

export function StockTable() {
  const [items, setItems] = useState<InventoryItem[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  const loadData = async () => {
    try {
      setIsLoading(true)
      const records = await pb.collection('inventory').getFullList<InventoryItem>({
        sort: 'expiry_date',
      })
      setItems(records)
    } catch (error) {
      console.error('Failed to load inventory', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  useRealtime('inventory', () => {
    loadData()
  })

  const filteredItems = items.filter(
    (item) =>
      (item.item_name || item.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.category || '').toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getStatus = (item: InventoryItem) => {
    if (!item.expiry_date) return { label: 'Válido', variant: 'default' as const }

    const daysToExpiry = differenceInDays(new Date(item.expiry_date), new Date())

    if (daysToExpiry < 0) return { label: 'Expirado', variant: 'destructive' as const }
    if (daysToExpiry <= 60)
      return { label: 'Próximo do Vencimento', variant: 'outline' as const, isWarning: true }

    return { label: 'Válido', variant: 'secondary' as const }
  }

  const getStockStatus = (item: InventoryItem) => {
    if (item.quantity <= 0) return { label: 'Sem Estoque', color: 'text-red-500' }
    if (item.quantity <= item.min_threshold)
      return { label: 'Estoque Baixo', color: 'text-yellow-500' }
    return { label: 'Normal', color: 'text-green-500' }
  }

  return (
    <Card className="w-full shadow-sm">
      <CardHeader className="pb-4 border-b">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <CardTitle>Controle de Estoque</CardTitle>
            <CardDescription>Gestão de medicamentos, consumíveis e equipamentos.</CardDescription>
          </div>
          <div className="relative w-full md:w-72">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar itens..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold">Item</TableHead>
                <TableHead className="font-semibold">Categoria</TableHead>
                <TableHead className="font-semibold text-right">Qtd</TableHead>
                <TableHead className="font-semibold text-right">Mínimo</TableHead>
                <TableHead className="font-semibold">Validade</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Carregando estoque...
                  </TableCell>
                </TableRow>
              ) : filteredItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Nenhum item encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                filteredItems.map((item) => {
                  const status = getStatus(item)
                  const stockStatus = getStockStatus(item)

                  return (
                    <TableRow key={item.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="font-medium">{item.item_name || item.name}</TableCell>
                      <TableCell className="capitalize">{item.category}</TableCell>
                      <TableCell className={`text-right font-medium ${stockStatus.color}`}>
                        {item.quantity}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {item.min_threshold}
                      </TableCell>
                      <TableCell>
                        {item.expiry_date ? (
                          <div className="flex items-center gap-2">
                            {format(new Date(item.expiry_date), 'dd/MM/yyyy')}
                            {status.isWarning && (
                              <AlertTriangle className="h-4 w-4 text-yellow-500" />
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={status.variant}
                          className={
                            status.isWarning
                              ? 'border-yellow-500 text-yellow-600 bg-yellow-50 hover:bg-yellow-100'
                              : ''
                          }
                        >
                          {status.label}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}

export default StockTable
