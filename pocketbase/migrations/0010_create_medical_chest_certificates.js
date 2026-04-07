migrate(
  (app) => {
    const collection = new Collection({
      name: 'medical_chest_certificates',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule:
        "@request.auth.id != '' && (@request.auth.role = 'admin' || @request.auth.role = 'pharmacist' || @request.auth.role = 'certifier')",
      updateRule:
        "@request.auth.id != '' && (@request.auth.role = 'admin' || @request.auth.role = 'pharmacist' || @request.auth.role = 'certifier')",
      deleteRule:
        "@request.auth.id != '' && (@request.auth.role = 'admin' || @request.auth.role = 'pharmacist' || @request.auth.role = 'certifier')",
      fields: [
        { name: 'vessel_name', type: 'text', required: true },
        { name: 'imo', type: 'text', required: true },
        { name: 'issue_date', type: 'date', required: true },
        { name: 'po_ref', type: 'text' },
        { name: 'valid_until', type: 'date', required: true },
        { name: 'flag', type: 'text', required: true },
        { name: 'ship_reg', type: 'text', required: true },
        { name: 'inspector_name', type: 'text', required: true },
        { name: 'signature', type: 'text', required: true },
        {
          name: 'pdf_file',
          type: 'file',
          maxSelect: 1,
          maxSize: 5242880,
          mimeTypes: ['application/pdf'],
        },
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
