const express = require('express')
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()
const router = express.Router()

router.get('/api/health', async (req, res) => {
  try {
    await prisma.$connect()
    const userCount = await prisma.user.count()
    return res.status(200).json({ status: 'ok', db: { connected: true, userCount } })
  } catch (e) {
    return res.status(503).type('application/problem+json').json({ type: 'about:blank', title: 'Service Unavailable', status: 503, detail: 'Database connection failed', instance: req.originalUrl })
  } finally {
    try { await prisma.$disconnect() } catch (_) {}
  }
})

module.exports = router
