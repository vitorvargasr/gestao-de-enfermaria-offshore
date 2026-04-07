migrate(
  (app) => {
    try {
      const user = app.findAuthRecordByEmail('users', 'vitorvargas@vvconsulting.com.br')
      user.set('role', 'admin')
      app.save(user)
    } catch (_) {}
  },
  (app) => {
    try {
      const user = app.findAuthRecordByEmail('users', 'vitorvargas@vvconsulting.com.br')
      user.set('role', '')
      app.save(user)
    } catch (_) {}
  },
)
