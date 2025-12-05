const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function requireVerified(req, res, next) {
  try {
    const userId = req.user && req.user.id
    if (!userId) return res.status(401).json({ error: 'Unauthorized', code: 401 })
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user || !user.isVerified) return res.status(403).json({ error: 'Email not verified', code: 403 })
    return next()
  } catch (e) {
    return res.status(500).json({ error: 'Server error', code: 500 })
  }
}

module.exports = { requireVerified }
