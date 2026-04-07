migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('kit_items')

    const items = [
      {
        name: 'Amoxicilina 500mg',
        quantity: 100,
        lot: 'AMX-2024-01',
        validity: '2026-12-31 12:00:00.000Z',
        serial: 'SN-AMX001',
        category: 'Medicamento',
        location: 'Armário de Medicamentos',
      },
      {
        name: 'Paracetamol 750mg',
        quantity: 200,
        lot: 'PAR-2024-05',
        validity: '2025-06-30 12:00:00.000Z',
        serial: 'SN-PAR005',
        category: 'Medicamento',
        location: 'Gaveta A',
      },
      {
        name: 'Soro Fisiológico 500ml',
        quantity: 50,
        lot: 'SORO-99',
        validity: '2025-10-15 12:00:00.000Z',
        serial: 'SN-SORO99',
        category: 'Ampola',
        location: 'Prateleira Inferior',
      },
      {
        name: 'Gaze Estéril (Pacote)',
        quantity: 300,
        lot: 'GAZE-X',
        validity: '2027-01-01 12:00:00.000Z',
        serial: 'SN-GAZE10',
        category: 'Insumo',
        location: 'Almoxarifado',
      },
      {
        name: 'Atropina 0.5mg/ml',
        quantity: 20,
        lot: 'ATR-P3',
        validity: '2025-03-20 12:00:00.000Z',
        serial: 'SN-ATR32',
        category: 'Ampola',
        location: 'Maleta de Emergência',
      },
      {
        name: 'Adrenalina 1mg/ml',
        quantity: 15,
        lot: 'ADR-V4',
        validity: '2025-08-12 12:00:00.000Z',
        serial: 'SN-ADR44',
        category: 'Ampola',
        location: 'Maleta de Emergência',
      },
      {
        name: 'Ibuprofeno 600mg',
        quantity: 150,
        lot: 'IBU-2024',
        validity: '2026-05-20 12:00:00.000Z',
        serial: 'SN-IBU20',
        category: 'Medicamento',
        location: 'Armário de Medicamentos',
      },
    ]

    for (const item of items) {
      try {
        app.findFirstRecordByFilter('kit_items', `name = "${item.name}" && lot = "${item.lot}"`)
      } catch (_) {
        const record = new Record(col)
        record.set('name', item.name)
        record.set('quantity', item.quantity)
        record.set('lot', item.lot)
        record.set('validity', item.validity)
        record.set('serial', item.serial)
        record.set('category', item.category)
        record.set('location', item.location)
        // 'kit' field is intentionally left empty/null to represent General Stock
        app.save(record)
      }
    }
  },
  (app) => {
    const items = [
      { name: 'Amoxicilina 500mg', lot: 'AMX-2024-01' },
      { name: 'Paracetamol 750mg', lot: 'PAR-2024-05' },
      { name: 'Soro Fisiológico 500ml', lot: 'SORO-99' },
      { name: 'Gaze Estéril (Pacote)', lot: 'GAZE-X' },
      { name: 'Atropina 0.5mg/ml', lot: 'ATR-P3' },
      { name: 'Adrenalina 1mg/ml', lot: 'ADR-V4' },
      { name: 'Ibuprofeno 600mg', lot: 'IBU-2024' },
    ]

    for (const item of items) {
      try {
        const record = app.findFirstRecordByFilter(
          'kit_items',
          `name = "${item.name}" && lot = "${item.lot}"`,
        )
        app.delete(record)
      } catch (_) {
        // Ignored if not found
      }
    }
  },
)
