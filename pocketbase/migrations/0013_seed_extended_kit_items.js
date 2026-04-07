migrate(
  (app) => {
    const kitItemsCollection = app.findCollectionByNameOrId('kit_items')

    // Find or create a base kit for these new items
    let kitId
    try {
      const kits = app.findRecordsByFilter('kits', '1=1', '', 1, 0)
      if (kits && kits.length > 0) {
        kitId = kits[0].id
      } else {
        const kitsCollection = app.findCollectionByNameOrId('kits')
        const newKit = new Record(kitsCollection)
        newKit.set('name', 'Emergency Response Kit')
        newKit.set('description', 'Comprehensive emergency kit for immediate life-saving care.')
        app.save(newKit)
        kitId = newKit.id
      }
    } catch (err) {
      // Fallback if no kits exist
      const kitsCollection = app.findCollectionByNameOrId('kits')
      const newKit = new Record(kitsCollection)
      newKit.set('name', 'Emergency Response Kit')
      newKit.set('description', 'Comprehensive emergency kit for immediate life-saving care.')
      app.save(newKit)
      kitId = newKit.id
    }

    // Set of selected extended inventory items to link to the kit
    const targetItems = [
      { name: 'Adrenaline Auto-injector', qty: 2 },
      { name: 'Sterile Gauze Pads', qty: 20 },
      { name: 'Triangular Bandage', qty: 4 },
      { name: 'Defibrillator Pads (Adult)', qty: 2 },
      { name: 'CPR Mask', qty: 1 },
    ]

    for (const target of targetItems) {
      try {
        const inventoryRecord = app.findFirstRecordByData('inventory', 'item_name', target.name)

        // Check if this kit_item relation already exists
        try {
          app.findFirstRecordByFilter(
            'kit_items',
            `kit = '${kitId}' && item = '${inventoryRecord.id}'`,
          )
          // Already exists, skip insertion
        } catch (_) {
          const kitItem = new Record(kitItemsCollection)
          kitItem.set('kit', kitId)
          kitItem.set('item', inventoryRecord.id)
          kitItem.set('quantity', target.qty)
          kitItem.set('validity', inventoryRecord.get('expiry_date'))
          app.save(kitItem)
        }
      } catch (_) {
        // Inventory item not found, skip
      }
    }
  },
  (app) => {
    const targetItems = [
      'Adrenaline Auto-injector',
      'Sterile Gauze Pads',
      'Triangular Bandage',
      'Defibrillator Pads (Adult)',
      'CPR Mask',
    ]

    for (const name of targetItems) {
      try {
        const inventoryRecord = app.findFirstRecordByData('inventory', 'item_name', name)
        const kitItems = app.findRecordsByFilter(
          'kit_items',
          `item = '${inventoryRecord.id}'`,
          '',
          100,
          0,
        )
        for (const ki of kitItems) {
          app.delete(ki)
        }
      } catch (_) {
        // Associated inventory item or kit_item does not exist
      }
    }
  },
)
