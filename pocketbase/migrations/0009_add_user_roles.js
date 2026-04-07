migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('users')
    users.fields.add(
      new SelectField({
        name: 'role',
        maxSelect: 1,
        values: ['admin', 'pharmacist', 'certifier', 'viewer'],
      }),
    )
    app.save(users)
  },
  (app) => {
    const users = app.findCollectionByNameOrId('users')
    users.fields.removeByName('role')
    app.save(users)
  },
)
