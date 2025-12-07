const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function requireVerified(req, res, next) {
  try {
    const userId = req.user && req.user.id
    if (!userId)
      return res
        .status(401)
        .type('application/problem+json')
        .json({ type: 'about:blank', title: 'Unauthorized', status: 401, detail: 'Missing user', instance: req.originalUrl })
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user || !user.isVerified)
      return res
        .status(403)
        .type('application/problem+json')
        .json({ type: 'about:blank', title: 'Forbidden', status: 403, detail: 'Email not verified', instance: req.originalUrl })
    return next()
  } catch (e) {
    return res
      .status(500)
      .type('application/problem+json')
      .json({ type: 'about:blank', title: 'Server Error', status: 500, detail: 'Unexpected error', instance: req.originalUrl })
  }
}

module.exports = { requireVerified }
