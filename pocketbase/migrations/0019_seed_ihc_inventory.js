migrate(
  (app) => {
    const inventory = app.findCollectionByNameOrId('inventory')

    try {
      app.truncateCollection(app.findCollectionByNameOrId('inventory_logs'))
    } catch (_) {}
    try {
      app.truncateCollection(app.findCollectionByNameOrId('kit_items'))
    } catch (_) {}
    try {
      app.truncateCollection(inventory)
    } catch (_) {}

    const today = new Date()
    const getFutureDate = (days) => {
      const d = new Date(today)
      d.setDate(d.getDate() + days)
      return d.toISOString().replace('T', ' ').substring(0, 19) + 'Z'
    }

    const items = [
      {
        item_name: 'Epinephrine 1mg/ml',
        category: 'medication',
        quantity: 10,
        min_threshold: 5,
        expiry: getFutureDate(30),
      },
      {
        item_name: 'Paracetamol 500mg',
        category: 'medication',
        quantity: 100,
        min_threshold: 20,
        expiry: getFutureDate(40),
      },
      {
        item_name: 'Oxygen Cylinder 2L',
        category: 'equipment',
        quantity: 2,
        min_threshold: 1,
        expiry: getFutureDate(45),
      },
      {
        item_name: 'Morphine Sulfate 10mg/ml',
        category: 'medication',
        quantity: 15,
        min_threshold: 5,
        expiry: getFutureDate(50),
      },
      {
        item_name: 'Adrenaline Auto-injector',
        category: 'medication',
        quantity: 5,
        min_threshold: 2,
        expiry: getFutureDate(55),
      },
      {
        item_name: 'Bandages 10cm',
        category: 'consumable',
        quantity: 50,
        min_threshold: 10,
        expiry: getFutureDate(100),
      },
      {
        item_name: 'Sterile Gauze Pads',
        category: 'consumable',
        quantity: 200,
        min_threshold: 50,
        expiry: getFutureDate(120),
      },
      {
        item_name: 'Defibrillator Pads',
        category: 'equipment',
        quantity: 4,
        min_threshold: 2,
        expiry: getFutureDate(150),
      },
      {
        item_name: 'Ibuprofen 400mg',
        category: 'medication',
        quantity: 80,
        min_threshold: 20,
        expiry: getFutureDate(200),
      },
      {
        item_name: 'Amoxicillin 500mg',
        category: 'medication',
        quantity: 40,
        min_threshold: 10,
        expiry: getFutureDate(250),
      },
      {
        item_name: 'Tourniquet',
        category: 'equipment',
        quantity: 10,
        min_threshold: 3,
        expiry: getFutureDate(300),
      },
      {
        item_name: 'Normal Saline 0.9% 500ml',
        category: 'medication',
        quantity: 30,
        min_threshold: 10,
        expiry: getFutureDate(350),
      },
      {
        item_name: 'Syringes 5ml',
        category: 'consumable',
        quantity: 150,
        min_threshold: 30,
        expiry: getFutureDate(400),
      },
      {
        item_name: 'Syringes 10ml',
        category: 'consumable',
        quantity: 100,
        min_threshold: 20,
        expiry: getFutureDate(400),
      },
      {
        item_name: 'IV Catheter 20G',
        category: 'consumable',
        quantity: 50,
        min_threshold: 15,
        expiry: getFutureDate(400),
      },
      {
        item_name: 'IV Catheter 22G',
        category: 'consumable',
        quantity: 50,
        min_threshold: 15,
        expiry: getFutureDate(400),
      },
      {
        item_name: 'Micropore Tape',
        category: 'consumable',
        quantity: 20,
        min_threshold: 5,
        expiry: getFutureDate(500),
      },
      {
        item_name: 'Medical Gloves M',
        category: 'consumable',
        quantity: 500,
        min_threshold: 100,
        expiry: getFutureDate(500),
      },
      {
        item_name: 'Medical Gloves L',
        category: 'consumable',
        quantity: 300,
        min_threshold: 50,
        expiry: getFutureDate(500),
      },
      {
        item_name: 'Digital Thermometer',
        category: 'equipment',
        quantity: 5,
        min_threshold: 2,
        expiry: getFutureDate(600),
      },
      {
        item_name: 'Pulse Oximeter',
        category: 'equipment',
        quantity: 4,
        min_threshold: 2,
        expiry: getFutureDate(600),
      },
      {
        item_name: 'Stethoscope',
        category: 'equipment',
        quantity: 3,
        min_threshold: 1,
        expiry: getFutureDate(700),
      },
      {
        item_name: 'Sphygmomanometer',
        category: 'equipment',
        quantity: 3,
        min_threshold: 1,
        expiry: getFutureDate(700),
      },
      {
        item_name: 'Antiseptic Wipes',
        category: 'consumable',
        quantity: 200,
        min_threshold: 50,
        expiry: getFutureDate(200),
      },
      {
        item_name: 'Scalpel Blades',
        category: 'consumable',
        quantity: 100,
        min_threshold: 20,
        expiry: getFutureDate(300),
      },
      {
        item_name: 'Suture Kit',
        category: 'consumable',
        quantity: 15,
        min_threshold: 5,
        expiry: getFutureDate(350),
      },
      {
        item_name: 'Hydrocortisone Cream 1%',
        category: 'medication',
        quantity: 20,
        min_threshold: 5,
        expiry: getFutureDate(200),
      },
      {
        item_name: 'Ondansetron 4mg',
        category: 'medication',
        quantity: 30,
        min_threshold: 10,
        expiry: getFutureDate(220),
      },
      {
        item_name: 'Loperamide 4mg',
        category: 'medication',
        quantity: 40,
        min_threshold: 10,
        expiry: getFutureDate(240),
      },
      {
        item_name: 'Cetirizine 10mg',
        category: 'medication',
        quantity: 50,
        min_threshold: 15,
        expiry: getFutureDate(260),
      },
    ]

    for (const item of items) {
      const record = new Record(inventory)
      record.set('item_name', item.item_name)
      record.set('category', item.category)
      record.set('quantity', item.quantity)
      record.set('min_threshold', item.min_threshold)
      record.set('expiry_date', item.expiry)
      app.save(record)
    }
  },
  (app) => {},
)
