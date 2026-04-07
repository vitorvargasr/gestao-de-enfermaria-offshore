import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { format, subDays, addDays, subHours } from 'date-fns'

export type Sector = 'Casa de Máquinas' | 'Cozinha' | 'Convés' | 'Ponte' | 'Acomodações'
export type Attachment = { id: string; name: string; url: string; type: string; date: string }

export type Certificate = {
  id: string
  name: string
  issueDate: string
  expiryDate: string
}

export type CrewMember = {
  id: string
  name: string
  rank: string
  sector: Sector
  age: number
  allergies: string
  conditions: string
  status: 'Active' | 'Observation'
  attachments: Attachment[]
  certificates: Certificate[]
}

export type TriagePriority = 'Red' | 'Orange' | 'Yellow' | 'Green' | 'Blue'

export type Consultation = {
  id: string
  crewId: string
  date: string
  reason: string
  symptoms: string
  vitalSigns: { bp: string; hr: string; temp: string; spo2?: string }
  diagnosis: string
  treatment: string
  priority: TriagePriority
  signature?: {
    signedAt: string
    signedBy: string
    hash: string
  }
}

export type InventoryItem = {
  id: string
  name: string
  category: string
  quantity: number
  minQuantity: number
  sectorMinQuantity?: Record<string, number>
  expiryDate: string
  batch: string
  barcode?: string
}

export type InventoryMovement = {
  id: string
  itemId: string
  date: string
  type: 'Entrada' | 'Saída' | 'Ajuste'
  quantity: number
  reason: string
  user: string
}

export type EDIInvoice = {
  id: string
  number: string
  supplier: string
  date: string
  status: 'Pending' | 'Processed'
  items: {
    name: string
    quantity: number
    batch: string
    expiryDate: string
    category: string
    barcode: string
  }[]
}

