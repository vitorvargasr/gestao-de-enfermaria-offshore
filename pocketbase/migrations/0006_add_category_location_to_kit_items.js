migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('kit_items')

    if (!col.fields.getByName('category')) {
      col.fields.add(new TextField({ name: 'category' }))
    }

    if (!col.fields.getByName('location')) {
      col.fields.add(new TextField({ name: 'location' }))
    }

    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('kit_items')
    col.fields.removeByName('category')
    col.fields.removeByName('location')
    app.save(col)
  },
)
