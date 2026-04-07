migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('medical_chest_certificates')

    col.createRule =
      "@request.auth.id != '' && (@request.auth.role = 'admin' || @request.auth.role = 'pharmacist' || @request.auth.role = 'certifier')"
    col.updateRule =
      "@request.auth.id != '' && (@request.auth.role = 'admin' || @request.auth.role = 'pharmacist' || @request.auth.role = 'certifier')"

    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('medical_chest_certificates')

    col.createRule =
      "@request.auth.id != '' && (@request.auth.role = 'pharmacist' || @request.auth.role = 'certifier')"
    col.updateRule =
      "@request.auth.id != '' && (@request.auth.role = 'pharmacist' || @request.auth.role = 'certifier')"

    app.save(col)
  },
)
