import { useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { FirstAidKits } from '@/components/inventory/FirstAidKits'
import StockTable from '@/components/inventory/StockTable'
import EDIInvoices from '@/components/inventory/EDIInvoices'
import DisposalForm from '@/components/inventory/DisposalForm'
import StockSettings from '@/components/inventory/StockSettings'
import MovementHistory from '@/components/inventory/MovementHistory'
import { Box, BriefcaseMedical, ScanLine, Truck, Trash2, Settings2, History } from 'lucide-react'

export default function Inventory() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const kitId = searchParams.get('kit')
  const [activeTab, setActiveTab] = useState(kitId ? 'kits' : 'stock')

  return (
    <div className="p-6 h-full flex flex-col overflow-hidden max-w-7xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestão de Estoque</h1>
          <p className="text-muted-foreground mt-2">
            Controle de estoque, compras integradas e conformidade regulatória.
          </p>
        </div>
        <Button
          onClick={() => navigate('/scanner')}
          className="gap-2 bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-200"
        >
          <ScanLine className="h-4 w-4" /> Scanner de Código
        </Button>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex-1 flex flex-col overflow-hidden"
      >
        <TabsList className="w-fit mb-4 flex-wrap h-auto gap-1">
          <TabsTrigger value="stock" className="gap-2 px-4">
            <Box className="h-4 w-4" /> Estoque Atual
          </TabsTrigger>
          <TabsTrigger value="edi" className="gap-2 px-4">
            <Truck className="h-4 w-4" /> Entrada via EDI
          </TabsTrigger>
          <TabsTrigger value="disposal" className="gap-2 px-4">
            <Trash2 className="h-4 w-4" /> Descarte Seguro
          </TabsTrigger>
          <TabsTrigger value="settings" className="gap-2 px-4">
            <Settings2 className="h-4 w-4" /> Níveis Mínimos
          </TabsTrigger>
          <TabsTrigger value="kits" className="gap-2 px-4">
            <BriefcaseMedical className="h-4 w-4" /> Kits Primeiros Socorros
          </TabsTrigger>
          <TabsTrigger value="movements" className="gap-2 px-4">
            <History className="h-4 w-4" /> Histórico de Mov.
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-auto pb-4">
          <TabsContent value="stock" className="m-0 h-full">
            <StockTable />
          </TabsContent>

          <TabsContent value="edi" className="m-0 h-full">
            <EDIInvoices />
          </TabsContent>

          <TabsContent value="disposal" className="m-0 h-full">
            <DisposalForm />
          </TabsContent>

          <TabsContent value="settings" className="m-0 h-full">
            <StockSettings />
          </TabsContent>

          <TabsContent value="kits" className="m-0 h-full bg-card rounded-xl shadow-sm border p-0">
            <FirstAidKits initialOpenKitId={kitId} />
          </TabsContent>

          <TabsContent value="movements" className="m-0 h-full">
            <MovementHistory />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}
