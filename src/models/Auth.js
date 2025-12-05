const { PrismaClient } = require('@prisma/client')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function register(body) {
  const hash = await bcrypt.hash(body.password, 10)
  const user = await prisma.user.create({
    data: {
      email: body.email,
      phone: body.phone ?? null,
      passwordHash: hash,
      isWorker: !!body.isWorker,
      isEmployer: !!body.isEmployer,
      isVerified: false,
    },
  })
  const token = jwt.sign({ sub: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '24h' })
  return { token }
}

async function login(body) {
  const user = await prisma.user.findUnique({ where: { email: body.email } })
  if (!user) throw new Error('Invalid credentials')
  const ok = await bcrypt.compare(body.password, user.passwordHash)
  if (!ok) throw new Error('Invalid credentials')
  const token = jwt.sign({ sub: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '24h' })
  await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } })
  return { token }
}

module.exports = { register, login }
