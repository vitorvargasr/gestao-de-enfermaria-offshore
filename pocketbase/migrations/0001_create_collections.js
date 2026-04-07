migrate(
  (app) => {
    const kits = new Collection({
      name: 'kits',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'location', type: 'text' },
        { name: 'status', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(kits)

    const kitItems = new Collection({
      name: 'kit_items',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        {
          name: 'kit',
          type: 'relation',
          required: true,
          collectionId: kits.id,
          cascadeDelete: true,
          maxSelect: 1,
        },
        { name: 'name', type: 'text', required: true },
        { name: 'quantity', type: 'number', required: true },
        { name: 'lot', type: 'text', required: true },
        { name: 'validity', type: 'date', required: true },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(kitItems)

    const kitInspections = new Collection({
      name: 'kit_inspections',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        {
          name: 'kit',
          type: 'relation',
          required: true,
          collectionId: kits.id,
          cascadeDelete: true,
          maxSelect: 1,
        },
        { name: 'inspector_name', type: 'text', required: true },
        { name: 'status', type: 'text', required: true },
        { name: 'notes', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(kitInspections)

    const drafts = new Collection({
      name: 'replenishment_drafts',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        {
          name: 'kit',
          type: 'relation',
          required: true,
          collectionId: kits.id,
          cascadeDelete: true,
          maxSelect: 1,
        },
        { name: 'item_name', type: 'text', required: true },
        { name: 'quantity_needed', type: 'number', required: true },
        { name: 'reason', type: 'text', required: true },
        { name: 'status', type: 'text', required: true },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(drafts)
  },
  (app) => {
    try {
      app.delete(app.findCollectionByNameOrId('replenishment_drafts'))
    } catch (_) {}
    try {
      app.delete(app.findCollectionByNameOrId('kit_inspections'))
    } catch (_) {}
    try {
      app.delete(app.findCollectionByNameOrId('kit_items'))
    } catch (_) {}
    try {
      app.delete(app.findCollectionByNameOrId('kits'))
    } catch (_) {}
  },
)
