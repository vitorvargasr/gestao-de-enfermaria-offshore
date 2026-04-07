migrate(
  (app) => {
    const kitsCol = app.findCollectionByNameOrId('kits')
    const inventoryCol = app.findCollectionByNameOrId('inventory')

    const collection = new Collection({
      name: 'kit_items',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'kit', type: 'relation', required: true, collectionId: kitsCol.id, maxSelect: 1 },
        {
          name: 'item',
          type: 'relation',
          required: true,
          collectionId: inventoryCol.id,
          maxSelect: 1,
        },
        { name: 'quantity', type: 'number', required: true },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(collection)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('kit_items')
    app.delete(collection)
  },
)
