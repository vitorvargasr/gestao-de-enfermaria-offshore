migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('users')

    if (!users.fields.getByName('role')) {
      users.fields.add(
        new SelectField({
          name: 'role',
          values: ['admin', 'pharmacist', 'certifier', 'user'],
          maxSelect: 1,
        }),
      )
      app.save(users)
    }

    // Update existing user to have 'admin' role if they don't have a role
    try {
      const adminUser = app.findAuthRecordByEmail('users', 'vitorvargas@vvconsulting.com.br')
      adminUser.set('role', 'admin')
      app.save(adminUser)
    } catch (_) {
      // Admin user not found, seed it
      const record = new Record(users)
      record.setEmail('vitorvargas@vvconsulting.com.br')
      record.setPassword('Skip@Pass')
      record.setVerified(true)
      record.set('name', 'Admin')
      record.set('role', 'admin')
      app.save(record)
    }
  },
  (app) => {
    const users = app.findCollectionByNameOrId('users')
    if (users.fields.getByName('role')) {
      users.fields.removeByName('role')
      app.save(users)
    }
  },
)
