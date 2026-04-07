migrate(
  (app) => {
    const inventory = app.findCollectionByNameOrId('inventory')

    const today = new Date()
    const getFutureDate = (days) => {
      const d = new Date(today)
      d.setDate(d.getDate() + days)
      return d.toISOString().replace('T', ' ').substring(0, 19) + 'Z'
    }

    const items = [
      // 10 near expiry (30-60 days)
      {
        item_name: 'Paracetamol 500mg',
        category: 'medication',
        quantity: 50,
        min_threshold: 20,
        expiry: getFutureDate(35),
      },
      {
        item_name: 'Ibuprofeno 400mg',
        category: 'medication',
        quantity: 30,
        min_threshold: 15,
        expiry: getFutureDate(40),
      },
      {
        item_name: 'Dipirona 1g',
        category: 'medication',
        quantity: 100,
        min_threshold: 50,
        expiry: getFutureDate(45),
      },
      {
        item_name: 'Amoxicilina 500mg',
        category: 'medication',
        quantity: 40,
        min_threshold: 20,
        expiry: getFutureDate(50),
      },
      {
        item_name: 'Seringa 5ml',
        category: 'consumable',
        quantity: 200,
        min_threshold: 50,
        expiry: getFutureDate(55),
      },
      {
        item_name: 'Atadura 10cm',
        category: 'consumable',
        quantity: 80,
        min_threshold: 30,
        expiry: getFutureDate(32),
      },
      {
        item_name: 'Gaze Estéril',
        category: 'consumable',
        quantity: 150,
        min_threshold: 50,
        expiry: getFutureDate(38),
      },
      {
        item_name: 'Luvas de Procedimento M',
        category: 'consumable',
        quantity: 10,
        min_threshold: 5,
        expiry: getFutureDate(42),
      },
      {
        item_name: 'Desfibrilador Pads',
        category: 'equipment',
        quantity: 4,
        min_threshold: 2,
        expiry: getFutureDate(58),
      },
      {
        item_name: 'Soro Fisiológico 0.9%',
        category: 'medication',
        quantity: 60,
        min_threshold: 20,
        expiry: getFutureDate(48),
      },

      // 20 valid > 60 days
      {
        item_name: 'Azitromicina 500mg',
        category: 'medication',
        quantity: 30,
        min_threshold: 10,
        expiry: getFutureDate(120),
      },
      {
        item_name: 'Loratadina 10mg',
        category: 'medication',
        quantity: 40,
        min_threshold: 15,
        expiry: getFutureDate(150),
      },
      {
        item_name: 'Omeprazol 20mg',
        category: 'medication',
        quantity: 60,
        min_threshold: 20,
        expiry: getFutureDate(200),
      },
      {
        item_name: 'Captopril 25mg',
        category: 'medication',
        quantity: 50,
        min_threshold: 20,
        expiry: getFutureDate(180),
      },
      {
        item_name: 'Metformina 850mg',
        category: 'medication',
        quantity: 100,
        min_threshold: 30,
        expiry: getFutureDate(220),
      },
      {
        item_name: 'AAS 100mg',
        category: 'medication',
        quantity: 80,
        min_threshold: 25,
        expiry: getFutureDate(300),
      },
      {
        item_name: 'Dexametasona 4mg',
        category: 'medication',
        quantity: 40,
        min_threshold: 10,
        expiry: getFutureDate(250),
      },
      {
        item_name: 'Epinefrina 1mg',
        category: 'medication',
        quantity: 15,
        min_threshold: 5,
        expiry: getFutureDate(100),
      },
      {
        item_name: 'Lidocaína 2%',
        category: 'medication',
        quantity: 20,
        min_threshold: 5,
        expiry: getFutureDate(140),
      },
      {
        item_name: 'Agulha 25x7',
        category: 'consumable',
        quantity: 300,
        min_threshold: 100,
        expiry: getFutureDate(400),
      },
      {
        item_name: 'Agulha 40x12',
        category: 'consumable',
        quantity: 200,
        min_threshold: 50,
        expiry: getFutureDate(400),
      },
      {
        item_name: 'Cateter IV 20G',
        category: 'consumable',
        quantity: 100,
        min_threshold: 30,
        expiry: getFutureDate(365),
      },
      {
        item_name: 'Cateter IV 22G',
        category: 'consumable',
        quantity: 100,
        min_threshold: 30,
        expiry: getFutureDate(365),
      },
      {
        item_name: 'Fita Micropore',
        category: 'consumable',
        quantity: 50,
        min_threshold: 15,
        expiry: getFutureDate(300),
      },
      {
        item_name: 'Esparadrapo',
        category: 'consumable',
        quantity: 40,
        min_threshold: 10,
        expiry: getFutureDate(300),
      },
      {
        item_name: 'Algodão 500g',
        category: 'consumable',
        quantity: 20,
        min_threshold: 5,
        expiry: getFutureDate(500),
      },
      {
        item_name: 'Termômetro Digital',
        category: 'equipment',
        quantity: 5,
        min_threshold: 2,
        expiry: getFutureDate(1000),
      },
      {
        item_name: 'Estetoscópio',
        category: 'equipment',
        quantity: 3,
        min_threshold: 1,
        expiry: getFutureDate(2000),
      },
      {
        item_name: 'Esfigmomanômetro',
        category: 'equipment',
        quantity: 3,
        min_threshold: 1,
        expiry: getFutureDate(2000),
      },
      {
        item_name: 'Oxímetro de Pulso',
        category: 'equipment',
        quantity: 4,
        min_threshold: 2,
        expiry: getFutureDate(1500),
      },
    ]

    for (const item of items) {
      let exists = false

      // Fallback to check multiple possible field name definitions
      try {
        app.findFirstRecordByData('inventory', 'item_name', item.item_name)
        exists = true
      } catch (_) {}

      if (!exists) {
        try {
          app.findFirstRecordByData('inventory', 'name', item.item_name)
          exists = true
        } catch (_) {}
      }

      if (!exists) {
        const record = new Record(inventory)

        // Setting both variables handles whichever field the schema requires
        record.set('item_name', item.item_name)
        record.set('name', item.item_name)

        record.set('category', item.category)
        record.set('quantity', item.quantity)
        record.set('min_threshold', item.min_threshold)
        record.set('expiry_date', item.expiry)
        app.save(record)
      }
    }
  },
  (app) => {
    // empty
  },
)
