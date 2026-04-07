import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  LineChart,
  Line,
  Tooltip as RechartsTooltip,
} from 'recharts'
import { useMemo } from 'react'
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart'
import { Activity, DollarSign, TrendingUp, PackageSearch, Stethoscope } from 'lucide-react'
import useMainStore from '@/stores/useMainStore'

export default function BI() {
  const { consultations } = useMainStore()

  const costData = useMemo(
    () => [
      { month: 'Jan', costs: 4500, vessel: 'Poseidon Alpha' },
      { month: 'Fev', costs: 5200, vessel: 'Poseidon Alpha' },
      { month: 'Mar', costs: 4800, vessel: 'Poseidon Alpha' },
      { month: 'Abr', costs: 6100, vessel: 'Poseidon Alpha' },
      { month: 'Mai', costs: 5900, vessel: 'Poseidon Alpha' },
      { month: 'Jun', costs: 6500, vessel: 'Poseidon Alpha' },
    ],
    [],
  )

  const categoryConsumption = useMemo(
    () => [
      { category: 'Analgésicos', value: 450 },
      { category: 'Antibióticos', value: 120 },
      { category: 'Curativos', value: 800 },
      { category: 'Injetáveis', value: 90 },
      { category: 'Equip. EPI', value: 300 },
    ],
    [],
  )

  const symptomIncidence = useMemo(() => {
    if (!consultations || consultations.length === 0) {
      return [
        { name: 'Dor de Cabeça', count: 12 },
        { name: 'Desidratação', count: 8 },
        { name: 'Trauma', count: 5 },
        { name: 'Dor Lombar', count: 4 },
        { name: 'Enjoo/Vômito', count: 3 },
      ]
    }

    const counts: Record<string, number> = {}
    consultations.forEach((c) => {
      const reason = c.reason || 'Outro'
      counts[reason] = (counts[reason] || 0) + 1
    })

    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
  }, [consultations])

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20 md:pb-0">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inteligência de Negócios (BI)</h1>
          <p className="text-muted-foreground">
            Visão corporativa de custos e consumo de saúde da frota.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Custo Total (Ano)</CardTitle>
            <DollarSign className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800">R$ 33.000</div>
            <p className="text-xs text-muted-foreground">+12% em relação ao semestre anterior</p>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Consultas Realizadas</CardTitle>
            <Activity className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800">142</div>
            <p className="text-xs text-muted-foreground">Média de 23 por mês</p>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Itens Dispensados</CardTitle>
            <PackageSearch className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800">1.760</div>
            <p className="text-xs text-muted-foreground">Em 6 categorias principais</p>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tendência de Saúde</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800">Estável</div>
            <p className="text-xs text-muted-foreground">
              Sem surtos reportados nos últimos 30 dias
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="shadow-sm lg:col-span-2">
          <CardHeader>
            <CardTitle>Evolução de Custos (R$)</CardTitle>
            <CardDescription>
              Gastos consolidados por mês - Embarcação Poseidon Alpha
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{ costs: { label: 'Custos Totais', color: 'hsl(var(--primary))' } }}
              className="h-[300px] w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={costData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="month" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis allowDecimals={false} fontSize={12} tickLine={false} axisLine={false} />
                  <RechartsTooltip content={<ChartTooltipContent />} />
                  <Line
                    type="monotone"
                    dataKey="costs"
                    stroke="#0ea5e9"
                    strokeWidth={3}
                    dot={{ r: 4, fill: '#0ea5e9' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Consumo por Categoria</CardTitle>
            <CardDescription>Volume de itens dispensados no semestre</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{ value: { label: 'Unidades', color: '#10b981' } }}
              className="h-[300px] w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={categoryConsumption}
                  layout="vertical"
                  margin={{ top: 10, right: 10, left: 20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                  <XAxis type="number" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis
                    type="category"
                    dataKey="category"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    width={100}
                  />
                  <RechartsTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]} fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-indigo-500" />
              Incidência de Sintomas
            </CardTitle>
            <CardDescription>Principais queixas (Tempo Real)</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{ count: { label: 'Casos', color: '#6366f1' } }}
              className="h-[300px] w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={symptomIncidence}
                  layout="vertical"
                  margin={{ top: 10, right: 30, left: 20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                  <XAxis
                    type="number"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    width={110}
                  />
                  <RechartsTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]} fill="#6366f1" barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
