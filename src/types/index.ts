export interface MedicalChestCertificate {
  id: string
  certificate_number: string
  vessel_name?: string
  imo?: string
  issue_date: string
  expiry_date: string
  issuing_authority?: string
  status: 'valid' | 'expired' | 'pending_renewal'
  notes?: string
  pdf_file?: string
  created: string
  updated: string
}
