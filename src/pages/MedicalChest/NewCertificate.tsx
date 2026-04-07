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
import { useAuth } from '@/hooks/use-auth'
import {
  checkNonConformities,
  createCertificate,
  uploadCertificatePdf,
} from '@/services/medical_chest'
import { toast } from 'sonner'
import { format } from 'date-fns'

const formSchema = z.object({
  vessel_name: z.string().min(2, 'Required'),
  imo: z.string().min(2, 'Required'),
  issue_date: z.string().min(1, 'Required'),
  po_ref: z.string().optional(),
  valid_until: z.string().min(1, 'Required'),
  flag: z.string().min(2, 'Required'),
  ship_reg: z.string().min(2, 'Required'),
  inspector_name: z.string().min(2, 'Required'),
  signature: z.string().min(2, 'Required'),
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

  const streamContent = `BT
/F2 18 Tf
100 720 Td
(MEDICAL CHEST CERTIFICATE) Tj
/F1 12 Tf
0 -40 Td
(Vessel Name: ${s(data.vessel_name)}) Tj
0 -20 Td
(IMO: ${s(data.imo)}) Tj
0 -20 Td
(Issue Date: ${s(format(new Date(data.issue_date), 'dd/MM/yyyy'))}) Tj
0 -20 Td
(Valid Until: ${s(format(new Date(data.valid_until), 'dd/MM/yyyy'))}) Tj
0 -20 Td
(Flag: ${s(data.flag)}) Tj
0 -20 Td
(Ship REG: ${s(data.ship_reg)}) Tj
0 -20 Td
(PO# Ref: ${s(data.po_ref || 'N/A')}) Tj
0 -40 Td
(We certify that the hospital of the ship was inspected and it is in accordance) Tj
0 -20 Td
(with the provisions of the International Maritime Organization.) Tj
0 -60 Td
(Inspector: ${s(data.inspector_name)}) Tj
/F2 16 Tf
0 -30 Td
(Signature: ${s(data.signature)}) Tj
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
      vessel_name: '',
      imo: '',
      issue_date: new Date().toISOString().split('T')[0],
      po_ref: '',
      valid_until: '',
      flag: '',
      ship_reg: '',
      inspector_name: user?.name || '',
      signature: '',
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
        vessel_name: values.vessel_name,
        imo: values.imo,
        issue_date: new Date(values.issue_date).toISOString(),
        po_ref: values.po_ref || '',
        valid_until: new Date(values.valid_until).toISOString(),
        flag: values.flag,
        ship_reg: values.ship_reg,
        inspector_name: values.inspector_name,
        signature: values.signature,
      }
      const record = await createCertificate(data)

      const pdfBytes = generateSimplePDF(data)
      const file = new File([pdfBytes], `certificate_${values.imo}.pdf`, {
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
          Fill in the vessel details. Compliance will be verified upon submission.
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
                  name="valid_until"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valid Until</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="po_ref"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>PO# Reference</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Optional" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="flag"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Flag</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="ship_reg"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ship INT REG</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="inspector_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Certifier Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="signature"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Digital Signature (Type your full name to sign)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className="font-serif italic text-lg"
                        placeholder="John Doe"
                      />
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
