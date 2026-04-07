import pb from '@/lib/pocketbase/client'

export interface DashboardData {
  totalConsultations: number
  observationConsultations: number
  expiringItemsTotal: number
  overdueCount: number
  expiringCount: number
  recentConsultations: any[]
  chartData: { sector: string; casos: number }[]
  expiringItems: any[]
}

export const getDashboardData = async (): Promise<DashboardData> => {
  const now = new Date()
  const ninetyDays = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000)
  const fortyEightHoursAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000)

  const ninetyDaysStr = ninetyDays.toISOString().replace('T', ' ').substring(0, 19) + 'Z'
  const fortyEightHoursAgoStr =
    fortyEightHoursAgo.toISOString().replace('T', ' ').substring(0, 19) + 'Z'

  const [
    totalConsultations,
    observationConsultations,
    expiringItems,
    recentConsultations,
    recent48hConsultations,
  ] = await Promise.all([
    pb.collection('consultations').getList(1, 1),
    pb.collection('consultations').getList(1, 1, { filter: `status = 'observation'` }),
    pb.collection('kit_items').getFullList({
      filter: `validity <= "${ninetyDaysStr}"`,
      sort: 'validity',
    }),
    pb.collection('consultations').getList(1, 5, { sort: '-date' }),
    pb.collection('consultations').getFullList({ filter: `date >= "${fortyEightHoursAgoStr}"` }),
  ])

  const sectors = ['Convés', 'Ponte', 'Casa de Máquinas', 'Cozinha', 'Acomodações']
  const sectorCounts = sectors.reduce(
    (acc, sector) => ({ ...acc, [sector]: 0 }),
    {} as Record<string, number>,
  )

  recent48hConsultations.forEach((c) => {
    if (sectorCounts[c.sector] !== undefined) {
      sectorCounts[c.sector]++
    }
  })

  const chartData = sectors.map((sector) => ({
    sector,
    casos: sectorCounts[sector],
  }))

  const overdueCount = expiringItems.filter((item) => new Date(item.validity) < now).length
  const expiringCount = expiringItems.length - overdueCount

  return {
    totalConsultations: totalConsultations.totalItems,
    observationConsultations: observationConsultations.totalItems,
    expiringItemsTotal: expiringItems.length,
    overdueCount,
    expiringCount,
    recentConsultations: recentConsultations.items,
    chartData,
    expiringItems,
  }
}
