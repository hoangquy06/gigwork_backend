require('dotenv').config()
const { PrismaClient } = require('@prisma/client')

async function main() {
  const prisma = new PrismaClient()
  try {
    await prisma.$connect()
    const url = process.env.DATABASE_URL || ''
    const info = {}
    try {
      const u = new URL(url)
      info.host = u.hostname
      info.database = u.pathname.replace('/', '')
      info.ssl = (u.search || '').includes('sslmode=require')
    } catch (_) {}
    const userCount = await prisma.user.count()
    console.log(JSON.stringify({ connected: true, host: info.host, database: info.database, ssl: info.ssl, userCount }))
  } catch (e) {
    console.log(JSON.stringify({ connected: false, error: String(e && e.message || e) }))
  } finally {
    try { await prisma.$disconnect() } catch (_) {}
  }
}

main()
