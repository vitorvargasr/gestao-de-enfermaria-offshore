import useMainStore from '@/stores/useMainStore'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { format, parseISO } from 'date-fns'

export default function MovementHistory() {
  const { inventoryMovements, inventory } = useMainStore()

  return (
    <div className="border rounded-md bg-white shadow-sm overflow-hidden h-full flex flex-col">
      <div className="p-4 border-b bg-slate-50">
        <h2 className="text-lg font-semibold text-slate-900">Histórico de Movimentações</h2>
        <p className="text-sm text-slate-500">
          Log detalhado de entradas, saídas e ajustes de estoque para auditoria.
        </p>
      </div>
      <div className="flex-1 overflow-auto">
        <Table>
          <TableHeader className="bg-slate-50 sticky top-0 z-10 shadow-sm">
            <TableRow>
              <TableHead>Data/Hora</TableHead>
              <TableHead>Item / Medicamento</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead className="text-right">Qtd</TableHead>
              <TableHead>Motivo</TableHead>
              <TableHead>Responsável</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {inventoryMovements.map((mov) => {
              const item = inventory.find((i) => i.id === mov.itemId)
              return (
                <TableRow key={mov.id} className="hover:bg-slate-50/50">
                  <TableCell className="text-sm text-slate-600 font-mono whitespace-nowrap">
                    {format(parseISO(mov.date), 'dd/MM/yyyy HH:mm')}
                  </TableCell>
                  <TableCell className="font-medium text-slate-900">
                    {item?.name || 'Item Removido do Sistema'}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={
                        mov.type === 'Entrada'
                          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                          : mov.type === 'Saída'
                            ? 'bg-red-100 text-red-800 hover:bg-red-200'
                            : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                      }
                    >
                      {mov.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-mono font-medium">
                    <span
                      className={
                        mov.type === 'Saída'
                          ? 'text-red-600'
                          : mov.type === 'Entrada'
                            ? 'text-emerald-600'
                            : 'text-blue-600'
                      }
                    >
                      {mov.type === 'Saída' ? '-' : '+'}
                      {mov.quantity}
                    </span>
                  </TableCell>
                  <TableCell className="text-slate-600 max-w-[200px] truncate" title={mov.reason}>
                    {mov.reason}
                  </TableCell>
                  <TableCell className="text-slate-600">{mov.user}</TableCell>
                </TableRow>
              )
            })}
            {inventoryMovements.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-slate-500">
                  Nenhuma movimentação registrada no histórico.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
