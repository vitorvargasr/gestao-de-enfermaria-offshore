migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('users')
    const seedUsers = [
      { email: 'admin@ihc.com', role: 'admin', name: 'Admin IHC' },
      { email: 'doctor@ihc.com', role: 'doctor', name: 'Doctor IHC' },
      { email: 'nurse@ihc.com', role: 'nurse', name: 'Nurse IHC' },
      { email: 'certifier@ihc.com', role: 'certifier', name: 'Certifier IHC' },
    ]

    for (const u of seedUsers) {
      try {
        const existing = app.findAuthRecordByEmail('users', u.email)
        existing.set('role', u.role)
        existing.set('name', u.name)
        app.save(existing)
      } catch (_) {
        const record = new Record(users)
        record.setEmail(u.email)
        record.setPassword('Skip@Pass')
        record.setVerified(true)
        record.set('role', u.role)
        record.set('name', u.name)
        app.save(record)
      }
    }
  },
  (app) => {},
)
