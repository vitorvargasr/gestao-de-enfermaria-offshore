migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('users')

    if (!users.fields.getByName('role')) {
      users.fields.add(
        new SelectField({
          name: 'role',
          values: ['admin', 'medico', 'enfermeiro', 'certificador'],
          maxSelect: 1,
        }),
      )
    }

    // Allow users to view roles (themselves or others in the system) and allow admins to manage
    users.viewRule = "@request.auth.id != ''"
    users.listRule = "@request.auth.id != ''"
    users.updateRule = "@request.auth.id = id || @request.auth.role = 'admin'"

    app.save(users)
  },
  (app) => {
    const users = app.findCollectionByNameOrId('users')
    if (users.fields.getByName('role')) {
      users.fields.removeByName('role')
    }

    // Reset back to sensible defaults for update
    users.updateRule = 'id = @request.auth.id'

    app.save(users)
  },
)
