migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('users')
    users.fields.removeByName('role')
    users.fields.add(
      new SelectField({
        name: 'role',
        values: ['admin', 'doctor', 'nurse', 'certifier'],
        maxSelect: 1,
      }),
    )
    app.save(users)
  },
  (app) => {
    const users = app.findCollectionByNameOrId('users')
    users.fields.removeByName('role')
    users.fields.add(
      new SelectField({
        name: 'role',
        values: ['admin', 'pharmacist', 'certifier', 'user'],
        maxSelect: 1,
      }),
    )
    app.save(users)
  },
)
