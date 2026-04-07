import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { Activity, AlertTriangle, Users } from 'lucide-react'
import { useRealtime } from '@/hooks/use-realtime'
import { getDashboardData, DashboardData } from '@/services/dashboard'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ChartContainer } from '@/components/ui/chart'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function Index() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    try {
      const dashboardData = await getDashboardData()
      setData(dashboardData)
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  useRealtime('consultations', () => loadData())
  useRealtime('kit_items', () => loadData())

  if (loading || !data) {
    return (
      <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-4 md:grid-cols-3 mt-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  const hasOutbreak = data.chartData.some((d) => d.casos > 3)
  const chartConfig = { casos: { label: 'Casos', color: '#3b82f6' } }

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500">
      <h1 className="text-2xl font-bold tracking-tight text-slate-900">
        Painel de Controle Central
      </h1>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-[#f8faff] border-[#e2e8f0] shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-blue-900">
              Consultas Registradas
            </CardTitle>
            <Activity className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-950">{data.totalConsultations}</div>
            <p className="text-xs text-blue-600 mt-1">Total de atendimentos</p>
          </CardContent>
        </Card>

        <Card className="bg-[#fffdf7] border-[#fef3c7] shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-amber-900">Em Observação</CardTitle>
            <Users className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-950">{data.observationConsultations}</div>
            <p className="text-xs text-amber-700 mt-1">Necessitam de atenção</p>
          </CardContent>
        </Card>

        <Card className="bg-[#fffcfc] border-[#fee2e2] shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-red-900">Alertas de Estoque</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-950">{data.expiringItemsTotal}</div>
            <p className="text-xs text-red-600 mt-1">
              {data.overdueCount} vencidos, {data.expiringCount} a vencer (90 dias)
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2 shadow-sm border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg">Painel de Análise de Surtos</CardTitle>
            <CardDescription>
              Distribuição de casos médicos nas últimas 48h por setor (Alerta se &gt; 3 casos)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {hasOutbreak && (
              <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-800 rounded-md flex items-center gap-2 text-sm font-medium animate-pulse">
                <AlertTriangle className="h-4 w-4" />
                Alerta: Surto detectado. Um ou mais setores excederam 3 casos médicos nas últimas 48
                horas.
              </div>
            )}
            <ChartContainer config={chartConfig} className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data.chartData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis
                    dataKey="sector"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                    allowDecimals={false}
                  />
                  <Tooltip
                    cursor={{ fill: '#f3f4f6' }}
                    contentStyle={{
                      borderRadius: '8px',
                      border: 'none',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    }}
                  />
                  <Bar
                    dataKey="casos"
                    fill="var(--color-casos)"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={60}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200 flex flex-col">
          <CardHeader>
            <CardTitle className="text-lg">Últimas Consultas</CardTitle>
          </CardHeader>
          <CardContent className="flex-1">
            {data.recentConsultations.length > 0 ? (
              <div className="space-y-4">
                {data.recentConsultations.map((c) => (
                  <div
                    key={c.id}
                    className="flex justify-between border-b border-slate-100 pb-3 last:border-0 last:pb-0"
                  >
                    <div>
                      <p className="font-medium text-sm text-slate-900">{c.patient_name}</p>
                      <p className="text-sm text-slate-500 mt-0.5">{c.symptom}</p>
                    </div>
                    <div className="text-xs text-slate-500 bg-slate-50 px-2 py-1 rounded-md h-fit border border-slate-100 whitespace-nowrap">
                      {format(new Date(c.date), 'dd/MM/yyyy')}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-sm text-slate-500 py-8">
                Nenhuma consulta recente.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border-orange-100 shadow-sm overflow-hidden">
        <CardHeader className="bg-orange-50/30 border-b border-orange-100 pb-4">
          <CardTitle className="text-lg text-orange-950 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            Alertas de Validade e Estoque
          </CardTitle>
          <CardDescription className="text-orange-700 font-medium mt-1">
            A Vencer nos próximos 90 dias
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          {data.expiringItems.length > 0 ? (
            <div className="space-y-2">
              {data.expiringItems.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center p-3 rounded-md bg-orange-50/80 border border-orange-200/60 transition-colors hover:bg-orange-100/50"
                >
                  <span className="text-sm text-orange-950">
                    <strong className="font-semibold">{item.name}</strong>{' '}
                    <span className="text-orange-700/80 font-medium">(Lote: {item.lot})</span>
                  </span>
                  <span className="text-sm font-medium text-orange-800 bg-white/60 px-2.5 py-1 rounded shadow-sm">
                    Vence em: {format(new Date(item.validity), 'dd/MM/yyyy')}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-sm text-slate-500 py-4">
              Nenhum item vencendo nos próximos 90 dias.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
