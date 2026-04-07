import pb from '@/lib/pocketbase/client'

export interface KitItem {
  id: string
  kit: string
  item: string
  quantity: number
  created: string
  updated: string
  expand?: {
    kit?: any
    item?: any
  }
}

export const getKitItems = async (filter?: string): Promise<KitItem[]> => {
  return await pb.collection('kit_items').getFullList<KitItem>({
    sort: '-created',
    expand: 'kit,item',
    filter,
  })
}

export const createKitItem = async (data: Partial<KitItem>) => {
  return await pb.collection('kit_items').create<KitItem>(data)
}

export const updateKitItem = async (id: string, data: Partial<KitItem>) => {
  return await pb.collection('kit_items').update<KitItem>(id, data)
}

export const deleteKitItem = async (id: string) => {
  return await pb.collection('kit_items').delete(id)
}
