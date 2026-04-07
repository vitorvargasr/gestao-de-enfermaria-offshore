migrate(
  (app) => {
    const collection = app.findCollectionByNameOrId('kit_items')
    const field = collection.fields.getByName('kit')
    field.required = false
    app.save(collection)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('kit_items')
    const field = collection.fields.getByName('kit')
    field.required = true
    app.save(collection)
  },
)
