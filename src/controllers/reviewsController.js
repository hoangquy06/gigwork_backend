const Reviews = require('../models/Reviews')

async function create(req, res) {
  const data = await Reviews.create(req.user.id, req.body || {})
  return res.json({ statusCode: 200, message: 'Operation successful', data })
}

async function list(req, res) {
  const data = await Reviews.list(Number(req.params.userId))
  return res.json({ statusCode: 200, message: 'Operation successful', data })
}

module.exports = { create, list }
