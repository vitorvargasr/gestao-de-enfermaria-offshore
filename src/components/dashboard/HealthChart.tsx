import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { ChartContainer } from '@/components/ui/chart'
import useMainStore from '@/stores/useMainStore'

export function HealthChart() {
  const { crew } = useMainStore()
  const data = [
    { name: 'Apto', value: crew.filter((c) => c.status === 'Apto').length, color: '#10b981' },
    {
      name: 'Observação',
      value: crew.filter((c) => c.status === 'Observação').length,
      color: '#f59e0b',
    },
    { name: 'Inapto', value: crew.filter((c) => c.status === 'Inapto').length, color: '#ef4444' },
  ].filter((d) => d.value > 0)

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold text-slate-800">
          Prontidão da Tripulação
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={{}} className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={85}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  borderRadius: '8px',
                  border: 'none',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                }}
              />
              <Legend verticalAlign="bottom" height={36} iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
