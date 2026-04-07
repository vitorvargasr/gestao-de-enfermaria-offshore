import pb from '@/lib/pocketbase/client'

export interface Kit {
  id: string
  name: string
  location?: string
  status?: string
}

export const getKits = async (): Promise<Kit[]> => {
  return await pb.collection('kits').getFullList<Kit>({
    sort: 'name',
  })
}
