migrate(
  (app) => {
    const collection = app.findCollectionByNameOrId('inventory')

    const now = new Date()

    // Format for PocketBase date fields: YYYY-MM-DD HH:mm:ss.SSSZ
    const formatPbDate = (date) => {
      return date.toISOString().replace('T', ' ')
    }

    const nearExpiryDate = formatPbDate(new Date(now.getTime() + 45 * 24 * 60 * 60 * 1000))
    const normalExpiryDate1 = formatPbDate(new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000))
    const normalExpiryDate2 = formatPbDate(new Date(now.getTime() + 730 * 24 * 60 * 60 * 1000))

    const items = [
      {
        item_name: 'Paracetamol 500mg',
        category: 'medication',
        quantity: 100,
        unit: 'tablets',
        min_threshold: 20,
        is_near_expiry: false,
      },
      {
        item_name: 'Amoxicillin 500mg',
        category: 'medication',
        quantity: 50,
        unit: 'capsules',
        min_threshold: 10,
        is_near_expiry: false,
      },
      {
        item_name: 'Adrenaline Auto-injector',
        category: 'medication',
        quantity: 2,
        unit: 'units',
        min_threshold: 1,
        is_near_expiry: true,
      },
      {
        item_name: 'Sterile Gauze Pads',
        category: 'consumable',
        quantity: 200,
        unit: 'pads',
        min_threshold: 50,
        is_near_expiry: false,
      },
      {
        item_name: 'Digital Sphygmomanometer',
        category: 'equipment',
        quantity: 2,
        unit: 'units',
        min_threshold: 1,
        is_near_expiry: false,
      },
      {
        item_name: 'Portable Oxygen Cylinder',
        category: 'equipment',
        quantity: 3,
        unit: 'cylinders',
        min_threshold: 1,
        is_near_expiry: false,
      },
      {
        item_name: 'Surgical Spirit',
        category: 'consumable',
        quantity: 5,
        unit: 'bottles',
        min_threshold: 2,
        is_near_expiry: false,
      },
      {
        item_name: 'Medical Adhesive Tape',
        category: 'consumable',
        quantity: 20,
        unit: 'rolls',
        min_threshold: 5,
        is_near_expiry: false,
      },
      {
        item_name: 'Burn Dressing',
        category: 'consumable',
        quantity: 10,
        unit: 'dressings',
        min_threshold: 2,
        is_near_expiry: false,
      },
      {
        item_name: 'Ibuprofen 400mg',
        category: 'medication',
        quantity: 80,
        unit: 'tablets',
        min_threshold: 15,
        is_near_expiry: false,
      },
      {
        item_name: 'Aspirin 300mg',
        category: 'medication',
        quantity: 60,
        unit: 'tablets',
        min_threshold: 10,
        is_near_expiry: false,
      },
      {
        item_name: 'Salbutamol Inhaler',
        category: 'medication',
        quantity: 5,
        unit: 'inhalers',
        min_threshold: 2,
        is_near_expiry: true,
      },
      {
        item_name: 'Cetirizine 10mg',
        category: 'medication',
        quantity: 40,
        unit: 'tablets',
        min_threshold: 10,
        is_near_expiry: false,
      },
      {
        item_name: 'Loperamide 2mg',
        category: 'medication',
        quantity: 30,
        unit: 'capsules',
        min_threshold: 10,
        is_near_expiry: false,
      },
      {
        item_name: 'Oral Rehydration Salts',
        category: 'medication',
        quantity: 50,
        unit: 'sachets',
        min_threshold: 15,
        is_near_expiry: false,
      },
      {
        item_name: 'Antiseptic Cream',
        category: 'medication',
        quantity: 10,
        unit: 'tubes',
        min_threshold: 3,
        is_near_expiry: false,
      },
      {
        item_name: 'Hydrocortisone Cream 1%',
        category: 'medication',
        quantity: 8,
        unit: 'tubes',
        min_threshold: 2,
        is_near_expiry: false,
      },
      {
        item_name: 'Triangular Bandage',
        category: 'consumable',
        quantity: 15,
        unit: 'bandages',
        min_threshold: 5,
        is_near_expiry: false,
      },
      {
        item_name: 'Crepe Bandage 7.5cm',
        category: 'consumable',
        quantity: 20,
        unit: 'bandages',
        min_threshold: 5,
        is_near_expiry: false,
      },
      {
        item_name: 'Disposable Gloves (Large)',
        category: 'consumable',
        quantity: 500,
        unit: 'pairs',
        min_threshold: 100,
        is_near_expiry: false,
      },
      {
        item_name: 'CPR Mask',
        category: 'equipment',
        quantity: 5,
        unit: 'masks',
        min_threshold: 2,
        is_near_expiry: false,
      },
      {
        item_name: 'Thermometer (Digital)',
        category: 'equipment',
        quantity: 4,
        unit: 'units',
        min_threshold: 2,
        is_near_expiry: false,
      },
      {
        item_name: 'Stethoscope',
        category: 'equipment',
        quantity: 2,
        unit: 'units',
        min_threshold: 1,
        is_near_expiry: false,
      },
      {
        item_name: 'Pulse Oximeter',
        category: 'equipment',
        quantity: 3,
        unit: 'units',
        min_threshold: 1,
        is_near_expiry: false,
      },
      {
        item_name: 'Automated External Defibrillator (AED)',
        category: 'equipment',
        quantity: 1,
        unit: 'units',
        min_threshold: 1,
        is_near_expiry: false,
      },
      {
        item_name: 'Defibrillator Pads (Adult)',
        category: 'consumable',
        quantity: 4,
        unit: 'pairs',
        min_threshold: 1,
        is_near_expiry: true,
      },
      {
        item_name: 'Suture Kit',
        category: 'consumable',
        quantity: 10,
        unit: 'kits',
        min_threshold: 3,
        is_near_expiry: false,
      },
      {
        item_name: 'Scalpel Blades',
        category: 'consumable',
        quantity: 50,
        unit: 'blades',
        min_threshold: 10,
        is_near_expiry: false,
      },
      {
        item_name: 'Syringes 5ml',
        category: 'consumable',
        quantity: 100,
        unit: 'syringes',
        min_threshold: 20,
        is_near_expiry: false,
      },
      {
        item_name: 'Needles 21G',
        category: 'consumable',
        quantity: 100,
        unit: 'needles',
        min_threshold: 20,
        is_near_expiry: false,
      },
      {
        item_name: 'Morphine Sulfate 10mg/ml',
        category: 'medication',
        quantity: 10,
        unit: 'ampoules',
        min_threshold: 2,
        is_near_expiry: false,
      },
      {
        item_name: 'Naloxone 400mcg/ml',
        category: 'medication',
        quantity: 5,
        unit: 'ampoules',
        min_threshold: 1,
        is_near_expiry: true,
      },
      {
        item_name: 'Epinephrine 1:1000',
        category: 'medication',
        quantity: 10,
        unit: 'ampoules',
        min_threshold: 2,
        is_near_expiry: false,
      },
      {
        item_name: 'Diazepam 5mg',
        category: 'medication',
        quantity: 20,
        unit: 'tablets',
        min_threshold: 5,
        is_near_expiry: true,
      },
    ]

    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      try {
        app.findFirstRecordByData('inventory', 'item_name', item.item_name)
        // Item already exists, skip insertion
      } catch (_) {
        const record = new Record(collection)
        record.set('item_name', item.item_name)
        record.set('category', item.category)
        record.set('quantity', item.quantity)
        record.set('unit', item.unit)
        record.set('min_threshold', item.min_threshold)

        let expiry = item.is_near_expiry
          ? nearExpiryDate
          : i % 2 === 0
            ? normalExpiryDate1
            : normalExpiryDate2
        record.set('expiry_date', expiry)

        app.save(record)
      }
    }
  },
  (app) => {
    const itemNames = [
      'Paracetamol 500mg',
      'Amoxicillin 500mg',
      'Adrenaline Auto-injector',
      'Sterile Gauze Pads',
      'Digital Sphygmomanometer',
      'Portable Oxygen Cylinder',
      'Surgical Spirit',
      'Medical Adhesive Tape',
      'Burn Dressing',
      'Ibuprofen 400mg',
      'Aspirin 300mg',
      'Salbutamol Inhaler',
      'Cetirizine 10mg',
      'Loperamide 2mg',
      'Oral Rehydration Salts',
      'Antiseptic Cream',
      'Hydrocortisone Cream 1%',
      'Triangular Bandage',
      'Crepe Bandage 7.5cm',
      'Disposable Gloves (Large)',
      'CPR Mask',
      'Thermometer (Digital)',
      'Stethoscope',
      'Pulse Oximeter',
      'Automated External Defibrillator (AED)',
      'Defibrillator Pads (Adult)',
      'Suture Kit',
      'Scalpel Blades',
      'Syringes 5ml',
      'Needles 21G',
      'Morphine Sulfate 10mg/ml',
      'Naloxone 400mcg/ml',
      'Epinephrine 1:1000',
      'Diazepam 5mg',
    ]

    for (const name of itemNames) {
      try {
        const record = app.findFirstRecordByData('inventory', 'item_name', name)
        app.delete(record)
      } catch (_) {
        // Record already deleted or does not exist
      }
    }
  },
)
