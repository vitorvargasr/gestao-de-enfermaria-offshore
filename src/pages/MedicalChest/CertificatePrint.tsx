import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getCertificate } from '@/services/medical_chest'
import { format } from 'date-fns'

export default function MedicalChestPrint() {
  const { id } = useParams()
  const [cert, setCert] = useState<any>(null)

  useEffect(() => {
    if (id) {
      getCertificate(id).then(setCert).catch(console.error)
    }
  }, [id])

  if (!cert) return <div className="p-8">Loading...</div>

  const safeFormatDate = (dateString: string | undefined) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return isNaN(date.getTime()) ? '-' : format(date, 'dd/MM/yyyy')
  }

  return (
    <div className="p-8 max-w-4xl mx-auto font-serif">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold uppercase mb-2">Medical Chest Certificate</h1>
        <p className="text-lg">International Health Care</p>
      </div>

      <div className="space-y-6 text-lg">
        <div className="grid grid-cols-2 gap-4">
          <p>
            <strong>Certificate Number:</strong> {cert.certificate_number}
          </p>
          <p>
            <strong>Vessel Name:</strong> {cert.vessel_name || '-'}
          </p>
          <p>
            <strong>IMO:</strong> {cert.imo || '-'}
          </p>
          <p>
            <strong>Issuing Authority:</strong> {cert.issuing_authority || '-'}
          </p>
          <p>
            <strong>Issue Date:</strong> {safeFormatDate(cert.issue_date)}
          </p>
          <p>
            <strong>Expiry Date:</strong> {safeFormatDate(cert.expiry_date)}
          </p>
          <p>
            <strong>Status:</strong> <span className="uppercase">{cert.status}</span>
          </p>
        </div>

        <div className="mt-12 text-justify">
          <p>
            We certify that the hospital of the ship was inspected and it is in accordance with the
            provisions of the International Maritime Organization. All medical supplies and
            equipment have been verified and are valid until the expiry date stated above.
          </p>
        </div>

        {cert.notes && (
          <div className="mt-8">
            <p>
              <strong>Notes:</strong> {cert.notes}
            </p>
          </div>
        )}

        <div className="mt-24 flex justify-between items-end">
          <div className="text-center w-64 border-t border-black pt-2">
            <p>Authorized Signature</p>
            <p className="text-sm mt-1">{cert.issuing_authority}</p>
          </div>
          <div className="text-sm text-gray-500">
            Document generated securely via IHCare System.
          </div>
        </div>
      </div>
    </div>
  )
}
