migrate(
  (app) => {
    const consultations = app.findCollectionByNameOrId('consultations')
    const now = Date.now()
    const hour = 3600 * 1000

    const seedData = [
      {
        patient_name: 'Carlos Souza',
        symptom: 'Falta de ar leve',
        sector: 'Ponte',
        status: 'observation',
        date: new Date(now - 2 * hour).toISOString(),
      },
      {
        patient_name: 'João Silva',
        symptom: 'Dor de cabeça',
        sector: 'Convés',
        status: 'regular',
        date: new Date(now - 24 * hour).toISOString(),
      },
      {
        patient_name: 'Maria Santos',
        symptom: 'Enjoo',
        sector: 'Ponte',
        status: 'regular',
        date: new Date(now - 12 * hour).toISOString(),
      },
      {
        patient_name: 'Pedro Alves',
        symptom: 'Corte na mão',
        sector: 'Casa de Máquinas',
        status: 'observation',
        date: new Date(now - 5 * hour).toISOString(),
      },
      {
        patient_name: 'Ana Lima',
        symptom: 'Febre',
        sector: 'Acomodações',
        status: 'regular',
        date: new Date(now - 36 * hour).toISOString(),
      },
    ]

    for (const data of seedData) {
      try {
        app.findFirstRecordByData('consultations', 'patient_name', data.patient_name)
      } catch (_) {
        const record = new Record(consultations)
        record.set('patient_name', data.patient_name)
        record.set('symptom', data.symptom)
        record.set('sector', data.sector)
        record.set('status', data.status)
        record.set('date', data.date)
        app.save(record)
      }
    }

    const kits = app.findCollectionByNameOrId('kits')
    let kitId = ''
    try {
      const kit = app.findFirstRecordByData('kits', 'name', 'Kit Principal')
      kitId = kit.id
    } catch (_) {
      const kit = new Record(kits)
      kit.set('name', 'Kit Principal')
      kit.set('status', 'Ativo')
      app.save(kit)
      kitId = kit.id
    }

    const kitItems = app.findCollectionByNameOrId('kit_items')
    try {
      app.findFirstRecordByData('kit_items', 'name', 'Ibuprofeno 400mg')
    } catch (_) {
      const record = new Record(kitItems)
      record.set('kit', kitId)
      record.set('name', 'Ibuprofeno 400mg')
      record.set('quantity', 50)
      record.set('lot', 'L-202302')
      record.set('validity', new Date(now + 45 * 24 * hour).toISOString().replace('T', ' '))
      app.save(record)
    }

    try {
      app.findFirstRecordByData('kit_items', 'name', 'Paracetamol 750mg')
    } catch (_) {
      const record = new Record(kitItems)
      record.set('kit', kitId)
      record.set('name', 'Paracetamol 750mg')
      record.set('quantity', 30)
      record.set('lot', 'P-88990')
      record.set('validity', new Date(now + 10 * 24 * hour).toISOString().replace('T', ' '))
      app.save(record)
    }
  },
  (app) => {
    // Empty down migration for seeds
  },
)
