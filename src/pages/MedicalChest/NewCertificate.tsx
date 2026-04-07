import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { CheckCircle2, ShieldAlert, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAuth } from '@/hooks/use-auth'
import {
  checkNonConformities,
  createCertificate,
  uploadCertificatePdf,
} from '@/services/medical_chest'
import { toast } from 'sonner'
import { format } from 'date-fns'

const formSchema = z.object({
  certificate_number: z.string().min(2, 'Required'),
  vessel_name: z.string().min(2, 'Required'),
  imo: z.string().optional(),
  issue_date: z.string().min(1, 'Required'),
  expiry_date: z.string().min(1, 'Required'),
  issuing_authority: z.string().min(2, 'Required'),
  status: z.enum(['valid', 'expired', 'pending_renewal']),
  notes: z.string().optional(),
})

function sanitizePDFString(str: string) {
  return str
    .replace(/[^\x20-\x7E]/g, '')
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
}

function generateSimplePDF(data: any): Uint8Array {
  const lines: string[] = []
  const objects: number[] = []
  let currentOffset = 0

  function addLine(line: string) {
    lines.push(line)
    currentOffset += line.length + 1
  }

  const s = sanitizePDFString

  addLine('%PDF-1.4')

  objects.push(currentOffset)
  addLine('1 0 obj')
  addLine('<< /Type /Catalog /Pages 2 0 R >>')
  addLine('endobj')

  objects.push(currentOffset)
  addLine('2 0 obj')
  addLine('<< /Type /Pages /Kids [3 0 R] /Count 1 >>')
  addLine('endobj')

  objects.push(currentOffset)
  addLine('3 0 obj')
  addLine(
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> >>',
  )
  addLine('endobj')

  const parseDateSafe = (d: string) => {
    if (!d) return '-'
    const date = new Date(d)
    return isNaN(date.getTime()) ? '-' : format(date, 'dd/MM/yyyy')
  }

  const issueSafe = parseDateSafe(data.issue_date)
  const expirySafe = parseDateSafe(data.expiry_date)

  const streamContent = `BT
/F2 18 Tf
100 720 Td
(MEDICAL CHEST CERTIFICATE) Tj
/F1 12 Tf
0 -40 Td
(Certificate Number: ${s(data.certificate_number)}) Tj
0 -20 Td
(Vessel Name: ${s(data.vessel_name || '-')}) Tj
0 -20 Td
(IMO: ${s(data.imo || '-')}) Tj
0 -20 Td
(Issue Date: ${s(issueSafe)}) Tj
0 -20 Td
(Expiry Date: ${s(expirySafe)}) Tj
0 -20 Td
(Authority: ${s(data.issuing_authority)}) Tj
0 -20 Td
(Status: ${s(data.status)}) Tj
0 -40 Td
(We certify that the hospital of the ship was inspected and it is in accordance) Tj
0 -20 Td
(with the provisions of the International Maritime Organization.) Tj
ET`

  objects.push(currentOffset)
  addLine('4 0 obj')
  addLine(`<< /Length ${streamContent.length} >>`)
  addLine('stream')
  addLine(streamContent)
  addLine('endstream')
  addLine('endobj')

  objects.push(currentOffset)
  addLine('5 0 obj')
  addLine('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>')
  addLine('endobj')

  objects.push(currentOffset)
  addLine('6 0 obj')
  addLine('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>')
  addLine('endobj')

  const xrefOffset = currentOffset
  addLine('xref')
  addLine(`0 ${objects.length + 1}`)
  addLine('0000000000 65535 f ')
  for (const objOffset of objects) {
    addLine(`${objOffset.toString().padStart(10, '0')} 00000 n `)
  }

  addLine('trailer')
  addLine(`<< /Size ${objects.length + 1} /Root 1 0 R >>`)
  addLine('startxref')
  addLine(xrefOffset.toString())
  addLine('%%EOF')

  const finalString = lines.join('\n')
  const buffer = new Uint8Array(finalString.length)
  for (let i = 0; i < finalString.length; i++) {
    buffer[i] = finalString.charCodeAt(i)
  }
  return buffer
}

