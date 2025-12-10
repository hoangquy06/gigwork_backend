const Notifications = require('../models/Notifications')

async function list(req, res) {
  const out = await Notifications.list(req.user.id, req.query || {})
  return res.status(200).json(out)
}

async function create(req, res) {
  const data = await Notifications.create(req.user.id, req.body || {})
  return res.status(201).json(data)
}

module.exports = { list, create }
