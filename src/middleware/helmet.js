const helmet = require('helmet')

function setupHelmet(http) {
  http.use(helmet())
  http.use(helmet.referrerPolicy({ policy: 'strict-origin-when-cross-origin' }))
  if (process.env.NODE_ENV === 'production') {
    http.use(helmet.hsts({ maxAge: 15552000, includeSubDomains: true, preload: true }))
  }
  http.use('/api/docs', helmet.contentSecurityPolicy({
    useDefaults: true,
    directives: {
      'script-src': ["'self'", "'unsafe-inline'"],
      'style-src': ["'self'", "'unsafe-inline'"],
    },
  }))
}

module.exports = { setupHelmet }

