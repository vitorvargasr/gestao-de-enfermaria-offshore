import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getCertificate } from '@/services/medical_chest'
import type { MedicalChestCertificate } from '@/types'
import { format } from 'date-fns'
import medGroupLogo from '@/assets/logo-b4757.jpg'
import { Button } from '@/components/ui/button'
import { Printer, ArrowLeft } from 'lucide-react'

export default function MedicalChestPrint() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [cert, setCert] = useState<MedicalChestCertificate | null>(null)

  useEffect(() => {
    if (id) getCertificate(id).then(setCert).catch(console.error)
  }, [id])

  if (!cert) return <div className="p-8 text-center">Loading certificate...</div>

  return (
    <div className="min-h-screen bg-gray-200 py-8 print:p-0 print:bg-white text-black">
      {/* Controls - Hidden on print */}
      <div className="max-w-[210mm] mx-auto mb-4 flex justify-between print:hidden">
        <Button
          variant="outline"
          onClick={() => navigate('/medical-chest')}
          className="bg-white text-black hover:bg-gray-100"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <Button onClick={() => window.print()}>
          <Printer className="mr-2 h-4 w-4" /> Print / Save as PDF
        </Button>
      </div>

      {/* A4 Paper Container */}
      <div className="max-w-[210mm] min-h-[297mm] mx-auto bg-white shadow-lg p-[20mm] relative box-border print:shadow-none print:m-0 print:p-[15mm] print:w-[210mm] print:h-[297mm]">
        {/* Header */}
        <div className="flex justify-between items-start border-b-2 border-dotted border-black pb-4 mb-12 relative z-10">
          <img
            src={medGroupLogo}
            alt="MedGroup"
            className="h-20 object-contain mix-blend-multiply"
          />
          <div className="text-right text-sm pt-2">
            <h2 className="font-bold text-gray-800">MEDGROUP OFFSHORE DIST MED E PROD FARM</h2>
            <p className="text-gray-600">CNPJ: 14.533.591/0001-77</p>
          </div>
        </div>

        {/* Title */}
        <div className="text-right mb-12 relative z-10">
          <h1 className="text-3xl font-bold font-serif uppercase tracking-widest">Certificate</h1>
          <p className="text-lg">Medical Chest Certificate</p>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-[150px_1fr] gap-y-4 mb-8 text-sm relative z-10">
          <div className="font-bold">TO:</div>
          <div>
            VESSEL NAME: <span className="font-bold">{cert.vessel_name}</span>
          </div>

          <div className="font-bold">IMO:</div>
          <div className="font-bold">{cert.imo}</div>

          <div className="font-bold">DATE:</div>
          <div className="font-bold">{format(new Date(cert.issue_date), 'dd/MM/yyyy')}</div>

          <div className="font-bold">FROM:</div>
          <div>MEDGROUP DISTRIBUTOR</div>

          <div className="font-bold">SUBJ.:</div>
          <div>MEDICAL CHEST CERTIFICATE</div>

          <div className="font-bold">PO# REF:</div>
          <div className="font-bold">{cert.po_ref || 'N/A'}</div>

          <div className="font-bold">VALID UNTIL:</div>
          <div className="font-bold">{format(new Date(cert.valid_until), 'dd/MM/yyyy')}</div>
        </div>

        <div className="border-b-2 border-dotted border-black mb-8 relative z-10"></div>

        {/* Body Text */}
        <div className="space-y-6 text-justify leading-relaxed relative z-10">
          <p>
            We certify that the hospital of the ship{' '}
            <span className="font-bold">{cert.vessel_name}</span>, registered under the{' '}
            <span className="font-bold">{cert.flag}</span> (
            <span className="font-bold">{cert.ship_reg}</span> Ship INT REG) flag, was inspected and
            it is in accordance with the provisions of the International Maritime Organization (IMO
            – ILO – WHO 1983) Scale "B", and Brazilian Legislation for Boats.
          </p>
          <p>
            Medicines and Medical materials are packed in appropriate place as well as all are in
            good general conditions. Medications are properly labeled and in sufficient quantity in
            accordance with the SOLAS regulations applied above.
          </p>
          <p>
            The expired medicines and medical materials were removed from the ship at time of
            inspection.
          </p>
        </div>

        {/* Validity & Signature */}
        <div className="mt-16 text-center relative z-10">
          <h3 className="text-lg font-bold mb-16 uppercase">
            THIS CERTIFICATE HAS THE VALIDITY OF ONE (1) YEAR FROM THE DATE OF ITS ISSUE.
          </h3>

          <div className="w-64 mx-auto border-t border-black pt-2">
            <div className="font-serif italic text-2xl mb-1 -mt-10">{cert.signature}</div>
            <p className="text-sm font-medium">{cert.inspector_name}</p>
            <p className="text-xs text-gray-600">MedGroup Distribuidora</p>
          </div>
        </div>

        {/* Footer */}
        <div className="absolute bottom-[20mm] left-[20mm] right-[20mm] text-[10px] text-gray-500 z-10">
          <div className="flex justify-between items-end mb-4">
            <div>
              <p className="font-bold text-gray-700">SURVEILLANCE AGENCY MUNICIPAL</p>
              <p>SANITARY CERTIFICATE OF REGULARITY</p>
              <p>Our No. 553-2014</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-gray-700">FEDERAL BOARD OF PHARMACY</p>
              <p>REGISTRATION No. ######</p>
            </div>
          </div>
          <div className="border-t-2 border-dotted border-black pt-2 text-center">
            <p>ADDRESS: LUIZ LYRIO DO VALLE, 82 – CASA 01 – PRAIA CAMPISTA – MACAÉ /RJ - BRAZIL</p>
          </div>
        </div>

        {/* Watermark/Background decoration */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5 overflow-hidden print:opacity-[0.03] z-0">
          <span className="text-[150px] font-bold transform -rotate-45 font-serif text-black whitespace-nowrap select-none">
            CERTIFICATE
          </span>
        </div>
      </div>
    </div>
  )
}
