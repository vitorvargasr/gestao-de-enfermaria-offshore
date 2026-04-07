migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('kit_items')
    if (!col.fields.getByName('serial')) {
      col.fields.add(new TextField({ name: 'serial' }))
    }
    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('kit_items')
    col.fields.removeByName('serial')
    app.save(col)
  },
)
