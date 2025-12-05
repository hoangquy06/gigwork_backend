const jwt = require('jsonwebtoken')

function authMiddleware(req, res, next) {
  const header = req.headers['authorization']
  if (!header || typeof header !== 'string') return res.status(401).json({ error: 'Missing token', code: 401 })
  const parts = header.split(' ')
  const token = parts.length === 2 ? parts[1] : parts[0]
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    req.user = { id: payload.sub, email: payload.email }
    next()
  } catch (e) {
    return res.status(401).json({ error: 'Invalid token', code: 401 })
  }
}

module.exports = { authMiddleware }