export default function MedicalChestNew() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [checking, setChecking] = useState(false)
  const [issues, setIssues] = useState<{
    expiredItems: any[]
    failedKits: string[]
    message?: string
  } | null>(null)
  const [validationSuccess, setValidationSuccess] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      certificate_number: '',
      vessel_name: '',
      imo: '',
      issue_date: new Date().toISOString().split('T')[0],
      expiry_date: '',
      issuing_authority: user?.name || '',
      status: 'valid',
      notes: '',
    },
  })

  const watchedVesselName = form.watch('vessel_name')
  useEffect(() => {
    setIssues(null)
    setValidationSuccess(false)
  }, [watchedVesselName])

  useEffect(() => {
    const userRole = (user as any)?.role || ''
    if (!['admin', 'certifier'].includes(userRole)) {
      toast.error('Unauthorized access')
      navigate('/medical-chest')
      return
    }
  }, [user, navigate])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setChecking(true)
    setIssues(null)
    setValidationSuccess(false)

    try {
      const res = await checkNonConformities(values.vessel_name)
      if (res.hasIssues) {
        setIssues(res)
        toast.error('Bloqueio: Não Conformidade detectada (Itens vencidos ou inspeção pendente)')
        setChecking(false)
        return
      }

      setValidationSuccess(true)

      const data = {
        certificate_number: values.certificate_number,
        vessel_name: values.vessel_name,
        imo: values.imo || '',
        issue_date: new Date(values.issue_date).toISOString(),
        expiry_date: new Date(values.expiry_date).toISOString(),
        issuing_authority: values.issuing_authority,
        status: values.status,
        notes: values.notes || '',
      }

      const record = await createCertificate(data)

      const pdfBytes = generateSimplePDF(data)
      const file = new File([pdfBytes], `certificate_${values.certificate_number}.pdf`, {
        type: 'application/pdf',
      })
      await uploadCertificatePdf(record.id, file)

      toast.success('Certificate issued successfully!')
      navigate('/medical-chest')
    } catch (error) {
      toast.error('Failed to issue certificate')
    } finally {
      setChecking(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Issue Certificate</h1>
        <p className="text-muted-foreground">
          Fill in the certificate details. Compliance will be verified upon submission.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Certificate Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {checking && (
                <div className="flex items-center gap-2 text-muted-foreground p-4 bg-slate-50 dark:bg-slate-900 rounded-md border border-slate-100 dark:border-slate-800">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Verifying NORMAM compliance & Saving...</span>
                </div>
              )}

              {issues && (
                <div className="space-y-4">
                  <Alert variant="destructive">
                    <ShieldAlert className="h-4 w-4" />
                    <AlertTitle>
                      Bloqueio: Não Conformidade detectada (Itens vencidos ou inspeção pendente)
                    </AlertTitle>
                    <AlertDescription>
                      {issues.message && <p>{issues.message}</p>}
                      {issues.expiredItems?.length > 0 && (
                        <p>
                          Items found with expired validity ({issues.expiredItems.length} items).
                        </p>
                      )}
                      {issues.failedKits?.length > 0 && (
                        <p>Non-conforming or missing inspections found for this vessel.</p>
                      )}
                    </AlertDescription>
                  </Alert>
                </div>
              )}

              {validationSuccess && (
                <Alert className="bg-emerald-50 text-emerald-900 border-emerald-200">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <AlertTitle className="text-emerald-800">Compliance Verified</AlertTitle>
                  <AlertDescription className="text-emerald-700">
                    No expired items or failed inspections found. Certificate is being generated.
                  </AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="certificate_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Certificate Number</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g. CERT-2026-001" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="vessel_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vessel Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g. MV Explorer" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="imo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>IMO Number</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Optional" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="issuing_authority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Issuing Authority</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="issue_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Issue Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="expiry_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expiry Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="valid">Valid</SelectItem>
                          <SelectItem value="expired">Expired</SelectItem>
                          <SelectItem value="pending_renewal">Pending Renewal</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Optional notes" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end gap-4 pt-4">
                <Button type="button" variant="outline" onClick={() => navigate('/medical-chest')}>
                  Cancel
                </Button>
                <Button type="submit" disabled={checking}>
                  Issue Certificate
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
