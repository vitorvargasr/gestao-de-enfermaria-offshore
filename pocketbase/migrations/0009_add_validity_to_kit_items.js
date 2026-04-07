migrate(
  (app) => {
    const collection = app.findCollectionByNameOrId('kit_items')

    if (!collection.fields.getByName('validity')) {
      collection.fields.add(
        new DateField({
          name: 'validity',
          required: false,
        }),
      )
      app.save(collection)
    }
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('kit_items')

    if (collection.fields.getByName('validity')) {
      collection.fields.removeByName('validity')
      app.save(collection)
    }
  },
)
