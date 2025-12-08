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

module.exports = { list }