export type Disposal = {
  id: string
  date: string
  itemId: string
  quantity: number
  reason: string
  notes: string
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

export type Occurrence = {
  id: string
  date: string
  time: string
  description: string
  actions: string
  isEmergency: boolean
}

export type EquipmentStatus = 'Operational' | 'Maintenance' | 'Blocked' | 'Disposed'

export type Equipment = {
  id: string
  name: string
  type: string
  ownership: 'Own' | 'Rented'
  location: Sector | 'Enfermaria'
  status: EquipmentStatus
  serialNumber: string
  acquisitionDate: string
  lastCalibration: string
  nextCalibration: string
  supplier?: string
}

export type MaintenanceLog = {
  id: string
  equipmentId: string
  date: string
  type: 'Repair' | 'Calibration' | 'Inspection' | 'Substitution'
  description: string
  cost?: number
  performedBy: string
}

type NetworkStatus = 'Online' | 'Offline' | 'Syncing'

type MainContextType = {
  inventoryMovements: InventoryMovement[]
  adjustInventoryQuantity: (
    id: string,
    quantityChange: number,
    type: 'Entrada' | 'Saída' | 'Ajuste',
    reason: string,
    user: string,
  ) => void
  crew: CrewMember[]
  addCrew: (c: Omit<CrewMember, 'id' | 'attachments'>) => void
  updateCrewStatus: (id: string, status: 'Active' | 'Observation') => void
  addAttachment: (crewId: string, attachment: Omit<Attachment, 'id' | 'date'>) => void
  removeAttachment: (crewId: string, attachmentId: string) => void
  consultations: Consultation[]
  addConsultation: (c: Omit<Consultation, 'id' | 'date'>) => void
  signConsultation: (id: string, signedBy: string) => void
  inventory: InventoryItem[]
  updateInventory: (id: string, updates: Partial<InventoryItem>) => void
  updateInventorySettings: (id: string, updates: Partial<InventoryItem>) => void
  addInventoryItem: (item: Omit<InventoryItem, 'id'>) => void
  linkBarcode: (id: string, barcode: string) => void
  ediInvoices: EDIInvoice[]
  processEDIInvoice: (id: string) => void
  disposals: Disposal[]
  addDisposal: (d: Omit<Disposal, 'id' | 'date'>) => void
  audits: Audit[]
  addAudit: (audit: Omit<Audit, 'id'>) => void
  occurrences: Occurrence[]
  addOccurrence: (o: Omit<Occurrence, 'id'>) => void
  networkStatus: NetworkStatus
  addCertificate: (crewId: string, certificate: Omit<Certificate, 'id'>) => void
  equipments: Equipment[]
  addEquipment: (e: Omit<Equipment, 'id'>) => void
  updateEquipment: (id: string, updates: Partial<Equipment>) => void
  maintenanceLogs: MaintenanceLog[]
  addMaintenanceLog: (log: Omit<MaintenanceLog, 'id'>) => void
}

const MainContext = createContext<MainContextType | null>(null)

export function MainProvider({ children }: { children: ReactNode }) {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>('Online')

  useEffect(() => {
    const handleOnline = () => {
      setNetworkStatus('Syncing')
      setTimeout(() => setNetworkStatus('Online'), 2000)
    }
    const handleOffline = () => setNetworkStatus('Offline')

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const [crew, setCrew] = useState<CrewMember[]>([
    {
      id: '1',
      name: 'João Silva',
      rank: 'Capitão',
      sector: 'Ponte',
      age: 45,
      allergies: 'Nenhuma',
      conditions: 'Hipertensão',
      status: 'Active',
      attachments: [],
      certificates: [
        {
          id: 'cert-1',
          name: 'STCW - Sobrevivência Pessoal',
          issueDate: subDays(new Date(), 400).toISOString(),
          expiryDate: addDays(new Date(), 30).toISOString(),
        },
        {
          id: 'cert-2',
          name: 'Atestado de Saúde Ocupacional (ASO)',
          issueDate: subDays(new Date(), 100).toISOString(),
          expiryDate: addDays(new Date(), 265).toISOString(),
        },
      ],
    },
    {
      id: '2',
      name: 'Carlos Souza',
      rank: 'Marinheiro',
      sector: 'Convés',
      age: 30,
      allergies: 'Penicilina',
      conditions: 'Asma',
      status: 'Observation',
      attachments: [],
      certificates: [
        {
          id: 'cert-3',
          name: 'STCW - Prevenção e Combate a Incêndio',
          issueDate: subDays(new Date(), 1000).toISOString(),
          expiryDate: subDays(new Date(), 10).toISOString(),
        },
      ],
    },
  ])

  const [consultations, setConsultations] = useState<Consultation[]>([
    {
      id: '1',
      crewId: '2',
      date: subHours(new Date(), 2).toISOString(),
      reason: 'Falta de ar leve',
      symptoms: 'Tosse e dificuldade respiratória',
      vitalSigns: { bp: '120/80', hr: '85', temp: '36.8', spo2: '94' },
      diagnosis: 'Crise asmática leve',
      treatment: 'Inalação com broncodilatador',
      priority: 'Yellow',
      signature: {
        signedAt: subHours(new Date(), 1).toISOString(),
        signedBy: 'Dr. Médico Responsável (CRM 12345)',
        hash: 'a3f9b2c1d4e5f6g7h8i9j0k1l2m3n4o5',
      },
    },
    {
      id: '2',
      crewId: '1',
      date: subHours(new Date(), 24).toISOString(),
      reason: 'Dor de cabeça',
      symptoms: 'Cefaleia tensional',
      vitalSigns: { bp: '130/85', hr: '75', temp: '36.6', spo2: '99' },
      diagnosis: 'Cefaleia tensional',
      treatment: 'Paracetamol',
      priority: 'Blue',
    },
  ])

  const [inventory, setInventory] = useState<InventoryItem[]>([
    {
      id: '1',
      name: 'Paracetamol 500mg',
      category: 'Analgésico',
      quantity: 150,
      minQuantity: 50,
      sectorMinQuantity: { Enfermaria: 20, Kits: 30 },
      expiryDate: addDays(new Date(), 300).toISOString(),
      batch: 'L-202301',
      barcode: '123456789012',
    },
    {
      id: '2',
      name: 'Ibuprofeno 400mg',
      category: 'Anti-inflamatório',
      quantity: 20,
      minQuantity: 50,
      sectorMinQuantity: { Enfermaria: 25, Kits: 25 },
      expiryDate: addDays(new Date(), 80).toISOString(),
      batch: 'L-202302',
      barcode: '987654321098',
    },
  ])

  const [ediInvoices, setEdiInvoices] = useState<EDIInvoice[]>([
    {
      id: 'inv-1',
      number: 'NF-e 001.234',
      supplier: 'MedSupply Global',
      date: new Date().toISOString(),
      status: 'Pending',
      items: [
        {
          name: 'Amoxicilina 500mg',
          quantity: 200,
          batch: 'AMX-998',
          expiryDate: addDays(new Date(), 400).toISOString(),
          category: 'Antibiótico',
          barcode: '7891011121314',
        },
        {
          name: 'Gaze Estéril',
          quantity: 500,
          batch: 'GZ-102',
          expiryDate: addDays(new Date(), 1000).toISOString(),
          category: 'Insumos',
          barcode: '7891011121315',
        },
      ],
    },
  ])

  const [disposals, setDisposals] = useState<Disposal[]>([])
  const [audits, setAudits] = useState<Audit[]>([])
  const [occurrences, setOccurrences] = useState<Occurrence[]>([])
  const [inventoryMovements, setInventoryMovements] = useState<InventoryMovement[]>([
    {
      id: 'mov-1',
      itemId: '1',
      date: subHours(new Date(), 48).toISOString(),
      type: 'Entrada',
      quantity: 50,
      reason: 'Reposição mensal via EDI',
      user: 'Logística Offshore',
    },
    {
      id: 'mov-2',
      itemId: '2',
      date: subHours(new Date(), 24).toISOString(),
      type: 'Saída',
      quantity: 2,
      reason: 'Atendimento consulta tripulante',
      user: 'Enfermeiro Chefe',
    },
  ])

  const [equipments, setEquipments] = useState<Equipment[]>([
    {
      id: 'eq-1',
      name: 'Desfibrilador Externo Automático (DEA)',
      type: 'Suporte à Vida',
      ownership: 'Own',
      location: 'Enfermaria',
      status: 'Operational',
      serialNumber: 'DEA-2023-001',
      acquisitionDate: subDays(new Date(), 365).toISOString(),
      lastCalibration: subDays(new Date(), 180).toISOString(),
      nextCalibration: addDays(new Date(), 185).toISOString(),
    },
    {
      id: 'eq-2',
      name: 'Monitor Multiparamétrico',
      type: 'Monitoramento',
      ownership: 'Rented',
      location: 'Enfermaria',
      status: 'Blocked',
      serialNumber: 'MON-992-B',
      acquisitionDate: subDays(new Date(), 700).toISOString(),
      lastCalibration: subDays(new Date(), 400).toISOString(),
      nextCalibration: subDays(new Date(), 35).toISOString(),
      supplier: 'MedEquip Rentals',
    },
  ])

  const [maintenanceLogs, setMaintenanceLogs] = useState<MaintenanceLog[]>([
    {
      id: 'ml-1',
      equipmentId: 'eq-1',
      date: subDays(new Date(), 180).toISOString(),
      type: 'Calibration',
      description: 'Calibração anual padrão realizada conforme normas da fabricante.',
      cost: 450,
      performedBy: 'Eng. Carlos (MedTech)',
    },
  ])

  const addCrew = (c: Omit<CrewMember, 'id' | 'attachments' | 'certificates'>) =>
    setCrew([
      ...crew,
      { ...c, id: Math.random().toString(36).substring(7), attachments: [], certificates: [] },
    ])

  const addCertificate = (crewId: string, cert: Omit<Certificate, 'id'>) => {
    setCrew(
      crew.map((c) =>
        c.id === crewId
          ? {
              ...c,
              certificates: [
                ...c.certificates,
                { ...cert, id: Math.random().toString(36).substring(7) },
              ],
            }
          : c,
      ),
    )
  }

  const updateCrewStatus = (id: string, status: 'Active' | 'Observation') =>
    setCrew(crew.map((c) => (c.id === id ? { ...c, status } : c)))

  const addAttachment = (crewId: string, attachment: Omit<Attachment, 'id' | 'date'>) => {
    setCrew(
      crew.map((c) =>
        c.id === crewId
          ? {
              ...c,
              attachments: [
                ...c.attachments,
                {
                  ...attachment,
                  id: Math.random().toString(36).substring(7),
                  date: new Date().toISOString(),
                },
              ],
            }
          : c,
      ),
    )
  }

  const removeAttachment = (crewId: string, attachmentId: string) => {
    setCrew(
      crew.map((c) =>
        c.id === crewId
          ? { ...c, attachments: c.attachments.filter((a) => a.id !== attachmentId) }
          : c,
      ),
    )
  }

  const addConsultation = (c: Omit<Consultation, 'id' | 'date'>) =>
    setConsultations([
      { ...c, id: Math.random().toString(36).substring(7), date: new Date().toISOString() },
      ...consultations,
    ])

  const signConsultation = (id: string, signedBy: string) => {
    setConsultations(
      consultations.map((c) =>
        c.id === id
          ? {
              ...c,
              signature: {
                signedAt: new Date().toISOString(),
                signedBy,
                hash:
                  Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2),
              },
            }
          : c,
      ),
    )
  }

  const updateInventory = (id: string, updates: Partial<InventoryItem>) =>
    setInventory(inventory.map((i) => (i.id === id ? { ...i, ...updates } : i)))

  const updateInventorySettings = (id: string, updates: Partial<InventoryItem>) =>
    setInventory(inventory.map((i) => (i.id === id ? { ...i, ...updates } : i)))

  const adjustInventoryQuantity = (
    id: string,
    quantityChange: number,
    type: 'Entrada' | 'Saída' | 'Ajuste',
    reason: string,
    user: string,
  ) => {
    const item = inventory.find((i) => i.id === id)
    if (!item) return
    const newQuantity = Math.max(
      0,
      item.quantity + (type === 'Saída' ? -quantityChange : quantityChange),
    )
    updateInventory(id, { quantity: newQuantity })
    setInventoryMovements((prev) => [
      {
        id: Math.random().toString(36).substring(7),
        itemId: id,
        date: new Date().toISOString(),
        type,
        quantity: quantityChange,
        reason,
        user,
      },
      ...prev,
    ])
  }

  const addInventoryItem = (item: Omit<InventoryItem, 'id'>) =>
    setInventory([...inventory, { ...item, id: Math.random().toString(36).substring(7) }])

  const linkBarcode = (id: string, barcode: string) =>
    setInventory(inventory.map((i) => (i.id === id ? { ...i, barcode } : i)))

  const processEDIInvoice = (id: string) => {
    const invoice = ediInvoices.find((i) => i.id === id)
    if (!invoice || invoice.status === 'Processed') return

    invoice.items.forEach((item) => {
      addInventoryItem({
        name: item.name,
        category: item.category,
        quantity: item.quantity,
        minQuantity: 50,
        expiryDate: item.expiryDate,
        batch: item.batch,
        barcode: item.barcode,
      })
    })
    setEdiInvoices(ediInvoices.map((i) => (i.id === id ? { ...i, status: 'Processed' } : i)))
  }

  const addDisposal = (d: Omit<Disposal, 'id' | 'date'>) => {
    setDisposals([
      { ...d, id: Math.random().toString(36).substring(7), date: new Date().toISOString() },
      ...disposals,
    ])
    const item = inventory.find((i) => i.id === d.itemId)
    if (item) {
      updateInventory(d.itemId, { quantity: Math.max(0, item.quantity - d.quantity) })
    }
  }

  const addOccurrence = (o: Omit<Occurrence, 'id'>) =>
    setOccurrences([{ ...o, id: Math.random().toString(36).substring(7) }, ...occurrences])

  const addAudit = (a: Omit<Audit, 'id'>) =>
    setAudits([{ ...a, id: Math.random().toString(36).substring(7) }, ...audits])

  const addEquipment = (e: Omit<Equipment, 'id'>) =>
    setEquipments([{ ...e, id: Math.random().toString(36).substring(7) }, ...equipments])

  const updateEquipment = (id: string, updates: Partial<Equipment>) =>
    setEquipments(equipments.map((eq) => (eq.id === id ? { ...eq, ...updates } : eq)))

  const addMaintenanceLog = (log: Omit<MaintenanceLog, 'id'>) => {
    setMaintenanceLogs([
      { ...log, id: Math.random().toString(36).substring(7) },
      ...maintenanceLogs,
    ])
    if (log.type === 'Calibration') {
      updateEquipment(log.equipmentId, {
        lastCalibration: log.date,
        nextCalibration: addDays(new Date(log.date), 365).toISOString(),
        status: 'Operational',
      })
    }
  }

  return (
    <MainContext.Provider
      value={{
        crew,
        addCrew,
        updateCrewStatus,
        addAttachment,
        removeAttachment,
        consultations,
        addConsultation,
        signConsultation,
        inventory,
        inventoryMovements,
        adjustInventoryQuantity,
        updateInventory,
        updateInventorySettings,
        addInventoryItem,
        linkBarcode,
        ediInvoices,
        processEDIInvoice,
        disposals,
        addDisposal,
        audits,
        addAudit,
        occurrences,
        addOccurrence,
        networkStatus,
        addCertificate,
        equipments,
        addEquipment,
        updateEquipment,
        maintenanceLogs,
        addMaintenanceLog,
      }}
    >
      {children}
    </MainContext.Provider>
  )
}

export default function useMainStore() {
  const ctx = useContext(MainContext)
  if (!ctx) throw new Error('useMainStore must be used within MainProvider')
  return ctx
}
