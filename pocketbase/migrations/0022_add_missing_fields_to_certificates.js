migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('medical_chest_certificates')

    if (!col.fields.getByName('vessel_name')) {
      col.fields.add(new TextField({ name: 'vessel_name' }))
    }
    if (!col.fields.getByName('imo')) {
      col.fields.add(new TextField({ name: 'imo' }))
    }
    if (!col.fields.getByName('pdf_file')) {
      col.fields.add(new FileField({ name: 'pdf_file', maxSelect: 1, maxSize: 5242880 }))
    }

    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('medical_chest_certificates')
    col.fields.removeByName('vessel_name')
    col.fields.removeByName('imo')
    col.fields.removeByName('pdf_file')
    app.save(col)
  },
)
