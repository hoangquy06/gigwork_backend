function errorHandler(err, req, res, next) {
  const code = err && err.code ? err.code : 400
  const status = code >= 100 && code < 600 ? code : 400
  const title = err && err.title ? String(err.title) : status === 401 ? 'Unauthorized' : status === 403 ? 'Forbidden' : status === 404 ? 'Not Found' : status === 409 ? 'Conflict' : status >= 500 ? 'Server Error' : 'Bad Request'
  const detail = err && err.message ? String(err.message) : title
  res.type('application/problem+json')
  const base = { type: 'about:blank', title, status, detail, instance: req.originalUrl }
  const extra = {}
  ;['errorCode', 'hint', 'content', 'meta', 'fields'].forEach((k) => {
    if (err && typeof err[k] !== 'undefined') extra[k] = err[k]
  })
  return res.status(status).json({ ...base, ...extra })
}

module.exports = { errorHandler }
