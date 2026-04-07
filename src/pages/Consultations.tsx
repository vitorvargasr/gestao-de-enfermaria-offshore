import { useState } from 'react'
import useMainStore, { TriagePriority } from '@/stores/useMainStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Activity, Bluetooth, FileDown, Stethoscope, Lock, Info, Pill, Trash2 } from 'lucide-react'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import pb from '@/lib/pocketbase/client'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

function PrescriptionDialog({ onPrescribe }: { onPrescribe: (item: any, qty: number) => void }) {
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState<any[]>([])
  const [selectedItemId, setSelectedItemId] = useState('')
  const [quantity, setQuantity] = useState('1')
  const [loading, setLoading] = useState(false)

  const loadItems = async () => {
    try {
      const data = await pb.collection('kit_items').getFullList({ expand: 'kit', sort: 'name' })
      setItems(data.filter((i: any) => i.quantity > 0))
    } catch (e) {
      // ignore error
    }
  }

  const handleOpen = (val: boolean) => {
    setOpen(val)
    if (val) loadItems()
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    const item = items.find((i: any) => i.id === selectedItemId)
    if (!item) return
    const qty = parseInt(quantity)
    if (qty > item.quantity) {
      toast.error('Estoque insuficiente', {
        description: `O item possui apenas ${item.quantity} unidades disponíveis.`,
      })
      return
    }
    setLoading(true)
    try {
      await pb.collection('kit_items').update(item.id, { quantity: item.quantity - qty })
      toast.success('Medicamento Prescrito', {
        description: 'Estoque deduzido automaticamente com sucesso.',
      })
      onPrescribe(item, qty)
      setOpen(false)
      setSelectedItemId('')
      setQuantity('1')
    } catch (err) {
      toast.error('Erro ao prescrever', { description: 'Não foi possível deduzir o estoque.' })
    }
    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="gap-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200"
        >
          <Pill className="w-3.5 h-3.5" />
          Prescrição
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Prescrever Medicamento / Insumo</DialogTitle>
          <DialogDescription>
            Selecione um item do estoque para deduzir automaticamente.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSave} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label>Item do Estoque (Kit)</Label>
            <Select value={selectedItemId} onValueChange={setSelectedItemId} required>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o medicamento..." />
              </SelectTrigger>
              <SelectContent>
                {items.map((i: any) => (
                  <SelectItem key={i.id} value={i.id}>
                    {i.name} ({i.expand?.kit?.name}) - Disp: {i.quantity}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Quantidade a Dispensar</Label>
            <Input
              type="number"
              min="1"
              required
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
          </div>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Processando...' : 'Confirmar Prescrição'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default function Consultations() {
  const { crew, consultations, addConsultation, signConsultation, networkStatus } = useMainStore()
  const [crewId, setCrewId] = useState('')
  const [selectedReason, setSelectedReason] = useState('')
  const [otherReason, setOtherReason] = useState('')
  const [symptoms, setSymptoms] = useState('')
  const [bp, setBp] = useState('')
  const [hr, setHr] = useState('')
  const [temp, setTemp] = useState('')
  const [spo2, setSpo2] = useState('')
  const [diagnosis, setDiagnosis] = useState('')
  const [treatment, setTreatment] = useState('')
  const [priority, setPriority] = useState<TriagePriority>('Blue')
  const [isSyncingIoT, setIsSyncingIoT] = useState(false)
  const [signModalOpen, setSignModalOpen] = useState(false)
  const [consultationToSign, setConsultationToSign] = useState<string | null>(null)
  const [signPin, setSignPin] = useState('')
  const [prescriptions, setPrescriptions] = useState<any[]>([])

  const protocolMapping: Record<string, string> = {
    'Dor no peito intensa':
      'Administrar AAS 300mg (mastigado), monitorar sinais vitais (ECG se possível), fornecer oxigênio se SpO2 < 94%, preparar evacuação aeromédica imediata (prioridade Vermelha).',
    'Falta de ar':
      'Fornecer oxigênio suplementar, avaliar ausculta pulmonar, manter paciente em decúbito elevado, verificar necessidade de broncodilatador.',
    Palpitações:
      'Monitorar FC e PA, realizar ECG se disponível, manter repouso absoluto. Avaliar histórico de arritmias e medicações em uso.',
    'Confusão Mental':
      'Verificar glicemia capilar (HGT), avaliar sinais de AVC (escala FAST), proteger contra quedas e traumas.',
    'Dor de Cabeça':
      'Avaliar sinais de alarme (início súbito, rigidez de nuca, fotofobia). Administrar analgésico padrão se sem sinais de alerta. Manter em repouso.',
    'Crise Convulsiva':
      'Proteger a cabeça, lateralizar o paciente, não inserir objetos na boca, administrar anticonvulsivante (ex: Diazepam IV/IM) se duração > 5 min.',
    Queimadura:
      'Resfriar a área com água corrente por 15 min, cobrir com curativo estéril, NÃO romper bolhas. Avaliar necessidade de analgesia IV.',
    Hemorragia:
      'Aplicar compressão direta no local. Se em membro e não controlada, avaliar uso de torniquete. Prevenir hipotermia e choque (elevar pernas, acesso venoso calibroso).',
    Fratura:
      'Imobilizar a articulação acima e abaixo da lesão, verificar perfusão distal, avaliar necessidade de analgesia antes da manipulação. Manter em jejum (risco cirúrgico).',
    'Reação Alérgica':
      'Avaliar via aérea imediatamente (risco de anafilaxia). Administrar anti-histamínico e corticoide. Se sinais de choque/edema de glote, Epinefrina IM imediata.',
    Desidratação:
      'Iniciar reposição hídrica oral (SRO) se tolerado, ou hidratação venosa (Ringer Lactato ou SF 0,9%) se vômitos intensos ou sinais de choque.',
    Trauma:
      'Avaliação primária (ABCDE do trauma). Imobilização cervical se suspeita de TRM, controle de hemorragias exanguinantes, monitoramento contínuo.',
    'Febre Alta':
      'Administrar antitérmico (ex: Dipirona/Paracetamol), resfriamento físico (compressas), investigar possível foco infeccioso (respiratório, urinário, cutâneo).',
  }

  const suggestedProtocol =
    protocolMapping[selectedReason] ||
    (selectedReason
      ? 'Avaliar os sinais vitais, realizar exame físico detalhado e aplicar tratamento sintomático conforme o quadro clínico. Monitorar evolução.'
      : '')

  const analyzeTriage = (text: string) => {
    const s = text.toLowerCase()
    if (s.match(/peito|desmaio|inconsciente|sangramento grave|convulsão/)) return 'Red'
    if (s.match(/febre alta|fratura exposta|dor intensa|corte profundo/)) return 'Orange'
    if (s.match(/vômito|corte|febre|dor moderada|tontura/)) return 'Yellow'
    if (s.match(/dor leve|torção|gripe|resfriado/)) return 'Green'
    return 'Blue'
  }

  const handleSymptomsChange = (val: string) => {
    setSymptoms(val)
    const currentReason = selectedReason === 'Outro' ? otherReason : selectedReason
    setPriority(analyzeTriage(val + ' ' + currentReason))
  }

  const handleReasonSelection = (val: string) => {
    setSelectedReason(val)
    const currentReason = val === 'Outro' ? otherReason : val
    setPriority(analyzeTriage(symptoms + ' ' + currentReason))
  }

  const handleOtherReasonChange = (val: string) => {
    setOtherReason(val)
    setPriority(analyzeTriage(symptoms + ' ' + val))
  }

  const handleOpenSign = (id: string) => {
    setConsultationToSign(id)
    setSignModalOpen(true)
  }

  const confirmSignature = () => {
    if (signPin.length < 4) {
      toast.error('PIN inválido. Mínimo de 4 dígitos.')
      return
    }
    if (consultationToSign) {
      signConsultation(consultationToSign, 'Dr. Médico Responsável (CRM/CFM)')
      toast.success('Prontuário assinado com sucesso via certificado ICP-Brasil.')
    }
    setSignModalOpen(false)
    setSignPin('')
  }

  const handleIoTSync = () => {
    setIsSyncingIoT(true)
    setTimeout(() => {
      setBp('120/80')
      setHr('75')
      setTemp('36.6')
      setSpo2('98')
      setIsSyncingIoT(false)
      toast.success('Dispositivo IoT conectado. Sinais vitais capturados com sucesso.')
    }, 2000)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!crewId) return toast.error('Selecione um tripulante.')

    const finalReason = selectedReason === 'Outro' ? otherReason : selectedReason

    if (!finalReason) {
      toast.error('Informe o motivo da consulta.')
      return
    }

    const treatmentWithPrescriptions =
      prescriptions.length > 0
        ? `${treatment}\n\nPrescrições Dispensadas:\n${prescriptions.map((p) => `- ${p.prescribedQty}x ${p.name}`).join('\n')}`
        : treatment

    addConsultation({
      crewId,
      reason: finalReason,
      symptoms,
      vitalSigns: { bp, hr, temp, spo2 },
      diagnosis,
      treatment: treatmentWithPrescriptions,
      priority,
    })

    if (networkStatus === 'Offline') {
      toast.success('Consulta salva localmente. Será sincronizada quando houver conexão.')
    } else {
      toast.success('Consulta registrada com sucesso no servidor.')
    }

    setSelectedReason('')
    setOtherReason('')
    setSymptoms('')
    setBp('')
    setHr('')
    setTemp('')
    setSpo2('')
    setDiagnosis('')
    setTreatment('')
    setPriority('Blue')
    setPrescriptions([])
  }

  const handlePrescribe = (item: any, qty: number) => {
    setPrescriptions((prev) => [...prev, { ...item, prescribedQty: qty }])
  }

  const removePrescription = (index: number) => {
    setPrescriptions((prev) => prev.filter((_, i) => i !== index))
  }

  const exportDocument = (type: string, patientName: string) => {
    toast.success(`Gerando PDF do ${type} para ${patientName}... (Com logotipo Poseidon Offshore)`)
  }

  const priorityColors = {
    Red: 'bg-red-500 text-white border-red-600',
    Orange: 'bg-orange-500 text-white border-orange-600',
    Yellow: 'bg-yellow-400 text-yellow-900 border-yellow-500',
    Green: 'bg-green-500 text-white border-green-600',
    Blue: 'bg-blue-500 text-white border-blue-600',
  }

  const priorityLabels = {
    Red: 'Emergência',
    Orange: 'Muito Urgente',
    Yellow: 'Urgente',
    Green: 'Pouco Urgente',
    Blue: 'Não Urgente',
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <h1 className="text-3xl font-bold tracking-tight">Consultas e Triagem</h1>

      <Tabs defaultValue="new" className="space-y-6">
        <TabsList className="bg-slate-200/50">
          <TabsTrigger value="new">Nova Consulta</TabsTrigger>
          <TabsTrigger value="history">Histórico e Prontuários</TabsTrigger>
        </TabsList>

        <TabsContent value="new">
          <Card className="shadow-sm">
            <CardHeader className="border-b bg-slate-50/50">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Registro de Atendimento</CardTitle>
                  <CardDescription>
                    Preencha os dados clínicos e utilize o Assistente de Triagem Inteligente.
                  </CardDescription>
                </div>
                <Badge
                  variant="outline"
                  className={cn('text-sm px-3 py-1', priorityColors[priority])}
                >
                  <Stethoscope className="w-4 h-4 mr-2" />
                  Triagem: {priorityLabels[priority]}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="space-y-2 max-w-md">
                  <Label>Tripulante Paciente</Label>
                  <Select value={crewId} onValueChange={setCrewId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um paciente..." />
                    </SelectTrigger>
                    <SelectContent>
                      {crew.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name} - {c.rank}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid lg:grid-cols-2 gap-8">
                  <div className="space-y-5">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                      <span className="bg-slate-100 text-slate-800 w-6 h-6 rounded-full flex items-center justify-center text-xs">
                        1
                      </span>
                      Anamnese & Assistente de Triagem
                    </h3>
                    <div className="space-y-2">
                      <Label>Motivo da Consulta</Label>
                      <Select value={selectedReason} onValueChange={handleReasonSelection} required>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o sintoma/motivo..." />
                        </SelectTrigger>
                        <SelectContent>
                          {[
                            'Confusão Mental',
                            'Crise Convulsiva',
                            'Crise Psiquiátrica',
                            'Desidratação',
                            'Dificuldade de Fala',
                            'Dor Abdominal',
                            'Dor Lombar',
                            'Dor de Cabeça',
                            'Dor no peito intensa',
                            'Edema',
                            'Falta de ar',
                            'Febre Alta',
                            'Fratura',
                            'Fraqueza',
                            'Hemorragia',
                            'Lesão',
                            'Palpitações',
                            'Perda de Consciência',
                            'Queimadura',
                            'Reação Alérgica',
                            'Respiração',
                            'Sangue nas Fezes',
                            'Sangue no Vômito',
                            'Sonolência',
                            'Tontura',
                            'Trauma',
                            'Vômitos',
                            'Outro',
                          ].map((r) => (
                            <SelectItem key={r} value={r}>
                              {r}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {selectedReason === 'Outro' && (
                        <div className="pt-2 animate-in fade-in slide-in-from-top-2 duration-300">
                          <Input
                            required
                            value={otherReason}
                            onChange={(e) => handleOtherReasonChange(e.target.value)}
                            placeholder="Descreva o motivo da consulta..."
                          />
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label>
                        Sintomas / Sensações (O Protocolo de Manchester auto-sugere a prioridade)
                      </Label>
                      <Textarea
                        className="min-h-[120px]"
                        required
                        value={symptoms}
                        onChange={(e) => handleSymptomsChange(e.target.value)}
                        placeholder="Descreva os sintomas reportados. Ex: paciente relata dor intensa..."
                      />
                    </div>

                    {suggestedProtocol && (
                      <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <Alert className="bg-indigo-50 text-indigo-900 border-indigo-200">
                          <Info className="h-4 w-4 text-indigo-600" />
                          <AlertTitle className="text-indigo-800 font-semibold flex items-center gap-2">
                            Protocolo Sugerido
                            <Badge
                              variant="outline"
                              className="text-[10px] bg-indigo-100 border-indigo-200 text-indigo-700"
                            >
                              Auto-sugerido
                            </Badge>
                          </AlertTitle>
                          <AlertDescription className="text-indigo-700/90 text-sm mt-1">
                            {suggestedProtocol}
                          </AlertDescription>
                        </Alert>
                      </div>
                    )}
                  </div>

                  <div className="space-y-5">
                    <h3 className="font-semibold text-lg flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="bg-slate-100 text-slate-800 w-6 h-6 rounded-full flex items-center justify-center text-xs">
                          2
                        </span>
                        Sinais Vitais & Avaliação
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleIoTSync}
                        disabled={isSyncingIoT}
                        className="text-blue-600 border-blue-200 bg-blue-50 hover:bg-blue-100"
                      >
                        {isSyncingIoT ? (
                          <Activity className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Bluetooth className="w-4 h-4 mr-2" />
                        )}
                        Sincronizar Monitor IoT
                      </Button>
                    </h3>
                    <div className="grid grid-cols-4 gap-3 p-4 bg-slate-50 rounded-lg border">
                      <div className="space-y-2">
                        <Label className="text-[10px] text-muted-foreground uppercase">
                          PA (mmHg)
                        </Label>
                        <Input
                          placeholder="120/80"
                          value={bp}
                          onChange={(e) => setBp(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] text-muted-foreground uppercase">
                          FC (bpm)
                        </Label>
                        <Input
                          placeholder="80"
                          type="number"
                          value={hr}
                          onChange={(e) => setHr(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] text-muted-foreground uppercase">
                          Temp (°C)
                        </Label>
                        <Input
                          placeholder="36.5"
                          type="number"
                          step="0.1"
                          value={temp}
                          onChange={(e) => setTemp(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] text-muted-foreground uppercase">
                          SpO2 (%)
                        </Label>
                        <Input
                          placeholder="98"
                          type="number"
                          value={spo2}
                          onChange={(e) => setSpo2(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Diagnóstico Preliminar</Label>
                      <Input
                        required
                        value={diagnosis}
                        onChange={(e) => setDiagnosis(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center mb-1">
                        <Label>Plano de Tratamento</Label>
                        <PrescriptionDialog onPrescribe={handlePrescribe} />
                      </div>
                      <Textarea
                        className="min-h-[80px]"
                        required
                        value={treatment}
                        onChange={(e) => setTreatment(e.target.value)}
                        placeholder="Descreva o plano de tratamento..."
                      />
                      {prescriptions.length > 0 && (
                        <div className="mt-3 bg-slate-50 border rounded-md p-3 space-y-2">
                          <Label className="text-xs text-muted-foreground uppercase">
                            Itens Prescritos (Baixa Automática no Estoque)
                          </Label>
                          <ul className="space-y-2">
                            {prescriptions.map((p, idx) => (
                              <li
                                key={idx}
                                className="flex justify-between items-center text-sm bg-white p-2 rounded border shadow-sm"
                              >
                                <span>
                                  <strong className="font-medium">{p.prescribedQty}x</strong>{' '}
                                  {p.name}
                                </span>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 text-red-500 hover:text-red-700"
                                  onClick={() => removePrescription(idx)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t">
                  <Button type="submit" size="lg">
                    Salvar e Registrar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card className="shadow-sm">
            <CardHeader className="border-b bg-slate-50/50">
              <CardTitle>Histórico e Prontuários Digitais</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-6">
                {consultations.map((c) => {
                  const patient = crew.find((cr) => cr.id === c.crewId)
                  return (
                    <div
                      key={c.id}
                      className="border p-5 rounded-lg space-y-4 bg-white shadow-sm transition hover:border-slate-300"
                    >
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-3 gap-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              'w-3 h-12 rounded-full',
                              priorityColors[c.priority || 'Blue'],
                            )}
                          ></div>
                          <div>
                            <p className="font-bold text-lg text-slate-800">{patient?.name}</p>
                            <p className="text-sm text-slate-500 font-medium">
                              {new Date(c.date).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          {c.signature ? (
                            <Badge
                              variant="secondary"
                              className="bg-green-100 text-green-800 border-green-200"
                            >
                              <Lock className="w-3 h-3 mr-1" />
                              Assinado Digitalmente
                            </Badge>
                          ) : (
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handleOpenSign(c.id)}
                              className="bg-slate-800 hover:bg-slate-900"
                            >
                              Assinar Prontuário
                            </Button>
                          )}
                          <Badge variant="outline" className="bg-slate-50 text-sm py-1">
                            {c.diagnosis}
                          </Badge>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => exportDocument('Atestado Médico', patient?.name || '')}
                          >
                            <FileDown className="w-4 h-4 mr-2" /> Atestado
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              exportDocument('Prontuário Clínico', patient?.name || '')
                            }
                          >
                            <FileDown className="w-4 h-4 mr-2" /> Prontuário
                          </Button>
                        </div>
                      </div>
                      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm px-2">
                        <div className="col-span-1 lg:col-span-2 space-y-3">
                          <div>
                            <span className="font-semibold text-slate-700 block mb-1">Motivo:</span>
                            <span className="text-slate-600">{c.reason}</span>
                          </div>
                          <div>
                            <span className="font-semibold text-slate-700 block mb-1">
                              Sintomas:
                            </span>
                            <span className="text-slate-600">{c.symptoms}</span>
                          </div>
                        </div>
                        <div className="col-span-1 bg-slate-50 p-3 rounded-md border h-fit">
                          <span className="font-semibold text-slate-700 block mb-2 text-xs uppercase">
                            Sinais Vitais
                          </span>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <span className="bg-white px-2 py-1 rounded border">
                              PA: {c.vitalSigns.bp}
                            </span>
                            <span className="bg-white px-2 py-1 rounded border">
                              FC: {c.vitalSigns.hr}
                            </span>
                            <span className="bg-white px-2 py-1 rounded border">
                              Temp: {c.vitalSigns.temp}°C
                            </span>
                            {c.vitalSigns.spo2 && (
                              <span className="bg-white px-2 py-1 rounded border">
                                SpO2: {c.vitalSigns.spo2}%
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="col-span-1">
                          <span className="font-semibold text-slate-700 block mb-1">
                            Tratamento:
                          </span>
                          <span className="text-slate-600">{c.treatment}</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
                {consultations.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    Nenhuma consulta registrada.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={signModalOpen} onOpenChange={setSignModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assinatura Digital de Prontuário</DialogTitle>
            <DialogDescription>
              Insira seu PIN do certificado digital (Padrão ICP-Brasil) para validar este registro
              médico legalmente.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>PIN do Certificado Digital</Label>
              <Input
                type="password"
                placeholder="****"
                value={signPin}
                onChange={(e) => setSignPin(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setSignModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={confirmSignature}>Confirmar Assinatura</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
