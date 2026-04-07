import pb from '@/lib/pocketbase/client'
import type { MedicalChestCertificate } from '@/types'

export async function getCertificates() {
  return pb.collection('medical_chest_certificates').getFullList<MedicalChestCertificate>({
    sort: '-created',
  })
}

export async function getCertificate(id: string) {
  return pb.collection('medical_chest_certificates').getOne<MedicalChestCertificate>(id)
}

export async function createCertificate(data: Partial<MedicalChestCertificate>) {
  return pb.collection('medical_chest_certificates').create(data)
}

export async function deleteCertificate(id: string) {
  return pb.collection('medical_chest_certificates').delete(id)
}

export async function uploadCertificatePdf(id: string, file: File) {
  const formData = new FormData()
  formData.append('pdf_file', file)
  return pb.collection('medical_chest_certificates').update<MedicalChestCertificate>(id, formData)
}

export function getCertificatePdfUrl(record: MedicalChestCertificate) {
  return record.pdf_file ? pb.files.getURL(record, record.pdf_file) : ''
}

export async function checkNonConformities(vesselName?: string) {
  const now = new Date().toISOString().replace('T', ' ').substring(0, 19) + 'Z'

  let targetKitId: string | null = null

  if (vesselName) {
    const safeName = vesselName.replace(/"/g, '\\"')
    const kits = await pb.collection('kits').getFullList({
      filter: `name ~ "${safeName}"`,
    })
    if (kits.length > 0) {
      targetKitId = kits[0].id
    }
  }

  let expiredItems: any[] = []
  const failedKits: string[] = []

  if (targetKitId) {
    expiredItems = await pb.collection('kit_items').getFullList({
      filter: `validity < "${now}" && kit = "${targetKitId}"`,
    })

    const inspections = await pb.collection('kit_inspections').getList(1, 1, {
      filter: `kit = "${targetKitId}"`,
      sort: '-created',
    })
    if (inspections.items.length > 0) {
      const latest = inspections.items[0]
      const status = latest.status.toLowerCase()
      if (
        !status.includes('conforme') &&
        !status.includes('aprovado') &&
        !status.includes('approved') &&
        !status.includes('passed')
      ) {
        failedKits.push(vesselName!)
      }
    } else {
      failedKits.push(vesselName!)
    }
  } else if (!vesselName) {
    expiredItems = await pb.collection('kit_items').getFullList({
      filter: `validity < "${now}"`,
    })

    const kits = await pb.collection('kits').getFullList()
    for (const kit of kits) {
      const inspections = await pb.collection('kit_inspections').getList(1, 1, {
        filter: `kit = "${kit.id}"`,
        sort: '-created',
      })

      if (inspections.items.length > 0) {
        const latest = inspections.items[0]
        const status = latest.status.toLowerCase()
        if (
          !status.includes('conforme') &&
          !status.includes('aprovado') &&
          !status.includes('approved') &&
          !status.includes('passed')
        ) {
          failedKits.push(kit.name)
        }
      } else {
        failedKits.push(kit.name)
      }
    }
  }

  return {
    hasIssues: expiredItems.length > 0 || failedKits.length > 0,
    expiredItems,
    failedKits,
  }
}
