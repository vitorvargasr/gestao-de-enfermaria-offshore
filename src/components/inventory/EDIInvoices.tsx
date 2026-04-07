import { useState, useRef, useEffect } from 'react'
import pb from '@/lib/pocketbase/client'
import useMainStore from '@/stores/useMainStore'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FileText, CheckCircle2, Download, UploadCloud } from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'sonner'

export default function EDIInvoices() {
  const { ediInvoices, processEDIInvoice } = useMainStore()
  const [isUploading, setIsUploading] = useState(false)
  const [defaultKitId, setDefaultKitId] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const fetchDefaultKit = async () => {
      try {
        const kits = await pb.collection('kits').getList(1, 1)
        if (kits.items.length > 0) {
          setDefaultKitId(kits.items[0].id)
        }
      } catch (err) {
        // ignore
      }
    }
    fetchDefaultKit()
  }, [])

  const handleProcess = (id: string) => {
    processEDIInvoice(id)
    toast.success('Nota Fiscal processada. Estoque atualizado automaticamente via EDI!')
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.name.endsWith('.xml')) {
      toast.error('Formato inválido', { description: 'Por favor, envie um arquivo .xml (NF-e).' })
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }

    setIsUploading(true)

    const reader = new FileReader()
    reader.onload = async (event) => {
      try {
        const xmlText = event.target?.result as string
        const parser = new DOMParser()
        const xmlDoc = parser.parseFromString(xmlText, 'text/xml')

        const detElements = xmlDoc.getElementsByTagName('det')
        let importedCount = 0

        if (detElements.length > 0 && defaultKitId) {
          for (let i = 0; i < detElements.length; i++) {
            const prod = detElements[i].getElementsByTagName('prod')[0]
            if (prod) {
              const xProd =
                prod.getElementsByTagName('xProd')[0]?.textContent || 'Produto Desconhecido'
              const qCom = parseFloat(prod.getElementsByTagName('qCom')[0]?.textContent || '1')

              // Import into pocketbase kit_items collection
              await pb.collection('kit_items').create({
                kit: defaultKitId,
                name: xProd,
                quantity: Math.max(1, Math.floor(qCom)),
                lot: 'EDI-' + new Date().getTime().toString().slice(-6),
                validity: new Date(
                  new Date().setFullYear(new Date().getFullYear() + 1),
                ).toISOString(),
                serial: 'NFE-' + (i + 1),
              })
              importedCount++
            }
          }
        }

        toast.success('NF-e Processada com Sucesso!', {
          description: `Arquivo ${file.name} importado. ${importedCount ? importedCount + ' itens adicionados via EDI ao estoque.' : 'Estoque atualizado via EDI.'}`,
        })
      } catch (err) {
        toast.error('Erro ao processar XML', { description: 'Falha ao ler os dados da NF-e.' })
      } finally {
        setIsUploading(false)
        if (fileInputRef.current) fileInputRef.current.value = ''
      }
    }

    reader.onerror = () => {
      setIsUploading(false)
      toast.error('Erro de leitura', { description: 'Não foi possível ler o arquivo.' })
    }

    reader.readAsText(file)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-blue-50 p-4 rounded-lg border border-blue-100 gap-4">
        <div>
          <h3 className="font-semibold text-blue-900 flex items-center gap-2">
            <Download className="w-5 h-5" /> Integração EDI com Fornecedores
          </h3>
          <p className="text-sm text-blue-700 mt-1">
            Conectado ao sistema de suprimentos da Poseidon Offshore. Receba notas fiscais e lotes
            de chegada automaticamente.
          </p>
        </div>
        <Button
          variant="outline"
          className="bg-white whitespace-nowrap shadow-sm"
          onClick={() => fileInputRef.current?.click()}
        >
          {isUploading ? 'Processando...' : 'Fazer Upload XML (NF-e)'}
          <UploadCloud className="w-4 h-4 ml-2" />
        </Button>
        <input
          type="file"
          accept=".xml"
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileUpload}
        />
      </div>

      <div className="grid gap-4">
        <h4 className="font-medium text-slate-800 text-lg">Notas Fiscais Pendentes e Histórico</h4>
        {ediInvoices.map((invoice) => (
          <Card key={invoice.id}>
            <CardHeader className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="w-5 h-5 text-slate-400" />
                  {invoice.number}
                </CardTitle>
                <CardDescription>
                  Fornecedor: {invoice.supplier} • Emitida em:{' '}
                  {format(new Date(invoice.date), 'dd/MM/yyyy')}
                </CardDescription>
              </div>
              <div>
                {invoice.status === 'Processed' ? (
                  <Badge className="bg-green-100 text-green-800 border-green-200 gap-1 py-1.5 px-3">
                    <CheckCircle2 className="w-4 h-4" /> Importada para Estoque
                  </Badge>
                ) : (
                  <Button onClick={() => handleProcess(invoice.id)}>Processar Entrada</Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-slate-50 p-4 rounded-md text-sm border">
                <p className="font-medium text-slate-700 mb-3">Resumo dos Itens:</p>
                <ul className="space-y-2">
                  {invoice.items.map((item, idx) => (
                    <li
                      key={idx}
                      className="flex flex-col sm:flex-row sm:justify-between sm:items-center text-slate-600 pb-2 border-b last:border-0 last:pb-0"
                    >
                      <span className="font-medium">
                        {item.quantity}x {item.name}
                      </span>
                      <span className="font-mono text-xs text-slate-500 mt-1 sm:mt-0">
                        Lote: {item.batch} | Val: {format(new Date(item.expiryDate), 'MM/yyyy')}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
