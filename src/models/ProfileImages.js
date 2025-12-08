const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

function normalizeRole(role) {
  const s = String(role || '').toLowerCase().trim()
  if (s === 'employee') return 'employee'
  return 'employer'
}

function normalizeKind(kind, role) {
  const s = String(kind || '').toLowerCase().trim()
  if (s === 'company_logo') return 'company_logo'
  if (s === 'avatar') return 'avatar'
  if (role === 'employer' && s === '') return 'company_logo'
  return 'avatar'
}

async function upload(userId, role, kind, file, setPrimary) {
  const r = normalizeRole(role)
  const k = normalizeKind(kind, r)
  if (!file || !file.buffer || !file.mimetype) {
    const e = new Error('Invalid file')
    e.code = 400
    throw e
  }
  if (setPrimary) {
    await prisma.profileImage.updateMany({ where: { userId, role: r, kind: k, isPrimary: true }, data: { isPrimary: false } })
  }
  const img = await prisma.profileImage.create({
    data: { userId, role: r, kind: k, contentType: file.mimetype, size: file.size || file.buffer.length, data: file.buffer, isPrimary: !!setPrimary },
  })
  return { id: img.id, contentType: img.contentType, size: img.size, isPrimary: img.isPrimary, role: img.role, kind: img.kind }
}

async function getPrimary(userId, role, kind) {
  const r = normalizeRole(role)
  const k = kind ? normalizeKind(kind, r) : undefined
  const where = { userId, role: r }
  if (k) where.kind = k
  const img = await prisma.profileImage.findFirst({ where: { ...where, isPrimary: true }, orderBy: { updatedAt: 'desc' } })
  return img || null
}

async function setPrimary(userId, imageId) {
  const img = await prisma.profileImage.findUnique({ where: { id: Number(imageId) } })
  if (!img || img.userId !== userId) throw new Error('Forbidden')
  await prisma.profileImage.updateMany({ where: { userId, role: img.role, kind: img.kind, isPrimary: true }, data: { isPrimary: false } })
  return prisma.profileImage.update({ where: { id: img.id }, data: { isPrimary: true } })
}

async function remove(userId, imageId) {
  const img = await prisma.profileImage.findUnique({ where: { id: Number(imageId) } })
  if (!img || img.userId !== userId) throw new Error('Forbidden')
  await prisma.profileImage.delete({ where: { id: img.id } })
  return { success: true }
}

module.exports = { upload, getPrimary, setPrimary, remove }
