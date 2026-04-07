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
    totalConsultationsRes,
    expiringItemsRes,
    recentConsultationsRes,
    recent48hConsultationsRes,
  ] = await Promise.allSettled([
    pb.collection('consultations').getList(1, 1),
    pb.collection('inventory').getFullList({
      filter: `expiry_date <= "${ninetyDaysStr}"`,
      sort: 'expiry_date',
    }),
    pb.collection('consultations').getList(1, 5, { sort: '-date' }),
    pb.collection('consultations').getFullList({
      filter: `date >= "${fortyEightHoursAgoStr}"`,
      expand: 'crew_member',
    }),
  ])

  const totalConsultations =
    totalConsultationsRes.status === 'fulfilled' ? totalConsultationsRes.value.totalItems : 0

  const expiringItems = expiringItemsRes.status === 'fulfilled' ? expiringItemsRes.value : []

  const recentConsultations =
    recentConsultationsRes.status === 'fulfilled' ? recentConsultationsRes.value.items : []

  const recent48hConsultations =
    recent48hConsultationsRes.status === 'fulfilled' ? recent48hConsultationsRes.value : []

  const observationConsultations = 0 // Not available in current schema

  const sectors = ['Convés', 'Ponte', 'Casa de Máquinas', 'Cozinha', 'Acomodações']
  const sectorCounts = sectors.reduce(
    (acc, sector) => ({ ...acc, [sector]: 0 }),
    {} as Record<string, number>,
  )

  recent48hConsultations.forEach((c) => {
    const department = c.expand?.crew_member?.department
    if (department && sectorCounts[department] !== undefined) {
      sectorCounts[department]++
    }
  })

  const chartData = sectors.map((sector) => ({
    sector,
    casos: sectorCounts[sector],
  }))

  const overdueCount = expiringItems.filter(
    (item) => item.expiry_date && new Date(item.expiry_date) < now,
  ).length
  const expiringCount = expiringItems.length - overdueCount

  return {
    totalConsultations,
    observationConsultations,
    expiringItemsTotal: expiringItems.length,
    overdueCount,
    expiringCount,
    recentConsultations,
    chartData,
    expiringItems,
  }
}
