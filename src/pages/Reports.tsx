import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { FileDown, FileSpreadsheet, Loader2, FileText } from 'lucide-react'
import { toast } from 'sonner'

export default function Reports() {
  const [isExportingPdf, setIsExportingPdf] = useState(false)
  const [isExportingExcel, setIsExportingExcel] = useState(false)
  const [reportType, setReportType] = useState('health')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const handleExport = (format: 'pdf' | 'excel') => {
    if (!startDate || !endDate) {
      toast.error('Selecione o período do relatório.')
      return
    }

    if (format === 'pdf') setIsExportingPdf(true)
    else setIsExportingExcel(true)

    setTimeout(() => {
      if (format === 'pdf') setIsExportingPdf(false)
      else setIsExportingExcel(false)

      toast.success(`Relatório exportado em ${format.toUpperCase()} com sucesso.`)
    }, 2000)
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Relatórios Gerenciais</h1>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="shadow-sm">
          <CardHeader className="border-b bg-slate-50/50">
            <CardTitle>Gerar Relatório</CardTitle>
            <CardDescription>
              Selecione os filtros abaixo para gerar resumos de saúde ou consumo de estoque.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="space-y-2">
              <Label>Tipo de Relatório</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="health">Resumo de Saúde Mensal</SelectItem>
                  <SelectItem value="inventory">Consumo de Estoque</SelectItem>
                  <SelectItem value="audit">Auditoria de Estoque (Reconciliação)</SelectItem>
                  <SelectItem value="occurrences">Registro de Ocorrências</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Data Inicial</Label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Data Final</Label>
                <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t">
              <Button
                className="flex-1"
                variant="outline"
                onClick={() => handleExport('pdf')}
                disabled={isExportingPdf}
              >
                {isExportingPdf ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <FileDown className="w-4 h-4 mr-2" />
                )}
                Exportar PDF
              </Button>
              <Button
                className="flex-1"
                onClick={() => handleExport('excel')}
                disabled={isExportingExcel}
              >
                {isExportingExcel ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <FileSpreadsheet className="w-4 h-4 mr-2" />
                )}
                Exportar Excel
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-50/50 border-dashed shadow-none">
          <CardContent className="flex flex-col items-center justify-center h-full min-h-[300px] text-center space-y-4">
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
              <FileText className="w-8 h-8" />
            </div>
            <div className="max-w-xs space-y-2">
              <h3 className="font-semibold text-slate-800">Repositório de Relatórios</h3>
              <p className="text-sm text-slate-500">
                Os relatórios gerados conterão a identidade visual da Poseidon Offshore e podem ser
                enviados diretamente para a administração em terra.
              </p>
              {reportType === 'audit' && (
                <div className="bg-amber-50 text-amber-800 text-xs p-3 rounded-md mt-4 text-left">
                  <p className="font-semibold mb-1">Conteúdo do Relatório de Auditoria:</p>
                  <ul className="list-disc pl-4 space-y-1">
                    <li>Nome do Item e Lote</li>
                    <li>Estoque Teórico (Sistema)</li>
                    <li>Estoque Físico (Auditado)</li>
                    <li>Divergência Calculada</li>
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
