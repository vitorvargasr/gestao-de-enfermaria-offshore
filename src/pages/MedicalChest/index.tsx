import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useRealtime } from '@/hooks/use-realtime'
import { Plus, Printer, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import {
  getCertificates,
  uploadCertificatePdf,
  getCertificatePdfUrl,
} from '@/services/medical_chest'
import { useAuth } from '@/hooks/use-auth'
import { toast } from 'sonner'
import type { MedicalChestCertificate } from '@/types'
import { format } from 'date-fns'

export default function MedicalChest() {
  const [certs, setCerts] = useState<MedicalChestCertificate[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const { user } = useAuth()
  const userRole = (user as any)?.role || ''
  const canIssue = ['admin', 'certifier'].includes(userRole)

  const loadCerts = () => {
    getCertificates().then(setCerts).catch(console.error)
  }

  useEffect(() => {
    loadCerts()
  }, [])

  useRealtime('medical_chest_certificates', () => {
    loadCerts()
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Medical Chest Certificates</h1>
          <p className="text-muted-foreground">Manage and view vessel compliance certificates.</p>
        </div>
        {canIssue && (
          <Button asChild>
            <Link to="/medical-chest/new">
              <Plus className="mr-2 h-4 w-4" /> Issue Certificate
            </Link>
          </Button>
        )}
      </div>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <CardTitle>Issued Certificates</CardTitle>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by vessel or IMO..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vessel Name</TableHead>
                <TableHead>IMO</TableHead>
                <TableHead>Issue Date</TableHead>
                <TableHead>Valid Until</TableHead>
                <TableHead>Inspector</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {certs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    No certificates issued yet.
                  </TableCell>
                </TableRow>
              ) : (
                certs
                  .filter(
                    (c) =>
                      (c.vessel_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                      (c.imo?.toLowerCase() || '').includes(searchTerm.toLowerCase()),
                  )
                  .map((cert) => (
                    <TableRow key={cert.id}>
                      <TableCell className="font-medium">{cert.vessel_name}</TableCell>
                      <TableCell>{cert.imo}</TableCell>
                      <TableCell>{format(new Date(cert.issue_date), 'dd/MM/yyyy')}</TableCell>
                      <TableCell>
                        {new Date(cert.valid_until) < new Date() ? (
                          <Badge variant="destructive">Expired</Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="bg-emerald-50 text-emerald-600 border-emerald-200"
                          >
                            Valid
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>{cert.inspector_name}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end items-center gap-2">
                          {cert.pdf_file ? (
                            <Button variant="outline" size="sm" asChild>
                              <a
                                href={getCertificatePdfUrl(cert)}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                View PDF
                              </a>
                            </Button>
                          ) : (
                            <>
                              <Button variant="ghost" size="icon" asChild title="Print Certificate">
                                <Link to={`/print/certificate/${cert.id}`} target="_blank">
                                  <Printer className="h-4 w-4" />
                                </Link>
                              </Button>
                              {canIssue && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="relative cursor-pointer"
                                >
                                  Upload Signed PDF
                                  <input
                                    type="file"
                                    accept="application/pdf"
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    onChange={async (e) => {
                                      const file = e.target.files?.[0]
                                      if (file) {
                                        try {
                                          await uploadCertificatePdf(cert.id, file)
                                          toast.success('PDF uploaded successfully')
                                          getCertificates().then(setCerts)
                                        } catch (err) {
                                          toast.error('Failed to upload PDF')
                                          console.error(err)
                                        }
                                      }
                                    }}
                                  />
                                </Button>
                              )}
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>