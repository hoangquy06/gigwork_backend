const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function list(userId, query) {
  const page = Number(query && query.page) > 0 ? Number(query.page) : 1
  const size = Number(query && query.size) > 0 ? Number(query.size) : 20
  const skip = (page - 1) * size
  const where = { userId }
  const [items, total] = await Promise.all([
    prisma.notification.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take: size }),
    prisma.notification.count({ where })
  ])
  return { items, meta: { total, page, size } }
}

async function create(userId, data) {
  const type = String(data && data.type || '').trim()
  const title = String(data && data.title || '').trim()
  const content = String(data && data.content || '').trim()
  if (!userId || !type || !title) {
    const e = new Error('Invalid notification payload')
    e.code = 400
    e.errorCode = 'NOTIFICATION_BAD_REQUEST'
    throw e
  }
  return prisma.notification.create({ data: { userId, type, title, content } })
}

module.exports = { list, create }
