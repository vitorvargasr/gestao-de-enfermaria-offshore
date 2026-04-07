migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')
    try {
      app.findAuthRecordByEmail('_pb_users_auth_', 'vitorvargas@vvconsulting.com.br')
    } catch (_) {
      const record = new Record(users)
      record.setEmail('vitorvargas@vvconsulting.com.br')
      record.setPassword('Skip@Pass')
      record.setVerified(true)
      record.set('name', 'Admin')
      app.save(record)
    }

    const kitsCol = app.findCollectionByNameOrId('kits')
    const itemsCol = app.findCollectionByNameOrId('kit_items')

    const kitData = [
      { name: 'Emergency Kit A', location: 'Ponte de Comando', status: 'Ativo' },
      { name: 'Trauma Bag 1', location: 'Enfermaria', status: 'Ativo' },
      { name: 'Burn Kit C', location: 'Casa de Máquinas', status: 'Ativo' },
    ]

    const now = new Date()
    const futureDate = new Date(now)
    futureDate.setDate(now.getDate() + 90)
    const pastDate = new Date(now)
    pastDate.setDate(now.getDate() - 10)

    for (const k of kitData) {
      let kitRecord
      try {
        kitRecord = app.findFirstRecordByData('kits', 'name', k.name)
      } catch (_) {
        kitRecord = new Record(kitsCol)
        kitRecord.set('name', k.name)
        kitRecord.set('location', k.location)
        kitRecord.set('status', k.status)
        app.save(kitRecord)

        const item1 = new Record(itemsCol)
        item1.set('kit', kitRecord.id)
        item1.set('name', 'Atadura ' + k.name)
        item1.set('quantity', 5)
        item1.set('lot', 'L-123')
        item1.set('validity', futureDate.toISOString().replace('T', ' '))
        app.save(item1)

        const item2 = new Record(itemsCol)
        item2.set('kit', kitRecord.id)
        item2.set('name', 'Soro ' + k.name)
        item2.set('quantity', 2)
        item2.set('lot', 'L-456')
        item2.set('validity', pastDate.toISOString().replace('T', ' '))
        app.save(item2)
      }
    }
  },
  (app) => {
    // Safe seed un-installation is omitted to preserve manually added test data
  },
)
