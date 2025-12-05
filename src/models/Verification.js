const { PrismaClient } = require('@prisma/client')
const nodemailer = require('nodemailer')
const crypto = require('crypto')

const prisma = new PrismaClient()

async function sendVerification(userId) {
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) throw new Error('User not found')
  const token = crypto.randomBytes(24).toString('hex')
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)
  await prisma.emailVerification.create({ data: { userId, token, expiresAt } })
  const linkBase = process.env.APP_URL || 'http://localhost:3001'
  const link = `${linkBase}/api/auth/verify-email?token=${token}`
  if (process.env.SMTP_MODE === 'smtp') {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: false,
      auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
    })
    await transporter.sendMail({
      from: process.env.MAIL_FROM || 'noreply@example.com',
      to: user.email,
      subject: 'Verify your email',
      text: `Click to verify: ${link}`,
      html: `<p>Click to verify: <a href="${link}">${link}</a></p>`,
    })
    return { success: true }
  }
  const transporter = nodemailer.createTransport({ jsonTransport: true })
  await transporter.sendMail({
    from: process.env.MAIL_FROM || 'noreply@example.com',
    to: user.email,
    subject: 'Verify your email (dev)',
    text: `Click to verify: ${link}`,
    html: `<p>Click to verify: <a href="${link}">${link}</a></p>`,
  })
  return { success: true, link }
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
