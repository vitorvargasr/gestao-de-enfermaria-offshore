export type CrewStatus = 'Apto' | 'Inapto' | 'Observação'

export interface CrewMember {
  id: string
  name: string
  role: string
  department: string
  bloodType: string
  allergies: string[]
  chronic: string[]
  status: CrewStatus
}

export interface InventoryItem {
  id: string
  name: string
  batch: string
  expiry: string
  quantity: number
  minQuantity: number
  unit: string
}

export interface FirstAidKitItem {
  id: string
  name: string
  quantity: number
  expiryDate: string
}

export interface FirstAidKit {
  id: string
  name: string
  location: string
  items: FirstAidKitItem[]
}

export type AuditItem = {
  itemId: string
  theoreticalQuantity: number
  scannedQuantity: number
  variance: number
}

export type Audit = {
  id: string
  date: string
  items: AuditItem[]
}

export interface Consultation {
  id: string
  patientId: string
  date: string
  vitals: { bp: string; hr: number; temp: number; spo2: number }
  symptoms: string
  diagnosis: string
  treatment: string
  status: CrewStatus
}

export interface Incident {
  id: string
  date: string
  type: 'Acidente' | 'MEDEVAC'
  description: string
  status: 'Aberto' | 'Resolvido'
}

export interface MedicalChestCertificate {
  id: string
  certificate_number: string
  issue_date: string
  expiry_date: string
  issuing_authority: string
  status: 'valid' | 'expired' | 'pending_renewal'
  notes?: string
  created: string
  updated: string
}
