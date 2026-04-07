import { useState, useRef } from 'react'
import useMainStore, { Sector, CrewMember } from '@/stores/useMainStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Search, Plus, FileText, UploadCloud, Trash2, FileIcon } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'

export default function Crew() {
  const { crew, addCrew, updateCrewStatus, addAttachment, removeAttachment } = useMainStore()
  const [search, setSearch] = useState('')
  const [openAdd, setOpenAdd] = useState(false)
  const [selectedCrew, setSelectedCrew] = useState<CrewMember | null>(null)

  const [name, setName] = useState('')
  const [rank, setRank] = useState('')
  const [sector, setSector] = useState<Sector>('Convés')
  const [age, setAge] = useState('')
  const [allergies, setAllergies] = useState('')
  const [conditions, setConditions] = useState('')

  const fileInputRef = useRef<HTMLInputElement>(null)

  const filtered = crew.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.rank.toLowerCase().includes(search.toLowerCase()),
  )

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault()
    addCrew({ name, rank, sector, age: Number(age), allergies, conditions, status: 'Active' })
    setOpenAdd(false)
    setName('')
    setRank('')
    setSector('Convés')
    setAge('')
    setAllergies('')
    setConditions('')
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && selectedCrew) {
      addAttachment(selectedCrew.id, {
        name: file.name,
        type: file.type || 'application/octet-stream',
        url: URL.createObjectURL(file),
      })
      toast.success('Documento anexado ao prontuário com sucesso.')
      if (fileInputRef.current) fileInputRef.current.value = ''

      setSelectedCrew((prev) =>
        prev
          ? {
              ...prev,
              attachments: [
                ...prev.attachments,
                {
                  id: Math.random().toString(),
                  name: file.name,
                  url: URL.createObjectURL(file),
                  type: file.type || 'application/octet-stream',
                  date: new Date().toISOString(),
                },
              ],
            }
          : null,
      )
    }
  }

  const handleDeleteAttachment = (attId: string) => {
    if (selectedCrew) {
      removeAttachment(selectedCrew.id, attId)
      setSelectedCrew((prev) =>
        prev
          ? {
              ...prev,
              attachments: prev.attachments.filter((a) => a.id !== attId),
            }
          : null,
      )
      toast.info('Documento removido.')
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Gestão de Tripulação</h1>
        <Dialog open={openAdd} onOpenChange={setOpenAdd}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Novo Tripulante
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Cadastrar Tripulante</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAdd} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome Completo</Label>
                <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="rank">Cargo / Rank</Label>
                  <Input
                    id="rank"
                    required
                    value={rank}
                    onChange={(e) => setRank(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sector">Setor</Label>
                  <Select value={sector} onValueChange={(val: Sector) => setSector(val)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Casa de Máquinas">Casa de Máquinas</SelectItem>
                      <SelectItem value="Cozinha">Cozinha</SelectItem>
                      <SelectItem value="Convés">Convés</SelectItem>
                      <SelectItem value="Ponte">Ponte</SelectItem>
                      <SelectItem value="Acomodações">Acomodações</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="age">Idade</Label>
                <Input
                  id="age"
                  type="number"
                  required
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="allergies">Alergias</Label>
                <Input
                  id="allergies"
                  placeholder="Ex: Nenhuma, Penicilina..."
                  value={allergies}
                  onChange={(e) => setAllergies(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="conditions">Condições Crônicas</Label>
                <Input
                  id="conditions"
                  placeholder="Ex: Hipertensão, Asma..."
                  value={conditions}
                  onChange={(e) => setConditions(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full mt-2">
                Salvar
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou cargo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-white"
          />
        </div>
      </div>

      <div className="border rounded-md bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Cargo</TableHead>
              <TableHead>Setor</TableHead>
              <TableHead>Idade</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Ação</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-medium">{c.name}</TableCell>
                <TableCell>{c.rank}</TableCell>
                <TableCell>{c.sector}</TableCell>
                <TableCell>{c.age}</TableCell>
                <TableCell>
                  <Select
                    value={c.status}
                    onValueChange={(val: 'Active' | 'Observation') => updateCrewStatus(c.id, val)}
                  >
                    <SelectTrigger className="w-[140px] h-8 text-xs bg-transparent border-0 ring-0 focus:ring-0">
                      <Badge
                        variant={c.status === 'Active' ? 'secondary' : 'destructive'}
                        className={c.status === 'Active' ? 'bg-green-100 text-green-800' : ''}
                      >
                        {c.status === 'Active' ? 'Ativo' : 'Em Observação'}
                      </Badge>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Marcar Ativo</SelectItem>
                      <SelectItem value="Observation">Pôr em Obs.</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm" onClick={() => setSelectedCrew(c)}>
                        <FileText className="w-4 h-4 mr-2" /> Prontuário
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px]">
                      <DialogHeader>
                        <DialogTitle>Prontuário Médico: {selectedCrew?.name}</DialogTitle>
                        <DialogDescription>
                          {selectedCrew?.rank} • {selectedCrew?.sector}
                        </DialogDescription>
                      </DialogHeader>
                      {selectedCrew && (
                        <Tabs defaultValue="info" className="mt-4">
                          <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="info">Info Clínicas</TabsTrigger>
                            <TabsTrigger value="certs">Certificações</TabsTrigger>
                            <TabsTrigger value="attachments">Arquivos</TabsTrigger>
                          </TabsList>
                          <TabsContent value="info" className="space-y-4 pt-4">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div className="p-3 bg-slate-50 rounded-lg border">
                                <span className="font-semibold block text-slate-500 mb-1">
                                  Alergias
                                </span>
                                {selectedCrew.allergies || 'Nenhuma informada'}
                              </div>
                              <div className="p-3 bg-slate-50 rounded-lg border">
                                <span className="font-semibold block text-slate-500 mb-1">
                                  Condições Crônicas
                                </span>
                                {selectedCrew.conditions || 'Nenhuma informada'}
                              </div>
                            </div>
                          </TabsContent>
                          <TabsContent value="certs" className="space-y-4 pt-4">
                            <div className="flex items-center justify-between">
                              <h3 className="text-sm font-semibold text-slate-800">
                                Certificados e Treinamentos (STCW, ASO)
                              </h3>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  const name = prompt('Nome do Certificado (ex: STCW):')
                                  if (!name) return
                                  const issueDate = prompt(
                                    'Data de Emissão (YYYY-MM-DD):',
                                    new Date().toISOString().split('T')[0],
                                  )
                                  if (!issueDate) return
                                  const expiryDate = prompt(
                                    'Data de Validade (YYYY-MM-DD):',
                                    new Date().toISOString().split('T')[0],
                                  )
                                  if (!expiryDate) return
                                  useMainStore.getState().addCertificate(selectedCrew.id, {
                                    name,
                                    issueDate: new Date(issueDate).toISOString(),
                                    expiryDate: new Date(expiryDate).toISOString(),
                                  })
                                  toast.success(
                                    'Certificado adicionado com sucesso. Feche e reabra o prontuário para visualizar a atualização.',
                                  )
                                }}
                              >
                                <Plus className="w-4 h-4 mr-2" /> Adicionar
                              </Button>
                            </div>
                            <div className="space-y-2 max-h-[250px] overflow-y-auto">
                              {selectedCrew.certificates?.map((cert) => {
                                const expDate = new Date(cert.expiryDate)
                                const isExpired = expDate < new Date()
                                const isExpiringSoon =
                                  !isExpired &&
                                  expDate.getTime() - new Date().getTime() <
                                    90 * 24 * 60 * 60 * 1000
                                return (
                                  <div
                                    key={cert.id}
                                    className="p-3 border rounded-lg bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-sm"
                                  >
                                    <div>
                                      <p className="font-medium text-sm text-slate-800">
                                        {cert.name}
                                      </p>
                                      <p className="text-xs text-slate-500">
                                        Emitido: {new Date(cert.issueDate).toLocaleDateString()} •
                                        Validade: {new Date(cert.expiryDate).toLocaleDateString()}
                                      </p>
                                    </div>
                                    <Badge
                                      variant={
                                        isExpired
                                          ? 'destructive'
                                          : isExpiringSoon
                                            ? 'secondary'
                                            : 'default'
                                      }
                                      className={
                                        isExpiringSoon
                                          ? 'bg-amber-100 text-amber-800 border-amber-200'
                                          : isExpired
                                            ? ''
                                            : 'bg-green-100 text-green-800 border-green-200'
                                      }
                                    >
                                      {isExpired
                                        ? 'Vencido'
                                        : isExpiringSoon
                                          ? 'A Vencer'
                                          : 'Válido'}
                                    </Badge>
                                  </div>
                                )
                              })}
                              {(!selectedCrew.certificates ||
                                selectedCrew.certificates.length === 0) && (
                                <p className="text-sm text-muted-foreground text-center py-6 border border-dashed rounded-lg bg-slate-50">
                                  Nenhum certificado registrado.
                                </p>
                              )}
                            </div>
                          </TabsContent>
                          <TabsContent value="attachments" className="space-y-4 pt-4">
                            <div className="border-2 border-dashed border-slate-200 rounded-lg p-6 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 transition">
                              <UploadCloud className="w-8 h-8 text-slate-400 mb-2" />
                              <p className="text-sm font-medium text-slate-600 mb-1">
                                Clique para anexar um documento
                              </p>
                              <p className="text-xs text-slate-400 mb-4">
                                PDF, JPG, PNG suportados
                              </p>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => fileInputRef.current?.click()}
                              >
                                Selecionar Arquivo
                              </Button>
                              <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept=".pdf,.jpg,.jpeg,.png"
                                onChange={handleFileUpload}
                              />
                            </div>

                            <div className="space-y-2">
                              <h4 className="font-semibold text-sm">
                                Arquivos Anexados ({selectedCrew.attachments.length})
                              </h4>
                              {selectedCrew.attachments.length === 0 ? (
                                <p className="text-sm text-muted-foreground">
                                  Nenhum documento anexado.
                                </p>
                              ) : (
                                <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
                                  {selectedCrew.attachments.map((att) => (
                                    <div
                                      key={att.id}
                                      className="flex items-center justify-between p-3 border rounded-md bg-white"
                                    >
                                      <div className="flex items-center gap-3 overflow-hidden">
                                        <div className="bg-blue-50 p-2 rounded text-blue-600">
                                          <FileIcon className="w-4 h-4" />
                                        </div>
                                        <div className="truncate">
                                          <p className="text-sm font-medium truncate">{att.name}</p>
                                          <p className="text-xs text-slate-500">
                                            {new Date(att.date).toLocaleDateString()}
                                          </p>
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <Button variant="ghost" size="icon" asChild>
                                          <a href={att.url} target="_blank" rel="noreferrer">
                                            <Search className="w-4 h-4 text-slate-500" />
                                          </a>
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          onClick={() => handleDeleteAttachment(att.id)}
                                        >
                                          <Trash2 className="w-4 h-4 text-red-500" />
                                        </Button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </TabsContent>
                        </Tabs>
                      )}
                    </DialogContent>
                  </Dialog>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground h-24">
                  Nenhum tripulante encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
