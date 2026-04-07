migrate(
  (app) => {
    const collection = app.findCollectionByNameOrId('medical_chest_certificates')

    const records = [
      {
        certificate_number: 'MC-2024-001',
        issue_date: '2024-01-15 12:00:00.000Z',
        expiry_date: '2025-01-15 12:00:00.000Z',
        status: 'valid',
        issuing_authority: 'Maritime Health Authority',
      },
      {
        certificate_number: 'MC-2023-088',
        issue_date: '2023-05-20 12:00:00.000Z',
        expiry_date: '2024-05-20 12:00:00.000Z',
        status: 'valid',
        issuing_authority: 'International Port Health',
      },
    ]

    for (const data of records) {
      try {
        app.findFirstRecordByData(
          'medical_chest_certificates',
          'certificate_number',
          data.certificate_number,
        )
      } catch (_) {
        const record = new Record(collection)
        record.set('certificate_number', data.certificate_number)
        record.set('issue_date', data.issue_date)
        record.set('expiry_date', data.expiry_date)
        record.set('status', data.status)
        record.set('issuing_authority', data.issuing_authority)
        app.save(record)
      }
    }
  },
  (app) => {
    const certs = ['MC-2024-001', 'MC-2023-088']
    for (const num of certs) {
      try {
        const record = app.findFirstRecordByData(
          'medical_chest_certificates',
          'certificate_number',
          num,
        )
        app.delete(record)
      } catch (_) {}
    }
  },
)
