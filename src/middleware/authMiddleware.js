const jwt = require('jsonwebtoken')

function authMiddleware(req, res, next) {
  const header = req.headers['authorization']
  if (!header || typeof header !== 'string')
    return res
      .status(401)
      .type('application/problem+json')
      .json({ type: 'about:blank', title: 'Unauthorized', status: 401, detail: 'Missing token', instance: req.originalUrl })
  const parts = header.split(' ')
  const token = parts.length === 2 ? parts[1] : parts[0]
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    req.user = { id: payload.sub, email: payload.email }
    next()
  } catch (e) {
    return res
      .status(401)
      .type('application/problem+json')
      .json({ type: 'about:blank', title: 'Unauthorized', status: 401, detail: 'Invalid token', instance: req.originalUrl })
  }
}

module.exports = { authMiddleware }
