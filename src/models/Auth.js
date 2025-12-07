const { PrismaClient } = require('@prisma/client')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function register(body) {
  if (typeof body.email !== 'string' || typeof body.password !== 'string') {
    const e = new Error('email and password are required')
    e.code = 400
    throw e
  }
  if (typeof body.isWorker !== 'boolean' || typeof body.isEmployer !== 'boolean') {
    const e = new Error('isWorker and isEmployer must be boolean')
    e.code = 400
    throw e
  }
  if (!body.isWorker && !body.isEmployer) {
    const e = new Error('at least one role must be true')
    e.code = 400
    throw e
  }
  const hash = await bcrypt.hash(body.password, 10)
  const user = await prisma.user.create({
    data: {
      email: body.email,
      phone: body.phone ?? null,
      passwordHash: hash,
      isWorker: body.isWorker,
      isEmployer: body.isEmployer,
      isVerified: false,
    },
  })
  const token = jwt.sign({ sub: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '24h' })
  return { token, user: { id: user.id, email: user.email, isWorker: user.isWorker, isEmployer: user.isEmployer, isVerified: user.isVerified } }
}

async function login(body) {
  const user = await prisma.user.findUnique({ where: { email: body.email } })
  if (!user) throw new Error('Invalid credentials')
  const ok = await bcrypt.compare(body.password, user.passwordHash)
  if (!ok) throw new Error('Invalid credentials')
  const token = jwt.sign({ sub: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '24h' })
  await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } })
  return { token, user: { id: user.id, email: user.email, isWorker: user.isWorker, isEmployer: user.isEmployer, isVerified: user.isVerified } }
}

module.exports = { register, login }
