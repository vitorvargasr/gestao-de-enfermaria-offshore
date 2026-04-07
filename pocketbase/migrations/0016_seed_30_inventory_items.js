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
        name: 'Paracetamol 500mg',
        category: 'medication',
        quantity: 50,
        min_threshold: 20,
        expiry: getFutureDate(35),
      },
      {
        name: 'Ibuprofeno 400mg',
        category: 'medication',
        quantity: 30,
        min_threshold: 15,
        expiry: getFutureDate(40),
      },
      {
        name: 'Dipirona 1g',
        category: 'medication',
        quantity: 100,
        min_threshold: 50,
        expiry: getFutureDate(45),
      },
      {
        name: 'Amoxicilina 500mg',
        category: 'medication',
        quantity: 40,
        min_threshold: 20,
        expiry: getFutureDate(50),
      },
      {
        name: 'Seringa 5ml',
        category: 'consumable',
        quantity: 200,
        min_threshold: 50,
        expiry: getFutureDate(55),
      },
      {
        name: 'Atadura 10cm',
        category: 'consumable',
        quantity: 80,
        min_threshold: 30,
        expiry: getFutureDate(32),
      },
      {
        name: 'Gaze Estéril',
        category: 'consumable',
        quantity: 150,
        min_threshold: 50,
        expiry: getFutureDate(38),
      },
      {
        name: 'Luvas de Procedimento M',
        category: 'consumable',
        quantity: 10,
        min_threshold: 5,
        expiry: getFutureDate(42),
      },
      {
        name: 'Desfibrilador Pads',
        category: 'equipment',
        quantity: 4,
        min_threshold: 2,
        expiry: getFutureDate(58),
      },
      {
        name: 'Soro Fisiológico 0.9%',
        category: 'medication',
        quantity: 60,
        min_threshold: 20,
        expiry: getFutureDate(48),
      },

      // 20 valid > 60 days
      {
        name: 'Azitromicina 500mg',
        category: 'medication',
        quantity: 30,
        min_threshold: 10,
        expiry: getFutureDate(120),
      },
      {
        name: 'Loratadina 10mg',
        category: 'medication',
        quantity: 40,
        min_threshold: 15,
        expiry: getFutureDate(150),
      },
      {
        name: 'Omeprazol 20mg',
        category: 'medication',
        quantity: 60,
        min_threshold: 20,
        expiry: getFutureDate(200),
      },
      {
        name: 'Captopril 25mg',
        category: 'medication',
        quantity: 50,
        min_threshold: 20,
        expiry: getFutureDate(180),
      },
      {
        name: 'Metformina 850mg',
        category: 'medication',
        quantity: 100,
        min_threshold: 30,
        expiry: getFutureDate(220),
      },
      {
        name: 'AAS 100mg',
        category: 'medication',
        quantity: 80,
        min_threshold: 25,
        expiry: getFutureDate(300),
      },
      {
        name: 'Dexametasona 4mg',
        category: 'medication',
        quantity: 40,
        min_threshold: 10,
        expiry: getFutureDate(250),
      },
      {
        name: 'Epinefrina 1mg',
        category: 'medication',
        quantity: 15,
        min_threshold: 5,
        expiry: getFutureDate(100),
      },
      {
        name: 'Lidocaína 2%',
        category: 'medication',
        quantity: 20,
        min_threshold: 5,
        expiry: getFutureDate(140),
      },
      {
        name: 'Agulha 25x7',
        category: 'consumable',
        quantity: 300,
        min_threshold: 100,
        expiry: getFutureDate(400),
      },
      {
        name: 'Agulha 40x12',
        category: 'consumable',
        quantity: 200,
        min_threshold: 50,
        expiry: getFutureDate(400),
      },
      {
        name: 'Cateter IV 20G',
        category: 'consumable',
        quantity: 100,
        min_threshold: 30,
        expiry: getFutureDate(365),
      },
      {
        name: 'Cateter IV 22G',
        category: 'consumable',
        quantity: 100,
        min_threshold: 30,
        expiry: getFutureDate(365),
      },
      {
        name: 'Fita Micropore',
        category: 'consumable',
        quantity: 50,
        min_threshold: 15,
        expiry: getFutureDate(300),
      },
      {
        name: 'Esparadrapo',
        category: 'consumable',
        quantity: 40,
        min_threshold: 10,
        expiry: getFutureDate(300),
      },
      {
        name: 'Algodão 500g',
        category: 'consumable',
        quantity: 20,
        min_threshold: 5,
        expiry: getFutureDate(500),
      },
      {
        name: 'Termômetro Digital',
        category: 'equipment',
        quantity: 5,
        min_threshold: 2,
        expiry: getFutureDate(1000),
      },
      {
        name: 'Estetoscópio',
        category: 'equipment',
        quantity: 3,
        min_threshold: 1,
        expiry: getFutureDate(2000),
      },
      {
        name: 'Esfigmomanômetro',
        category: 'equipment',
        quantity: 3,
        min_threshold: 1,
        expiry: getFutureDate(2000),
      },
      {
        name: 'Oxímetro de Pulso',
        category: 'equipment',
        quantity: 4,
        min_threshold: 2,
        expiry: getFutureDate(1500),
      },
    ]

    for (const item of items) {
      try {
        app.findFirstRecordByData('inventory', 'item_name', item.name)
      } catch (_) {
        const record = new Record(inventory)
        record.set('item_name', item.name)
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
