migrate(
  (app) => {
    const kitsCollection = app.findCollectionByNameOrId('kits')

    const seedData = [
      {
        name: 'Kit de Primeiros Socorros - Deck A',
        description: 'Kit básico para atendimento inicial',
      },
      {
        name: 'Kit de Trauma - Emergência',
        description: 'Equipamentos para estabilização de traumas graves',
      },
      {
        name: 'Kit de Sutura e Pequenos Curativos',
        description: 'Material estéril para procedimentos menores',
      },
    ]

    for (const data of seedData) {
      try {
        app.findFirstRecordByData('kits', 'name', data.name)
        // Record already exists - skip
      } catch (_) {
        const record = new Record(kitsCollection)
        record.set('name', data.name)
        record.set('description', data.description)
        app.save(record)
      }
    }
  },
  (app) => {
    const seedNames = [
      'Kit de Primeiros Socorros - Deck A',
      'Kit de Trauma - Emergência',
      'Kit de Sutura e Pequenos Curativos',
    ]

    for (const name of seedNames) {
      try {
        const record = app.findFirstRecordByData('kits', 'name', name)
        app.delete(record)
      } catch (_) {}
    }
  },
)
