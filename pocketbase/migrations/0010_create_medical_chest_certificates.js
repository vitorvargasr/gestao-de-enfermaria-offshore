migrate(
  (app) => {
    const collection = new Collection({
      name: 'medical_chest_certificates',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'certificate_number', type: 'text', required: true },
        { name: 'issue_date', type: 'date', required: true },
        { name: 'expiry_date', type: 'date', required: true },
        { name: 'issuing_authority', type: 'text' },
        {
          name: 'status',
          type: 'select',
          values: ['valid', 'expired', 'pending_renewal'],
          maxSelect: 1,
        },
        { name: 'notes', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(collection)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('medical_chest_certificates')
    app.delete(collection)
  },
)
