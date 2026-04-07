migrate(
  (app) => {
    const collection = new Collection({
      name: 'consultations',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'patient_name', type: 'text', required: true },
        { name: 'symptom', type: 'text', required: true },
        { name: 'sector', type: 'text', required: true },
        { name: 'status', type: 'text' },
        { name: 'date', type: 'date', required: true },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(collection)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('consultations')
    app.delete(collection)
  },
)
