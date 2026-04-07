migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('users')

    const createOrUpdateUser = (email, name, role) => {
      try {
        const user = app.findAuthRecordByEmail('users', email)
        user.set('role', role)
        app.save(user)
      } catch (_) {
        const user = new Record(users)
        user.setEmail(email)
        user.setPassword('Skip@Pass')
        user.setVerified(true)
        user.set('name', name)
        user.set('role', role)
        app.save(user)
      }
    }

    createOrUpdateUser('vitorvargas@vvconsulting.com.br', 'Vitor Vargas', 'admin')
    createOrUpdateUser('medico@example.com', 'Médico Plantonista', 'medico')
    createOrUpdateUser('enfermeiro@example.com', 'Enfermeiro Chefe', 'enfermeiro')
    createOrUpdateUser('certificador@example.com', 'Auditor/Certificador', 'certificador')
  },
  (app) => {
    // No revert needed for seed data
  },
)
