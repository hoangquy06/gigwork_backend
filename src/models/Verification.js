const { PrismaClient } = require('@prisma/client')
const { sendEmail } = require('../services/emailService')
const crypto = require('crypto')

const prisma = new PrismaClient()

async function sendVerification(userId) {
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) throw new Error('User not found')
  const recent = await prisma.emailVerification.findFirst({ where: { userId }, orderBy: { createdAt: 'desc' } })
  if (recent && (Date.now() - new Date(recent.createdAt).getTime()) < 60 * 1000) {
    const e = new Error('Too many requests')
    e.code = 429
    e.errorCode = 'VERIFICATION_RATE_LIMIT'
    e.hint = 'Please wait 60 seconds before requesting another verification email'
    throw e
  }
  const token = crypto.randomBytes(24).toString('hex')
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)
  await prisma.emailVerification.create({ data: { userId, token, expiresAt } })
  const linkBase = process.env.APP_URL || 'http://localhost:3000'
  const link = `${linkBase}/api/auth/verify-email?token=${token}`
  let html = `<p>Click to verify: <a href="${link}">${link}</a></p>`
  try {
    const fs = require('fs')
    const path = require('path')
    const tpl = path.resolve(process.cwd(), 'src', 'emails', 'verifyEmail.html')
    if (fs.existsSync(tpl)) {
      html = fs.readFileSync(tpl, 'utf8').replace(/\{\{VERIFY_LINK\}\}/g, link)
    }
  } catch (_) {}
  await sendEmail({ to: user.email, subject: 'Verify your email', html })
  return { success: true }
}

async function verifyByToken(token) {
  const ev = await prisma.emailVerification.findUnique({ where: { token } })
  if (!ev) throw new Error('Invalid token')
  if (ev.usedAt) throw new Error('Token used')
  if (ev.expiresAt < new Date()) throw new Error('Token expired')
  await prisma.user.update({ where: { id: ev.userId }, data: { isVerified: true } })
  await prisma.emailVerification.update({ where: { token }, data: { usedAt: new Date() } })
  return { success: true }
}

module.exports = { sendVerification, verifyByToken }
