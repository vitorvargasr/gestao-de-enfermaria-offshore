migrate(
  (app) => {
    const kitItemsCol = app.findCollectionByNameOrId('kit_items')

    let targetKit
    try {
      targetKit = app.findFirstRecordByData('kits', 'name', 'Kit de Primeiros Socorros - Deck A')
    } catch (_) {
      try {
        const kits = app.findRecordsByFilter('kits', '1=1', '', 1, 0)
        if (kits.length > 0) targetKit = kits[0]
      } catch (_) {}
    }

    if (!targetKit) return

    let items = []
    try {
      items = app.findRecordsByFilter('inventory', '1=1', '', 3, 0)
    } catch (_) {}

    if (items.length === 0) return

    const seeds = [
      { item: items[0].id, quantity: 2 },
      { item: items[1 % items.length].id, quantity: 5 },
      { item: items[2 % items.length].id, quantity: 1 },
    ]

    const uniqueSeeds = Array.from(new Map(seeds.map((s) => [s.item, s])).values())

    for (const s of uniqueSeeds) {
      try {
        app.findFirstRecordByFilter('kit_items', `kit = '${targetKit.id}' && item = '${s.item}'`)
      } catch (_) {
        const record = new Record(kitItemsCol)
        record.set('kit', targetKit.id)
        record.set('item', s.item)
        record.set('quantity', s.quantity)
        app.save(record)
      }
    }
  },
  (app) => {
    try {
      const records = app.findRecordsByFilter('kit_items', '1=1', '', 100, 0)
      for (const record of records) {
        app.delete(record)
      }
    } catch (_) {}
  },
)
